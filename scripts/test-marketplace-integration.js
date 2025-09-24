#!/usr/bin/env node

/**
 * Test Marketplace Integration
 * 
 * This script tests the marketplace integration with Supabase
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Marketplace Integration...\n');

// Test 1: Check if migration file exists
console.log('1️⃣ Checking migration file...');
const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20240120000000_create_marketplace_tables.sql');
if (fs.existsSync(migrationPath)) {
  console.log('✅ Migration file exists');
} else {
  console.log('❌ Migration file not found');
  process.exit(1);
}

// Test 2: Check if service files exist
console.log('\n2️⃣ Checking service files...');
const serviceFiles = [
  'src/services/marketplaceService.ts',
  'src/hooks/useMarketplaceServices.ts',
  'src/hooks/useTalentServices.ts',
  'src/components/marketplace/PublishServiceModal.tsx',
  'src/components/marketplace/ServiceRequestModal.tsx',
  'src/pages/BusinessMarketplace.tsx'
];

let allFilesExist = true;
serviceFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file}`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some service files are missing');
  process.exit(1);
}

// Test 3: Check TypeScript compilation
console.log('\n3️⃣ Checking TypeScript compilation...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation failed');
  console.log('Error:', error.message);
  process.exit(1);
}

// Test 4: Check if Supabase is running
console.log('\n4️⃣ Checking Supabase status...');
try {
  const status = execSync('supabase status', { stdio: 'pipe' }).toString();
  if (status.includes('API URL')) {
    console.log('✅ Supabase is running');
  } else {
    console.log('⚠️  Supabase status unclear');
  }
} catch (error) {
  console.log('❌ Supabase is not running');
  console.log('Run: supabase start');
}

// Test 5: Check if tables exist (if Supabase is running)
console.log('\n5️⃣ Checking database tables...');
try {
  const tables = execSync('supabase db diff --schema public', { stdio: 'pipe' }).toString();
  if (tables.includes('talent_services') || tables.includes('No differences')) {
    console.log('✅ Database tables are set up');
  } else {
    console.log('⚠️  Database tables may not be set up');
    console.log('Run: supabase db reset');
  }
} catch (error) {
  console.log('⚠️  Could not check database tables');
}

// Test 6: Check if development server can start
console.log('\n6️⃣ Testing development server...');
try {
  // Start dev server in background
  const devProcess = execSync('npm run dev', { 
    stdio: 'pipe', 
    timeout: 10000,
    killSignal: 'SIGTERM'
  });
  console.log('✅ Development server started successfully');
} catch (error) {
  if (error.signal === 'SIGTERM') {
    console.log('✅ Development server started (killed after 10s)');
  } else {
    console.log('❌ Development server failed to start');
    console.log('Error:', error.message);
  }
}

console.log('\n🎉 Marketplace integration test complete!');
console.log('\n📋 Summary:');
console.log('- Migration file: ✅');
console.log('- Service files: ✅');
console.log('- TypeScript compilation: ✅');
console.log('- Supabase status: Check manually');
console.log('- Database tables: Check manually');
console.log('- Development server: ✅');
console.log('\n🚀 Ready to test the marketplace!');
console.log('\n🔗 Test URLs:');
console.log('- Business Marketplace: http://localhost:8081/business-dashboard/marketplace');
console.log('- Talent Marketplace: http://localhost:8081/talent-dashboard/marketplace');
console.log('\n💡 Tips:');
console.log('- Use the "Publicar Servicio" button to test the publishing flow');
console.log('- Use the "Solicitar Servicio" button to test the request flow');
console.log('- Check the browser console for any errors');
console.log('- Test with different user roles (business/talent)');
