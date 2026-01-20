import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const createMockSupabase = () => {
  const disabledError = new Error('Supabase is disabled in local/no-db mode.');

  const chain = () => ({
    select: () => chain(),
    insert: async () => ({ data: null, error: disabledError }),
    upsert: async () => ({ data: null, error: disabledError }),
    update: async () => ({ data: null, error: disabledError }),
    delete: async () => ({ data: null, error: disabledError }),
    eq: () => chain(),
    neq: () => chain(),
    in: () => chain(),
    order: () => chain(),
    limit: () => chain(),
    single: async () => ({ data: null, error: disabledError }),
    maybeSingle: async () => ({ data: null, error: disabledError }),
    then: (resolve) => Promise.resolve({ data: null, error: disabledError }).then(resolve),
  });

  return {
    from: () => chain(),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: async () => ({ data: null, error: disabledError }),
      signOut: async () => ({ error: null }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: disabledError }),
        download: async () => ({ data: null, error: disabledError }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    functions: {
      invoke: async () => ({ data: null, error: disabledError }),
    },
  };
};

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : createMockSupabase();
