#!/usr/bin/env node

/**
 * Brenda Cereals - Quick Diagnostic Script
 * Runs automated checks and generates diagnostic report
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface DiagnosticChecks {
  nodeModules: {
    root: boolean;
    web: boolean;
    types: boolean;
    ui: boolean;
    utils: boolean;
  };
  envFiles: {
    env: boolean;
    envExample: boolean;
    webEnv: boolean;
  };
  prisma: {
    schema: boolean;
    generated: boolean;
  };
  docker: {
    dockerfile: boolean;
    dockerCompose: boolean;
    dockerComposeDev: boolean;
  };
}

const PROJECT_ROOT: string = process.cwd();

console.log('🔍 Running Brenda Cereals Diagnostics...\n');

const diagnostics: DiagnosticChecks = {
  nodeModules: {
    root: fs.existsSync(path.join(PROJECT_ROOT, 'node_modules')),
    web: fs.existsSync(path.join(PROJECT_ROOT, 'apps/web/node_modules')),
    types: fs.existsSync(path.join(PROJECT_ROOT, 'packages/types/node_modules')),
    ui: fs.existsSync(path.join(PROJECT_ROOT, 'packages/ui/node_modules')),
    utils: fs.existsSync(path.join(PROJECT_ROOT, 'packages/utils/node_modules'))
  },
  envFiles: {
    env: fs.existsSync(path.join(PROJECT_ROOT, '.env')),
    envExample: fs.existsSync(path.join(PROJECT_ROOT, '.env.example')),
    webEnv: fs.existsSync(path.join(PROJECT_ROOT, 'apps/web/.env.local'))
  },
  prisma: {
    schema: fs.existsSync(path.join(PROJECT_ROOT, 'prisma/schema.prisma')),
    generated: fs.existsSync(path.join(PROJECT_ROOT, 'apps/web/generated/prisma'))
  },
  docker: {
    dockerfile: fs.existsSync(path.join(PROJECT_ROOT, 'Dockerfile')),
    dockerCompose: fs.existsSync(path.join(PROJECT_ROOT, 'docker-compose.yml')),
    dockerComposeDev: fs.existsSync(path.join(PROJECT_ROOT, 'docker-compose.dev.yml'))
  }
};

// Check Node.js and npm versions
let nodeVersion: string = 'Unknown';
let npmVersion: string = 'Unknown';

try {
  nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
} catch (error) {
  console.warn('⚠️  Could not determine Node.js/npm versions');
}

// Calculate health score
let score: number = 0;
let total: number = 0;

Object.values(diagnostics).forEach(category => {
  Object.values(category).forEach(check => {
    total++;
    if (check) score++;
  });
});

const healthPercentage: number = Math.round((score / total) * 100);

// Generate report
console.log('📊 DIAGNOSTIC RESULTS');
console.log('='.repeat(50));
console.log(`Node.js Version: ${nodeVersion}`);
console.log(`npm Version: ${npmVersion}`);
console.log(`Health Score: ${score}/${total} (${healthPercentage}%)\n`);

console.log('📦 DEPENDENCIES:');
console.log(`  Root node_modules: ${diagnostics.nodeModules.root ? '✅' : '❌'}`);
console.log(`  Web node_modules: ${diagnostics.nodeModules.web ? '✅' : '❌'}`);
console.log(`  Types node_modules: ${diagnostics.nodeModules.types ? '✅' : '❌'}`);
console.log(`  UI node_modules: ${diagnostics.nodeModules.ui ? '✅' : '❌'}`);
console.log(`  Utils node_modules: ${diagnostics.nodeModules.utils ? '✅' : '❌'}\n`);

console.log('⚙️  CONFIGURATION:');
console.log(`  .env file: ${diagnostics.envFiles.env ? '✅' : '❌'}`);
console.log(`  .env.example: ${diagnostics.envFiles.envExample ? '✅' : '❌'}`);
console.log(`  Web .env.local: ${diagnostics.envFiles.webEnv ? '✅' : '❌'}\n`);

console.log('🗄️  DATABASE:');
console.log(`  Prisma schema: ${diagnostics.prisma.schema ? '✅' : '❌'}`);
console.log(`  Prisma generated: ${diagnostics.prisma.generated ? '✅' : '❌'}\n`);

console.log('🐳 DOCKER:');
console.log(`  Dockerfile: ${diagnostics.docker.dockerfile ? '✅' : '❌'}`);
console.log(`  docker-compose.yml: ${diagnostics.docker.dockerCompose ? '✅' : '❌'}`);
console.log(`  docker-compose.dev.yml: ${diagnostics.docker.dockerComposeDev ? '✅' : '❌'}\n`);

// Recommendations
console.log('💡 RECOMMENDATIONS:');
if (!diagnostics.nodeModules.root || !diagnostics.nodeModules.web) {
  console.log('  → Run: npm run install-all');
}
if (!diagnostics.envFiles.env) {
  console.log('  → Create .env file from .env.example');
}
if (!diagnostics.prisma.generated) {
  console.log('  → Run: npm run db:generate');
}

console.log('\n✨ Run "npm run dev" when all checks pass!');
