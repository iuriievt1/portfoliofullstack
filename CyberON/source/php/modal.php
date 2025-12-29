<?php
// modal.php — обработка формы из Services (AJAX JSON)

// Включаем JSON-ответ
header('Content-Type: application/json; charset=UTF-8');

// Разрешаем только POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode([
    'success' => false,
    'error' => 'Method not allowed',
  ]);
  exit;
}

// Хелпер для аккуратного чтения полей
function field($key)
{
  return isset($_POST[$key]) ? trim($_POST[$key]) : '';
}

$name = field('name');
$phone = field('phone');
$email = field('email');
$service = field('service');
$message = field('message');
$human = isset($_POST['human']) ? $_POST['human'] : '';
$clickedService = field('clickedService');
$clickedSection = field('clickedSection');

// Валидация (та же логика, что в JS, но на сервере)
if ($name === '' || $phone === '' || $email === '' || $service === '' || $message === '') {
  echo json_encode([
    'success' => false,
    'error' => 'Please fill in all required fields.',
  ]);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode([
    'success' => false,
    'error' => 'Please enter a valid email address.',
  ]);
  exit;
}

if ($human === '') {
  echo json_encode([
    'success' => false,
    'error' => 'Please confirm that you are not a robot.',
  ]);
  exit;
}

// КУДА ОТПРАВЛЯЕМ ПИСЬМО
$to = 'info@cyber-on.net';
$subject = 'New service request from CyberON website';

// Текст письма
$bodyLines = [
  "New request from services page:",
  "",
  "Name:    {$name}",
  "Phone:   {$phone}",
  "Email:   {$email}",
  "Service: {$service}",
  "",
  "Clicked service: {$clickedService}",
  "Clicked section: {$clickedSection}",
  "",
  "Message:",
  $message,
  "",
  "Time: " . date('Y-m-d H:i:s'),
  "IP:   " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'),
];

$body = implode("\n", $bodyLines);

// Заголовки письма
$headers = [];
$headers[] = 'From: CyberON Website <no-reply@cyberon.cz>';
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'Content-Type: text/plain; charset=UTF-8';

$ok = @mail($to, $subject, $body, implode("\r\n", $headers));

if (!$ok) {
  echo json_encode([
    'success' => false,
    'error' => 'Email send failed on server.',
  ]);
  exit;
}

// Всё ок
echo json_encode([
  'success' => true,
]);
exit;
