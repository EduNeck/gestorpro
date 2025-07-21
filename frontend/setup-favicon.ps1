# Script de PowerShell para configurar el favicon de GestorPro
# Ejecuta este archivo con: .\setup-favicon.ps1

Write-Host "🎨 Configurando favicon de GestorPro..." -ForegroundColor Cyan

$logoPath = "src\assets\GestorProLogo.png"
$publicPath = "public"
$faviconPath = "$publicPath\favicon.png"

# Verificar que el logo existe
if (!(Test-Path $logoPath)) {
    Write-Host "❌ Error: No se encuentra el archivo GestorProLogo.png en src\assets\" -ForegroundColor Red
    Write-Host "📋 Coloca tu logo en: src\assets\GestorProLogo.png" -ForegroundColor Yellow
    exit 1
}

# Crear carpeta public si no existe
if (!(Test-Path $publicPath)) {
    New-Item -ItemType Directory -Path $publicPath
    Write-Host "📁 Creada carpeta public\" -ForegroundColor Green
}

# Copiar el logo como favicon
try {
    Copy-Item $logoPath $faviconPath -Force
    Write-Host "✅ Logo copiado como favicon.png" -ForegroundColor Green
    
    # También crear una copia como favicon.ico (mismo archivo, diferente extensión)
    $faviconIcoPath = "$publicPath\favicon.ico"
    Copy-Item $logoPath $faviconIcoPath -Force
    Write-Host "✅ Logo copiado como favicon.ico" -ForegroundColor Green
    
    # Crear copias para diferentes tamaños (mismo archivo, nombres diferentes)
    $sizes = @(
        @{name = "favicon-16x16.png"; desc = "16x16"},
        @{name = "favicon-32x32.png"; desc = "32x32"},
        @{name = "favicon-48x48.png"; desc = "48x48"},
        @{name = "apple-touch-icon.png"; desc = "180x180 (iOS)"}
    )
    
    foreach ($size in $sizes) {
        $targetPath = "$publicPath\$($size.name)"
        Copy-Item $logoPath $targetPath -Force
        Write-Host "✅ Creado: $($size.name) ($($size.desc))" -ForegroundColor Green
    }
    
    Write-Host "`n🎉 ¡Favicon configurado exitosamente!" -ForegroundColor Green
    Write-Host "📋 Archivos creados en public\:" -ForegroundColor Cyan
    Write-Host "   - favicon.png" -ForegroundColor White
    Write-Host "   - favicon.ico" -ForegroundColor White
    Write-Host "   - favicon-16x16.png" -ForegroundColor White
    Write-Host "   - favicon-32x32.png" -ForegroundColor White
    Write-Host "   - favicon-48x48.png" -ForegroundColor White
    Write-Host "   - apple-touch-icon.png" -ForegroundColor White
    
    Write-Host "`n🔄 Reinicia el servidor de desarrollo para ver los cambios:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error al copiar archivos: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n💡 Nota: Para mejores resultados, usa un editor de imágenes para redimensionar" -ForegroundColor Yellow
Write-Host "   los archivos a sus tamaños específicos (16x16, 32x32, etc.)" -ForegroundColor Yellow
