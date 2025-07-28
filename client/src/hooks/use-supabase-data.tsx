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

// Updated interface to match actual database schema
export interface SupabaseUserFavorite {
  id: number;
  user_id: string;
  activity_id: string; // This is a string in the database
  activity_data: any; // This contains the full vocabulary card data
  created_at: string;
}

// Interface for the app's internal use (backward compatibility)
export interface AppUserFavorite {
  id: number;
  user_id: string;
  vocabulary_card_id: number;
  activity_data: SupabaseVocabularyCard;
  created_at: string;
}

// Hook to fetch all vocabulary cards from Supabase
export function useSupabaseVocabularyCards() {
  return useQuery({
    queryKey: ['supabase-vocabulary-cards'],
    queryFn: async () => {
      console.log('Fetching vocabulary cards from Supabase...');

      const { data, error } = await supabase
        .from('schedule_vocabulary_cards')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching vocabulary cards:', error);
        throw error;
      }

      console.log('Vocabulary cards fetched:', data?.length || 0, 'cards');
      return data as SupabaseVocabularyCard[];
    },
    retry: false,
  });
}

// Helper function to get category icons
function getCategoryIcon(categoryName: string): string {
  const iconMap: Record<string, string> = {
    'Getting Ready': 'ri-shirt-line',
    'Holiday': 'ri-gift-line',
    'Hygiene': 'ri-hand-sanitizer-line',
    'Indoors & Chores': 'ri-broom-line',
    'Meals': 'ri-restaurant-line',
    'Outdoors & Social': 'ri-user-line',
    'Places & Transportation': 'ri-map-pin-line',
    'Vacation': 'ri-suitcase-line'
  };

  return iconMap[categoryName] || 'ri-folder-line';
}

// Helper function to get category background colors
export function getCategoryBgColor(categoryName: string): string {
  const colorMap: Record<string, string> = {
    'Getting Ready': 'purple-300',
    'Holiday': 'green-400',
    'Hygiene': 'blue-300',
    'Indoors & Chores': 'orange-300',
    'Meals': 'blue-400',
    'Outdoors & Social': 'purple-200',
    'Places & Transportation': 'orange-100',
    'Vacation': 'orange-200'
  };

  return colorMap[categoryName] || 'gray-100';
}

// Hook to get categories from vocabulary cards
export function useSupabaseCategories() {
  const { data: vocabularyCards, isLoading, error } = useSupabaseVocabularyCards();

  return useQuery({
    queryKey: ['supabase-categories', vocabularyCards?.length],
    queryFn: async () => {
      if (!vocabularyCards) return [];

      // Extract unique categories from vocabulary cards
      const uniqueCategories = Array.from(
        new Set(vocabularyCards.map(card => card.categoryname_en))
      );

      // Create category objects with proper IDs and names
      const categories = [
        { id: 'all', name: 'All Categories', icon: 'ri-apps-line' },
        ...uniqueCategories.map(categoryName => ({
          id: categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
          name: categoryName,
          icon: getCategoryIcon(categoryName)
        })),
        { id: 'favorites', name: 'Favorites', icon: 'ri-star-fill' }
      ];

      console.log('Categories generated:', categories.length, 'categories');
      return categories;
    },
    enabled: !!vocabularyCards && !isLoading && !error,
    retry: false,
  });
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
        .select('id, user_id, activity_id, activity_data, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user favorites:', error);
        return [];
      }

      console.log('User favorites fetched:', data);

      // Map to app interface for backward compatibility
      return data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        vocabulary_card_id: parseInt(item.activity_id),
        activity_data: item.activity_data,
        created_at: item.created_at
      })) as AppUserFavorite[];
    },
    enabled: !!userId,
    retry: false,
  });
}

// Hook to get organized activity data with favorites
export function useOrganizedActivityData(language: string, userId: string | null) {
  const { data: vocabularyCards, isLoading: cardsLoading, error: cardsError } = useSupabaseVocabularyCards();
  const { data: userFavorites, isLoading: favoritesLoading } = useUserFavorites(userId);

  return useQuery({
    queryKey: ['organized-activity-data', language, userId, vocabularyCards?.length, userFavorites?.length],
    queryFn: async () => {
      if (!vocabularyCards) {
        throw new Error('No vocabulary cards available');
      }

      console.log('Organizing activity data for language:', language);

      // Transform vocabulary cards to ScheduleActivity format, preserving sort order
      // Cards with sort_order = 0 are unorganized and should appear after numbered cards
      const allCards: ScheduleActivity[] = vocabularyCards
        .sort((a, b) => {
          // If both have sort_order = 0, maintain original order
          if (a.sort_order === 0 && b.sort_order === 0) return 0;
          // If only a has sort_order = 0, put it after b
          if (a.sort_order === 0) return 1;
          // If only b has sort_order = 0, put it after a
          if (b.sort_order === 0) return -1;
          // Both have non-zero sort_order, sort normally
          return a.sort_order - b.sort_order;
        })
        .map(card => ({
          id: card.id.toString(),
          title: language === 'es' ? card.text_es || card.text_en : card.text_en,
          titleEs: card.text_es,
          speechText: card.spoken_word_en,
          speechTextEs: card.spoken_word_es,
          icon: getCategoryIcon(card.categoryname_en), // Use category icon as fallback
          iconUrl: card.icon_url || '', // Keep for backward compatibility
          imageSrc: card.icon_url || '', // This is what ActivityCard actually looks for
          category: card.categoryname_en,
          bgColor: getCategoryBgColor(card.categoryname_en), // Use category-based colors
          textColor: 'text-gray-800'
        }));

      // Organize cards by category, preserving sort order within each category
      const organizedData: Record<string, ScheduleActivity[]> = {};

      // First sort all cards by sort_order (0s go after numbered cards), then organize by category
      const sortedCards = vocabularyCards.sort((a, b) => {
        // If both have sort_order = 0, maintain original order
        if (a.sort_order === 0 && b.sort_order === 0) return 0;
        // If only a has sort_order = 0, put it after b
        if (a.sort_order === 0) return 1;
        // If only b has sort_order = 0, put it after a
        if (b.sort_order === 0) return -1;
        // Both have non-zero sort_order, sort normally
        return a.sort_order - b.sort_order;
      });
      
      sortedCards.forEach(card => {
        const categoryName = card.categoryname_en;
        if (!organizedData[categoryName]) {
          organizedData[categoryName] = [];
        }

        const activity: ScheduleActivity = {
          id: card.id.toString(),
          title: language === 'es' ? card.text_es || card.text_en : card.text_en,
          titleEs: card.text_es,
          speechText: card.spoken_word_en,
          speechTextEs: card.spoken_word_es,
          icon: getCategoryIcon(card.categoryname_en), // Use category icon as fallback
          iconUrl: card.icon_url || '', // Keep for backward compatibility
          imageSrc: card.icon_url || '', // This is what ActivityCard actually looks for
          category: card.categoryname_en,
          bgColor: getCategoryBgColor(card.categoryname_en), // Use category-based colors
          textColor: 'text-gray-800'
        };

        organizedData[categoryName].push(activity);
      });

      // Add favorites to organized data
      if (userFavorites && userFavorites.length > 0) {
        organizedData['favorites'] = userFavorites.map(favorite => ({
          id: favorite.vocabulary_card_id.toString(),
          title: language === 'es' ? favorite.activity_data.text_es || favorite.activity_data.text_en : favorite.activity_data.text_en,
          titleEs: favorite.activity_data.text_es,
          speechText: favorite.activity_data.spoken_word_en,
          speechTextEs: favorite.activity_data.spoken_word_es,
          icon: getCategoryIcon(favorite.activity_data.categoryname_en), // Use category icon as fallback
          iconUrl: favorite.activity_data.icon_url || '', // Keep for backward compatibility
          imageSrc: favorite.activity_data.icon_url || '', // This is what ActivityCard actually looks for
          category: favorite.activity_data.categoryname_en,
          bgColor: getCategoryBgColor(favorite.activity_data.categoryname_en), // Preserve original category color
          textColor: 'text-gray-800'
        }));
      } else {
        organizedData['favorites'] = [];
      }

      console.log('Activity data organized:', {
        totalCards: allCards.length,
        categories: Object.keys(organizedData).length,
        favorites: organizedData['favorites']?.length || 0
      });

      return {
        organizedData,
        allCards
      };
    },
    enabled: !!vocabularyCards && !cardsLoading && !cardsError,
    retry: false,
  });
}

// Hook to manage user favorites (add/remove)
export function useUserFavoritesManager(userId: string | null) {
  const queryClient = useQueryClient();

  const addFavorite = useMutation({
    mutationFn: async (vocabularyCard: SupabaseVocabularyCard) => {
      if (!userId) throw new Error('User not authenticated');

      console.log('🔧 Attempting to insert favorite with vocabulary card:', vocabularyCard);

      // Check if already exists
      const { data: existing } = await supabase
        .from('schedule_user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('activity_id', vocabularyCard.id.toString())
        .single();

      if (existing) {
        throw new Error('This item is already in your favorites');
      }

      // Prepare the activity data object
      const activityData = {
        id: vocabularyCard.id,
        categoryname_en: vocabularyCard.categoryname_en,
        text_en: vocabularyCard.text_en,
        text_es: vocabularyCard.text_es,
        spoken_word_en: vocabularyCard.spoken_word_en,
        spoken_word_es: vocabularyCard.spoken_word_es,
        icon_url: vocabularyCard.icon_url,
        sort_order: vocabularyCard.sort_order,
        created_at: vocabularyCard.created_at
      };

      const { data, error } = await supabase
        .from('schedule_user_favorites')
        .insert([{
          user_id: userId,
          activity_id: vocabularyCard.id.toString(),
          activity_data: activityData // Store complete vocabulary card data
        }])
        .select('*')
        .single();

      if (error) {
        console.log('❌ Insert error details:', error);
        if (error.code === '23505') {
          throw new Error('This item is already in your favorites');
        }
        throw new Error(`Failed to add favorite: ${error.message}`);
      }

      console.log('✅ Insert successful:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Favorite added successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['user-favorites', userId] });
      queryClient.invalidateQueries({ queryKey: ['organized-activity-data'] });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (vocabularyCardId: number) => {
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('schedule_user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('activity_id', vocabularyCardId.toString());

      if (error) {
        throw new Error(`Failed to remove favorite: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites', userId] });
      queryClient.invalidateQueries({ queryKey: ['organized-activity-data'] });
    },
  });

  return {
    addFavorite,
    removeFavorite,
    isAddingFavorite: addFavorite.isPending,
    isRemovingFavorite: removeFavorite.isPending,
  };
}

// Helper function to get vocabulary card data by ID
export function useVocabularyCard(cardId: number) {
  return useQuery({
    queryKey: ['vocabulary-card', cardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedule_vocabulary_cards')
        .select('*')
        .eq('id', cardId)
        .single();

      if (error) {
        console.error('Error fetching vocabulary card:', error);
        throw error;
      }

      return data as SupabaseVocabularyCard;
    },
    enabled: !!cardId,
  });
}