<?php
// /registration/api/cms/import-from-json.php

require_once __DIR__ . '/../../../config/cms_storage.php';

header('Content-Type: application/json; charset=utf-8');

$result = [
  'ok' => true,
  'importedTexts' => 0,
  'importedLinks' => 0,
  'errors' => []
];

// ---------- 1) TEXTS из /storage/texts.json ----------
$textsPath = __DIR__ . '/../../../storage/texts.json';
if (file_exists($textsPath)) {
  $json = file_get_contents($textsPath);
  $data = json_decode($json, true);

  if (is_array($data)) {
    foreach ($data as $key => $langs) {
      if (!is_array($langs))
        continue;

      foreach (['cs', 'en'] as $lang) {
        if (isset($langs[$lang])) {
          cms_save_text($key, $lang, $langs[$lang]);
        }
      }
      $result['importedTexts']++;
    }
  } else {
    $result['errors'][] = 'texts.json: nelze dekódovat JSON';
  }
} else {
  $result['errors'][] = 'texts.json: soubor nenalezen';
}

// ---------- 2) LINKS из /storage/links.json ----------
$linksPath = __DIR__ . '/../../../storage/links.json';
if (file_exists($linksPath)) {
  $json = file_get_contents($linksPath);
  $data = json_decode($json, true);

  if (is_array($data)) {
    foreach ($data as $key => $url) {
      cms_save_link($key, $url);
      $result['importedLinks']++;
    }
  } else {
    $result['errors'][] = 'links.json: nelze dekódovat JSON';
  }
} else {
  $result['errors'][] = 'links.json: soubor nenalezen';
}

echo json_encode($result);
