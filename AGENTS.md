# Reglas y Flujo de Trabajo Obligatorio (English Learning)

A partir de ahora el enfoque es **100% en la Aplicación Web (PWA)** alojada en GitHub Pages. No se compila APK localmente.

Cada vez que se complete una petición o modificación en el código:

1. **Revisión y Control Previo**:
   - Verificar la sintaxis, imports, estado y lógica de los componentes modificados.
   - Ejecutar `npm.cmd run lint` (o verificar que no haya errores de linting).
   - Ejecutar `npm.cmd run build` para comprobar que la compilación de Vite y PWA no presente ningún error.

2. **Subida y Despliegue en Git (GitHub)**:
   - Crear un commit claro con los cambios (`git commit -am "..."`).
   - Hacer push a la rama principal (`git push origin main`) para que GitHub Actions compile y despliegue automáticamente la web en vivo en GitHub Pages (`https://facuminatto.github.io/English-Learning/`) y todos los usuarios reciban la actualización remota de inmediato.
