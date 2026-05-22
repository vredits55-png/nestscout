# <p align="center"><img src="public/logo.png" alt="NestScout Logo" width="80" height="80"><br>🟢 NESTSCOUT TERMINAL</p>

<p align="center">
  <strong>Premium Real Estate Clearance & Verified Tenant-Landlord Connection Portal</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.1-10b981?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-059669?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Supabase-Auth_%26_DB-047857?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Framer_Motion-Interactive-10b981?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion">
</p>

---

## 📡 SYSTEM DIAGNOSTICS & STATUS
```json
{
  "system": "NestScout Terminal Core",
  "status": "OPERATIONAL",
  "security_level": "MAXIMUM",
  "database_sync": "SYNCED (Supabase RLS)",
  "encryption": "ACTIVE (PKCE Flow & OTP)",
  "mail_channel": "VERIFIED (Plunk SMTP)"
}
```

NestScout is a state-of-the-art digital matrix connecting verified landlords (**Landlord Nodes**) with prospective tenants (**Tenant Nodes**). Built with absolute focus on visual excellence, performance, and hardened authentication.

---

## 🛡️ KEY PROTOCOLS & FEATURES

### 🗝️ Cryptographic Authentication
- **Dual Auth Modes**: Toggle seamlessly between dynamic **Encryption Keys (Passwords)** and secure **One-Time Passwords (OTPs)**.
- **Secure Email Verification**: Dynamic client-to-server PKCE redirection code flows that auto-log the user in immediately upon confirming their channel.
- **Provider Account Link Hijack Protection**: Active validation intercepting linked provider changes to isolate and prevent session merger hijack attempts.

### 🟢 Aesthetic Real Estate Nodes
- **Premium Emerald Theme**: Sleek dark/light backgrounds built using responsive glassmorphism interfaces, smooth gradients, and micro-animations.
- **Interactive Geospatial Scanning**: Fully custom map layers powered by Leaflet to locate and interact with property nodes.
- **Curated Connections**: Real-time server-synced chat/conversations between tenant clearance nodes and property managers.

---

## 🛠️ DEPLOYMENT & INITIALIZATION

### 1. Replicate Local Repository
```bash
git clone https://github.com/vredits55-png/nestscout.git
cd nestscout
```

### 2. Inject Security Credentials
Duplicate the template structure and fill in your Supabase project endpoints:
```bash
cp .env.example .env.local
```
Configure:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Initialize Dev Server
```bash
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser terminal to boot the system interface.

---

## 🔒 SECURITY STANDARD & COMPLIANCE

* **Zero Environment Commit**: Credentials and local parameters are kept completely isolated.
* **Middleware Route Protection**: Complete global Next.js middleware guards to block unauthenticated access to secured sub-panels.
* **RLS PostgreSQL Policies**: Underlining DB rows are query-locked using user matching checks.

<p align="center">
  <sub>NestScout Terminal Core © 2026. All rights reserved.</sub>
</p>
