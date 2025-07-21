# 🎨 Configuración de Favicon - GestorPro

## ✅ Archivos de Favicon Configurados

Los siguientes archivos han sido configurados en la carpeta `public/`:

- `favicon.ico` - Favicon principal (formato ICO)
- `favicon.png` - Favicon en formato PNG
- `favicon-16x16.png` - Icono 16x16 píxeles
- `favicon-32x32.png` - Icono 32x32 píxeles  
- `favicon-48x48.png` - Icono 48x48 píxeles
- `apple-touch-icon.png` - Icono para dispositivos iOS (180x180)

## 📋 Configuración en index.html

El archivo `index.html` ha sido actualizado con las siguientes etiquetas:

```html
<!-- Favicons para diferentes dispositivos -->
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="icon" type="image/png" href="/favicon.png" />
```

## 🔄 Actualizar Favicon

Para cambiar el favicon en el futuro:

### Opción 1: Usar el script automático
```bash
npm run generate-favicons
```

### Opción 2: Script de PowerShell
```powershell
.\setup-favicon.ps1
```

### Opción 3: Manual
1. Coloca tu nuevo logo en `src/assets/GestorProLogo.png`
2. Copia el archivo a `public/` con los diferentes nombres:
   ```bash
   copy src\assets\GestorProLogo.png public\favicon.png
   copy src\assets\GestorProLogo.png public\favicon.ico
   # ... etc para otros tamaños
   ```

## 💡 Recomendaciones

- **Tamaño óptimo**: 512x512 píxeles para el logo original
- **Formato**: PNG con fondo transparente
- **Diseño**: Asegúrate de que sea legible en tamaños pequeños (16x16)
- **Pruebas**: Reinicia el servidor de desarrollo tras cambios

## 🌐 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Dispositivos móviles iOS y Android  
- ✅ Pestañas del navegador
- ✅ Marcadores/Favoritos
- ✅ Accesos directos de escritorio

## 🎯 Resultado

Ahora la pestaña del navegador mostrará el logo de GestorPro en lugar del logo de Vite por defecto.
