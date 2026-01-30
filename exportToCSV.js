import mongoose from 'mongoose';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

export async function exportAllCollectionsToCSV() {
    try {
        console.log('🔄 Starting database export...');
        
        // Check if already connected
        if (mongoose.connection.readyState !== 1) {
            console.log('⚠️ Database not connected, skipping export');
            return;
        }
        
        console.log('✅ Using existing MongoDB connection');

        // Create exports directory with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5); // Remove milliseconds
        const exportDir = `./database_exports/${timestamp}`;
        if (!fs.existsSync('./database_exports')) {
            fs.mkdirSync('./database_exports');
        }
        fs.mkdirSync(exportDir, { recursive: true });
        
        console.log(`📁 Export directory: ${exportDir}`);

        // Get all collection names
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📊 Found ${collections.length} collections`);

        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`\n📝 Exporting ${collectionName}...`);

            // Get all documents from the collection
            const collection = mongoose.connection.db.collection(collectionName);
            const documents = await collection.find({}).toArray();

            if (documents.length === 0) {
                console.log(`   ⚠️  ${collectionName} is empty, skipping...`);
                continue;
            }

            // Flatten nested objects and arrays for CSV
            const flattenedDocs = documents.map(doc => flattenObject(doc));

            // Get all unique keys from all documents
            const allKeys = new Set();
            flattenedDocs.forEach(doc => {
                Object.keys(doc).forEach(key => allKeys.add(key));
            });

            // Create CSV writer
            const csvPath = path.join(exportDir, `${collectionName}.csv`);
            const csvWriter = createObjectCsvWriter({
                path: csvPath,
                header: Array.from(allKeys).map(key => ({ id: key, title: key }))
            });

            // Write to CSV
            await csvWriter.writeRecords(flattenedDocs);
            console.log(`   ✅ Exported ${documents.length} records to ${csvPath}`);
        }

        console.log(`\n🎉 Export completed! Files saved in ${exportDir}/`);
        return true;

    } catch (error) {
        console.error('❌ Export Error:', error.message);
        return false;
    }
}

// Helper function to flatten nested objects
function flattenObject(obj, prefix = '') {
    let flattened = {};

    for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value === null || value === undefined) {
            flattened[newKey] = '';
        } else if (value instanceof Date) {
            flattened[newKey] = value.toISOString();
        } else if (mongoose.Types.ObjectId.isValid(value) && value.toString) {
            flattened[newKey] = value.toString();
        } else if (Array.isArray(value)) {
            // Convert arrays to JSON string for CSV
            flattened[newKey] = JSON.stringify(value);
        } else if (typeof value === 'object' && !(value instanceof Date)) {
            // Recursively flatten nested objects
            Object.assign(flattened, flattenObject(value, newKey));
        } else {
            flattened[newKey] = value;
        }
    }

    return flattened;
}

// If running directly (not imported)
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
    const config = await import('./config.js');
    const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
    
    await mongoose.connect(DB);
    await exportAllCollectionsToCSV();
    process.exit(0);
}
