# Guía de Configuración: Supabase Storage (EPIC 6)

Esta guía detalla los pasos manuales y el SQL necesario para configurar el almacenamiento de archivos del proyecto Telmark de forma segura.

## 1. Configuración Manual (Consola de Supabase)

1. Entra en el menú **Storage**.
2. Pulsa en **New Bucket**.
3. **Nombre del Bucket**: `telmark-media`
4. **Public Bucket**: **DESACTIVADO** (Importante: Queremos que sea privado).
5. **Allowed MIME Types**: No rellenes nada para permitir todo (PDF, MP4, PNG, etc.) o limita a lo que desees.

---

## 2. Configuración de Seguridad (SQL Editor)

Ejecuta el siguiente código SQL para que Supabase sepa quién puede leer y subir archivos. Las reglas son:
- **Admins/Superadmins**: Control total.
- **Trabajadores**: Solo pueden leer archivos si la carpeta del archivo coincide con una sección que tengan asignada.

```sql
-- NOTA: No es necesario hacer "ALTER TABLE storage.objects" ya que Supabase lo gestiona.
-- Si el Bucket es privado, las políticas se aplicarán automáticamente.

-- 1. Política de LECTURA (SELECT)
-- Permite ver archivos si eres admin o si tienes asignada la sección correspondiente
CREATE POLICY "Select - Assigned sections only" ON storage.objects
FOR SELECT
TO authenticated
USING (
    public.is_admin_or_superadmin()
    OR
    EXISTS (
        SELECT 1 FROM public.profile_sections ps
        JOIN public.sections s ON s.id = ps.section_id
        WHERE ps.profile_id = auth.uid()
        AND s.slug = (split_part(name, '/', 1)) -- Comprobamos el primer segmento de la ruta
    )
);

-- 2. Política de ESCRITURA (INSERT, UPDATE, DELETE)
-- Solo los Administradores o Superadministradores pueden gestionar archivos físicos
CREATE POLICY "All - Admin only" ON storage.objects
FOR ALL
TO authenticated
USING (public.is_admin_or_superadmin())
WITH CHECK (public.is_admin_or_superadmin());
```

---

## 3. Notas Técnicas

- **Ruta de Archivos**: Los archivos se guardarán con el patrón `{section-slug}/{category-slug}/{filename}`. Esto permite que el RLS verifique el permiso eficientemente.
- **Límite de Tamaño**: Supabase Free Tier permite hasta **50MB** por archivo. Para las pruebas, usaremos archivos pequeños (< 1MB) para no agotar la cuota de transferencia rápidamente.
