import { QueryClient } from "@tanstack/react-query";

// Simple query client for frontend-only app with Supabase
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});

// Legacy function kept for compatibility - but it won't be used with server routes
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.warn('apiRequest called but no backend server is available. This is a frontend-only app.');
  throw new Error('API requests are not available in frontend-only mode. Use Supabase client instead.');
}
