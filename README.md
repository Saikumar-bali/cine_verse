# 🎬 CineVerse - Modern Movie & Series Streaming Platform

**Live Website:** [https://saikumar-bali.github.io/cine_verse](https://saikumar-bali.github.io/cine_verse)

A modern, responsive movie and series browsing website built with cutting-edge web technologies. Discover, search, and explore your favorite movies and TV series with a sleek user interface.

## ✨ Features

### 🎯 Core Functionality
- **Browse Movies & Series** - Extensive catalog with rich metadata
- **Advanced Search** - Find movies and series by title instantly
- **Genre Filtering** - Browse content by your favorite genres
- **Detailed Views** - Comprehensive information with cast, ratings, and synopsis
- **Video Streaming** - Integrated video player with multiple server options
- **Episode Management** - Full series support with season and episode navigation

### 🎨 User Experience
- **Responsive Design** - Perfect on desktop, tablet, and mobile devices
- **Modern UI/UX** - Clean, intuitive interface with smooth animations
- **Fast Loading** - Optimized performance with lazy loading
- **Dark/Light Themes** - Comfortable viewing in any environment
- **Smart Search** - Real-time search with instant results

### ⚡ Technical Features
- **TypeScript** - Type-safe code for reliability
- **React Router** - Seamless client-side navigation
- **Supabase Backend** - Real-time database with authentication
- **Vite Build System** - Lightning-fast development and builds
- **Component Architecture** - Modular, maintainable codebase

## 🚀 Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** CSS3 with custom animations
- **Backend:** Supabase (PostgreSQL + Real-time)
- **Routing:** React Router DOM v7
- **Build Tools:** Vite + TypeScript compiler
- **Deployment:** GitHub Pages with GitHub Actions

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Setup
```bash
# Clone the repository
git clone https://github.com/Saikumar-bali/cine_verse.git
cd cine_verse

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your Supabase credentials to .env

# Start development server
npm run dev
```

### Environment Variables
Create a `.env` file with your Supabase configuration:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🏗️ Build & Deployment

This project is configured to work on both **GitHub Pages** and **Render**.

### 🛠️ Production Build
```bash
npm run build
npm run preview
```

### 🌍 Deployment Options

#### 1. GitHub Pages (Automated)
- The project automatically deploys to GitHub Pages via GitHub Actions whenever you push to the `main` branch.
- The base path is automatically set to `/cine_verse/` in the workflow.
- **Live Website:** [https://saikumar-bali.github.io/cine_verse](https://saikumar-bali.github.io/cine_verse)

#### 2. Render (Recommended)
- **Automatic Setup:** Render will automatically detect the `render.yaml` file in this repository and configure everything for you.
- **Manual Setup (Static Site):**
  - **Build Command:** `npm run build`
  - **Publish Directory:** `dist`
  - **Redirects/Rewrites:** Add a rewrite rule (Source: `/*`, Destination: `/index.html`) to handle client-side routing.
  - **Environment Variables:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Render dashboard.
- **Base URL:** By default, it uses `/` (root), which is perfect for Render.

### 🤖 Automated Workflow
The project uses GitHub Actions for automatic deployment. The workflow:

1. **Triggers** on push to main branch
2. **Sets** `VITE_BASE_URL` to `/cine_verse/` for GitHub Pages
3. **Builds** the React application 
4. **Deploys** to GitHub Pages automatically


## 🔒 Security

- ✅ No hardcoded credentials in source code
- ✅ Environment variables for all sensitive data
- ✅ Proper `.gitignore` configuration
- ✅ GitHub Secrets for production deployment
- ✅ Supabase Row Level Security (RLS) enabled

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari iOS 14+
- Chrome Mobile Android 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🌟 Acknowledgments

- [Supabase](https://supabase.com) - Backend as a Service
- [Vite](https://vitejs.dev) - Build tool
- [React](https://reactjs.org) - UI Framework
- [TypeScript](https://typescriptlang.org) - Type Safety

---

**Built with ❤️ by [Saikumar Bali](https://github.com/Saikumar-bali)**

*Enjoy streaming your favorite content on CineVerse!* 🍿
