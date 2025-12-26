<?php
// /registration/api/cms/get-media.php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../../config/cms_storage.php';

$media = cms_get_media();

echo json_encode(
  array(
    'ok' => true,
    'media' => $media,
  ),
  JSON_UNESCAPED_UNICODE
);
