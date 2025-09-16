# Aroundtheway — 🚀 Full‑Stack .NET + Next.js + MySQL + Tailwind

- **.NET 8**
- **Next.js (App Router)**
- **MySQL (Docker)**
- **TailwindCSS**
- **Next.js**---

## 📦 Requirements

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Docker](https://docs.docker.com/get-docker/)
- [Node.js + npm](https://nodejs.org/)

## 🚀 First‑Time Setup

```bash
# Database (Docker)
docker run --name mysql -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:8.0

# Backend (.NET)
cd apps/api
dotnet tool install --global dotnet-ef
dotnet restore
dotnet ef database update
npm install -g @tailwindcss/cli
npm install

# Frontend (Next.js)
cd apps/web
npm install
```

## ▶️ Run (Dev)

```bash
# Terminal 1.1 — API
cd apps/api
dotnet watch

# Terminal 1.2 — Tailwind watcher (Optional)
cd apps/api
npm run css:watch

# Terminal 2 — Web
cd apps/web
npm run dev
```
