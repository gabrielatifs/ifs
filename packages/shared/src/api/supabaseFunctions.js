import { supabase } from "../lib/supabase.js";

/**
 * Invokes a Supabase Edge Function.
 * Assumes the function expects a JSON body (the first argument).
 */
export const invokeFunction = (name) => async (payload = {}) => {
    console.log(`[supabaseFunctions] Invoking ${name}`, payload);
    if (!supabase?.functions?.invoke) {
        console.error('[supabaseFunctions] Supabase functions are unavailable', supabase);
        throw new Error('Supabase functions are unavailable');
    }
    const { data, error } = await supabase.functions.invoke(name, {
        body: payload,
    });

    if (error) {
        console.error(`Error invoking function ${name}:`, error);
        throw error;
    }

    console.log(`[supabaseFunctions] ${name} response`, data);
    return data;
};
