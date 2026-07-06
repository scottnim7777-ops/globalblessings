<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { echo json_encode(['success'=>false]); exit; }

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) { echo json_encode(['success'=>false,'error'=>'no data']); exit; }

$to      = 'eunicekim7679@gmail.com';
$name    = strip_tags(trim($data['이름']      ?? ''));
$phone   = strip_tags(trim($data['핸드폰번호'] ?? ''));
$email   = strip_tags(trim($data['이메일']     ?? ''));
$source  = strip_tags(trim($data['유입경로']   ?? '미선택'));
$message = strip_tags(trim($data['문의내용']   ?? ''));

if (!$name || !$phone || !$message) {
    echo json_encode(['success'=>false,'error'=>'required fields missing']); exit;
}

$subject_raw = '[글로벌 블레싱스] 새 문의가 도착했습니다 — ' . $name;
$subject     = '=?UTF-8?B?' . base64_encode($subject_raw) . '?=';

$body  = "안녕하세요,\n";
$body .= "글로벌 블레싱스 웹사이트에서 새 문의가 접수되었습니다.\n";
$body .= str_repeat('-', 40) . "\n\n";
$body .= "이름:       " . $name   . "\n";
$body .= "핸드폰번호: " . $phone  . "\n";
$body .= "이메일:     " . ($email  ?: '미입력') . "\n";
$body .= "유입경로:   " . $source . "\n\n";
$body .= "[ 문의 내용 ]\n";
$body .= $message . "\n";

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: =?UTF-8?B?" . base64_encode('글로벌 블레싱스 웹사이트') . "?= <noreply@globalblessings.com>\r\n";
if ($email) {
    $headers .= "Reply-To: " . $email . "\r\n";
}

$sent = mail($to, $subject, $body, $headers);
echo json_encode(['success' => (bool)$sent]);
