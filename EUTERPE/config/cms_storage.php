<?php
// /config/cms_storage.php

// Путь к файлам хранилища
function cms_storage_path($file)
{
  return __DIR__ . '/../storage/' . $file;
}

// Чтение JSON
function cms_read_json($file)
{
  $path = cms_storage_path($file);
  if (!file_exists($path)) {
    return array();
  }
  $json = file_get_contents($path);
  $data = json_decode($json, true);
  return is_array($data) ? $data : array();
}

// Запись JSON
function cms_write_json($file, $data)
{
  $path = cms_storage_path($file);
  if (!is_dir(dirname($path))) {
    @mkdir(dirname($path), 0775, true);
  }
  file_put_contents(
    $path,
    json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
  );
}

/* ======================
   ТЕКСТЫ
====================== */

function cms_get_texts()
{
  return cms_read_json('cms_texts.json');
}

function cms_save_text($key, $lang, $value)
{
  $texts = cms_get_texts();
  if (!isset($texts[$key]) || !is_array($texts[$key])) {
    $texts[$key] = array();
  }
  $texts[$key][$lang] = $value;
  cms_write_json('cms_texts.json', $texts);
}

/* ======================
   ССЫЛКИ
====================== */

function cms_get_links()
{
  return cms_read_json('cms_links.json');
}

function cms_save_link($key, $url)
{
  $links = cms_get_links();
  $links[$key] = $url;
  cms_write_json('cms_links.json', $links);
}

/* ======================
   ИЗОБРАЖЕНИЯ
====================== */

function cms_get_media()
{
  return cms_read_json('cms_media.json');
}

function cms_save_media($slot, $files)
{
  $media = cms_get_media();
  $media[$slot] = $files;
  cms_write_json('cms_media.json', $media);
}
