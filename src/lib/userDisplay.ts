import type { User } from '@supabase/supabase-js'

/** Nombre completo guardado en el perfil (user_metadata) */
export function getUserFullName(user: User | null | undefined): string {
  const meta = user?.user_metadata ?? {}
  const raw = meta.nombre ?? meta.full_name ?? meta.name ?? meta.given_name ?? ''
  return String(raw).trim()
}

/** Primer nombre para cabeceras ("Explotación de José") */
export function getUserFirstName(user: User | null | undefined): string {
  const full = getUserFullName(user)
  if (full) return full.split(/\s+/)[0] ?? full
  const emailLocal = user?.email?.split('@')[0]?.trim()
  return emailLocal || 'usuario'
}

export function getExplotacionLabel(user: User | null | undefined): string {
  return `Explotación de ${getUserFirstName(user)}`
}
