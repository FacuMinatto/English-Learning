# Reglas y Flujo de Trabajo Obligatorio (English Learning)

Cada vez que se complete una petición o modificación en el código:

1. **Revisión y Control Previo**:
   - Verificar la sintaxis, imports, estado y lógica de los componentes modificados.
   - Ejecutar `npm run build` para comprobar que la compilación de Vite y PWA no presente errores.

2. **Compilación de la APK de Android**:
   - Ejecutar `npx cap sync android` para sincronizar los archivos y plugins en Android.
   - Compilar el instalador APK ejecutando `gradlew.bat assembleDebug` dentro de la carpeta `android`.
   - Verificar que el APK `android/app/build/outputs/apk/debug/app-debug.apk` se haya generado con éxito.

3. **Subida a Git (GitHub)**:
   - Crear un commit con los cambios (`git commit -am "..."`).
   - Hacer push a la rama principal (`git push`) para que GitHub Actions actualice automáticamente la web en vivo y se propague la actualización remota a todos los dispositivos.
