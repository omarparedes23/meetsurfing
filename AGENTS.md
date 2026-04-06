<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Arquitectura del proyecto

## Stack
- Next.js 16.2.1 con Turbopack
- Supabase local (CLI 2.78.1) — puerto 54325, corriendo en Docker
- `@supabase/ssr` 0.9.0 + `@supabase/supabase-js` 2.99.3
- Auth: `createBrowserClient` en cliente, `createServerClient` en servidor/API routes

## Estructura de auth
- `(auth)/login/page.tsx` — client component, usa `supabase.auth.signInWithPassword`
- `(auth)/register/page.tsx` — client component, usa `supabase.auth.signUp` + fetch a `/api/auth/register`
- `/api/auth/register/route.ts` — inserta perfil en tabla `users` con service role key
- `(main)/layout.tsx` — server component, hace `getUser()` y redirige a `/login` si no hay sesión

## Variables de entorno (.env.local)
- `NEXT_PUBLIC_SUPABASE_URL` — debe ser la IP pública del servidor (no `127.0.0.1`) para que el browser pueda conectarse
- `SUPABASE_SERVICE_ROLE_KEY` — solo se usa server-side, puede apuntar a `127.0.0.1`
- Puerto 54325 expuesto en `0.0.0.0` por Docker (accesible externamente)

# Problemas conocidos y soluciones

## Browser no puede conectar a Supabase local
**Síntoma:** `signUp()` y `signInWithPassword()` fallan silenciosamente, no se crean usuarios en `auth.users`.
**Causa:** `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54325` — el browser del cliente remoto intenta conectarse a su propio `localhost`, no al servidor.
**Solución:** Cambiar `NEXT_PUBLIC_SUPABASE_URL` a la IP pública del servidor (`http://46.62.244.216:54325`). El puerto ya está expuesto por Docker.
**Verificar usuarios creados:** `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "select id, email from auth.users;"`

## Error "Failed to find Server Action"
**Síntoma:** `Error: Failed to find Server Action "x"` + `POST /api/formaction 404`.
**Causa:** Artefacto de caché del build anterior en `.next/`. No afecta el flujo actual (login/register usan cliente Supabase directo, no Server Actions).
**Solución:** `rm -rf .next` y reiniciar.

## Confirmación de email
`enable_confirmations = false` ya está configurado en `supabase/config.toml` — los usuarios pueden loguear inmediatamente tras el registro sin confirmar email.
