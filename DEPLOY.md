# Deploy ke server (Docker + Nginx Proxy Manager / Nginx)

Domain: **https://cms.documentation.my.id**

Yang jalan di server: 2 container, yaitu `cms-app` (website, port 8080 internal) dan `cms-db` (MySQL 8.4).
Node/npm **tidak** perlu ada di server. Tampilan (CSS/JS) di-build di laptop lalu ikut terkirim, karena `npm` dan `vite` terlalu berat untuk RAM server.

---

## 0. Domain: pakai tunnel Cloudflare yang sudah ada

Domain `documentation.my.id` sudah di Cloudflare dan server sudah menjalankan tunnel **`noktah`**.
Website ini cukup ditambahkan sebagai **route baru** di tunnel itu (langkah 4), jadi tidak perlu ubah nameserver,
tidak perlu buka port, dan Nginx Proxy Manager tidak dipakai.

## 1. Kirim kode ke server (dari Windows PowerShell)

```powershell
cd "D:\Jedagjedug\Web Porto\CMS"
npm ci; npm run build; Remove-Item -Recurse -Force node_modules
tar -czf ..\cms.tar.gz --exclude=node_modules --exclude=vendor --exclude=.env --exclude=public/storage --exclude=public/hot --exclude="storage/logs/*.log" .
scp ..\cms.tar.gz USER@IP_SERVER:/tmp/
```

## 2. Siapkan di server (SSH ke server)

```bash
sudo mkdir -p /opt/cms && sudo chown $USER /opt/cms
tar -xzf /tmp/cms.tar.gz -C /opt/cms
cd /opt/cms
cp .env.production.example .env
chmod 600 .env
```

Isi `.env` (`nano .env`). Kolom yang wajib diganti:

| Kolom | Cara isi |
|-------|----------|
| `APP_KEY` | hasil dari `echo "base64:$(openssl rand -base64 32)"` |
| `DB_PASSWORD`, `DB_ROOT_PASSWORD` | masing-masing hasil `openssl rand -base64 24` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | akun login panel admin (password yang kuat) |
| `APP_PORT` | biarkan `8080`, kecuali port itu sudah dipakai aplikasi lain |

## 3. Jalankan

**Dengan tunnel Cloudflare yang sudah ada (yang kita pakai):**

```bash
ss -tlnp | grep ':8080 '   # kalau ada isinya, port 8080 sudah dipakai: ganti APP_PORT di .env (misal 8085)
docker compose up -d --build
```

**Kalau Nginx Proxy Manager berjalan di Docker:**

```bash
# cari nama network NPM
docker network ls
# tambahkan ke .env, contoh: NPM_NETWORK=npm_default
echo "NPM_NETWORK=npm_default" >> .env

docker compose -f docker-compose.yml -f docker-compose.npm.yml up -d --build
```

**Kalau Nginx terpasang langsung di server (bukan Docker):**

```bash
docker compose up -d --build
```

Migrasi database jalan otomatis setiap container start. **Jangan jalankan dua build bersamaan**: cek dulu dengan `pgrep -af "docker-compose"` (harus kosong), karena dua build sekaligus bisa membuat server tidak merespons.

Isi data awal (akun admin, logo, warna, contoh layanan dan galeri). **Cukup sekali:**

```bash
docker compose exec app php artisan db:seed --force
```

Cek: `curl -I http://127.0.0.1:8080/up` harus menjawab `HTTP/1.1 200`.

## 4. Sambungkan domain

### Cloudflare Tunnel (yang kita pakai)

Cloudflare → **Zero Trust** → **Networks** → **Tunnels** → **noktah** → **Routes** → **Add route** → **Published application**:

- Subdomain `cms` · Domain `documentation.my.id` · Path kosong
- Service type `HTTP` · URL: lihat tabel. Caranya, samakan dengan pola route `noktah.documentation.my.id` yang sudah jalan:

| Route noktah yang lama memakai URL… | Artinya cloudflared jalan… | URL untuk cms |
|---|---|---|
| `localhost:xxxx` / `127.0.0.1:xxxx` | langsung di server (atau Docker `network_mode: host`) | `localhost:8080` |
| `nama-container:xxxx` | di Docker (bridge network) | `cms-app:8080`, lalu di server jalankan `docker network connect cms_default NAMA_CONTAINER_CLOUDFLARED` |

DNS `cms.documentation.my.id` dibuat otomatis oleh Cloudflare saat route disimpan. Nyalakan juga **SSL/TLS → Edge Certificates → Always Use HTTPS**.

### A. Nginx Proxy Manager

*Hosts → Proxy Hosts → Add Proxy Host*

- **Details**: Domain Names `cms.documentation.my.id`, Scheme `http`, Forward Hostname `cms-app`, Forward Port `8080`, centang *Block Common Exploits*.
- **SSL**: *Request a new SSL Certificate*, centang *Force SSL* dan *HTTP/2 Support*, setujui Let's Encrypt.
- **Advanced** (supaya upload foto/logo sampai 10 MB tidak ditolak):
  ```nginx
  client_max_body_size 12m;
  ```

### B. Nginx di server

`/etc/nginx/sites-available/cms.documentation.my.id`:

```nginx
server {
    server_name cms.documentation.my.id;
    client_max_body_size 12m;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/cms.documentation.my.id /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d cms.documentation.my.id
```

## 5. Selesai, lalu cek

- https://cms.documentation.my.id tampil dengan gembok HTTPS.
- https://cms.documentation.my.id/login, masuk dengan `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Di **Tampilan Situs**: ganti nomor WhatsApp, alamat dan koordinat lokasi dengan data asli.
- Di **Galeri Hasil**: ganti foto dummy dengan foto hasil kerja asli.

---

## Update website nanti

Ulangi langkah 1 (buat `cms.tar.gz` lalu `scp`), kemudian di server:

```bash
cd /opt/cms
tar -xzf /tmp/cms.tar.gz -C /opt/cms        # .env tidak ikut tertimpa
docker compose up -d --build
```

Data (database dan foto yang di-upload) aman, karena disimpan di volume Docker `cms_dbdata` dan `cms_uploads`.

## Backup

```bash
cd /opt/cms
# database
docker compose exec -T db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' > backup-db-$(date +%F).sql
# foto/logo yang di-upload
docker run --rm -v cms_uploads:/data -v "$PWD":/backup alpine tar czf /backup/backup-uploads-$(date +%F).tgz -C /data .
```

## Kalau ada masalah

| Gejala | Cek |
|--------|-----|
| Cloudflare: error 502 / 1033 | `curl -I http://127.0.0.1:8080/up` di server harus 200; URL route di tunnel harus cocok dengan cara cloudflared berjalan (tabel di langkah 4) |
| 502 Bad Gateway di NPM | `docker ps` (apakah `cms-app` Up?), dan apakah NPM satu network: `docker network inspect $NPM_NETWORK` |
| Tampilan berantakan / CSS tidak muncul | `APP_URL` di `.env` harus `https://cms.documentation.my.id`, lalu `docker compose up -d` |
| Error 500 | `docker compose logs app --tail=100` |
| Upload foto gagal (413) | tambahkan `client_max_body_size 12m;` di proxy (langkah 4) |
| `db:seed` menolak jalan | `ADMIN_PASSWORD` di `.env` masih kosong |
