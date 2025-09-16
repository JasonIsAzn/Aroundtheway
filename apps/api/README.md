# 🚀 Full Stack .NET + MySQL + Tailwind Boilerplate

- **.NET 8**
- **MySQL (Docker)**
- **TailwindCSS**

## 📦 Requirements

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Docker](https://docs.docker.com/get-docker/)
- [Node.js + npm](https://nodejs.org/)

## 🚀 First-Time Setup

```bash
dotnet tool install --global dotnet-ef
npm install -g @tailwindcss/cli
docker run --name mysql -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:8.0
cd ./DotnetBoilerplate
dotnet restore
npm install
```

## 🛠️ Database

```bash
dotnet ef database update
```

## ▶️ Run

```bash
dotnet watch
npm run css:watch
```
