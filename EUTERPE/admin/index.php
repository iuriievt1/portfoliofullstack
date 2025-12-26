<?php
// /admin/index.php
session_start();
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/cms_storage.php';

if (empty($_SESSION['admin_logged'])) {
  header('Location: /admin/login.php');
  exit;
}

// какой экран открыт
$view = isset($_GET['view']) ? $_GET['view'] : 'dashboard';

/* =====================================
   1) ОБРАБОТКА POST ДО ЧТЕНИЯ STORAGE
   ===================================== */

// ТЕКСТЫ
if (
  $view === 'texts' &&
  $_SERVER['REQUEST_METHOD'] === 'POST' &&
  (isset($_GET['action']) && $_GET['action'] === 'save')
) {
  $key = trim(isset($_POST['key']) ? $_POST['key'] : '');
  $cs = trim(isset($_POST['cs']) ? $_POST['cs'] : '');
  $en = trim(isset($_POST['en']) ? $_POST['en'] : '');

  if ($key !== '') {
    cms_save_text($key, 'cs', $cs);
    cms_save_text($key, 'en', $en);
  }

  header('Location: /admin/index.php?view=texts');
  exit;
}

// ССЫЛКИ
if (
  $view === 'links' &&
  $_SERVER['REQUEST_METHOD'] === 'POST' &&
  (isset($_GET['action']) && $_GET['action'] === 'save')
) {
  $key = trim(isset($_POST['key']) ? $_POST['key'] : '');
  $url = trim(isset($_POST['url']) ? $_POST['url'] : '');

  if ($key !== '' && $url !== '') {
    cms_save_link($key, $url);
  }

  header('Location: /admin/index.php?view=links');
  exit;
}

// ИЗОБРАЖЕНИЯ – загрузка
if (
  $view === 'media' &&
  $_SERVER['REQUEST_METHOD'] === 'POST' &&
  (isset($_GET['action']) && $_GET['action'] === 'upload')
) {
  $slot = trim(isset($_POST['slot']) ? $_POST['slot'] : '');
  if ($slot !== '' && isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../uploads';
    if (!is_dir($uploadDir)) {
      @mkdir($uploadDir, 0775, true);
    }
    $ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
    $name = 'img_' . time() . '_' . mt_rand(1000, 9999) . '.' . $ext;
    $destPath = $uploadDir . '/' . $name;
    if (move_uploaded_file($_FILES['file']['tmp_name'], $destPath)) {
      $relPath = 'uploads/' . $name;
      $media = cms_get_media();
      if (!isset($media[$slot]) || !is_array($media[$slot])) {
        $media[$slot] = array();
      }
      $media[$slot][] = $relPath;
      cms_save_media($slot, $media[$slot]);
    }
  }

  header('Location: /admin/index.php?view=media');
  exit;
}

// ИЗОБРАЖЕНИЯ – удаление
if (
  $view === 'media' &&
  $_SERVER['REQUEST_METHOD'] === 'POST' &&
  (isset($_GET['action']) && $_GET['action'] === 'delete')
) {
  $slot = trim(isset($_POST['slot']) ? $_POST['slot'] : '');
  $path = trim(isset($_POST['path']) ? $_POST['path'] : '');

  if ($slot !== '' && $path !== '') {
    $media = cms_get_media();
    if (isset($media[$slot]) && is_array($media[$slot])) {
      $newArr = array();
      foreach ($media[$slot] as $p) {
        if ($p !== $path) {
          $newArr[] = $p;
        }
      }
      $media[$slot] = $newArr;
      cms_save_media($slot, $media[$slot]);
    }

    $fullPath = __DIR__ . '/../' . $path;
    if (file_exists($fullPath)) {
      @unlink($fullPath);
    }
  }

  header('Location: /admin/index.php?view=media');
  exit;
}

/* =====================================
   2) ЧИТАЕМ АКТУАЛЬНЫЕ ДАННЫЕ
   ===================================== */
$texts = cms_get_texts();
$links = cms_get_links();
$media = cms_get_media();
?>
<!DOCTYPE html>
<html lang="ru">

<head>
  <meta charset="UTF-8">
  <title>EUTERPE – Админ-панель</title>
  <link rel="stylesheet" href="/admin/assets/css/admin.css">
</head>

<body class="admin-body">
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-sidebar__logo">EUTERPE Admin</div>
      <nav class="admin-nav">
        <a href="?view=dashboard"
          class="admin-nav__item <?php echo $view === 'dashboard' ? 'is-active' : ''; ?>">Обзор</a>
        <a href="?view=texts" class="admin-nav__item <?php echo $view === 'texts' ? 'is-active' : ''; ?>">Тексты</a>
        <a href="?view=links" class="admin-nav__item <?php echo $view === 'links' ? 'is-active' : ''; ?>">Ссылки</a>
        <a href="?view=media"
          class="admin-nav__item <?php echo $view === 'media' ? 'is-active' : ''; ?>">Изображения</a>
        <a href="?view=help" class="admin-nav__item <?php echo $view === 'help' ? 'is-active' : ''; ?>">Справка</a>
      </nav>
      <div class="admin-sidebar__bottom">
        <div class="admin-sidebar__user"><?php echo htmlspecialchars($_SESSION['admin_email']); ?></div>
        <a href="/admin/logout.php" class="admin-nav__item admin-nav__item--muted">Выйти</a>
      </div>
    </aside>

    <main class="admin-main">
      <?php if ($view === 'dashboard'): ?>
        <section class="admin-section">
          <h1 class="admin-h1">Обзор</h1>
          <p>Добро пожаловать в админ-панель EUTERPE. Слева выберите раздел для редактирования текстов, ссылок или
            изображений.</p>
        </section>

      <?php elseif ($view === 'texts'): ?>
        <section class="admin-section">
          <h1 class="admin-h1">Тексты</h1>
          <p class="admin-muted">
            Ключи соответствуют атрибутам <code>data-cms-key</code> в HTML.
          </p>

          <form method="post" class="admin-card admin-form" action="?view=texts&action=save">
            <h2 class="admin-h2">Добавить / изменить текст</h2>
            <label class="admin-label">
              <span>Ключ (например <code>footer.news.title</code>)</span>
              <input type="text" name="key" required>
            </label>
            <label class="admin-label">
              <span>Текст (чешский)</span>
              <textarea name="cs" rows="2"></textarea>
            </label>
            <label class="admin-label">
              <span>Текст (английский)</span>
              <textarea name="en" rows="2"></textarea>
            </label>
            <button type="submit" class="admin-btn admin-btn--primary">Сохранить</button>
          </form>

          <div class="admin-card admin-table-card">
            <h2 class="admin-h2">Существующие тексты</h2>
            <?php if (!$texts): ?>
              <p class="admin-muted">Пока нет ни одного текста.</p>
            <?php else: ?>
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Ключ</th>
                    <th>CS</th>
                    <th>EN</th>
                  </tr>
                </thead>
                <tbody>
                  <?php foreach ($texts as $key => $vals): ?>
                    <tr>
                      <td><?php echo htmlspecialchars($key); ?></td>
                      <td><?php echo htmlspecialchars(isset($vals['cs']) ? $vals['cs'] : ''); ?></td>
                      <td><?php echo htmlspecialchars(isset($vals['en']) ? $vals['en'] : ''); ?></td>
                    </tr>
                  <?php endforeach; ?>
                </tbody>
              </table>
            <?php endif; ?>
          </div>
        </section>

      <?php elseif ($view === 'links'): ?>
        <section class="admin-section">
          <h1 class="admin-h1">Ссылки</h1>
          <p class="admin-muted">
            Ключи могут быть, например, <code>button.tickets.main</code>, а в HTML нужно использовать
            <code>data-cms-link="button.tickets.main"</code>.
          </p>

          <form method="post" class="admin-card admin-form" action="?view=links&action=save">
            <h2 class="admin-h2">Добавить / изменить ссылку</h2>
            <label class="admin-label">
              <span>Ключ ссылки</span>
              <input type="text" name="key" required>
            </label>
            <label class="admin-label">
              <span>URL</span>
              <input type="url" name="url" required>
            </label>
            <button type="submit" class="admin-btn admin-btn--primary">Сохранить</button>
          </form>

          <div class="admin-card admin-table-card">
            <h2 class="admin-h2">Существующие ссылки</h2>
            <?php if (!$links): ?>
              <p class="admin-muted">Пока нет ни одной ссылки.</p>
            <?php else: ?>
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Ключ</th>
                    <th>URL</th>
                  </tr>
                </thead>
                <tbody>
                  <?php foreach ($links as $key => $url): ?>
                    <tr>
                      <td><?php echo htmlspecialchars($key); ?></td>
                      <td><?php echo htmlspecialchars($url); ?></td>
                    </tr>
                  <?php endforeach; ?>
                </tbody>
              </table>
            <?php endif; ?>
          </div>
        </section>

      <?php elseif ($view === 'media'): ?>
        <section class="admin-section">
          <h1 class="admin-h1">Изображения</h1>
          <p class="admin-muted">
            Слот = ключ позиции изображения, например <code>hero.main</code>, а на странице нужно использовать
            <code>data-cms-img="hero.main"</code>.
          </p>

          <div class="admin-card admin-form">
            <h2 class="admin-h2">Добавить / заменить изображение</h2>
            <form method="post" enctype="multipart/form-data" action="?view=media&action=upload">
              <label class="admin-label">
                <span>Ключ слота</span>
                <input type="text" name="slot" required>
              </label>
              <label class="admin-label">
                <span>Файл</span>
                <input type="file" name="file" accept="image/*" required>
              </label>
              <button type="submit" class="admin-btn admin-btn--primary">Загрузить</button>
            </form>
          </div>

          <div class="admin-card admin-table-card">
            <h2 class="admin-h2">Существующие изображения</h2>
            <?php if (!$media): ?>
              <p class="admin-muted">Пока нет ни одного изображения.</p>
            <?php else: ?>
              <?php foreach ($media as $slot => $files): ?>
                <div class="admin-media-group">
                  <div class="admin-media-group__header">
                    <strong><?php echo htmlspecialchars($slot); ?></strong>
                  </div>
                  <div class="admin-media-group__list">
                    <?php foreach ($files as $path): ?>
                      <div class="admin-media-item">
                        <img src="/<?php echo htmlspecialchars($path); ?>" alt="">
                        <form method="post" action="?view=media&action=delete"
                          onsubmit="return confirm('Удалить изображение?');">
                          <input type="hidden" name="slot" value="<?php echo htmlspecialchars($slot); ?>">
                          <input type="hidden" name="path" value="<?php echo htmlspecialchars($path); ?>">
                          <button type="submit" class="admin-btn admin-btn--ghost">Удалить</button>
                        </form>
                      </div>
                    <?php endforeach; ?>
                  </div>
                </div>
              <?php endforeach; ?>
            <?php endif; ?>
          </div>
        </section>

      <?php elseif ($view === 'help'): ?>
        <section class="admin-section">
          <h1 class="admin-h1">Справка</h1>
          <div class="admin-card">
            <h2 class="admin-h2">Как работает CMS</h2>
            <ol class="admin-list">
              <li>На странице в HTML помечайте тексты атрибутом <code>data-cms-key="ключ"</code>.</li>
              <li>В разделе «Тексты» используйте тот же ключ и заполните варианты на чешском и английском.</li>
              <li>Для кнопок с билетами / YouTube используйте <code>data-cms-link="ключ"</code>.</li>
              <li>В разделе «Ссылки» задайте URL для нужного ключа.</li>
              <li>Изображения работают через <code>data-cms-img="slot"</code>, где slot — это ключ в разделе
                «Изображения».</li>
              <li>На фронтенде должен быть подключён <code>cms-frontend.js</code>, который всё подгружает и подменяет.
              </li>
            </ol>
          </div>
        </section>
      <?php endif; ?>
    </main>
  </div>
</body>

</html>
