/**
 * Mock Supabase Client for LocalStorage-only Implementation
 *
 * This file provides mock implementations to maintain compatibility
 * with any remaining references to the Supabase client.
 */

console.warn(
  "⚠️  Supabase client is disabled. Application is running in localStorage-only mode."
);

// Mock client that throws helpful errors
export const supabase = null;

export const isSupabaseConfigured = false;

export function getSupabaseClient() {
  throw new Error(
    "Supabase is disabled. This application now runs entirely on localStorage."
  );
}
