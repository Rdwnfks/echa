# Emilia Tengil Batu — PWA

## Isi paket
- index.html            → aplikasi
- manifest.webmanifest  → nama, ikon, shortcut
- sw.js                 → service worker (offline + update)
- icons/                → ikon 192, 512, maskable, apple-touch, favicon
- _headers              → (opsional) Netlify / Cloudflare Pages

## Cara pakai (wajib HTTPS)
PWA tidak bisa diinstal dari file lokal. Upload SEMUA file ke hosting statis gratis:
- Cloudflare Pages / Netlify: drag & drop folder ini.
- GitHub Pages: upload isi folder ke repo, aktifkan Pages.

Buka sekali saat online → muncul tombol Pasang (Pengaturan → Aplikasi & Offline).
- Android/Chrome: tombol "Pasang Aplikasi" atau menu ⋮ → Instal aplikasi.
- iPhone/iPad: Safari → Bagikan → Tambah ke Layar Utama.
  PENTING: data di Safari dan di aplikasi layar utama terpisah. Backup dulu, Restore setelah terpasang.

## Ubah judul
Ketuk judul di header, atau Pengaturan → Judul Aplikasi. Nama ikon di layar utama tetap
sesuai saat aplikasi dipasang (ubah lewat pengaturan HP, atau pasang ulang).

## Rilis versi baru
1. Edit index.html
2. Naikkan VERSION di sw.js dan APP_VERSION di index.html
3. Upload ulang → pengguna melihat banner "Versi baru tersedia".
