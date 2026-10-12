---
description: Regla de fin de turno - Revisión previa, compilación de APK y push a Git
globs: **/*
---

# Flujo de Trabajo Obligatorio por Petición

Cada vez que se complete la solicitud del usuario:

1. **Revisión Previa**:
   - Verificar que no existan errores lógicos o de interfaz.
   - Ejecutar `npm run build` y corroborar que finalice con código 0.

2. **Compilar APK**:
   - Ejecutar `npx cap sync android`.
   - Compilar con `gradlew.bat assembleDebug` en `android/`.
   - Confirmar generación de `android/app/build/outputs/apk/debug/app-debug.apk`.

3. **Subir a Git**:
   - Ejecutar `git add .` y `git commit -m "..."`.
   - Ejecutar `git push` para desplegar en GitHub Pages y actualizar remotamente.
