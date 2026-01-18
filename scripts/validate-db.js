#!/usr/bin/env node

/**
 * Validate game database files
 * Checks JSON structure and generated SQL files
 */

const fs = require('fs');
const path = require('path');

function validateJSON(jsonPath) {
  console.log(`\nValidating: ${path.basename(jsonPath)}`);
  
  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Check required structure
    if (!data.picks || !Array.isArray(data.picks)) {
      throw new Error('Missing or invalid "picks" array');
    }
    
    if (data.picks.length === 0) {
      throw new Error('No picks defined in database');
    }
    
    if (!data.facts || !Array.isArray(data.facts)) {
      throw new Error('Missing or invalid "facts" array');
    }
    
    if (data.facts.length === 0) {
      throw new Error('No facts defined in database');
    }
    
    // Validate facts
    const factIds = new Set();
    for (let i = 0; i < data.facts.length; i++) {
      const fact = data.facts[i];
      
      if (!fact.id) {
        throw new Error(`Fact at index ${i} is missing an 'id' field`);
      }
      
      if (factIds.has(fact.id)) {
        throw new Error(`Duplicate fact id: ${fact.id}`);
      }
      factIds.add(fact.id);
      
      if (!fact.description) {
        throw new Error(`Fact ${fact.id} is missing a 'description' field`);
      }
      
      if (!fact.category) {
        throw new Error(`Fact ${fact.id} is missing a 'category' field`);
      }
    }
    
    // Validate each pick
    const pickIds = new Set();
    for (let i = 0; i < data.picks.length; i++) {
      const pick = data.picks[i];
      
      if (!pick.id) {
        throw new Error(`Pick at index ${i} is missing an 'id' field`);
      }
      
      if (pickIds.has(pick.id)) {
        throw new Error(`Duplicate pick id: ${pick.id}`);
      }
      pickIds.add(pick.id);
      
      if (!pick.name) {
        throw new Error(`Pick ${pick.id} is missing a 'name' field`);
      }
      
      if (!pick.factIds || !Array.isArray(pick.factIds)) {
        throw new Error(`Pick ${pick.id} is missing or has invalid 'factIds' array`);
      }
      
      if (pick.factIds.length === 0) {
        throw new Error(`Pick ${pick.id} has no facts assigned`);
      }
      
      // Validate that factIds reference existing facts
      for (const factId of pick.factIds) {
        if (!factIds.has(factId)) {
          throw new Error(`Pick ${pick.id} references non-existent fact: ${factId}`);
        }
      }
    }
    
    console.log(`  ✓ Valid structure`);
    console.log(`  ✓ ${data.facts.length} facts validated`);
    console.log(`  ✓ ${data.picks.length} picks validated`);
    console.log(`  ✓ ${pickIds.size} unique pick IDs`);
    
    // Check for fact distribution (needed for gameplay)
    const factUsageCount = new Map();
    for (const pick of data.picks) {
      for (const factId of pick.factIds) {
        factUsageCount.set(factId, (factUsageCount.get(factId) || 0) + 1);
      }
    }
    
    const sharedFacts = Array.from(factUsageCount.entries())
      .filter(([_, count]) => count > 1);
    
    if (sharedFacts.length > 0) {
      console.warn(`  ⚠ Warning: ${sharedFacts.length} facts are shared by multiple picks. This may reduce game variety.`);
    }
    
    const picksWithoutFacts = data.picks.filter(p => !p.factIds || p.factIds.length === 0).length;
    if (picksWithoutFacts > 0) {
      console.warn(`  ⚠ Warning: ${picksWithoutFacts} picks have no facts assigned`);
    }
    
    console.log(`  ✓ All fact references are valid`);
    
    return true;
  } catch (error) {
    console.error(`  ✗ Validation failed: ${error.message}`);
    return false;
  }
}

function validateSQL(sqlPath) {
  console.log(`\nValidating SQL: ${path.basename(sqlPath)}`);
  
  try {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Check for required tables
    const requiredTables = ['picks', 'facts', 'pick_facts'];
    for (const table of requiredTables) {
      const tablePattern = new RegExp(`CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?${table}`, 'i');
      if (!tablePattern.test(sql)) {
        throw new Error(`Missing CREATE TABLE ${table} statement`);
      }
    }
    
    // Check for INSERT statements
    if (!sql.includes('INSERT INTO picks')) {
      throw new Error('No picks inserted');
    }
    
    if (!sql.includes('INSERT INTO facts')) {
      throw new Error('No facts inserted');
    }
    
    if (!sql.includes('INSERT INTO pick_facts')) {
      throw new Error('No pick_facts relationships inserted');
    }
    
    console.log(`  ✓ SQL structure is valid`);
    return true;
  } catch (error) {
    console.error(`  ✗ SQL validation failed: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('=== VERSUS Database Validation ===\n');
  
  const dataDir = path.join(__dirname, '../data');
  const publicDataDir = path.join(__dirname, '../public/data');
  
  let allValid = true;
  
  // Validate JSON files in data/
  console.log('--- Validating JSON files ---');
  const jsonFiles = fs.readdirSync(dataDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(dataDir, file));
  
  if (jsonFiles.length === 0) {
    console.error('✗ No JSON files found in data directory');
    process.exit(1);
  }
  
  for (const jsonFile of jsonFiles) {
    if (!validateJSON(jsonFile)) {
      allValid = false;
    }
  }
  
  // Validate SQL files in public/data/
  console.log('\n--- Validating SQL files ---');
  if (fs.existsSync(publicDataDir)) {
    const sqlFiles = fs.readdirSync(publicDataDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => path.join(publicDataDir, file));
    
    if (sqlFiles.length === 0) {
      console.warn('⚠ No SQL files found in public/data directory (run generate-db.js first)');
    } else {
      for (const sqlFile of sqlFiles) {
        if (!validateSQL(sqlFile)) {
          allValid = false;
        }
      }
    }
  } else {
    console.warn('⚠ public/data directory does not exist');
  }
  
  console.log('\n=== Validation Complete ===');
  if (allValid) {
    console.log('✓ All validations passed!');
    process.exit(0);
  } else {
    console.error('✗ Some validations failed');
    process.exit(1);
  }
}

// Run the script
main();
