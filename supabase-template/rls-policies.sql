-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================
-- Este archivo contiene las políticas de seguridad a nivel de fila
-- para proteger los datos en Supabase

-- ============================================
-- TABLA: users
-- ============================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios pueden leer su propio perfil
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Policy: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Policy: Permitir inserción durante signup (manejado por trigger)
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- TABLA: projects
-- ============================================

-- Habilitar RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Todos pueden leer proyectos publicados
CREATE POLICY "Anyone can read published projects"
ON projects FOR SELECT
USING (status = 'published');

-- Policy: Los usuarios autenticados pueden leer sus propios proyectos
CREATE POLICY "Users can read own projects"
ON projects FOR SELECT
USING (auth.uid() = owner_id);

-- Policy: Los usuarios autenticados pueden crear proyectos
CREATE POLICY "Authenticated users can create projects"
ON projects FOR INSERT
WITH CHECK (
  auth.uid() = owner_id AND
  auth.uid() IS NOT NULL
);

-- Policy: Los usuarios pueden actualizar solo sus propios proyectos
CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE
USING (auth.uid() = owner_id);

-- Policy: Los usuarios pueden eliminar solo sus propios proyectos
CREATE POLICY "Users can delete own projects"
ON projects FOR DELETE
USING (auth.uid() = owner_id);

-- ============================================
-- TABLA: project_media
-- ============================================

-- Habilitar RLS
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;

-- Policy: Todos pueden leer media de proyectos publicados
CREATE POLICY "Anyone can read media from published projects"
ON project_media FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_media.project_id
    AND projects.status = 'published'
  )
);

-- Policy: Los dueños pueden leer media de sus proyectos
CREATE POLICY "Owners can read own project media"
ON project_media FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_media.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Policy: Los dueños pueden insertar media en sus proyectos
CREATE POLICY "Owners can insert media to own projects"
ON project_media FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_media.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Policy: Los dueños pueden actualizar media de sus proyectos
CREATE POLICY "Owners can update own project media"
ON project_media FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_media.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Policy: Los dueños pueden eliminar media de sus proyectos
CREATE POLICY "Owners can delete own project media"
ON project_media FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_media.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- ============================================
-- TABLA: project_roadmap_items
-- ============================================

-- Habilitar RLS
ALTER TABLE project_roadmap_items ENABLE ROW LEVEL SECURITY;

-- Policy: Todos pueden leer roadmap de proyectos publicados
CREATE POLICY "Anyone can read roadmap from published projects"
ON project_roadmap_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_roadmap_items.project_id
    AND projects.status = 'published'
  )
);

-- Policy: Los dueños pueden gestionar roadmap de sus proyectos
CREATE POLICY "Owners can manage own project roadmap"
ON project_roadmap_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_roadmap_items.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- ============================================
-- TABLA: fund_usage
-- ============================================

-- Habilitar RLS
ALTER TABLE fund_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Todos pueden leer fund usage de proyectos publicados
CREATE POLICY "Anyone can read fund usage from published projects"
ON fund_usage FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = fund_usage.project_id
    AND projects.status = 'published'
  )
);

-- Policy: Los dueños pueden gestionar fund usage de sus proyectos
CREATE POLICY "Owners can manage own project fund usage"
ON fund_usage FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = fund_usage.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- ============================================
-- TABLA: donations
-- ============================================

-- Habilitar RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Policy: Todos pueden leer donaciones de proyectos publicados
CREATE POLICY "Anyone can read donations from published projects"
ON donations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = donations.project_id
    AND projects.status = 'published'
  )
);

-- Policy: Los dueños de proyectos pueden ver todas las donaciones
CREATE POLICY "Project owners can read all donations to their projects"
ON donations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = donations.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Policy: Sistema puede insertar donaciones (validadas por backend)
CREATE POLICY "System can insert donations"
ON donations FOR INSERT
WITH CHECK (true);

-- ============================================
-- STORAGE: project-images bucket
-- ============================================

-- Policy: Todos pueden leer imágenes
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Usuarios autenticados pueden subir imágenes
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-images' AND
  auth.role() = 'authenticated'
);

-- Policy: Usuarios pueden actualizar sus propias imágenes
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Usuarios pueden eliminar sus propias imágenes
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Lectura pública de imágenes
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');
