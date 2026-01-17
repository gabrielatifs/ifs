import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.resolve(__dirname, '../migration_source');
const OUTPUT_FILE = path.resolve(__dirname, '../supabase/migrations/01_profiles.sql');

const cleanTableName = (filename) => {
    let name = filename.replace(/_export.*\.csv$/, '').replace(/\s\(\d+\)/, '').replace('.csv', '');
    return name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
};

const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result.map(s => s.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
};

const inferType = (header, values) => {
    const lowerHeader = header.toLowerCase();
    if (lowerHeader === 'id' || lowerHeader.endsWith('_id')) return 'TEXT'; // IDs are text
    if (lowerHeader.includes('date') || lowerHeader.includes('at')) return 'TIMESTAMPTZ';
    if (lowerHeader.startsWith('is') || lowerHeader.startsWith('has')) return 'BOOLEAN';

    // Check values
    let isNumber = true;
    let isBoolean = true;
    let hasValue = false;

    for (const val of values) {
        if (!val || val === '') continue;
        hasValue = true;
        if (isNaN(parseFloat(val))) isNumber = false;
        if (!['true', 'false', 'yes', 'no', '0', '1'].includes(val.toLowerCase())) isBoolean = false;
    }

    if (!hasValue) return 'TEXT'; // Default to text if empty
    if (isBoolean) return 'BOOLEAN';
    if (isNumber) return 'NUMERIC';
    return 'TEXT';
};

const generateSchema = () => {
    const files = ['profiles.csv']; // Only process profiles.csv
    let sql = '-- Auto-generated schema for profiles\n\n';

    files.forEach(file => {
        const filePath = path.join(SOURCE_DIR, file);
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return;
        }

        const tableName = cleanTableName(file);
        console.log(`Processing ${file} -> ${tableName}`);

        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);

        if (lines.length === 0) return;

        const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));
        const sampleData = lines.slice(1, 50).map(l => parseCSVLine(l)); // Check first 50 lines

        let createTable = `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;

        headers.forEach((header, index) => {
            // Get values for this column to infer type
            const values = sampleData.map(row => row[index]);
            let type = inferType(header, values);

            // Special case overrides based on known data
            if (header === 'id') type = 'TEXT PRIMARY KEY';
            if (header === 'stripe_customer_id') type = 'TEXT';
            if (header === 'stripe_subscription_id') type = 'TEXT';

            // Clean header name conflicts
            if (header === 'table') header = 'table_name';

            createTable += `    "${header}" ${type}${index < headers.length - 1 ? ',' : ''}\n`;
        });

        // Add extra columns if needed manually
        // e.g. auth_id mapping
        createTable += `    , "auth_id" UUID REFERENCES auth.users(id)\n`;

        createTable += ');\n\n';
        createTable += `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;\n\n`;

        sql += createTable;
    });

    fs.writeFileSync(OUTPUT_FILE, sql);
    console.log(`Schema generated at: ${OUTPUT_FILE}`);
};

generateSchema();
