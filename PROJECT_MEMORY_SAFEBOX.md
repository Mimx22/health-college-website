# Antigravity Persistent Memory & Knowledge Safe Box
**Project:** Medical Career College of Health Science and Technology, Jos (Website & Application Portal)
**Domain:** `https://medicalcareeracademy.ng`
**Created/Updated:** September 2026

---

## 1. Production Architecture Overview
- **Hosting / cPanel Provider:** HostAfrica (DirectAdmin/cPanel server: `da36.host-ww.net`)
- **Web Server:** Apache with CloudLinux Phusion Passenger for Node.js
- **Node.js Version:** v18 (`/home/medicalc/nodevenv/app/18/bin/node`)
- **Backend Directory:** `/home/medicalc/app`
- **Frontend / Web Root:** `/home/medicalc/domains/medicalcareeracademy.ng/public_html`
- **API Base URL:** `https://medicalcareeracademy.ng/api`
- **Database:** MongoDB Atlas Replica Set (Cluster `ac-nigzd1w`)

---

## 2. Server Routing & Apache Configuration
- The `.htaccess` file inside `public_html` routes requests to the Node application managed by Phusion Passenger:
  ```apache
  # DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
  PassengerEnabled On
  PassengerAppRoot /home/medicalc/app
  PassengerNodejs /home/medicalc/nodevenv/app/18/bin/node
  PassengerAppType node
  PassengerStartupFile api/index.js
  PassengerAppEnv development
  PassengerFriendlyErrorPages on
  # DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
  ```
- To restart the Node.js application, touch/upload a timestamp to:
  `/home/medicalc/app/tmp/restart.txt`

---

## 3. Database Credentials & Connection Details
- **MongoDB Atlas Cluster:**
  `ac-nigzd1w-shard-00-00.lv0fc0l.mongodb.net:27017,ac-nigzd1w-shard-00-01.lv0fc0l.mongodb.net:27017,ac-nigzd1w-shard-00-02.lv0fc0l.mongodb.net:27017/josmedicalcollege`
- **Username:** `glittercost_db_user`
- **Password (CRITICAL):** `%24miracle2255` (lowercase `m` — URL encoded for `$miracle2255`).
  *Note:* Using uppercase `M` triggers `bad auth : authentication failed`.
- **Replica Set:** `atlas-123aol-shard-0`
- **Port:** `27017` (allowed and opened on host firewall).
- **Direct connection string is used** (bypass SRV `mongodb+srv://` because cPanel DNS resolvers often fail on SRV records).

---

## 4. Admin Credentials & Access
- **Admin Portal URL:** `https://medicalcareeracademy.ng/admin-login.html`
- **Admin Dashboard URL:** `https://medicalcareeracademy.ng/admin-dashboard.html`
- **Active Admin Credentials:**
  - **Email:** `admin@medicalcareeracademy.ng`
  - **Password:** `admin123`
- **Authentication Method:** JWT Token (Header: `Authorization: Bearer <token>`). Stored in browser `localStorage` under both keys:
  - `jmc_token` (used across `script.js` for admin actions and secure document access)
  - `adminToken` (backup key)

---

## 5. Contact Form & Email System
- **Endpoint:** `POST https://medicalcareeracademy.ng/api/contact`
- **Storage:**
  1. **MongoDB Database:** Every contact message is saved to the `contacts` collection (`fullName`, `email`, `phone`, `subject`, `message`, `emailSent`, timestamp).
  2. **Webmail Inbox Dispatch:** Messages are sent to `admissions@medicalcareeracademy.ng`.
- **Webmail Login:**
  - **URL:** `https://medicalcareeracademy.ng/webmail`
  - **Email Account:** `admissions@medicalcareeracademy.ng`
  - **Password:** `$Miracle2255`
- **SMTP Settings:**
  - Host: `mail.medicalcareeracademy.ng`
  - Port: `465` (SSL)

---

## 6. FTP Automation & Deployment Tools
Automated deployment scripts in `scratch/`:
- `scratch/deploy_backend_ftp.js`: Connects to `da36.host-ww.net` (`medicalc`), syncs all files in `api/models`, `api/routes`, `api/controllers`, `api/utils`, `api/middleware`, `api/config`, `api/index.js`, `.env`, and triggers Passenger restart via `restart.txt`.
- `scratch/deploy_frontend.js`: Syncs `admin-login.html`, `admin-dashboard.html`, `script.js`, and `config.js` directly to `public_html`.
- `scratch/check_health.js`: Tests live endpoint `https://medicalcareeracademy.ng/api/health`.

---

## 7. Next Available Tasks
1. Add a **"Contact Messages" tab** to `admin-dashboard.html` to review all messages in the browser.
2. Verify / enhance document upload previews and student status modification flows.
