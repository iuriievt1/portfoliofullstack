<?php
// /admin/login.php
session_start();
require_once __DIR__ . '/../config/config.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $email = trim($_POST['email'] ?? '');
  $pass = trim($_POST['password'] ?? '');

  if (strcasecmp($email, ADMIN_EMAIL) === 0 && $pass === ADMIN_PASSWORD) {
    $_SESSION['admin_logged'] = true;
    $_SESSION['admin_email'] = $email;
    header('Location: /admin/index.php');
    exit;
  } else {
    $error = 'Špatný e-mail nebo heslo.';
  }
}

$prefillEmail = trim($_GET['email'] ?? '');
?>
<!DOCTYPE html>
<html lang="cs">

<head>
  <meta charset="UTF-8">
  <title>Admin login</title>
  <link rel="stylesheet" href="/admin/assets/css/admin.css">
</head>

<body class="admin-body admin-body--center">
  <div class="admin-card admin-card--auth">
    <h1 class="admin-title">EUTERPE – Admin</h1>
    <form method="post" class="admin-form">
      <label class="admin-label">
        <span>E-mail</span>
        <input type="email" name="email" required
          value="<?php echo htmlspecialchars($prefillEmail ?: ($_POST['email'] ?? '')); ?>">
      </label>
      <label class="admin-label">
        <span>Heslo</span>
        <input type="password" name="password" required>
      </label>
      <button type="submit" class="admin-btn admin-btn--primary">Přihlásit</button>
      <?php if ($error): ?>
        <div class="admin-error"><?php echo htmlspecialchars($error); ?></div>
      <?php endif; ?>
    </form>
  </div>
</body>

</html>
