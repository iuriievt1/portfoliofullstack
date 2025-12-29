<?php
// /registration/api/cms/get-texts.php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../../config/cms_storage.php';

$lang = isset($_GET['lang']) ? strtolower($_GET['lang']) : 'cs';
if ($lang !== 'cs' && $lang !== 'en') {
  $lang = 'cs';
}

$all = cms_get_texts();
$result = array();

foreach ($all as $key => $variants) {
  if (!is_array($variants)) {
    continue;
  }

  if (isset($variants[$lang]) && $variants[$lang] !== '') {
    $result[$key] = $variants[$lang];
  } elseif (isset($variants['cs'])) {
    $result[$key] = $variants['cs'];
  } elseif (isset($variants['en'])) {
    $result[$key] = $variants['en'];
  }
}

echo json_encode(
  array(
    'ok' => true,
    'texts' => $result,
  ),
  JSON_UNESCAPED_UNICODE
);
