<?php
// /registration/api/cms/get-links.php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../../config/cms_storage.php';

$links = cms_get_links();

echo json_encode(
  array(
    'ok' => true,
    'links' => $links,
  ),
  JSON_UNESCAPED_UNICODE
);
