import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Category {
  id: number;
  categoryname_en: string;
  name_es?: string;
  color?: string;
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('schedulecategories')
        .select('*')
        .order('id');

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      // Add the "all" category at the beginning
      const allCategory: Category = {
        id: 0,
        categoryname_en: 'all',
        name_es: 'todos',
        color: 'gray-400'
      };

      return [allCategory, ...(data || [])];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}