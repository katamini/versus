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
  
  sql += 'CREATE TABLE IF NOT EXISTS facts (\n';
  sql += '  id TEXT PRIMARY KEY,\n';
  sql += '  description TEXT NOT NULL,\n';
  sql += '  category TEXT NOT NULL,\n';
  sql += '  image TEXT\n';
  sql += ');\n\n';
  
  sql += 'CREATE TABLE IF NOT EXISTS pick_facts (\n';
  sql += '  pick_id TEXT NOT NULL,\n';
  sql += '  fact_id TEXT NOT NULL,\n';
  sql += '  PRIMARY KEY (pick_id, fact_id),\n';
  sql += '  FOREIGN KEY (pick_id) REFERENCES picks(id),\n';
  sql += '  FOREIGN KEY (fact_id) REFERENCES facts(id)\n';
  sql += ');\n\n';
  
  // Insert facts
  if (jsonData.facts) {
    for (const fact of jsonData.facts) {
      const imageValue = fact.image ? `'${fact.image.replace(/'/g, "''")}'` : 'NULL';
      sql += `INSERT INTO facts (id, description, category, image) VALUES ('${fact.id.replace(/'/g, "''")}', '${fact.description.replace(/'/g, "''")}', '${fact.category.replace(/'/g, "''")}', ${imageValue});\n`;
    }
    sql += '\n';
  }
  
  // Insert picks and pick_facts
  if (jsonData.picks) {
    for (const pick of jsonData.picks) {
      const imageValue = pick.image ? `'${pick.image.replace(/'/g, "''")}'` : 'NULL';
      sql += `INSERT INTO picks (id, name, image) VALUES ('${pick.id.replace(/'/g, "''")}', '${pick.name.replace(/'/g, "''")}', ${imageValue});\n`;
      
      if (pick.factIds && Array.isArray(pick.factIds)) {
        for (const factId of pick.factIds) {
          sql += `INSERT INTO pick_facts (pick_id, fact_id) VALUES ('${pick.id.replace(/'/g, "''")}', '${factId.replace(/'/g, "''")}');\n`;
        }
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
      
      // Count facts
      const allFacts = new Set();
      if (jsonData.facts && Array.isArray(jsonData.facts)) {
        jsonData.facts.forEach(fact => allFacts.add(fact.id));
      }
      console.log(`  - Found ${allFacts.size} facts`);
      
      // Generate SQL script
      generateSQLiteScript(jsonData, sqlPath);
      
      // Always copy/sync JSON to public/data (overwrite to avoid stale data)
      const publicJsonPath = path.join(publicDataDir, jsonFile);
      fs.copyFileSync(jsonPath, publicJsonPath);
      console.log(`✓ Synced JSON to: ${publicJsonPath}`);
      
    } catch (error) {
      console.error(`✗ Error processing ${jsonFile}:`, error.message);
    }
  }
  
  console.log('\n✓ Database generation complete!');
}

// Run the script
main();
