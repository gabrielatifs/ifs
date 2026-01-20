// Using Supabase auth with real Supabase entities
import { auth } from './supabaseAuth';
import * as entities from './entities';
import { supabase } from '../lib/supabase';

// Use real Supabase auth and real Supabase entities
export const ifs = {
  auth,
  entities,
  functions: {
    invoke: async (functionName, params) => {
      const { data, error } = await supabase.functions.invoke(functionName, { body: params });
      if (error) throw error;
      return { data };
    }
  }
};
