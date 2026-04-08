# MeetSurfing - Contexto del Proyecto

## Resumen
Aplicación tipo Couchsurfing Hangouts para encontrar y unirse a eventos/espontáneos cercanos. Los usuarios pueden crear hangouts, verlos en un mapa, unirse y chatear en tiempo real.

---

## Arquitectura

### Stack Tecnológico
- **Frontend**: Next.js 16.2.1 + React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **Mapas**: Leaflet + OpenStreetMap
- **Archivos**: AWS S3 (para fotos en el chat)
- **Geolocalización**: GPS del navegador

### Estructura de Carpetas
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx         # Login con verificación de perfil
│   │   ├── register/page.tsx      # Registro simplificado (solo email/pass)
│   │   └── complete-profile/      # Completar perfil post-login
│   └── (main)/
│       ├── page.tsx               # Home con mapa y eventos cercanos
│       ├── my-events/page.tsx     # Mis hangouts (creados + unidos)
│       ├── events/
│       │   ├── new/page.tsx       # Crear nuevo hangout
│       │   └── [id]/              # Detalle del evento + chat
│       └── profile/
├── components/
│   ├── events/EventForm.tsx       # Formulario simplificado de creación
│   ├── events/EventCard.tsx       # Tarjeta de evento
│   ├── map/EventMap.tsx           # Mapa con Leaflet
│   ├── chat/ChatRoom.tsx          # Sala de chat en tiempo real
│   ├── chat/MessageBubble.tsx     # Burbuja de mensaje
│   └── chat/PhotoUpload.tsx       # Subir fotos al chat
├── hooks/
│   ├── useLocation.ts             # Obtener GPS del usuario
│   ├── useNearbyEvents.ts         # Eventos cercanos vía RPC
│   └── useChat.ts                 # Chat con Supabase Realtime
└── lib/
    ├── supabase/
    │   ├── client.ts              # Cliente Supabase (browser)
    │   ├── server.ts              # Cliente Supabase (server)
    │   └── types.ts               # Tipos TypeScript
    └── s3/upload.ts               # Subida a S3
```

---

## Esquema de Base de Datos

### Tablas Principales

#### cs_users (Perfiles)
```sql
id uuid PRIMARY KEY REFERENCES auth.users(id)
username text UNIQUE NOT NULL
full_name text
avatar_url text
is_online boolean DEFAULT false
last_seen_at timestamptz
avg_rating double precision DEFAULT 0
created_at timestamptz DEFAULT now()
```

#### cs_events (Hangouts)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
creator_id uuid REFERENCES cs_users(id)
title text NOT NULL
description text
category text CHECK ('bar', 'cafe', 'restaurant', 'park', 'museum', 'sports', 'music', 'other')
city text
country text
location_name text  -- Nombre del lugar (ej: "Bar El Maño")
address text
location geometry(Point, 4326)  -- PostGIS para coordenadas GPS
visibility_radius_km integer DEFAULT 10
starts_at timestamptz
ends_at timestamptz
max_participants integer DEFAULT 8
current_participants integer DEFAULT 1
status text DEFAULT 'active'  -- active, full, cancelled, expired
is_locked boolean DEFAULT false
last_activity_at timestamptz DEFAULT now()
created_at timestamptz DEFAULT now()
```

#### cs_event_participants (Participantes)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
event_id uuid REFERENCES cs_events(id)
user_id uuid REFERENCES cs_users(id)
status text DEFAULT 'joined'  -- joined, left, kicked, banned
joined_at timestamptz DEFAULT now()
left_at timestamptz
UNIQUE(event_id, user_id)
```

#### cs_messages (Mensajes del chat)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
event_id uuid REFERENCES cs_events(id)
sender_id uuid REFERENCES cs_users(id)
type text DEFAULT 'text'  -- text, image, system
content text
is_deleted boolean DEFAULT false
deleted_at timestamptz
created_at timestamptz DEFAULT now()
```

#### cs_message_photos (Fotos en el chat)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
message_id uuid REFERENCES cs_messages(id)
event_id uuid REFERENCES cs_events(id)
uploader_id uuid REFERENCES cs_users(id)
s3_key text NOT NULL
s3_url text NOT NULL
size_bytes integer
mime_type text
width integer
height integer
is_deleted boolean DEFAULT false
deleted_at timestamptz
created_at timestamptz DEFAULT now()
```

### Funciones RPC

#### get_nearby_events(user_lat, user_lng, radius_km)
Retorna eventos activos dentro del radio especificado, ordenados por distancia. Solo eventos con `starts_at > now()`.

**Columnas retornadas:** `id`, `creator_id`, `title`, `description`, `category`, `city`, `country`, `location_name`, `address`, `visibility_radius_km`, `starts_at`, `ends_at`, `max_participants`, `current_participants`, `status`, `is_locked`, `location_hidden`, `created_at`, `updated_at`, `distance_km`, `creator_username`, `creator_avatar_url`, `creator_avg_rating`, `lat`, `lng`

**Nota importante:** Las columnas `lat` y `lng` se extraen de PostGIS usando `ST_Y()` y `ST_X()` para mostrar los marcadores correctamente en el mapa.

#### lock_inactive_events(inactivity_hours)
Bloquea eventos inactivos y retorna fotos a eliminar de S3.

---

## Flujo de Autenticación (Opción B2)

### Registro
1. Usuario ingresa email + password
2. `supabase.auth.signUp()` crea usuario en auth.users
3. Muestra pantalla "Check Your Email" (confirmación requerida)

### Login
1. Usuario ingresa credenciales
2. `supabase.auth.signInWithPassword()`
3. Verifica si existe perfil en `cs_users`
4. Si NO tiene perfil → redirige a `/complete-profile`
5. Si tiene perfil → redirige a Home

### Completar Perfil
1. Usuario ingresa username + full_name
2. Crea registro en `cs_users`
3. Redirige a Home

---

## Flujo Principal de la App

### 1. Ver Eventos Cercanos (Home)
- Obtiene GPS del navegador (`useLocation`)
- Llama RPC `get_nearby_events(lat, lng, 30)`
- Muestra mapa con marcadores (Leaflet)
- Lista eventos ordenados por distancia

### 2. Crear Hangout
- Botón "+" en navbar → `/events/new`
- Formulario simplificado:
  - Título (qué quieres hacer)
  - Descripción (opcional)
  - Categoría (bar, cafe, etc.)
  - Máximo participantes
  - Nombre del lugar (opcional)
- **Ubicación GPS automática** (no editable)
- Evento empieza en **1 hora** por defecto
- Creador se une automáticamente al chat

### 3. Unirse a Hangout
- Click en evento en el mapa o lista
- Botón "Join Hangout"
- Se agrega a `cs_event_participants`
- Redirige automáticamente al **chat**

### 4. Chat en Tiempo Real
- **Supabase Realtime** para mensajes instantáneos
- **Presence** para ver quién está online (puntos verdes)
- Mensajes de texto
- Fotos (subidas a S3)
- Solo participantes del evento pueden ver el chat

### 5. Mis Hangouts
- Página `/my-events` (tab "My" en navbar)
- Sección "Created by you": Eventos creados
- Sección "You joined": Eventos donde participa
- Click para ir al chat

---

## Configuración de Supabase

### Variables de Entorno (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://axcrubvtpqcyscizgoee.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_nXvc3DSk2D7QBwF8fFervA_90zNdTHt
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### RLS Policies
Todas las tablas tienen RLS habilitado:
- **cs_events**: Cualquiera puede ver, solo creador puede editar/borrar
- **cs_event_participants**: Cualquiera puede ver, usuario solo sus propios
- **cs_messages**: Solo participantes del evento pueden ver/escribir
- **cs_users**: Usuario solo puede ver/insertar su propio perfil

---

## Características de Seguridad

### Eventos
- Eventos se bloquean automáticamente después de **2 horas de inactividad**
- Fotos se eliminan de S3 al bloquear evento
- Solo creador puede editar/borrar su evento

### Chat
- Solo participantes con `status = 'joined'` pueden ver/escribir
- Mensajes pueden marcarse como eliminados (soft delete)
- Fotos tienen registro en `cs_message_photos` para limpieza

### Ubicación
- GPS del usuario **nunca se expone** a otros usuarios
- Solo se usa para calcular distancia y mostrar eventos cercanos
- La ubicación exacta del creador no se muestra en el mapa

---

## Problemas Conocidos y Soluciones

### Email Confirmation en Supabase Cloud
**Problema**: Por defecto Supabase requiere confirmación de email.
**Solución**: Se implementó flujo B2 (confirmación + perfil post-login).
**Alternativa**: Desactivar "Enable email confirmations" en Dashboard.

### Eventos no aparecen en Home
**Causa**: Función `get_nearby_events` solo muestra eventos futuros (`starts_at > now()`).
**Solución**: Eventos creados empiezan en 1 hora por defecto.

### Tablas con prefijo cs_
**Nota**: Todas las tablas del proyecto usan prefijo `cs_` para evitar conflictos.

### Eventos no se actualizan en tiempo real (Home)
**Causa**: `useNearbyEvents` fetcheaba una sola vez al montar — sin Realtime, eventos nuevos de otros usuarios no aparecían.
**Solución**: Suscripción `postgres_changes` a `cs_events`. Requiere que la tabla esté en la publicación `supabase_realtime`.
**Activar**: `ALTER PUBLICATION supabase_realtime ADD TABLE public.cs_events;`

### Cada usuario solo ve sus propios eventos (no los de otros)
**Causa**: `get_nearby_events` usaba `SECURITY INVOKER` (default). La RLS de `cs_users` era `auth.uid() = id`, por lo que el `INNER JOIN cs_users` filtraba eventos cuyos creadores no eran el usuario autenticado.
**Solución**: La función RPC usa `SECURITY DEFINER` para bypassear la RLS del JOIN interno.

### RLS de cs_users — perfiles visibles solo por el propio usuario
**Problema**: La policy original `Users can view own profile` usaba `auth.uid() = id`, bloqueando:
- `enrichMessage` (no podía obtener username/avatar de otros usuarios)
- El JOIN en `get_nearby_events` (filtraba eventos de otros creadores)
**Solución**: Reemplazada por `Authenticated users can view any profile` con `USING (true)` para `authenticated`.

### Chat — mensajes no aparecen en tiempo real
**Causa**: `cs_messages` no estaba en la publicación `supabase_realtime`.
**Solución**: `ALTER PUBLICATION supabase_realtime ADD TABLE public.cs_messages;`

### Fotos en chat — no se insertan en cs_message_photos
**Causa**: `cs_message_photos` tenía RLS habilitado pero sin política de INSERT — todos los inserts de usuarios autenticados eran rechazados silenciosamente.
**Solución**: Agregar policy `Participants can upload photos` con `WITH CHECK` que verifica participación en el evento.

### Fotos en chat — imagen no se muestra (broken image)
**Causa 1**: `cs_message_photos` no estaba en `supabase_realtime` → el patch del mensaje con la foto nunca llegaba.
**Causa 2**: Bucket S3 tenía `GetObject` público solo para `fotos_col/*` y `firmas_col/*`, no para `events/*`.
**Solución**: 
- `ALTER PUBLICATION supabase_realtime ADD TABLE public.cs_message_photos;`
- Agregar `arn:aws:s3:::dmartin-fotos-productos/events/*` a la bucket policy de lectura pública.

### CORS en S3 para subida directa desde el browser
**Causa**: S3 sin CORS configurado bloquea el PUT cross-origin del browser silenciosamente (`TypeError: Failed to fetch`).
**Solución**: Configurar CORS en el bucket con `AllowedMethods: [PUT, GET, HEAD]` y `AllowedOrigins: [*]`.
**Nota**: No tiene relación con localhost vs HTTPS — es necesario en cualquier entorno.

### S3 — path de fotos del chat
Las fotos se almacenan en `events/${eventId}/${uuid}.ext` dentro del bucket `dmartin-fotos-productos`.
El acceso de lectura pública debe cubrir el prefix `events/*`.

---

## Supabase Realtime — Tablas con publicación activa
Las siguientes tablas están en `supabase_realtime` y soportan `postgres_changes`:
- `cs_events` — para actualizar el Home en tiempo real
- `cs_messages` — para el chat en tiempo real
- `cs_message_photos` — para mostrar fotos al recibirlas (evita race condition)

---

## Usuarios de Prueba

| Username | Email | Estado |
|----------|-------|--------|
| anitamorsito777 | anitamorsito777@yandex.ru | Activo |
| petitenfant2014 | petitenfant2014@gmail.com | Activo |
| gustavoparedes | gustavoparedes2017@gmail.com | Activo |

### Crear Usuario Manualmente
```sql
-- En Supabase Dashboard → SQL Editor
INSERT INTO cs_users (id, username, full_name)
VALUES ('UUID_DEL_USUARIO', 'username', 'Full Name');
```

---

## Comandos Útiles

### Ver eventos cercanos (debug)
```sql
SELECT * FROM get_nearby_events(48.8566, 2.3522, 50);
```

### Ver participantes de un evento
```sql
SELECT u.username, p.status, p.joined_at
FROM cs_event_participants p
JOIN cs_users u ON p.user_id = u.id
WHERE p.event_id = 'UUID_DEL_EVENTO';
```

### Ver mensajes de un evento
```sql
SELECT m.content, m.type, u.username, m.created_at
FROM cs_messages m
JOIN cs_users u ON m.sender_id = u.id
WHERE m.event_id = 'UUID_DEL_EVENTO'
ORDER BY m.created_at;
```

---

## Próximas Mejoras Sugeridas

1. **Notificaciones push** cuando alguien se une al hangout
2. **Indicador "typing"** en el chat
3. **Reacciones** a mensajes
4. **Compartir ubicación en tiempo real** (solo dentro del hangout)
5. **Calificaciones** entre usuarios post-evento
6. **Filtros** por categoría en el Home
7. **Búsqueda** de eventos por ciudad

---

## Notas para Desarrollo

- Siempre usar prefijo `cs_` para tablas nuevas
- Las coordenadas GPS se guardan como `geometry(Point, 4326)` en PostGIS
- El chat usa `supabase.channel()` con `presence` para online status
- Las fotos se suben a S3 con presigned URLs (`/api/s3/presign`)
- El cleanup de eventos inactivos corre vía cron job (`/api/cleanup`)

### Mapa (Leaflet) - Lecciones Aprendidas

**Bug: Mapa no se re-centra con GPS**
- `MapContainer` de react-leaflet usa `center` solo como valor inicial
- Cuando llega el GPS después del primer render, el mapa se queda en Madrid
- **Solución**: Usar componente hijo `MapCenterUpdater` con `useMap()` que llama `map.setView()` cuando cambian las coords

**Bug: Marcadores en [0, 0] (costa de África)**
- El RPC `get_nearby_events` no retornaba `lat`/`lng` de los eventos
- Los marcadores usaban `position={[0, 0]}` por defecto
- **Solución**: Actualizar la función RPC para incluir `ST_Y(e.location) AS lat` y `ST_X(e.location) AS lng`, y filtrar eventos sin coordenadas

---

Última actualización: 2026-04-08 (correcciones de mapa, RPC, Realtime, chat, S3)
