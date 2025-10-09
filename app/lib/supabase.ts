import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { zustandStorage } from '@/storage/mmkv';

const extra = (Constants.expoConfig as any)?.extra || (Constants.manifest as any)?.extra || {};

const supabaseUrl: string | undefined = extra?.supabaseUrl;
const supabaseAnonKey: string | undefined = extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('[Supabase] Missing Supabase URL or Anon Key in app.json extra');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    storage: zustandStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
