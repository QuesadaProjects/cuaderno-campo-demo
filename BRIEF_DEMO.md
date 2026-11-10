# Brief: Demo Cuaderno de Campo Digital (Freemium)

## Objetivo
Crear una demo moderna, limpia y fácil de usar de un cuaderno de campo digital orientado a agricultores pequeños y medianos en España. La demo debe verse claramente más actual y sencilla que las soluciones actuales del mercado (AgroGEST SIEX, Geofolia, etc.).

## Modelo de producto (contexto)
- **Gratis**: Cumplimiento normativo completo (registro de tratamientos fitosanitarios y fertilización, exportación de informes oficiales, app offline, mapas básicos). Límite: 2 usuarios y 40 ha.
- **Premium (19 €/mes o 190 €/año)**: Control de costes y rentabilidad por parcela, multi-usuario, alertas avanzadas, integración con técnicos/cooperativa, soporte prioritario.

## Principios de diseño
- Interfaz minimalista y moderna (mobile-first)
- Mucho espacio en blanco, tipografía grande y legible
- Colores frescos: verdes suaves (#16a34a / #22c55e), blancos y grises claros
- Evitar densidades visuales altas y colores saturados tipo naranja
- Flujos cortos: máximo 3-4 pasos para registrar un tratamiento
- Sensación de app moderna, no de software de gestión tradicional

## Stack recomendado
- React + TypeScript + Vite (o Next.js)
- Tailwind CSS
- Mapas con Leaflet (versión simple)
- Datos de ejemplo hardcodeados (sin backend real)
- Código limpio, comentado y fácil de extender

## Pantallas a implementar

### 1. Dashboard principal
- Mapa interactivo con parcelas de ejemplo
- Botón grande y destacado: “Registrar tratamiento”
- Lista limpia de últimas actividades
- Indicador de estado (“Todo al día” o alertas suaves)
- Acceso rápido a Parcelas e Informes

### 2. Flujo de registro de tratamiento (prioridad máxima)
- Paso 1: Seleccionar parcela(s) desde mapa o lista
- Paso 2: Buscar y seleccionar producto (con sugerencias)
- Paso 3: Dosis, fecha y aplicador (valores por defecto inteligentes)
- Paso 4: Confirmación visual clara
- Debe poder completarse muy rápido

### 3. Detalle de parcela
- Información básica de la parcela
- Timeline limpio del historial de tratamientos y fertilizaciones
- Botón para exportar informe de la parcela

### 4. Informes / Exportar
- Botón grande “Generar cuaderno oficial”
- Previsualización sencilla + opciones de descarga (PDF / Excel simulado)

### 5. Upgrade a Premium (suave)
- Cuando el usuario intenta acceder a “Control de costes” o añadir más usuarios, mostrar un modal limpio explicando el Premium (19 €/mes o 190 €/año)
- No bloquear el uso gratuito

## Datos de ejemplo
- 4 parcelas: Olivar Norte (12 ha), Viñedo Sur (8 ha), Cereal Este (15 ha), Huerto (3 ha)
- Varios tratamientos fitosanitarios y fertilizaciones ya registrados
- Productos de ejemplo comunes (herbicidas, fungicidas, fertilizantes)
- Todos los textos en español claro y natural

## Navegación
- En móvil: barra inferior simple (Dashboard, Registrar, Parcelas, Informes)
- Estados visuales claros (éxito, alerta de plazo de seguridad, etc.)

## Notas importantes
- Priorizar la experiencia visual y la simplicidad del flujo de registro
- La demo debe poder ejecutarse localmente sin configuración compleja
- El objetivo es que cualquier persona vea la demo y note inmediatamente que es más moderna y fácil de usar que las alternativas actuales
