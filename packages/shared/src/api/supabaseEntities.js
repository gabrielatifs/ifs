import { supabase } from "../lib/supabase.js";

// Helper to map app camelCase keys to DB snake_case/lowercase keys
// based on the observed schema import strategy
const normalizeKey = (key) => {
    // Special cases for timestamp/tracking fields - DB uses created_at/updated_at
    if (key === 'createdDate' || key === 'createdAt' || key === 'created_date') return 'created_at';
    if (key === 'updatedDate' || key === 'updatedAt' || key === 'updated_date') return 'updated_at';
    if (key === 'createdBy') return 'created_by_email';
    if (key === 'createdById') return 'created_by_id';
    if (key === 'isSample') return 'is_sample';

    // Convert camelCase to snake_case (userId -> user_id, eventDate -> event_date)
    return key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// Helper to convert DB keys back to camelCase for app usage
const denormalizeKey = (key) => {
    // Convert snake_case to camelCase (user_id -> userId, event_date -> eventDate)
    return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Fields that should be parsed as JSON arrays/objects
const JSON_FIELDS = ['questions', 'sections', 'responses', 'messages', 'tags', 'resources', 'metadata', 'subcategories'];

// Fields that should be converted to booleans
const BOOLEAN_FIELDS = ['is_always_available', 'allow_multiple_responses', 'is_featured', 'is_anonymous', 'completed'];

// Helper to parse a value based on its field name (DB -> App)
const parseValue = (key, value) => {
    if (value === null || value === undefined) return value;

    // Parse JSON fields
    if (JSON_FIELDS.includes(key) && typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch {
            return value; // Return original if parsing fails
        }
    }

    // Convert boolean strings
    if (BOOLEAN_FIELDS.includes(key) && typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }

    return value;
};

// Helper to serialize a value for storage (App -> DB)
const serializeValue = (key, value) => {
    if (value === null || value === undefined) return value;

    // Stringify JSON fields (arrays/objects)
    if (JSON_FIELDS.includes(key) && (Array.isArray(value) || (typeof value === 'object' && value !== null))) {
        return JSON.stringify(value);
    }

    // Convert booleans to strings for TEXT columns
    if (BOOLEAN_FIELDS.includes(key) && typeof value === 'boolean') {
        return value.toString();
    }

    return value;
};

// Helper to transform an object's keys from DB format to app format
const denormalizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(denormalizeObject);

    const denormalized = {};
    Object.entries(obj).forEach(([key, value]) => {
        const parsedValue = parseValue(key, value);
        denormalized[denormalizeKey(key)] = parsedValue;
    });
    return denormalized;
};

const createSupabaseEntity = (tableName) => ({
    list: async (sortField, limit) => {
        let query = supabase.from(tableName).select('*');
        if (sortField) {
            // Translate legacy Base44 sort: "-field.asc" or "-field" -> { ascending: false }
            let field = sortField;
            let ascending = true;

            if (field.startsWith('-')) {
                ascending = false;
                field = field.substring(1);
            }

            field = field.replace('.asc', '').replace('.desc', '');

            // Normalize the sort field name
            field = normalizeKey(field);

            query = query.order(field, { ascending });
        }
        if (limit) query = query.limit(limit);
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(denormalizeObject);
    },

    filter: async (query = {}, sortField, limit) => {
        let q = supabase.from(tableName).select('*');

        // Apply filters with normalized keys
        Object.entries(query).forEach(([key, value]) => {
            q = q.eq(normalizeKey(key), value);
        });

        if (sortField) {
            let field = sortField;
            let ascending = true;
            if (field.startsWith('-')) {
                ascending = false;
                field = field.substring(1);
            }
            field = field.replace('.asc', '').replace('.desc', '');

            // Normalize sort field
            field = normalizeKey(field);

            q = q.order(field, { ascending });
        }
        if (limit) q = q.limit(limit);

        const { data, error } = await q;
        if (error) throw error;
        return (data || []).map(denormalizeObject);
    },

    get: async (id) => {
        const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
        if (error) return null; // Supabase returns error for no rows usually, handle gracefully
        return denormalizeObject(data);
    },

    // Legacy aliases
    find: async (query = {}) => {
        let q = supabase.from(tableName).select('*');
        Object.entries(query).forEach(([key, value]) => {
            q = q.eq(normalizeKey(key), value);
        });
        const { data, error } = await q;
        if (error) throw error;
        const denormalizedItems = (data || []).map(denormalizeObject);
        return { items: denormalizedItems, total: denormalizedItems.length };
    },

    findOne: async (id) => {
        const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
        if (error) return null;
        return denormalizeObject(data);
    },

    findMany: async (query = {}) => {
        let q = supabase.from(tableName).select('*');
        Object.entries(query).forEach(([key, value]) => {
            q = q.eq(normalizeKey(key), value);
        });
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).map(denormalizeObject);
    },

    count: async (query = {}) => {
        let q = supabase.from(tableName).select('*', { count: 'exact', head: true });
        Object.entries(query).forEach(([key, value]) => {
            q = q.eq(normalizeKey(key), value);
        });
        const { count, error } = await q;
        if (error) throw error;
        return count;
    },

    create: async (data) => {
        const normalizedData = {};
        if (!Object.prototype.hasOwnProperty.call(data, 'id')) {
            const generatedId = globalThis.crypto?.randomUUID?.();
            normalizedData.id = generatedId || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        }
        Object.entries(data).forEach(([key, value]) => {
            const normalizedKey = normalizeKey(key);
            normalizedData[normalizedKey] = serializeValue(normalizedKey, value);
        });

        const { data: created, error } = await supabase.from(tableName).insert(normalizedData).select().single();
        if (error) throw error;
        return denormalizeObject(created);
    },

    update: async (id, data) => {
        const normalizedData = {};
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'id') {
                const normalizedKey = normalizeKey(key);
                normalizedData[normalizedKey] = serializeValue(normalizedKey, value);
            }
        });

        const { data: updated, error } = await supabase.from(tableName).update(normalizedData).eq('id', id).select().single();
        if (error) throw error;
        return denormalizeObject(updated);
    },

    delete: async (id) => {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    upsert: async (query, data) => {
        const normalizedData = {};
        Object.entries(data).forEach(([key, value]) => {
            const normalizedKey = normalizeKey(key);
            normalizedData[normalizedKey] = serializeValue(normalizedKey, value);
        });

        const { data: result, error } = await supabase.from(tableName).upsert(normalizedData).select().single();
        if (error) throw error;
        return denormalizeObject(result);
    }
});

export default createSupabaseEntity;
