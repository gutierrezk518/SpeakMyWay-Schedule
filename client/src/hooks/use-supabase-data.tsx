import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ScheduleActivity } from '@/data/scheduleData';

export interface SupabaseCategory {
  id: number;
  categoryname_en: string;
  name_es: string;
  color: string;
  created_at: string;
}

export interface SupabaseVocabularyCard {
  id: number;
  categoryname_en: string;
  text_en: string;
  text_es: string;
  spoken_word_en: string;
  spoken_word_es: string;
  icon_url: string | null;
  sort_order: number;
  created_at: string;
}

// Hook to fetch categories from Supabase
export function useSupabaseCategories() {
  return useQuery({
    queryKey: ['supabase-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedulecategories')
        .select('*')
        .order('categoryname_en');
      
      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }
      
      return data as SupabaseCategory[];
    },
  });
}

// Hook to fetch vocabulary cards from Supabase
export function useSupabaseVocabularyCards() {
  return useQuery({
    queryKey: ['supabase-vocabulary-cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedule_vocabulary_cards')
        .select('*')
        .order('sort_order, text_en');
      
      if (error) {
        throw new Error(`Failed to fetch vocabulary cards: ${error.message}`);
      }
      
      return data as SupabaseVocabularyCard[];
    },
  });
}

// Helper function to convert Supabase data to ScheduleActivity format
export function convertToScheduleActivity(
  card: SupabaseVocabularyCard, 
  categoryColor: string,
  language: 'en' | 'es' = 'en'
): ScheduleActivity {
  return {
    id: card.id.toString(),
    title: language === 'es' ? card.text_es : card.text_en,
    titleEs: card.text_es,
    icon: card.icon_url || 'ri-bookmark-fill', // fallback icon
    bgColor: categoryColor,
    speechText: language === 'es' ? card.spoken_word_es : card.spoken_word_en,
    speechTextEs: card.spoken_word_es,
  };
}

// Hook to get organized activity data (categories with their cards)
export function useOrganizedActivityData(language: 'en' | 'es' = 'en') {
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useSupabaseCategories();
  const { data: cards, isLoading: cardsLoading, error: cardsError } = useSupabaseVocabularyCards();

  return useQuery({
    queryKey: ['organized-activity-data', language],
    queryFn: () => {
      if (!categories || !cards) {
        throw new Error('Categories or cards data not available');
      }

      // Create a map of category name to color
      const categoryColorMap = categories.reduce((map, cat) => {
        map[cat.categoryname_en] = cat.color;
        return map;
      }, {} as Record<string, string>);

      // Group cards by category
      const organizedData: Record<string, ScheduleActivity[]> = {};
      
      categories.forEach(category => {
        organizedData[category.categoryname_en] = [];
      });

      cards.forEach(card => {
        const categoryColor = categoryColorMap[card.categoryname_en] || 'gray-300';
        const activity = convertToScheduleActivity(card, categoryColor, language);
        
        if (organizedData[card.categoryname_en]) {
          organizedData[card.categoryname_en].push(activity);
        }
      });

      // Sort each category's cards by sort_order, with fallback for zero values
      Object.keys(organizedData).forEach(categoryName => {
        organizedData[categoryName].sort((a, b) => {
          const cardA = cards.find(c => c.id.toString() === a.id);
          const cardB = cards.find(c => c.id.toString() === b.id);
          
          if (!cardA || !cardB) return 0;
          
          // If sort_order is 0, use alphabetical sorting as fallback
          const sortA = cardA.sort_order || 999;
          const sortB = cardB.sort_order || 999;
          
          if (sortA === sortB) {
            return cardA.text_en.localeCompare(cardB.text_en);
          }
          
          return sortA - sortB;
        });
      });

      return {
        organizedData,
        categories,
        categoryColorMap,
        allCards: Object.values(organizedData).flat(),
      };
    },
    enabled: !categoriesLoading && !cardsLoading && !!categories && !!cards,
  });
}

// Hook to get activity categories for the category selector
export function useActivityCategories(language: 'en' | 'es' = 'en') {
  const { data: categories } = useSupabaseCategories();
  
  return useQuery({
    queryKey: ['activity-categories', language],
    queryFn: () => {
      if (!categories) return [];
      
      // Add special categories
      const activityCategories = [
        { id: "all", name: language === 'es' ? "Todos" : "All", color: "gray-300" },
        { id: "favorites", name: language === 'es' ? "Favoritos" : "Favorites", color: "yellow-300" },
      ];
      
      // Add categories from database
      categories.forEach(cat => {
        activityCategories.push({
          id: cat.categoryname_en,
          name: language === 'es' ? cat.name_es : cat.categoryname_en,
          color: cat.color,
        });
      });
      
      return activityCategories;
    },
    enabled: !!categories,
  });
}