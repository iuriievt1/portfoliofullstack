<?php
// /registration/api/subscribe/start.php
session_start();
require_once __DIR__ . '/../../../config/helpers.php';

$raw = file_get_contents('php://input');
$data = $raw ? json_decode($raw, true) : [];
if (!is_array($data))
  $data = [];

$email = isset($data['email']) ? trim((string) $data['email']) : '';
$phone = isset($data['phone']) ? trim((string) $data['phone']) : '';
$lang = isset($data['lang']) ? strtolower(trim((string) $data['lang'])) : 'cs';

if ($email === '' && $phone === '') {
  json_fail('EMAIL_OR_PHONE_REQUIRED');
}

// генерируем 6-значный код
$chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
$code = '';
for ($i = 0; $i < 6; $i++) {
  $code .= $chars[random_int(0, strlen($chars) - 1)];
}

// сохраняем в сессию
$_SESSION['sub_email'] = $email;
$_SESSION['sub_phone'] = $phone;
$_SESSION['sub_code'] = $code;
$_SESSION['sub_created'] = time();

// для твоего JS нужны: tokenId, cooldownSec, channel, to
// tokenId нам не важен, просто отдадим 1
json_ok([
  'tokenId' => 1,
  'cooldownSec' => 30,
  'channel' => 'email',
  'to' => $email,
  // чтобы тебе было легче тестировать — код сразу в ответе
  'debugCode' => $code
]);
