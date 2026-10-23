<?php
/**
 * API mínima del módulo administrativo.
 *   GET  ?action=content   contenido público de la landing
 *   GET  ?action=me        estado de la sesión
 *   POST ?action=login     { password }
 *   POST ?action=logout
 *   POST ?action=save      JSON completo del contenido   (requiere sesión)
 *   POST ?action=upload    multipart "file" (imagen)      (requiere sesión)
 *   POST ?action=password  { current, next }              (requiere sesión)
 */
declare(strict_types=1);

const ROOT = __DIR__ . '/..';
const CONTENT_FILE = ROOT . '/data/content.json';
const AUTH_FILE = __DIR__ . '/.auth.php';
const UPLOAD_DIR = ROOT . '/uploads';
const DEFAULT_PASSWORD = 'cambiar-esta-clave';
const MAX_UPLOAD = 4 * 1024 * 1024;

session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Strict',
    'secure' => !empty($_SERVER['HTTPS']),
    'path' => '/',
]);
session_start();
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function out($data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function passwordHash(): ?string
{
    return is_file(AUTH_FILE) ? (include AUTH_FILE) : null;
}

function requireAuth(): void
{
    if (empty($_SESSION['admin'])) out(['error' => 'Inicia sesión para continuar.'], 401);
    // Defensa CSRF: las peticiones del panel siempre envían esta cabecera.
    if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'admin') out(['error' => 'Petición no válida.'], 400);
}

function body(): array
{
    $j = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($j) ? $j : [];
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

switch ($action) {
    case 'content':
        header('Cache-Control: no-store');
        if (!is_file(CONTENT_FILE)) out(['error' => 'Sin contenido guardado.'], 404);
        echo file_get_contents(CONTENT_FILE);
        exit;

    case 'me':
        out(['admin' => !empty($_SESSION['admin']), 'defaultPassword' => passwordHash() === null]);

    case 'login':
        if ($method !== 'POST') out(['error' => 'Método no permitido.'], 405);
        $pw = (string)(body()['password'] ?? '');
        $hash = passwordHash();
        $ok = $hash === null ? hash_equals(DEFAULT_PASSWORD, $pw) : password_verify($pw, $hash);
        if (!$ok) {
            usleep(600000);
            out(['error' => 'Contraseña incorrecta.'], 401);
        }
        session_regenerate_id(true);
        $_SESSION['admin'] = true;
        out(['ok' => true, 'defaultPassword' => $hash === null]);

    case 'logout':
        $_SESSION = [];
        session_destroy();
        out(['ok' => true]);

    case 'password':
        requireAuth();
        $b = body();
        $hash = passwordHash();
        $cur = (string)($b['current'] ?? '');
        $next = (string)($b['next'] ?? '');
        $ok = $hash === null ? hash_equals(DEFAULT_PASSWORD, $cur) : password_verify($cur, $hash);
        if (!$ok) out(['error' => 'La contraseña actual no coincide.'], 400);
        if (strlen($next) < 10) out(['error' => 'La nueva contraseña debe tener al menos 10 caracteres.'], 400);
        $php = '<?php return ' . var_export(password_hash($next, PASSWORD_DEFAULT), true) . ';';
        if (file_put_contents(AUTH_FILE, $php, LOCK_EX) === false) out(['error' => 'No se pudo guardar. Revisa permisos de escritura en /api.'], 500);
        out(['ok' => true]);

    case 'save':
        requireAuth();
        $raw = file_get_contents('php://input') ?: '';
        if (strlen($raw) > 2 * 1024 * 1024) out(['error' => 'El contenido es demasiado grande.'], 413);
        $data = json_decode($raw, true);
        if (!is_array($data) || !isset($data['brand'])) out(['error' => 'Contenido no válido.'], 400);
        if (!is_dir(dirname(CONTENT_FILE))) mkdir(dirname(CONTENT_FILE), 0755, true);
        if (is_file(CONTENT_FILE)) copy(CONTENT_FILE, CONTENT_FILE . '.bak');
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if (file_put_contents(CONTENT_FILE, $json, LOCK_EX) === false) out(['error' => 'No se pudo guardar. Revisa permisos de escritura en /data.'], 500);
        out(['ok' => true, 'savedAt' => date('c')]);

    case 'upload':
        requireAuth();
        $f = $_FILES['file'] ?? null;
        if (!$f || $f['error'] !== UPLOAD_ERR_OK) out(['error' => 'No llegó ninguna imagen.'], 400);
        if ($f['size'] > MAX_UPLOAD) out(['error' => 'La imagen supera 4 MB. Comprímela e inténtalo de nuevo.'], 413);
        $types = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
        if (!isset($types[$mime])) out(['error' => 'Formato no admitido. Usa JPG, PNG, WEBP o GIF.'], 415);
        if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);
        $name = date('Ymd') . '-' . bin2hex(random_bytes(6)) . '.' . $types[$mime];
        if (!move_uploaded_file($f['tmp_name'], UPLOAD_DIR . '/' . $name)) out(['error' => 'No se pudo guardar la imagen. Revisa permisos de /uploads.'], 500);
        out(['ok' => true, 'url' => 'uploads/' . $name]);

    default:
        out(['error' => 'Acción desconocida.'], 404);
}
