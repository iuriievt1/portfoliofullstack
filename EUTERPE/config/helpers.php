<?php
// /config/helpers.php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

function json_ok(array $extra = [])
{
  echo json_encode(array_merge(['ok' => true], $extra));
  exit;
}

function json_fail(string $error, int $code = 200)
{
  http_response_code($code);
  echo json_encode(['ok' => false, 'error' => $error]);
  exit;
}
