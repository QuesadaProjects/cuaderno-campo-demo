-- Políticas RLS de UPDATE para marcar registros como enviados a SIEX.
-- Ejecutar en el SQL Editor de Supabase si el botón no persiste el cambio.

-- TRATAMIENTOS
DROP POLICY IF EXISTS "tratamientos_update_own" ON public.tratamientos;
CREATE POLICY "tratamientos_update_own"
ON public.tratamientos
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.parcelas p
    JOIN public.explotaciones e ON e.id = p.explotacion_id
    WHERE p.id = tratamientos.parcela_id
      AND e.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.parcelas p
    JOIN public.explotaciones e ON e.id = p.explotacion_id
    WHERE p.id = tratamientos.parcela_id
      AND e.user_id = auth.uid()
  )
);

-- FERTILIZACIONES
DROP POLICY IF EXISTS "fertilizaciones_update_own" ON public.fertilizaciones;
CREATE POLICY "fertilizaciones_update_own"
ON public.fertilizaciones
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.parcelas p
    JOIN public.explotaciones e ON e.id = p.explotacion_id
    WHERE p.id = fertilizaciones.parcela_id
      AND e.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.parcelas p
    JOIN public.explotaciones e ON e.id = p.explotacion_id
    WHERE p.id = fertilizaciones.parcela_id
      AND e.user_id = auth.uid()
  )
);
