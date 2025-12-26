<?php
header('Content-Type: application/json');

// CAPTCHA check (optional)
$recaptchaSecret = "YOUR_SECRET_KEY";
$response = $_POST["g-recaptcha-response"];
$verify = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret={$recaptchaSecret}&response={$response}");
$captchaSuccess = json_decode($verify)->success;
if (!$captchaSuccess) {
    echo json_encode(["success" => false, "error" => "captcha"]);
    exit;
}

// Collect form data
$name = htmlspecialchars($_POST["name"]);
$email = htmlspecialchars($_POST["email"]);
$subject = htmlspecialchars($_POST["subject"]);
$message = htmlspecialchars($_POST["message"]);

// Send mail
$to = "info@veltora.cz";
$headers = "From: {$email}\r\nReply-To: {$email}\r\nContent-Type: text/plain; charset=UTF-8";

$body = "Jméno: $name\nEmail: $email\nPředmět: $subject\n\nZpráva:\n$message";

if (mail($to, "Kontakt z webu: $subject", $body, $headers)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false]);
}
