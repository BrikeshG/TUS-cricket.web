# TuS Cricket Pfarrkirchen - Official Website

A modern, full-stack web application for the Cricket Department of **TuS 1860 Pfarrkirchen e.V.**, featuring a responsive public website and a secure admin dashboard.

🌐 **Live Site**: [tus-cricket-pfarrkirchen.de](https://tus-cricket-pfarrkirchen.de)

---

## 🚀 Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, Vite 7 |
| **Routing** | React Router v7 |
| **Backend** | Supabase (PostgreSQL + Auth) |
| **Serverless** | Netlify Functions |
| **Styling** | CSS3 with CSS Variables (Design System) |
| **SEO** | React Helmet Async |
| **Icons** | Lucide React |
| **Deployment** | Netlify (Git-based CI/CD) |

---

## ✨ Key Features

### Public Website
- **Responsive Design** — Mobile-first with hamburger navigation
- **Hero Section** — Animated CTA with glassmorphism effects
- **Squad Page** — Team photo carousel + player rankings table
- **Join Form** — Netlify Forms integration with email notifications
- **SEO Optimized** — Meta tags, sitemap.xml, robots.txt, structured data

### Admin Dashboard
- **Secure Authentication** — Supabase Auth with protected routes
- **Player Management** — CRUD operations for squad members
- **Statistics Sync** — Manual data import from CricClubs with token auth
- **Role-based Access** — Admin-only functionality

### Legal Compliance (German GDPR)
- Impressum (Imprint)
- Privacy Policy (Datenschutzerklärung)
- Consent checkboxes on forms

---

## 📁 Project Structure

```
├── src/
│   ├── components/     # Reusable UI (Navbar, Footer, Hero, JoinForm)
│   ├── pages/          # Page components (Home, Squad, Join, Contact)
│   │   └── admin/      # Protected admin pages (Dashboard, Login)
│   ├── lib/            # Utilities (Supabase client, auth helpers)
│   └── index.css       # Global design system (CSS Variables)
├── netlify/
│   └── functions/      # Serverless API endpoints
├── public/             # Static assets (logo, sitemap, robots.txt)
└── netlify.toml        # Deployment & redirect configuration
```

---

## 🛠 Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/BrikeshG/TUS-cricket.web.git

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables
See `.env.example` for required configuration:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key
- `VITE_SYNC_TOKEN` — Token for stats sync authentication

---

## 🚢 Deployment

Every push to `main` triggers automatic build and deployment via Netlify.

```bash
npm run build    # Production build
npm run preview  # Preview production build locally
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Brikesh Gelal**  
Full-Stack Developer | Bavaria, Germany

---

*Built with ❤️ for the cricket community in Pfarrkirchen*
