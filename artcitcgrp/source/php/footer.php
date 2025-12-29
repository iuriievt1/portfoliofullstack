<?php
// source/php/footer-form.php

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'invalid_method']);
  exit;
}

function post($key)
{
  return isset($_POST[$key]) ? trim($_POST[$key]) : '';
}

$email = post('email');
$phone = post('phone');
$topic = post('topic');
$otherTopic = post('otherTopic');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'invalid_email']);
  exit;
}

$ownerEmail = 'info@arcticgrp.com';
$fromEmail = 'noreply@arcticgrp.com'; // при желании на существующий ящик
$fromName = 'Arctic Group';

// Письмо бизнесу
$subjectOwner = 'Nová poptávka z webu Arctic Group';

$bodyOwner = "Dobrý den,\n\n";
$bodyOwner .= "na webu Arctic Group byla odeslána nová poptávka.\n\n";
$bodyOwner .= "E-mail klienta: {$email}\n";

if ($phone !== '') {
  $bodyOwner .= "Telefon: {$phone}\n";
}
if ($topic !== '') {
  $bodyOwner .= "Téma: {$topic}\n";
}
if ($otherTopic !== '') {
  $bodyOwner .= "Upřesnění: {$otherTopic}\n";
}

$bodyOwner .= "\nProsím, kontaktujte klienta co nejdříve.\n\n";
$bodyOwner .= "--\nArctic Group web\n";

$headersOwner =
  "From: {$fromName} <{$fromEmail}>\r\n" .
  "Reply-To: {$email}\r\n" .
  "Content-Type: text/plain; charset=UTF-8\r\n";

// Письмо пользователю
$subjectUser = 'Děkujeme za Vaši zprávu – Arctic Group';

$bodyUser = "Dobrý den,\n\n";
$bodyUser .= "děkujeme, že jste nás kontaktovali přes web Arctic Group.\n";
$bodyUser .= "Ozveme se Vám zpět co nejdříve.\n\n";
$bodyUser .= "S pozdravem,\nArctic Group\n";

$headersUser =
  "From: {$fromName} <{$fromEmail}>\r\n" .
  "Reply-To: {$ownerEmail}\r\n" .
  "Content-Type: text/plain; charset=UTF-8\r\n";

$okOwner = @mail($ownerEmail, $subjectOwner, $bodyOwner, $headersOwner);
$okUser = @mail($email, $subjectUser, $bodyUser, $headersUser);

// успех считаем по письму бизнесу
if ($okOwner) {
  echo json_encode(['success' => true]);
} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'mail_failed']);
}
