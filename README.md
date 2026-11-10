# CampoLibre — Cuaderno de Campo Digital (Demo SIEX)

Demo profesional freemium de cuaderno de campo digital para agricultores en España, orientada al cumplimiento del registro electrónico de tratamientos fitosanitarios y fertilización (compatible conceptualmente con SIEX).

## Arranque

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Cumplimiento (demo)

### Tratamientos fitosanitarios
Fecha, parcela(s), superficie (ha), cultivo, producto (nombre + nº registro), materia activa, dosis, unidad, aplicador, plazo de seguridad, método de aplicación, observaciones. Validación de producto y dosis excesiva.

### Fertilización
Fecha, parcela, tipo/nombre, dosis, N-P-K, aplicador.

### Otras funciones
- Historial append-only (inalterable)
- Alertas de plazos de seguridad
- Marcar registros como enviados a SIEX
- Exportación JSON SIEX, CSV y PDF legible (impresión)
- Persistencia en `localStorage` durante la sesión del navegador
- Gestión básica de parcelas (crear/editar)
- Mapa OpenStreetMap + Leaflet (sin API key)

## Plan

- **Gratis**: cumplimiento normativo completo (límite demo: 2 usuarios / 40 ha)
- **Premium**: 19 €/mes o 190 €/año (control de costes, multi-usuario…)

## Stack

React + TypeScript + Vite · Tailwind CSS v4 · Leaflet · React Router
