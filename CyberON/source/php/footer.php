<?php
// footer.php — обработчик формы Consultation

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

$email = isset($_POST['email']) ? trim($_POST['email']) : '';

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Invalid email address.']);
  exit;
}

// время заявки
date_default_timezone_set('Europe/Prague');
$time = date('Y-m-d H:i:s');


$to = 'info@cyber-on.net';


$subject = 'New consultation request — CyberON Production';
$body = "New consultation request from footer form:\n\nEmail: {$email}\nTime: {$time}\n\nSource: CyberON website footer.";
$headers = "From: no-reply@cyberon.cz\r\n";
$headers .= "Reply-To: {$email}\r\n";

$sent = @mail($to, $subject, $body, $headers);

if ($sent) {
  echo json_encode(['success' => true]);
} else {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'error' => 'Unable to send email. Check mail() configuration on server.'
  ]);
}
