#!/usr/bin/env node

/**
 * Generate SQLite database from JSON data
 * This script reads JSON files from data/ and generates SQLite databases
 */

const fs = require('fs');
const path = require('path');

// Simple SQLite database generator (creates SQL script)
function generateSQLiteScript(jsonData, outputPath) {
  let sql = '-- VERSUS Game Database\n';
  sql += '-- Generated: ' + new Date().toISOString() + '\n\n';
  
  sql += 'CREATE TABLE IF NOT EXISTS picks (\n';
  sql += '  id TEXT PRIMARY KEY,\n';
  sql += '  name TEXT NOT NULL,\n';
  sql += '  image TEXT\n';
  sql += ');\n\n';
  
  sql += 'CREATE TABLE IF NOT EXISTS properties (\n';
  sql += '  pick_id TEXT NOT NULL,\n';
  sql += '  property_name TEXT NOT NULL,\n';
  sql += '  value REAL NOT NULL,\n';
  sql += '  image TEXT,\n';
  sql += '  FOREIGN KEY (pick_id) REFERENCES picks(id)\n';
  sql += ');\n\n';
  
  sql += 'CREATE TABLE IF NOT EXISTS property_categories (\n';
  sql += '  name TEXT PRIMARY KEY,\n';
  sql += '  image TEXT\n';
  sql += ');\n\n';
  
  // Insert categories
  if (jsonData.propertyCategories) {
    for (const [name, category] of Object.entries(jsonData.propertyCategories)) {
      const imageValue = category.image ? `'${category.image.replace(/'/g, "''")}'` : 'NULL';
      sql += `INSERT INTO property_categories (name, image) VALUES ('${name.replace(/'/g, "''")}', ${imageValue});\n`;
    }
    sql += '\n';
  }
  
  // Insert picks and properties
  if (jsonData.picks) {
    for (const pick of jsonData.picks) {
      const imageValue = pick.image ? `'${pick.image.replace(/'/g, "''")}'` : 'NULL';
      sql += `INSERT INTO picks (id, name, image) VALUES ('${pick.id.replace(/'/g, "''")}', '${pick.name.replace(/'/g, "''")}', ${imageValue});\n`;
      
      for (const [prop, value] of Object.entries(pick.properties)) {
        const propImageValue = pick.propertyImages?.[prop] ? `'${pick.propertyImages[prop].replace(/'/g, "''")}'` : 'NULL';
        sql += `INSERT INTO properties (pick_id, property_name, value, image) VALUES ('${pick.id.replace(/'/g, "''")}', '${prop.replace(/'/g, "''")}', ${value}, ${propImageValue});\n`;
      }
      sql += '\n';
    }
  }
  
  fs.writeFileSync(outputPath, sql, 'utf8');
  console.log(`✓ Generated SQL script: ${outputPath}`);
}

// Main function
function main() {
  const dataDir = path.join(__dirname, '../data');
  const publicDataDir = path.join(__dirname, '../public/data');
  
  // Ensure public/data directory exists
  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true });
  }
  
  // Find all JSON files in data directory
  const jsonFiles = fs.readdirSync(dataDir)
    .filter(file => file.endsWith('.json'));
  
  if (jsonFiles.length === 0) {
    console.log('No JSON files found in data directory');
    return;
  }
  
  console.log(`Found ${jsonFiles.length} JSON file(s)`);
  
  for (const jsonFile of jsonFiles) {
    const jsonPath = path.join(dataDir, jsonFile);
    const baseName = path.basename(jsonFile, '.json');
    const sqlPath = path.join(publicDataDir, `${baseName}.sql`);
    
    console.log(`\nProcessing: ${jsonFile}`);
    
    try {
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      // Validate JSON structure
      if (!jsonData.picks || !Array.isArray(jsonData.picks)) {
        console.error(`✗ Invalid JSON structure in ${jsonFile}: missing or invalid 'picks' array`);
        continue;
      }
      
      console.log(`  - Found ${jsonData.picks.length} picks`);
      
      // Count properties
      const allProperties = new Set();
      for (const pick of jsonData.picks) {
        Object.keys(pick.properties || {}).forEach(prop => allProperties.add(prop));
      }
      console.log(`  - Found ${allProperties.size} unique properties`);
      
      // Generate SQL script
      generateSQLiteScript(jsonData, sqlPath);
      
      // Copy JSON to public/data if not already there
      const publicJsonPath = path.join(publicDataDir, jsonFile);
      if (!fs.existsSync(publicJsonPath)) {
        fs.copyFileSync(jsonPath, publicJsonPath);
        console.log(`✓ Copied JSON to: ${publicJsonPath}`);
      }
      
    } catch (error) {
      console.error(`✗ Error processing ${jsonFile}:`, error.message);
    }
  }
  
  console.log('\n✓ Database generation complete!');
}

// Run the script
main();
