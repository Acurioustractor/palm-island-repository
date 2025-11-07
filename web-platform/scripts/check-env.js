#!/usr/bin/env node

/**
 * Environment Variable Verification Script
 * Checks that all required env vars are set before running the app
 */

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_PICC_ORGANIZATION_ID'
];

const optional = [
  'OPENAI_API_KEY',
  'PINECONE_API_KEY',
  'PINECONE_ENVIRONMENT',
  'PINECONE_INDEX',
  'QDRANT_URL',
  'QDRANT_API_KEY',
  'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID'
];

console.log('🔍 Checking Palm Island Repository environment variables...\n');
console.log('='.repeat(60));

let hasErrors = false;
let warnings = 0;

// Check required variables
console.log('\n📋 REQUIRED VARIABLES:\n');

required.forEach(key => {
  const value = process.env[key];
  if (!value) {
    console.log(`❌ MISSING: ${key}`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const masked = value.length > 20
      ? value.slice(0, 10) + '...' + value.slice(-10)
      : value.slice(0, 5) + '...' + value.slice(-3);

    console.log(`✅ ${key}`);
    console.log(`   Value: ${masked}`);

    // Validate format
    if (key === 'NEXT_PUBLIC_SUPABASE_URL' && !value.startsWith('https://')) {
      console.log(`   ⚠️  WARNING: Should start with https://`);
      warnings++;
    }

    if (key.includes('KEY') && value.length < 20) {
      console.log(`   ⚠️  WARNING: Key seems too short`);
      warnings++;
    }
  }
});

// Check optional variables
console.log('\n🔧 OPTIONAL VARIABLES:\n');

optional.forEach(key => {
  const value = process.env[key];
  if (value) {
    const masked = value.slice(0, 5) + '...' + (value.length > 10 ? value.slice(-3) : '');
    console.log(`✅ ${key}: ${masked}`);
  } else {
    console.log(`⚪ ${key}: Not configured`);
  }
});

// Security checks
console.log('\n🔒 SECURITY CHECKS:\n');

// Check that service role key doesn't have NEXT_PUBLIC prefix
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (publicServiceKey) {
  console.log('❌ SECURITY ERROR: SUPABASE_SERVICE_ROLE_KEY has NEXT_PUBLIC_ prefix!');
  console.log('   This will expose your service role key to the browser.');
  console.log('   Remove NEXT_PUBLIC_ from this variable name immediately.');
  hasErrors = true;
}

// Check .env.local exists
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  WARNING: .env.local file not found');
  console.log('   Copy .env.local.example to .env.local');
  warnings++;
} else {
  console.log('✅ .env.local file exists');
}

// Check .gitignore includes .env.local
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
  if (gitignore.includes('.env.local')) {
    console.log('✅ .env.local is in .gitignore');
  } else {
    console.log('❌ ERROR: .env.local is NOT in .gitignore');
    console.log('   Add it to prevent committing secrets!');
    hasErrors = true;
  }
}

// Summary
console.log('\n' + '='.repeat(60));

if (hasErrors) {
  console.log('❌ ERRORS FOUND - Cannot proceed\n');
  console.log('Fix the errors above, then run this script again.');
  console.log('\nQuick fix:');
  console.log('  1. Copy .env.local.example to .env.local');
  console.log('  2. Fill in your Supabase keys');
  console.log('  3. Run: node scripts/check-env.js');
  process.exit(1);
} else if (warnings > 0) {
  console.log(`⚠️  ${warnings} WARNING(S) - Review above\n`);
  console.log('You can proceed, but consider fixing warnings.');
  console.log('\nTo start development:');
  console.log('  npm run dev');
} else {
  console.log('✅ ALL CHECKS PASSED!\n');
  console.log('Your environment is configured correctly.');
  console.log('\nNext steps:');
  console.log('  npm run dev          # Start development server');
  console.log('  npm run build        # Build for production');
  console.log('  npm run typecheck    # Check TypeScript');
}

console.log('\n📚 For help, see: web-platform/ENV_SETUP_GUIDE.md\n');
