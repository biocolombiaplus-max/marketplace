# Landing de compras a cuotas (Addi · Sistecrédito)

Landing con catálogo y carrito de varios productos, simulador de cuotas, banner principal hacia WhatsApp
y módulo administrativo para editar textos, logos, productos e imágenes de cada sección.

## Estructura
- `index.html` — la landing pública.
- `admin/` — panel administrativo (`/admin/`).
- `api/index.php` — guarda contenido (`data/content.json`) e imágenes (`uploads/`).
- `assets/js/defaults.js` — contenido inicial si aún no se ha guardado nada.

## Publicar
1. Sube la carpeta a un hosting con **PHP 7.4+** (cPanel, Hostinger, etc.).
2. Da permisos de escritura a `data/`, `uploads/` y `api/`.
3. Entra a `/admin/` con la contraseña inicial `cambiar-esta-clave` y **cámbiala de inmediato**.
4. Cambia el número de WhatsApp, logo, datos legales y productos, y pulsa **Guardar cambios**.

Probar en local: `php -S localhost:8000` y abrir http://localhost:8000.

## Antes de salir al aire
- Usa los logos de Addi y Sistecrédito solo con autorización como comercio aliado.
- Publica la política de tratamiento de datos (Ley 1581 de 2012) y los términos, y enlázalos en el pie.
- Ajusta la tasa del simulador a la que publique cada plataforma.
- Publica solo testimonios reales y autorizados (Ley 1480 de 2011).
