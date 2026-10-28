# Neethivaan

Monorepo with:

- `backend/`: FastAPI API server
- `frontend/`: Next.js (React) web app

## Features

- ⚡ **Next.js 15** - React framework for production
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🔥 **TypeScript** - Type-safe development
- 📦 **App Router** - Latest Next.js routing system
- 🌙 **Dark Mode** - Built-in dark mode support

## Getting Started

### Frontend: Install Dependencies

```bash
cd frontend
npm install
```

### Frontend: Start Development Server

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server (run inside `frontend/`)
- `npm run build` - Build for production (run inside `frontend/`)
- `npm run start` - Start production server (run inside `frontend/`)
- `npm run lint` - Run ESLint (run inside `frontend/`)

## Project Structure

```
backend/
  main.py
  requirements.txt
frontend/
  src/
    app/
      layout.tsx
      page.tsx
      globals.css
```

## Environment Variables

Create a `frontend/.env.local` file for frontend environment variables:

```env
NEXT_PUBLIC_API_URL=your_api_url_here
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [TypeScript Documentation](https://www.typescriptlang.org)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
