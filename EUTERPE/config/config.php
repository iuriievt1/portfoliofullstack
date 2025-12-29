<?php
// /config/config.php

// Логин для входа в админку
//
define('ADMIN_EMAIL', 'euterpeadmin@mail.com');

// >>> СЮДА придумай пароль для админки
define('ADMIN_PASSWORD', 'EuteRpe189!Erpe?Petrohrad1793!!');

// Папка, где лежат JSON-файлы CMS
define('CMS_STORAGE_DIR', __DIR__ . '/../storage');

// Файлы для текстов, ссылок и медиа
define('CMS_TEXTS_FILE', CMS_STORAGE_DIR . '/texts.json');
define('CMS_LINKS_FILE', CMS_STORAGE_DIR . '/links.json');
define('CMS_MEDIA_FILE', CMS_STORAGE_DIR . '/media.json');
