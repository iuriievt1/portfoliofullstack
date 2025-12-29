<?php
// source/php/contact-form.php

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode([
    'success' => false,
    'error' => 'Method not allowed'
  ]);
  exit;
}

function post($key)
{
  return isset($_POST[$key]) ? trim($_POST[$key]) : '';
}

$email = post('email');
$phone = post('phone');
$name = post('name');
$company = post('company');
$service = post('service');
$subservices = post('subservices'); // строка "ventilation, water" и т.п.
$message = post('message');
$notRobot = post('notRobot');
$privacy = post('privacy');

// Базовая валидация
if (
  !filter_var($email, FILTER_VALIDATE_EMAIL) ||
  $phone === '' ||
  $name === '' ||
  $service === '' ||
  $notRobot !== '1' ||
  $privacy !== '1'
) {

  http_response_code(400);
  echo json_encode([
    'success' => false,
    'error' => 'Missing or invalid required fields'
  ]);
  exit;
}

$ownerEmail = 'info@arcticgrp.com';
$fromEmail = 'noreply@arcticgrp.com';
$fromName = 'Arctic Group';

$subjectBusiness = 'New contact request from Arctic Group website';

$bodyBusiness = "New contact request from website:\n\n";
$bodyBusiness .= "Name: {$name}\n";
$bodyBusiness .= "Email: {$email}\n";
$bodyBusiness .= "Phone: {$phone}\n";

if ($company !== '') {
  $bodyBusiness .= "Company: {$company}\n";
}

$bodyBusiness .= "Service: {$service}\n";

if ($subservices !== '') {
  $bodyBusiness .= "Subservices: {$subservices}\n";
}

if ($message !== '') {
  $bodyBusiness .= "\nMessage:\n{$message}\n";
}

$headersBusiness =
  "From: {$fromName} <{$fromEmail}>\r\n" .
  "Reply-To: {$email}\r\n" .
  "Content-Type: text/plain; charset=UTF-8\r\n";

$sentBusiness = @mail($ownerEmail, $subjectBusiness, $bodyBusiness, $headersBusiness);

// Письмо пользователю
$toUser = $email;
$subjectUser = 'Vaše poptávka – Arctic Group';
$bodyUser = "Děkujeme za vaši zprávu.\n\n";
$bodyUser .= "Obdrželi jsme váš kontakt a ozveme se vám co nejdříve.\n\n";
$bodyUser .= "Arctic Group\n";

$headersUser =
  "From: {$fromName} <{$fromEmail}>\r\n" .
  "Reply-To: {$ownerEmail}\r\n" .
  "Content-Type: text/plain; charset=UTF-8\r\n";

$sentUser = @mail($toUser, $subjectUser, $bodyUser, $headersUser);

// успех считаем по письму бизнесу
if ($sentBusiness) {
  echo json_encode(['success' => true]);
} else {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'error' => 'Mail sending failed'
  ]);
}
