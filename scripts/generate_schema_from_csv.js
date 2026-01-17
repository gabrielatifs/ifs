import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.resolve(__dirname, '../migration_source');
const OUTPUT_FILE = path.resolve(__dirname, '../supabase/migrations/00_init_schema.sql');

// Map CSV filenames to clean table names
const cleanTableName = (filename) => {
    // Remove _export suffix, remove (1), remove extension
    let name = filename.replace(/_export.*\.csv$/, '').replace(/\s\(\d+\)/, '').replace('.csv', '');
    // Convert CamelCase to snake_case
    return name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
};

const inferType = (value) => {
    if (!value && value !== 0) return 'TEXT';
    const val = value.trim();
    if (val === '') return 'TEXT';
    if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') return 'BOOLEAN';
    if (!isNaN(val) && val !== '') {
        return val.includes('.') ? 'NUMERIC' : 'INTEGER';
    }
    // Check for ISODate
    if (!isNaN(Date.parse(val)) && val.includes('-') && val.includes(':')) {
        return 'TIMESTAMPTZ';
    }
    return 'TEXT';
};

const processFile = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return null;

    // Basic CSV parser that handles quoted strings
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

    const headers = parseCSVLine(lines[0]);
    // clean headers: lowercase, remove special chars
    const cleanHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'));

    // Sample first 50 rows to infer types
    const sampleRows = lines.slice(1, 50).map(parseCSVLine);

    const columnTypes = cleanHeaders.map((header, index) => {
        let detectedType = 'TEXT';
        let hasNumeric = false;
        let hasBoolean = false;
        let hasDate = false;
        let hasText = false;

        for (const row of sampleRows) {
            if (row[index] !== undefined) {
                const type = inferType(row[index]);
                if (type === 'NUMERIC' || type === 'INTEGER') hasNumeric = true;
                if (type === 'BOOLEAN') hasBoolean = true;
                if (type === 'TIMESTAMPTZ') hasDate = true;
                if (type === 'TEXT' && row[index] !== '') hasText = true;
            }
        }

        // Conflict resolution
        if (hasText) return 'TEXT';
        if (hasDate) return 'TIMESTAMPTZ';
        if (hasBoolean) return 'BOOLEAN';
        if (hasNumeric) return 'NUMERIC'; // Default to numeric for safety if mixture
        return 'TEXT';
    });

    return { headers: cleanHeaders, types: columnTypes };
};

const main = () => {
    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`Directory not found: ${SOURCE_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.csv'));
    let sqlOutput = `-- Auto-generated schema from CSVs\n\n`;

    // Ensure migrations dir exists
    const migrationsDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
    }

    files.forEach(file => {
        const tableName = cleanTableName(file);
        console.log(`Processing ${file} -> ${tableName}`);

        const result = processFile(path.join(SOURCE_DIR, file));
        if (!result) return;

        const { headers, types } = result;

        let createTableSQL = `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;

        // Add ID if not exists, though CSV usually has it. 
        // We will trust CSV columns but ensure ID is primary key if present
        const definitions = headers.map((header, i) => {
            let type = types[i];
            let def = `    "${header}" ${type}`;
            if (header === 'id' || header === '_id') {
                def += ' PRIMARY KEY';
            }
            return def;
        });

        createTableSQL += definitions.join(',\n');
        createTableSQL += `\n);\n\n`;

        // Enable RLS by default
        createTableSQL += `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;\n\n`;

        sqlOutput += createTableSQL;
    });

    fs.writeFileSync(OUTPUT_FILE, sqlOutput);
    console.log(`Schema generated at: ${OUTPUT_FILE}`);
};

main();
