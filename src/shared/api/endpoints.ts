/**
 * API Endpoint definitions (relative to API_BASE_URL in shared/api/client.ts)
 * Keep all paths centralized here to avoid drift.
 */
export const endpoints = {
  pages: "/pages",
  pageById: (id: string) => `/pages/${id}`,
  pageText: (id: string) => `/pages/${id}/text`,
};
