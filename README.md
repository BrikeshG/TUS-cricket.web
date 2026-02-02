# TuS Cricket Pfarrkirchen - Official Website

This is the official web application for the Cricket Department of **TuS 1860 Pfarrkirchen e.V.**, built with React, Vite, and modern CSS.

## 🚀 Technology Stack
- **Frontend**: React 19 (Vite)
- **Routing**: React Router v7
- **SEO**: React Helmet Async
- **Icons**: Lucide React
- **Deployment**: Netlify (Git-based CI/CD)

## 📁 Project Structure
- `src/components/`: Reusable UI components (Navbar, Footer, Hero, etc.)
- `src/pages/`: Page-level components (Home, Team, Join, etc.)
- `src/index.css`: Global design system with CSS Variables (Colors, Spacing, Transitions)
- `public/`: Static assets (Logo, Sitemap, Robots.txt)
- `netlify.toml`: Continuous deployment and redirect configuration

## ⚖️ Legal Compliance
The site includes mandatory German legal pages:
- **Impressum** (Imprint)
- **Privacy Policy** (Datenschutzerklärung)
- Mandatory privacy consent fields on all forms.

## 📈 SEO & Performance
- Page-specific Canonical tags and Meta titles.
- Automated Sitemap and Robots.txt generation.
- Optimized for mobile and desktop viewports.

## 🛠 Development
```bash
npm install
npm run dev
```

## 🚢 Deployment
Every push to the `main` branch on GitHub automatically builds and deploys to the live site via Netlify.
