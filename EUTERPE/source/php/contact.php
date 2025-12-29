<?php
// /source/php/contact.php
// Возвращает JSON: { ok: bool, message: string }

header('Content-Type: application/json; charset=utf-8');

// ===== НАСТРОЙКИ =====
$TO_EMAIL = 'info@euterpe.cz';             // куда слать
$SUBJECT_PREFIX = 'EUTERPE — Nová zpráva';

// Утилита ответа
function json_out($ok, $msg)
{
  http_response_code($ok ? 200 : 400);
  echo json_encode(['ok' => $ok, 'message' => $msg], JSON_UNESCAPED_UNICODE);
  exit;
}

// Метод
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_out(false, 'Neplatná metoda požadavku.');
}

// Honeypot
$website = isset($_POST['website']) ? trim($_POST['website']) : '';
if ($website !== '') {
  json_out(true, 'Děkujeme! Vaše zpráva byla odeslána.');
}

// Поля
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';
$topic = isset($_POST['topic']) ? trim($_POST['topic']) : '';

// Валидация
if ($name === '' || $email === '' || $message === '') {
  json_out(false, 'Vyplňte prosím povinná pole (jméno, e-mail, zpráva).');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  json_out(false, 'Zadejte prosím platný e-mail.');
}
if (mb_strlen($message) < 3) {
  json_out(false, 'Zpráva je příliš krátká.');
}

// Санитайз
function clean($s)
{
  $s = strip_tags($s);
  $s = preg_replace("/[\r\n]+/", " ", $s);
  return trim($s);
}
$nameClean = clean($name);
$phoneClean = clean($phone);
$emailClean = clean($email);
$messageTxt = trim(strip_tags($message));

// Письмо
$subject = $SUBJECT_PREFIX . ($topic ? " — $topic" : '');
$body = "Nová zpráva z webu EUTERPE\n\n";
$body .= "Téma: " . ($topic ?: 'Kontakt') . "\n";
$body .= "Jméno: $nameClean\n";
$body .= "Telefon: " . ($phoneClean ?: '—') . "\n";
$body .= "E-mail: $emailClean\n\n";
$body .= "Zpráva:\n$messageTxt\n\n";
$body .= "—\nOdesláno: " . date('Y-m-d H:i:s') . "\n";

// Заголовки
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: EUTERPE <no-reply@euterpe.cz>\r\n";
$headers .= "Reply-To: $nameClean <$emailClean>\r\n";

// Отправка
$ok = @mail(
  $TO_EMAIL,
  "=?UTF-8?B?" . base64_encode($subject) . "?=",
  $body,
  $headers
);

if ($ok) {
  json_out(true, 'Děkujeme! Zpráva byla odeslána.');
} else {
  json_out(false, 'Chyba při odesílání. Zkuste to prosím znovu.');
}
