<?php
// source/php/estimate-form.php

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

$spaceType = post('spaceType');
$area = post('area');
$style = post('style');
$startWhen = post('startWhen');
$city = post('city');

$name = post('name');
$phone = post('phone');
$message = post('message');

// минимальная проверка — без телефона не отправляем
if ($phone === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'phone_required']);
  exit;
}

$to = 'info@arcticgrp.com';
$fromEmail = 'noreply@arcticgrp.com';
$fromName = 'Arctic Group';
$subject = 'New design estimate request';

$body = "New estimate request from website:\n\n";
$body .= "Space type: " . ($spaceType !== '' ? $spaceType : '-') . "\n";
$body .= "Area (m2): " . ($area !== '' ? $area : '-') . "\n";
$body .= "Style: " . ($style !== '' ? $style : '-') . "\n";
$body .= "Start when: " . ($startWhen !== '' ? $startWhen : '-') . "\n";
$body .= "City: " . ($city !== '' ? $city : '-') . "\n\n";

$body .= "Name: " . ($name !== '' ? $name : '-') . "\n";
$body .= "Phone: " . $phone . "\n\n";

$body .= "Message:\n" . ($message !== '' ? $message : '-') . "\n";

$headers =
  "From: {$fromName} <{$fromEmail}>\r\n" .
  "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = @mail($to, $subject, $body, $headers);

if ($sent) {
  echo json_encode(['success' => true]);
} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'mail_failed']);
}
