import { supabase } from "../lib/supabase.js";

/**
 * Invokes a Supabase Edge Function.
 * Assumes the function expects a JSON body (the first argument).
 */
export const invokeFunction = (name) => async (payload = {}) => {
    const { data, error } = await supabase.functions.invoke(name, {
        body: payload,
    });

    if (error) {
        console.error(`Error invoking function ${name}:`, error);
        throw error;
    }

    return data;
};
