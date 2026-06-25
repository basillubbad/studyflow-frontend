<?php

declare(strict_types=1);

try {
    $pdo = new PDO(
        'mysql:host=127.0.0.1;port=3306',
        'root',
        '',
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5,
        ],
    );

    $pdo->exec(
        'CREATE DATABASE IF NOT EXISTS studyflow_backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
    );

    fwrite(STDOUT, "DATABASE_READY\n");
} catch (Throwable $exception) {
    fwrite(STDERR, $exception->getMessage() . PHP_EOL);
    exit(1);
}
