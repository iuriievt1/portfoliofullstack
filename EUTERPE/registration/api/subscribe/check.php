<?php
// /registration/api/subscribe/check.php
session_start();
require_once __DIR__ . '/../../../config/helpers.php';

$raw = file_get_contents('php://input');
$data = $raw ? json_decode($raw, true) : [];
if (!is_array($data))
  $data = [];

$email = isset($data['email']) ? trim((string) $data['email']) : '';

if ($email === '') {
  json_fail('EMAIL_REQUIRED');
}

// если это админский e-mail → говорим фронту role: 'admin'
if (strcasecmp($email, ADMIN_EMAIL) === 0) {
  json_ok(['role' => 'admin']);
}

// обычный подписчик: у нас нет базы, так что считаем всегда новый
json_ok([
  'exists' => false,
  'verified' => false
]);
