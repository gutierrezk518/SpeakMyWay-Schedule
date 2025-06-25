import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export interface SupabaseUserFavorite {
  id: number;
  user_id: string;
  vocabulary_card_id: number;
  created_at: string;
}

// Hook to fetch user favorites from Supabase
export function useUserFavorites(userId: string | null) {
  return useQuery({
    queryKey: ['user-favorites', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('Fetching user favorites for user:', userId);
      const { data, error } = await supabase
        .from('schedule_user_favorites')
        .select(`
          id,
          vocabulary_card_id,
          created_at,
          schedule_vocabulary_cards (
            id,
            categoryname_en,
            text_en,
            text_es,
            spoken_word_en,
            spoken_word_es,
            icon_url,
            sort_order
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user favorites:', error);
        throw new Error(`Failed to fetch user favorites: ${error.message}`);
      }
      
      console.log('User favorites fetched:', data);
      return data as (SupabaseUserFavorite & { schedule_vocabulary_cards: SupabaseVocabularyCard })[];
    },
    enabled: !!userId,
  });
}

// Hook to manage user favorites (add/remove)
export function useUserFavoritesManager(userId: string | null) {
  const queryClient = useQueryClient();
  
  const addFavorite = useMutation({
    mutationFn: async (vocabularyCardId: number) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('schedule_user_favorites')
        .insert({
          user_id: userId,
          vocabulary_card_id: vocabularyCardId
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('This item is already in your favorites');
        }
        throw new Error(`Failed to add favorite: ${error.message}`);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites', userId] });
    },
  });
  
  const removeFavorite = useMutation({
    mutationFn: async (vocabularyCardId: number) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('schedule_user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('vocabulary_card_id', vocabularyCardId);
      
      if (error) {
        throw new Error(`Failed to remove favorite: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites', userId] });
    },
  });
  
  return {
    addFavorite,
    removeFavorite,
    isAddingFavorite: addFavorite.isPending,
    isRemovingFavorite: removeFavorite.isPending,
  };
}

// Hook to fetch categories from Supabase
export function useSupabaseCategories() {
  return useQuery({
    queryKey: ['supabase-categories'],
    queryFn: async () => {
      console.log('Fetching categories from Supabase...');
      const { data, error } = await supabase
        .from('schedulecategories')
        .select('*')
        .order('categoryname_en');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }
      
      console.log('Categories fetched:', data);
      return data as SupabaseCategory[];
    },
  });
}

// Hook to fetch vocabulary cards from Supabase
export function useSupabaseVocabularyCards() {
  return useQuery({
    queryKey: ['supabase-vocabulary-cards'],
    queryFn: async () => {
      console.log('Fetching vocabulary cards from Supabase...');
      const { data, error } = await supabase
        .from('schedule_vocabulary_cards')
        .select('*')
        .order('sort_order, text_en');
      
      if (error) {
        console.error('Error fetching vocabulary cards:', error);
        throw new Error(`Failed to fetch vocabulary cards: ${error.message}`);
      }
      
      console.log('Raw Supabase response:', { data, error });
      console.log('Vocabulary cards fetched (first card full):', JSON.stringify(data?.[0], null, 2));
      console.log('Total cards:', data?.length);
      console.log('Card IDs check:', data?.slice(0, 5)?.map(c => ({ id: c.id, text: c.text_en })));
      return data as SupabaseVocabularyCard[];
    },
  });
}

// Helper function to convert Supabase data to ScheduleActivity format
export function convertToScheduleActivity(
  card: SupabaseVocabularyCard, 
  categoryColor: string,
  language: 'en' | 'es' = 'en'
): ScheduleActivity | null {
  // Handle missing or invalid data
  if (!card || !card.id) {
    console.warn('Skipping card with missing ID:', card);
    return null;
  }

  const result = {
    id: String(card.id), // Safe conversion
    title: language === 'es' ? (card.text_es || card.text_en) : card.text_en,
    titleEs: card.text_es || card.text_en,
    icon: card.icon_url || 'ri-bookmark-fill',
    bgColor: categoryColor || 'gray-300',
    speechText: language === 'es' ? (card.spoken_word_es || card.spoken_word_en) : card.spoken_word_en,
    speechTextEs: card.spoken_word_es || card.spoken_word_en,
    time: undefined,
  };
  
  return result;
}

// Hook to get organized activity data (categories with their cards)
export function useOrganizedActivityData(language: 'en' | 'es' = 'en', userId?: string | null) {
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useSupabaseCategories();
  const { data: cards, isLoading: cardsLoading, error: cardsError } = useSupabaseVocabularyCards();
  // Temporarily disable favorites to fix card loading issue
  // const { data: userFavorites, isLoading: favoritesLoading } = useUserFavorites(userId);
  const userFavorites = null;

  return useQuery({
    queryKey: ['organized-activity-data', language, userId],
    queryFn: () => {
      console.log('=== ORGANIZING ACTIVITY DATA ===');
      console.log('Categories count:', categories?.length);
      console.log('Cards count:', cards?.length);

      if (!categories || !cards) {
        console.log('Missing data - categories:', !!categories, 'cards:', !!cards);
        throw new Error('Categories or cards data not available');
      }

      // Create a map of category name to color
      const categoryColorMap = categories.reduce((map, cat) => {
        map[cat.categoryname_en] = cat.color;
        return map;
      }, {} as Record<string, string>);
      
      // Create set of favorite card IDs for quick lookup
      const favoriteCardIds = new Set(userFavorites?.map(fav => fav.vocabulary_card_id) || []);

      // Group cards by category - use ALL categories from schedulecategories table
      const organizedData: Record<string, ScheduleActivity[]> = {};
      
      categories.forEach(category => {
        organizedData[category.categoryname_en] = [];
      });

      // Add favorites category
      organizedData['favorites'] = [];
      
      console.log('Categories from schedulecategories table:', Object.keys(organizedData));
      console.log('Card categories from schedule_vocabulary_cards:', [...new Set(cards.map(c => c.categoryname_en))]);
      console.log('Category color mapping:', categoryColorMap);

      console.log('Processing', cards.length, 'cards...');
      
      let validCardsProcessed = 0;
      let invalidCardsSkipped = 0;
      
      cards.forEach((card, index) => {
        const categoryColor = categoryColorMap[card.categoryname_en] || 'gray-300';
        
        console.log(`Processing card ${index + 1}:`, {
          id: card.id,
          text_en: card.text_en,
          categoryname_en: card.categoryname_en,
          categoryColor,
          categoryExists: !!organizedData[card.categoryname_en]
        });
        
        const activity = convertToScheduleActivity(card, categoryColor, language);
        
        if (!activity) {
          console.warn(`Failed to convert card: "${card.text_en}"`);
          invalidCardsSkipped++;
          return;
        }
        
        // Add to main category - only add if category exists in schedulecategories
        if (organizedData[card.categoryname_en]) {
          organizedData[card.categoryname_en].push(activity);
          validCardsProcessed++;
          console.log(`✓ Added "${card.text_en}" to "${card.categoryname_en}"`);
        } else {
          console.warn(`Card "${card.text_en}" has category "${card.categoryname_en}" which doesn't exist in schedulecategories table`);
          invalidCardsSkipped++;
        }

        // Add to favorites if user has favorited this card
        if (favoriteCardIds.has(card.id)) {
          organizedData['favorites'].push(activity);
        }
      });
      
      console.log(`Cards processed: ${validCardsProcessed} valid, ${invalidCardsSkipped} skipped`);
      
      console.log('All cards processed successfully');

      console.log('Final organized data counts by category:');
      Object.keys(organizedData).forEach(categoryName => {
        console.log(`  ${categoryName}: ${organizedData[categoryName].length} cards`);
      });

      // Sort each category's cards by sort_order, with fallback for zero values
      Object.keys(organizedData).forEach(categoryName => {
        organizedData[categoryName].sort((a, b) => {
          if (categoryName === 'favorites') {
            // Sort favorites by when they were added (most recent first)
            const favA = userFavorites?.find(fav => fav.vocabulary_card_id.toString() === a.id);
            const favB = userFavorites?.find(fav => fav.vocabulary_card_id.toString() === b.id);
            if (favA && favB) {
              return new Date(favB.created_at).getTime() - new Date(favA.created_at).getTime();
            }
          }

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

      const result = {
        organizedData,
        categories,
        categoryColorMap,
        allCards: Object.values(organizedData).flat(),
        favoriteCardIds,
      };

      console.log('RESULT: Total cards organized:', result.allCards.length);
      console.log('RESULT: Categories with cards:', Object.keys(result.organizedData).filter(k => result.organizedData[k].length > 0));
      console.log('RESULT: Sample result object keys:', Object.keys(result));
      console.log('=== END ORGANIZING ACTIVITY DATA ===');

      return result;
    },
    enabled: !categoriesLoading && !cardsLoading && !!categories && !!cards,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false, // Disable retries to see errors faster
  });
}

// Hook to get activity categories for the category selector - purely from Supabase
export function useActivityCategories(language: 'en' | 'es' = 'en') {
  const { data: supabaseCategories } = useSupabaseCategories();
  const { data: organizedActivities } = useOrganizedActivityData(language);
  
  return useQuery({
    queryKey: ['activity-categories', language, supabaseCategories?.length, organizedActivities ? Object.keys(organizedActivities).length : 0],
    queryFn: () => {
      if (!supabaseCategories || !organizedActivities) return [];
      
      console.log('Building categories from schedulecategories table only');
      
      // Start with special categories
      const activityCategories = [
        { 
          id: "all", 
          name: language === 'es' ? "Todos" : "All", 
          color: "gray-300",
          count: Object.values(organizedActivities.organizedData).flat().length
        },
        { 
          id: "favorites", 
          name: language === 'es' ? "Favoritos" : "Favorites", 
          color: "yellow-300",
          count: organizedActivities.organizedData.favorites?.length || 0
        },
      ];
      
      // Add all categories from schedulecategories table, showing count of cards
      supabaseCategories.forEach(category => {
        const cardCount = organizedActivities.organizedData[category.categoryname_en]?.length || 0;
        
        activityCategories.push({
          id: category.categoryname_en.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
          name: language === 'es' ? category.name_es : category.categoryname_en,
          color: category.color,
          count: cardCount
        });
      });
      
      console.log('Categories from schedulecategories:', activityCategories.map(c => `${c.name} (${c.count})`));
      
      return activityCategories;
    },
    enabled: !!supabaseCategories && !!organizedActivities,
  });
}