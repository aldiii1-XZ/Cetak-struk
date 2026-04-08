<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Legacy Static UI</title>
    <style>
        body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            font-family: system-ui, sans-serif;
            background: #eef4ef;
            color: #173025;
        }
        .box {
            max-width: 720px;
            padding: 32px;
            border-radius: 20px;
            background: #fff;
            border: 1px solid #d8e3da;
        }
        a { color: #119156; font-weight: 700; }
    </style>
</head>
<body>
    <div class="box">
        <h1>Versi statis lama telah diarsipkan</h1>
        <p>File lama masih tersimpan di folder <code>legacy-static</code> untuk referensi migrasi desain dan logic.</p>
        <p>Halaman utama aplikasi sekarang memakai Laravel Blade.</p>
        <p><a href="{{ route('pos') }}">Kembali ke dashboard POS Laravel</a></p>
    </div>
</body>
</html>
