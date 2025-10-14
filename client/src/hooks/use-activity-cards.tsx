import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/app-context';

export interface ActivityCard {
  id: string;
  title: string;
  speechText: string;
  categoryname_en: string;
  icon: string;
  imageSrc: string;
  bgColor: string;
}

export interface DatabaseCard {
  id: number;
  categoryname_en: string;
  text_en: string;
  text_es?: string;
  spoken_word_en: string;
  spoken_word_es?: string;
  icon: string;
  icon_url: string;
  created_at: string;
  sort_order?: number;
  color?: string; // From schedulecategories join
}

export function useActivityCards(selectedCategory?: string) {
  const { language } = useAppContext();

  return useQuery({
    queryKey: ['activity-cards', selectedCategory, language],
    queryFn: async (): Promise<ActivityCard[]> => {
      // First, get the categories to map colors
      const { data: categories, error: categoriesError } = await supabase
        .from('schedulecategories')
        .select('categoryname_en, color');

      if (categoriesError) {
        console.warn('Could not fetch categories for colors:', categoriesError.message);
      }

      // Create a map of category names to colors
      const categoryColorMap: Record<string, string> = {};
      if (categories) {
        categories.forEach(cat => {
          categoryColorMap[cat.categoryname_en] = cat.color || 'gray-400';
        });
      }

      // Now get the activity cards
      let query = supabase
        .from('schedule_vocabulary_cards')
        .select('*')
        .order('sort_order', { ascending: true });

      // Filter by category unless it's "all" or undefined
      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('categoryname_en', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch activity cards: ${error.message}`);
      }

      // Transform database format to component format
      return (data || []).map((card: any): ActivityCard => ({
        id: card.id.toString(),
        title: language === 'es' && card.text_es ? card.text_es : card.text_en,
        speechText: language === 'es' && card.spoken_word_es ? card.spoken_word_es : card.spoken_word_en,
        categoryname_en: card.categoryname_en,
        icon: card.icon,
        imageSrc: card.icon_url,
        bgColor: categoryColorMap[card.categoryname_en] || 'gray-400'
      }));
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    enabled: true, // Always enabled, we handle filtering in the query
  });
}

// Hook to get cards organized by category (for the old grouped structure)
export function useActivityCardsByCategory() {
  const { language } = useAppContext();

  return useQuery({
    queryKey: ['activity-cards-by-category', language],
    queryFn: async (): Promise<Record<string, ActivityCard[]>> => {
      const { data, error } = await supabase
        .from('schedule_vocabulary_cards')
        .select(`
          *,
          schedulecategories!inner(color)
        `)
        .order('sort_order', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch activity cards: ${error.message}`);
      }

      // Group cards by category
      const cardsByCategory: Record<string, ActivityCard[]> = {};

      (data || []).forEach((card: any) => {
        const categoryName = card.categoryname_en;
        
        if (!cardsByCategory[categoryName]) {
          cardsByCategory[categoryName] = [];
        }

        cardsByCategory[categoryName].push({
          id: card.id.toString(),
          title: language === 'es' && card.text_es ? card.text_es : card.text_en,
          speechText: language === 'es' && card.spoken_word_es ? card.spoken_word_es : card.spoken_word_en,
          categoryname_en: card.categoryname_en,
          icon: card.icon,
          imageSrc: card.icon_url,
          bgColor: card.schedulecategories?.color || 'gray-400'
        });
      });

      return cardsByCategory;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}