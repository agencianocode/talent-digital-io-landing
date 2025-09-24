#!/usr/bin/env node

/**
 * Script de build y deployment para el Marketplace
 * Optimiza y prepara el marketplace para producción
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración
const config = {
  buildDir: 'dist',
  marketplaceDir: 'dist/marketplace',
  assetsDir: 'dist/assets',
  outputDir: 'build-output',
  tempDir: 'temp-build'
};

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Utilidades
const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, colors.green);
const logError = (message) => log(`❌ ${message}`, colors.red);
const logWarning = (message) => log(`⚠️  ${message}`, colors.yellow);
const logInfo = (message) => log(`ℹ️  ${message}`, colors.blue);

// Verificar dependencias
const checkDependencies = () => {
  logInfo('Verificando dependencias...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'react',
    'react-dom',
    'react-router-dom',
    '@types/react',
    '@types/react-dom',
    'typescript',
    'vite',
    'tailwindcss'
  ];
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
  );
  
  if (missingDeps.length > 0) {
    logError(`Dependencias faltantes: ${missingDeps.join(', ')}`);
    return false;
  }
  
  logSuccess('Todas las dependencias están instaladas');
  return true;
};

// Limpiar directorios de build
const cleanBuildDirs = () => {
  logInfo('Limpiando directorios de build...');
  
  const dirsToClean = [config.buildDir, config.outputDir, config.tempDir];
  
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      logInfo(`Directorio limpiado: ${dir}`);
    }
  });
  
  logSuccess('Directorios de build limpiados');
};

// Ejecutar build de producción
const runProductionBuild = () => {
  logInfo('Ejecutando build de producción...');
  
  try {
    // Build con Vite
    execSync('npm run build', { stdio: 'inherit' });
    logSuccess('Build de producción completado');
    return true;
  } catch (error) {
    logError(`Error en build de producción: ${error.message}`);
    return false;
  }
};

// Optimizar assets del marketplace
const optimizeMarketplaceAssets = () => {
  logInfo('Optimizando assets del marketplace...');
  
  try {
    // Crear directorio del marketplace
    if (!fs.existsSync(config.marketplaceDir)) {
      fs.mkdirSync(config.marketplaceDir, { recursive: true });
    }
    
    // Copiar archivos específicos del marketplace
    const marketplaceFiles = [
      'src/components/marketplace/',
      'src/hooks/useMarketplaceServices.ts',
      'src/hooks/useTalentServices.ts',
      'src/pages/BusinessMarketplace.tsx',
      'src/pages/TalentMarketplace.tsx',
      'src/lib/marketplace-categories.ts'
    ];
    
    marketplaceFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const destPath = path.join(config.marketplaceDir, path.basename(file));
        if (fs.statSync(file).isDirectory()) {
          fs.cpSync(file, destPath, { recursive: true });
        } else {
          fs.copyFileSync(file, destPath);
        }
        logInfo(`Archivo copiado: ${file}`);
      }
    });
    
    logSuccess('Assets del marketplace optimizados');
    return true;
  } catch (error) {
    logError(`Error optimizando assets: ${error.message}`);
    return false;
  }
};

// Generar manifest del marketplace
const generateMarketplaceManifest = () => {
  logInfo('Generando manifest del marketplace...');
  
  const manifest = {
    name: 'TalentoDigital.io Marketplace',
    version: '1.0.0',
    description: 'Marketplace de servicios para talentos y empresas',
    buildDate: new Date().toISOString(),
    components: [
      'ServiceCard',
      'ServiceForm',
      'ServiceFilters',
      'ServiceRequestModal',
      'TalentServiceCard',
      'ServiceRequestsList'
    ],
    pages: [
      'BusinessMarketplace',
      'TalentMarketplace'
    ],
    hooks: [
      'useMarketplaceServices',
      'useTalentServices'
    ],
    features: [
      'Service catalog',
      'Service management',
      'Request system',
      'Filtering and search',
      'Responsive design',
      'TypeScript support'
    ],
    performance: {
      lazyLoading: true,
      memoization: true,
      pagination: true,
      debouncing: true
    }
  };
  
  const manifestPath = path.join(config.marketplaceDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  logSuccess(`Manifest generado: ${manifestPath}`);
  return true;
};

// Validar build
const validateBuild = () => {
  logInfo('Validando build...');
  
  const requiredFiles = [
    'dist/index.html',
    'dist/assets/index.css',
    'dist/assets/index.js'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    logError(`Archivos faltantes en build: ${missingFiles.join(', ')}`);
    return false;
  }
  
  // Verificar tamaño de archivos
  const indexJsPath = 'dist/assets/index.js';
  if (fs.existsSync(indexJsPath)) {
    const stats = fs.statSync(indexJsPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    logInfo(`Tamaño del bundle principal: ${sizeInMB}MB`);
    
    if (stats.size > 5 * 1024 * 1024) { // 5MB
      logWarning('Bundle principal es muy grande (>5MB)');
    }
  }
  
  logSuccess('Build validado correctamente');
  return true;
};

// Generar reporte de build
const generateBuildReport = (results) => {
  logInfo('Generando reporte de build...');
  
  const report = {
    timestamp: new Date().toISOString(),
    buildId: `build-${Date.now()}`,
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter(Boolean).length,
      failed: Object.values(results).filter(r => !r).length
    },
    results: results,
    assets: {
      buildDir: config.buildDir,
      marketplaceDir: config.marketplaceDir,
      totalSize: 0
    },
    recommendations: []
  };
  
  // Calcular tamaño total
  if (fs.existsSync(config.buildDir)) {
    const calculateDirSize = (dir) => {
      let size = 0;
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          size += calculateDirSize(filePath);
        } else {
          size += stats.size;
        }
      });
      return size;
    };
    
    report.assets.totalSize = calculateDirSize(config.buildDir);
  }
  
  // Agregar recomendaciones
  if (!results.dependencies) {
    report.recommendations.push('Instalar dependencias faltantes');
  }
  
  if (!results.build) {
    report.recommendations.push('Revisar errores de build');
  }
  
  if (!results.optimization) {
    report.recommendations.push('Optimizar assets del marketplace');
  }
  
  if (!results.validation) {
    report.recommendations.push('Validar archivos de build');
  }
  
  // Guardar reporte
  const reportPath = path.join(config.outputDir, 'build-report.json');
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logSuccess(`Reporte de build guardado: ${reportPath}`);
  
  // Mostrar resumen
  log(`\n${colors.bold}📊 RESUMEN DE BUILD${colors.reset}`);
  log(`Build ID: ${report.buildId}`);
  log(`Total de verificaciones: ${report.summary.total}`);
  log(`✅ Exitosas: ${report.summary.passed}`, colors.green);
  log(`❌ Fallidas: ${report.summary.failed}`, colors.red);
  log(`Tamaño total: ${(report.assets.totalSize / (1024 * 1024)).toFixed(2)}MB`);
  
  if (report.recommendations.length > 0) {
    log(`\n${colors.bold}💡 RECOMENDACIONES:${colors.reset}`);
    report.recommendations.forEach(rec => {
      log(`• ${rec}`, colors.yellow);
    });
  }
  
  return report;
};

// Función principal
const main = () => {
  log(`${colors.bold}🏗️  INICIANDO BUILD DEL MARKETPLACE${colors.reset}\n`);
  
  const results = {};
  
  // Verificar dependencias
  results.dependencies = checkDependencies();
  
  if (!results.dependencies) {
    logError('Dependencias faltantes. Abortando build.');
    process.exit(1);
  }
  
  // Limpiar directorios
  cleanBuildDirs();
  
  // Ejecutar build
  results.build = runProductionBuild();
  
  if (!results.build) {
    logError('Build falló. Abortando proceso.');
    process.exit(1);
  }
  
  // Optimizar assets
  results.optimization = optimizeMarketplaceAssets();
  results.manifest = generateMarketplaceManifest();
  
  // Validar build
  results.validation = validateBuild();
  
  // Generar reporte
  const report = generateBuildReport(results);
  
  // Determinar código de salida
  const hasFailures = report.summary.failed > 0;
  
  if (hasFailures) {
    logError('\n❌ Build completado con errores');
    process.exit(1);
  } else {
    logSuccess('\n✅ Build completado exitosamente');
    logInfo(`Archivos de build disponibles en: ${config.buildDir}`);
    logInfo(`Assets del marketplace en: ${config.marketplaceDir}`);
    process.exit(0);
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  checkDependencies,
  cleanBuildDirs,
  runProductionBuild,
  optimizeMarketplaceAssets,
  generateMarketplaceManifest,
  validateBuild,
  generateBuildReport
};
