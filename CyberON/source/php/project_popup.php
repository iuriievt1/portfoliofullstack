<?php
// /source/php/project_popup.php

header('Content-Type: application/json; charset=utf-8');

// helper для ответа
function respond($success, $message = '')
{
  echo json_encode([
    'success' => $success,
    'error' => $success ? null : $message,
  ]);
  exit;
}

// Проверяем метод
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  respond(false, 'Invalid request method.');
}

// Читаем поля
$project = isset($_POST['project']) ? trim($_POST['project']) : '';
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// Валидация
if ($email === '' || $message === '') {
  respond(false, 'Please fill in required fields.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  respond(false, 'Invalid email address.');
}

// Собираем письмо
$to = 'info@cyber-on.net';
$subject = 'New project request: ' . ($project ?: 'Unknown project');

$body = "Project: " . ($project ?: 'Not specified') . "\n";
$body .= "Name: " . ($name ?: 'Not specified') . "\n";
$body .= "Email: " . $email . "\n\n";
$body .= "Message:\n" . $message . "\n";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/plain; charset=utf-8';
$headers[] = 'From: CyberON <no-reply@cyber-on.net>';
$headers[] = 'Reply-To: ' . $email;

$sent = @mail($to, $subject, $body, implode("\r\n", $headers));

if ($sent) {
  respond(true);
} else {
  respond(false, 'Mail sending failed.');
}
