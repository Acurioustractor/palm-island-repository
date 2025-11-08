#!/usr/bin/env node

/**
 * Environment Variable Validator
 *
 * This script checks that all required environment variables are set correctly.
 * Run it with: npm run check-env
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

// Required environment variables
const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

// Optional but recommended variables
const RECOMMENDED_VARS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ACCESS_TOKEN',
];

// Check if .env.local exists
function checkEnvFileExists() {
  const envPath = path.join(__dirname, '../.env.local');

  if (!fs.existsSync(envPath)) {
    console.log(`\n${colors.red}${icons.error} .env.local file not found!${colors.reset}`);
    console.log(`\n${colors.yellow}Quick fix:${colors.reset}`);
    console.log(`  cp .env.local.example .env.local`);
    console.log(`  # Then edit .env.local with your actual values\n`);
    return false;
  }

  console.log(`${colors.green}${icons.success} .env.local file exists${colors.reset}`);
  return true;
}

// Load and parse .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '../.env.local');
  const content = fs.readFileSync(envPath, 'utf8');

  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        env[key] = value;
      }
    }
  });

  return env;
}

// Validate required variables
function validateRequired(env) {
  let allValid = true;

  console.log(`\n${colors.cyan}Required Variables:${colors.reset}`);

  REQUIRED_VARS.forEach(varName => {
    const value = env[varName];

    if (!value || value.includes('your_') || value.includes('_here')) {
      console.log(`  ${colors.red}${icons.error} ${varName}${colors.reset} - Missing or placeholder value`);
      allValid = false;
    } else {
      // Validate format
      if (varName === 'NEXT_PUBLIC_SUPABASE_URL') {
        if (!value.startsWith('https://') || !value.includes('supabase.co')) {
          console.log(`  ${colors.red}${icons.error} ${varName}${colors.reset} - Invalid format (should be https://xxx.supabase.co)`);
          allValid = false;
        } else if (!value.includes('uaxhjzqrdotoahjnxmbj')) {
          console.log(`  ${colors.yellow}${icons.warning} ${varName}${colors.reset} - Using different project (expected: uaxhjzqrdotoahjnxmbj)`);
        } else {
          console.log(`  ${colors.green}${icons.success} ${varName}${colors.reset}`);
        }
      } else if (varName === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
        if (!value.startsWith('eyJ')) {
          console.log(`  ${colors.red}${icons.error} ${varName}${colors.reset} - Invalid JWT format`);
          allValid = false;
        } else {
          console.log(`  ${colors.green}${icons.success} ${varName}${colors.reset}`);
        }
      } else {
        console.log(`  ${colors.green}${icons.success} ${varName}${colors.reset}`);
      }
    }
  });

  return allValid;
}

// Validate recommended variables
function validateRecommended(env) {
  console.log(`\n${colors.cyan}Recommended Variables:${colors.reset}`);

  RECOMMENDED_VARS.forEach(varName => {
    const value = env[varName];

    if (!value || value.includes('your_') || value.includes('_here')) {
      console.log(`  ${colors.yellow}${icons.warning} ${varName}${colors.reset} - Not set (some features may not work)`);
    } else {
      console.log(`  ${colors.green}${icons.success} ${varName}${colors.reset}`);
    }
  });
}

// Main validation
function main() {
  console.log(`\n${colors.blue}==============================================`);
  console.log(`  Environment Variables Check`);
  console.log(`==============================================${colors.reset}\n`);

  // Check if .env.local exists
  if (!checkEnvFileExists()) {
    process.exit(1);
  }

  // Load environment variables
  const env = loadEnvFile();

  // Validate required variables
  const requiredValid = validateRequired(env);

  // Validate recommended variables
  validateRecommended(env);

  // Final result
  console.log(`\n${colors.blue}==============================================${colors.reset}`);

  if (requiredValid) {
    console.log(`\n${colors.green}${icons.success} All required environment variables are set correctly!${colors.reset}\n`);

    console.log(`${colors.cyan}Next steps:${colors.reset}`);
    console.log(`  1. Link Supabase: supabase link --project-ref uaxhjzqrdotoahjnxmbj`);
    console.log(`  2. Generate types: supabase gen types typescript --linked > lib/supabase/database.types.ts`);
    console.log(`  3. Start dev server: npm run dev\n`);

    process.exit(0);
  } else {
    console.log(`\n${colors.red}${icons.error} Some required environment variables are missing or invalid!${colors.reset}\n`);

    console.log(`${colors.yellow}How to fix:${colors.reset}`);
    console.log(`  1. Open .env.local in your editor`);
    console.log(`  2. Get your keys from: ${colors.cyan}https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/settings/api${colors.reset}`);
    console.log(`  3. Copy the ANON_KEY and SERVICE_ROLE_KEY into .env.local`);
    console.log(`  4. Run this script again: npm run check-env\n`);

    process.exit(1);
  }
}

main();
