#!/usr/bin/env node

/**
 * Script de testing automatizado para el Marketplace
 * Ejecuta tests específicos del marketplace y genera reportes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración
const config = {
  testDir: 'src/components/marketplace/__tests__',
  hookTestDir: 'src/hooks/__tests__',
  outputDir: 'test-results',
  coverageDir: 'coverage'
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

// Verificar que estamos en el directorio correcto
const checkProjectStructure = () => {
  logInfo('Verificando estructura del proyecto...');
  
  const requiredDirs = [
    'src/components/marketplace',
    'src/hooks',
    'src/pages'
  ];
  
  const requiredFiles = [
    'src/components/marketplace/ServiceCard.tsx',
    'src/components/marketplace/ServiceForm.tsx',
    'src/hooks/useMarketplaceServices.ts',
    'src/hooks/useTalentServices.ts',
    'src/pages/BusinessMarketplace.tsx',
    'src/pages/TalentMarketplace.tsx'
  ];
  
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      logError(`Directorio requerido no encontrado: ${dir}`);
      return false;
    }
  }
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      logError(`Archivo requerido no encontrado: ${file}`);
      return false;
    }
  }
  
  logSuccess('Estructura del proyecto verificada correctamente');
  return true;
};

// Crear directorios de resultados
const createOutputDirs = () => {
  logInfo('Creando directorios de resultados...');
  
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  if (!fs.existsSync(config.coverageDir)) {
    fs.mkdirSync(config.coverageDir, { recursive: true });
  }
  
  logSuccess('Directorios de resultados creados');
};

// Ejecutar tests de componentes
const runComponentTests = () => {
  logInfo('Ejecutando tests de componentes...');
  
  try {
    const testFiles = [
      'src/components/marketplace/__tests__/ServiceCard.test.tsx'
    ];
    
    for (const testFile of testFiles) {
      if (fs.existsSync(testFile)) {
        logInfo(`Ejecutando test: ${testFile}`);
        execSync(`npx jest ${testFile} --verbose`, { stdio: 'inherit' });
        logSuccess(`Test completado: ${testFile}`);
      } else {
        logWarning(`Test file no encontrado: ${testFile}`);
      }
    }
    
    return true;
  } catch (error) {
    logError(`Error ejecutando tests de componentes: ${error.message}`);
    return false;
  }
};

// Ejecutar tests de hooks
const runHookTests = () => {
  logInfo('Ejecutando tests de hooks...');
  
  try {
    const testFiles = [
      'src/hooks/__tests__/useMarketplaceServices.test.ts'
    ];
    
    for (const testFile of testFiles) {
      if (fs.existsSync(testFile)) {
        logInfo(`Ejecutando test: ${testFile}`);
        execSync(`npx jest ${testFile} --verbose`, { stdio: 'inherit' });
        logSuccess(`Test completado: ${testFile}`);
      } else {
        logWarning(`Test file no encontrado: ${testFile}`);
      }
    }
    
    return true;
  } catch (error) {
    logError(`Error ejecutando tests de hooks: ${error.message}`);
    return false;
  }
};

// Verificar linting
const runLinting = () => {
  logInfo('Ejecutando verificación de linting...');
  
  try {
    const marketplaceFiles = [
      'src/components/marketplace/',
      'src/hooks/useMarketplaceServices.ts',
      'src/hooks/useTalentServices.ts',
      'src/pages/BusinessMarketplace.tsx',
      'src/pages/TalentMarketplace.tsx'
    ];
    
    for (const file of marketplaceFiles) {
      logInfo(`Verificando linting: ${file}`);
      execSync(`npx eslint ${file} --format=json`, { stdio: 'pipe' });
    }
    
    logSuccess('Linting verificado correctamente');
    return true;
  } catch (error) {
    logError(`Error en linting: ${error.message}`);
    return false;
  }
};

// Verificar tipos TypeScript
const runTypeCheck = () => {
  logInfo('Ejecutando verificación de tipos TypeScript...');
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    logSuccess('Verificación de tipos completada');
    return true;
  } catch (error) {
    logError(`Error en verificación de tipos: ${error.message}`);
    return false;
  }
};

// Generar reporte de testing
const generateTestReport = (results) => {
  logInfo('Generando reporte de testing...');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter(Boolean).length,
      failed: Object.values(results).filter(r => !r).length
    },
    results: results,
    recommendations: []
  };
  
  // Agregar recomendaciones basadas en resultados
  if (!results.structure) {
    report.recommendations.push('Verificar estructura del proyecto');
  }
  
  if (!results.components) {
    report.recommendations.push('Revisar tests de componentes');
  }
  
  if (!results.hooks) {
    report.recommendations.push('Revisar tests de hooks');
  }
  
  if (!results.linting) {
    report.recommendations.push('Corregir errores de linting');
  }
  
  if (!results.types) {
    report.recommendations.push('Corregir errores de TypeScript');
  }
  
  // Guardar reporte
  const reportPath = path.join(config.outputDir, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logSuccess(`Reporte guardado en: ${reportPath}`);
  
  // Mostrar resumen
  log(`\n${colors.bold}📊 RESUMEN DE TESTING${colors.reset}`);
  log(`Total de verificaciones: ${report.summary.total}`);
  log(`✅ Exitosas: ${report.summary.passed}`, colors.green);
  log(`❌ Fallidas: ${report.summary.failed}`, colors.red);
  
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
  log(`${colors.bold}🧪 INICIANDO TESTING DEL MARKETPLACE${colors.reset}\n`);
  
  const results = {};
  
  // Verificar estructura
  results.structure = checkProjectStructure();
  
  if (!results.structure) {
    logError('Estructura del proyecto incorrecta. Abortando testing.');
    process.exit(1);
  }
  
  // Crear directorios de salida
  createOutputDirs();
  
  // Ejecutar verificaciones
  results.components = runComponentTests();
  results.hooks = runHookTests();
  results.linting = runLinting();
  results.types = runTypeCheck();
  
  // Generar reporte
  const report = generateTestReport(results);
  
  // Determinar código de salida
  const hasFailures = report.summary.failed > 0;
  
  if (hasFailures) {
    logError('\n❌ Testing completado con errores');
    process.exit(1);
  } else {
    logSuccess('\n✅ Testing completado exitosamente');
    process.exit(0);
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  checkProjectStructure,
  runComponentTests,
  runHookTests,
  runLinting,
  runTypeCheck,
  generateTestReport
};
