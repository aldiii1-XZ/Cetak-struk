# Cetak Struk Laravel POS

Aplikasi kasir minimarket berbasis Laravel dengan dashboard POS modern berbasis Blade.

## Status saat ini

- Laravel sudah dipasang di root project
- Halaman utama `/` menampilkan dashboard POS utama
- Katalog, keranjang, checkout, histori transaksi, dan preview struk sudah aktif di alur POS

## Menjalankan project

Karena PHP di mesin ini belum masuk `PATH` global, contoh command aman untuk sementara:

```powershell
C:\Users\aldiy\Downloads\php-8.5.5-nts-Win32-vs17-x64\php.exe artisan serve
```

Lalu buka:

```text
http://127.0.0.1:8000
```

Jika `php` dan `composer` nanti sudah masuk PATH, kamu cukup pakai:

```powershell
php artisan serve
```

## Route utama

- `/` untuk dashboard POS Laravel

## Struktur penting

- `resources/views/pos.blade.php` untuk desain POS utama Laravel
- `resources/js/pos.js` untuk interaksi katalog, keranjang, dan pembayaran
- `resources/css/app.css` untuk styling dashboard POS
- `routes/web.php` untuk route aplikasi

## Google Cloud

Project ini sekarang sudah disiapkan untuk pola deploy Google Cloud yang umum:

- `Cloud Run` untuk menjalankan aplikasi Laravel
- `Cloud SQL MySQL` untuk database production
- trust proxy aktif via `TRUST_PROXIES` agar URL/HTTPS bekerja benar di belakang load balancer Google
- fallback `CLOUD_SQL_INSTANCE_CONNECTION_NAME` di config database untuk koneksi socket `/cloudsql/...`

File yang ditambahkan:

- `Dockerfile` untuk build image production
- `.dockerignore` agar build context tetap ringan
- `.gcloudignore` agar source upload ke Cloud Build tidak membawa file lokal yang tidak perlu
- `cloudbuild.yaml` untuk build image dan deploy langsung ke Cloud Run
- `scripts/deploy-cloudrun.ps1` untuk menjalankan deploy dari Windows/PowerShell
- `.env.example` dengan contoh env Google Cloud

Env minimal di Cloud Run:

```text
APP_ENV=production
APP_DEBUG=false
APP_URL=https://YOUR_CLOUD_RUN_URL
DB_CONNECTION=mysql
DB_DATABASE=cetak_struk
DB_USERNAME=app_user
DB_PASSWORD=your-db-password
CLOUD_SQL_INSTANCE_CONNECTION_NAME=project-id:region:instance-name
TRUST_PROXIES=*
```

Secret Manager yang disarankan:

```powershell
echo "base64:YOUR_LARAVEL_APP_KEY" | gcloud secrets create laravel-app-key --data-file=-
echo "YOUR_DB_PASSWORD" | gcloud secrets create cetak-struk-db-password --data-file=-
```

Contoh deploy dasar:

```powershell
gcloud builds submit --tag asia-southeast2-docker.pkg.dev/PROJECT_ID/REPOSITORY/cetak-struk
```

```powershell
gcloud run deploy cetak-struk `
  --image asia-southeast2-docker.pkg.dev/PROJECT_ID/REPOSITORY/cetak-struk `
  --region asia-southeast2 `
  --platform managed `
  --allow-unauthenticated `
  --add-cloudsql-instances project-id:region:instance-name `
  --set-env-vars APP_ENV=production,APP_DEBUG=false,APP_URL=https://YOUR_CLOUD_RUN_URL,DB_CONNECTION=mysql,DB_DATABASE=cetak_struk,DB_USERNAME=app_user,CLOUD_SQL_INSTANCE_CONNECTION_NAME=project-id:region:instance-name,TRUST_PROXIES=*
```

Lalu jalankan migrasi di environment target:

```powershell
php artisan migrate --force
```

Atau jalankan deploy dari PowerShell lokal:

```powershell
.\scripts\deploy-cloudrun.ps1 `
  -ProjectId "your-project-id" `
  -AppUrl "https://YOUR_CLOUD_RUN_URL" `
  -CloudSqlConnection "project-id:asia-southeast2:instance-name"
```

## Langkah berikutnya

- Tambah autentikasi admin/kasir
- Simpan histori transaksi ke database permanen
- Tambah modul laporan, manajemen produk, dan pengaturan toko
