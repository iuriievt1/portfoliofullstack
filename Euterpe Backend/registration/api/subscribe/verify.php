<?php
// /registration/api/subscribe/verify.php
session_start();
require_once __DIR__ . '/../../../config/helpers.php';

$raw = file_get_contents('php://input');
$data = $raw ? json_decode($raw, true) : [];
if (!is_array($data))
  $data = [];

$tokenId = isset($data['tokenId']) ? (int) $data['tokenId'] : 0;
$code = isset($data['code']) ? trim((string) $data['code']) : '';

if ($code === '' || !isset($_SESSION['sub_code'])) {
  json_fail('TOKEN_NOT_FOUND');
}

// проверка на 10 минут
$created = $_SESSION['sub_created'] ?? 0;
if (!$created || (time() - $created) > 10 * 60) {
  json_fail('TOKEN_EXPIRED');
}

if (strcasecmp($_SESSION['sub_code'], $code) !== 0) {
  json_fail('CODE_INVALID');
}

// всё ок – очищаем
unset($_SESSION['sub_code'], $_SESSION['sub_email'], $_SESSION['sub_phone'], $_SESSION['sub_created']);

json_ok();
