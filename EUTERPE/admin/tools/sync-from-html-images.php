<?php
// /admin/tools/sync-from-html-images.php
session_start();

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/cms_storage.php';

if (empty($_SESSION['admin_logged'])) {
  http_response_code(403);
  die('Нужно войти как администратор.');
}

/**
 * Сканируем HTML файлы и подтягиваем ТОЛЬКО data-cms-img слоты
 * в /storage/cms_media.json (через cms_save_media).
 *
 * Ничего не удаляем и не перезатираем существующее.
 */

// 1) какие страницы сканировать
$files = [
  __DIR__ . '/../../index.html',
  __DIR__ . '/../../events.html',
  __DIR__ . '/../../anderson.html',
  __DIR__ . '/../../malyprinc.html',
  __DIR__ . '/../../teambuilding.html',
  __DIR__ . '/../../corporate.html',
  __DIR__ . '/../../decoration.html',
  __DIR__ . '/../../concerts.html',
  __DIR__ . '/../../galerie.html',
  __DIR__ . '/../../gallery.html', // на всякий случай, если где-то так назвал
  __DIR__ . '/../../about.html',
  __DIR__ . '/../../studio.html',
];

$media = cms_get_media();
if (!is_array($media)) $media = [];

$newSlots = [];
$scanned = 0;

foreach ($files as $path) {
  if (!is_file($path)) continue;

  $html = file_get_contents($path);
  if ($html === false || $html === '') continue;

  $scanned++;

  // ищем все data-cms-img="..."
  if (preg_match_all('/data-cms-img="([^"]+)"/u', $html, $m)) {
    foreach ($m[1] as $slot) {
      $slot = trim($slot);
      if ($slot === '') continue;

      // если слота еще нет — создаем пустой массив
      if (!array_key_exists($slot, $media)) {
        cms_save_media($slot, []);
        $media[$slot] = [];
        $newSlots[] = $slot;
      }
    }
  }
}

header('Content-Type: text/html; charset=utf-8');
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Синхронизация изображений из HTML</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background:#0f0f12; color:#eee; padding:20px; }
    .card { background:#17171c; border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:16px; margin:12px 0; }
    code { background:#0b0b0e; padding:2px 6px; border-radius:6px; }
    a { color:#8cd6ff; }
    ul { margin:8px 0 0; padding-left:18px; }
  </style>
</head>
<body>
  <h1>Синхронизация слотов изображений (data-cms-img)</h1>

  <div class="card">
    <div>Просканировано HTML файлов: <strong><?php echo (int)$scanned; ?></strong></div>
    <div>Найдено новых слотов: <strong><?php echo (int)count(array_unique($newSlots)); ?></strong></div>
  </div>

  <div class="card">
    <h2>Новые слоты</h2>
    <?php if (!$newSlots): ?>
      <p>Новых слотов нет — всё уже было в CMS.</p>
    <?php else: ?>
      <ul>
        <?php foreach (array_unique($newSlots) as $s): ?>
          <li><code><?php echo htmlspecialchars($s); ?></code></li>
        <?php endforeach; ?>
      </ul>
    <?php endif; ?>
  </div>

  <div class="card">
    <p>Готово ✅ Теперь зайди в <a href="/admin/index.php?view=media">Админка → Изображения</a> — там появятся эти слоты, и можно загружать картинки.</p>
    <p style="opacity:.75">Файл хранилища: <code>/storage/cms_media.json</code></p>
  </div>
</body>
</html>
