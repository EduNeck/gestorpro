/**
 * Script para generar favicons desde el logo principal
 * Este script requiere que tengas GestorProLogo.png en src/assets/
 * 
 * Instrucciones:
 * 1. Asegúrate de tener el archivo src/assets/GestorProLogo.png
 * 2. Instala sharp para procesamiento de imágenes: npm install sharp
 * 3. Ejecuta: node generate-favicons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputLogo = path.join(__dirname, 'src', 'assets', 'GestorProLogo.png');
const outputDir = path.join(__dirname, 'public');

// Verificar que el logo existe
if (!fs.existsSync(inputLogo)) {
  console.error('❌ Error: No se encuentra el archivo GestorProLogo.png en src/assets/');
  console.log('📋 Coloca tu logo en: src/assets/GestorProLogo.png');
  process.exit(1);
}

// Configuración de tamaños de favicons a generar
const faviconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' }, // Para iOS
];

async function generateFavicons() {
  try {
    console.log('🎨 Generando favicons desde GestorProLogo.png...');
    
    // Leer el logo original
    const logoBuffer = fs.readFileSync(inputLogo);
    
    // Generar cada tamaño de favicon
    for (const favicon of faviconSizes) {
      const outputPath = path.join(outputDir, favicon.name);
      
      await sharp(logoBuffer)
        .resize(favicon.size, favicon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Fondo transparente
        })
        .png({ quality: 100 })
        .toFile(outputPath);
      
      console.log(`✅ Generado: ${favicon.name} (${favicon.size}x${favicon.size})`);
    }
    
    // Generar favicon.ico (usando el tamaño 32x32 como base)
    const faviconIcoPath = path.join(outputDir, 'favicon.ico');
    await sharp(logoBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .ico()
      .toFile(faviconIcoPath)
      .catch(async () => {
        // Si no se puede generar ICO, usar PNG
        await sharp(logoBuffer)
          .resize(32, 32, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toFile(faviconIcoPath.replace('.ico', '.png'));
        
        console.log('✅ Generado: favicon.png (32x32) - renombra a favicon.ico si es necesario');
      });
    
    console.log('✅ Generado: favicon.ico (32x32)');
    
    console.log('\n🎉 ¡Favicons generados exitosamente!');
    console.log('\n📋 Archivos creados en la carpeta public/:');
    faviconSizes.forEach(favicon => console.log(`   - ${favicon.name}`));
    console.log('   - favicon.ico');
    
    console.log('\n🔄 Reinicia el servidor de desarrollo para ver los cambios.');
    
  } catch (error) {
    console.error('❌ Error al generar favicons:', error.message);
    
    // Instrucciones de fallback
    console.log('\n📋 Alternativa manual:');
    console.log('1. Copia src/assets/GestorProLogo.png a public/favicon.png');
    console.log('2. Renombra favicon.png a favicon.ico o usa un convertidor online');
    console.log('3. Crea copias redimensionadas para los diferentes tamaños');
  }
}

// Verificar si Sharp está instalado
try {
  require.resolve('sharp');
  generateFavicons();
} catch (error) {
  console.log('📦 Sharp no está instalado. Instalando...');
  console.log('💡 Ejecuta: npm install sharp');
  console.log('📋 Luego ejecuta de nuevo: node generate-favicons.js');
}
