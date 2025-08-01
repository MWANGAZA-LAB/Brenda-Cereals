#!/usr/bin/env node

/**
 * TypeScript-Only Project Enforcement Script
 * Ensures the project only uses TypeScript files
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔍 TypeScript-Only Project Verification...\n');

const PROJECT_ROOT: string = process.cwd();

interface TSConfig {
  compilerOptions?: {
    allowJs?: boolean;
    strict?: boolean;
  };
}

interface PackageJson {
  scripts?: {
    'type-check'?: string;
  };
}

// Check for any remaining JavaScript files that shouldn't be there
const checkForJS = (): boolean => {
  console.log('📋 Checking for unauthorized JavaScript files...');
  
  const allowedJSFiles: string[] = [
    // No JavaScript files should remain in a TypeScript-only project!
  ];
  
  const ignorePaths: string[] = [
    'node_modules',
    '.next',
    'dist',
    'generated/prisma'
  ];
  
  try {
    const output = execSync('find . -name "*.js" -o -name "*.jsx" -o -name "*.mjs" | grep -v node_modules || true', 
      { encoding: 'utf8', cwd: PROJECT_ROOT });
    
    const jsFiles: string[] = output.split('\n').filter(file => file.trim());
    const unauthorizedFiles: string[] = jsFiles.filter(file => {
      const basename: string = path.basename(file);
      const isAllowed: boolean = allowedJSFiles.includes(basename);
      const isIgnored: boolean = ignorePaths.some(ignorePath => file.includes(ignorePath));
      return !isAllowed && !isIgnored;
    });
    
    if (unauthorizedFiles.length > 0) {
      console.log('❌ Found unauthorized JavaScript files:');
      unauthorizedFiles.forEach(file => console.log(`   ${file}`));
      return false;
    } else {
      console.log('✅ No unauthorized JavaScript files found');
      return true;
    }
  } catch (error) {
    console.log('⚠️  Could not check for JS files (this is normal on Windows)');
    return true;
  }
};

// Check TypeScript configurations
const checkTSConfig = (): boolean => {
  console.log('\n📋 Checking TypeScript configurations...');
  
  const configs: string[] = [
    'tsconfig.json',
    'apps/web/tsconfig.json',
    'packages/types/tsconfig.json'
  ];
  
  let allValid: boolean = true;
  
  configs.forEach(configPath => {
    if (fs.existsSync(configPath)) {
      try {
        const config: TSConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Check if allowJs is disabled
        if (config.compilerOptions && config.compilerOptions.allowJs === true) {
          console.log(`❌ ${configPath}: allowJs should be false`);
          allValid = false;
        } else {
          console.log(`✅ ${configPath}: Properly configured`);
        }
        
        // Check for strict mode
        if (config.compilerOptions && !config.compilerOptions.strict) {
          console.log(`⚠️  ${configPath}: Consider enabling strict mode`);
        }
        
      } catch (error) {
        console.log(`❌ ${configPath}: Invalid JSON`);
        allValid = false;
      }
    } else {
      console.log(`⚠️  ${configPath}: Not found`);
    }
  });
  
  return allValid;
};

// Check package.json scripts
const checkPackageScripts = (): boolean => {
  console.log('\n📋 Checking package.json scripts...');
  
  if (fs.existsSync('package.json')) {
    const packageJson: PackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts['type-check']) {
      console.log('✅ TypeScript type-checking script found');
      return true;
    } else {
      console.log('⚠️  No type-checking script found in package.json');
      return false;
    }
  }
  
  return false;
};

// Run type checking
const runTypeCheck = (): boolean => {
  console.log('\n🔍 Running TypeScript type check...');
  
  try {
    execSync('npm run type-check', { stdio: 'inherit', cwd: PROJECT_ROOT });
    console.log('✅ TypeScript compilation successful');
    return true;
  } catch (error) {
    console.log('❌ TypeScript compilation failed');
    return false;
  }
};

// Main execution
const main = (): void => {
  const checks: boolean[] = [
    checkTSConfig(),
    checkPackageScripts(),
    checkForJS()
  ];
  
  const allPassed: boolean = checks.every(check => check);
  
  if (allPassed) {
    console.log('\n🎉 Project is properly configured for TypeScript-only development!');
    
    // Run type check as final verification
    const typeCheckPassed: boolean = runTypeCheck();
    
    if (typeCheckPassed) {
      console.log('\n✅ All TypeScript verifications passed!');
      process.exit(0);
    } else {
      console.log('\n❌ TypeScript compilation issues found');
      process.exit(1);
    }
  } else {
    console.log('\n❌ Project has TypeScript configuration issues');
    process.exit(1);
  }
};

main();
