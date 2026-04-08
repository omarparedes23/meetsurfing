-- 1. Crear la tabla de Eventos
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location_name TEXT DEFAULT 'Casa Agave',
  location_url TEXT,
  price DECIMAL DEFAULT 0,
  type TEXT CHECK (type IN ('friday', 'party')),
  telegram_bot_link TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear la tabla de Galería
CREATE TABLE gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar Seguridad (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- 4. Crear Políticas para que todos puedan VER los datos
CREATE POLICY "Cualquiera puede ver eventos" ON events FOR SELECT USING (true);
CREATE POLICY "Cualquiera puede ver fotos" ON gallery FOR SELECT USING (true);

-- 5. Insertar un evento de prueba para ver algo en la web
INSERT INTO events (title, description, event_date, type, location_url)
VALUES (
  'Viernes de Agave', 
  'Práctica de español, nuevos amigos y baile latino en el sótano.', 
  NOW() + interval '2 days', 
  'friday', 
  'https://yandex.com/maps/-/CCUfE2H8sA'
);


ALTER TABLE events 
RENAME COLUMN event_date TO date;