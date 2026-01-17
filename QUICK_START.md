# Quick Start Guide: IFS App Restructure

## What's Been Done

✅ **Directory Structure Created**
- `apps/main-site/` - Public website
- `apps/portal/` - Member portal (subdomain)
- `packages/shared/` - Shared code between apps

✅ **Configuration Files Created**
- Workspace root `package.json` with scripts
- Individual `package.json` files for both apps
- Vite configs for both apps
- Environment templates
- Tailwind, PostCSS, ESLint configs copied

✅ **Shared Package Setup**
- All UI components, hooks, libs, utils, and API code moved to shared package
- Export index files created
- Domain redirect logic implemented

✅ **Entry Files Created**
- `index.html`, `main.jsx`, `App.jsx` for both apps
- Auto-redirect logic integrated

✅ **Documentation Created**
- RESTRUCTURE_PLAN.md - Overall architecture plan
- IMPLEMENTATION_GUIDE.md - Detailed step-by-step instructions
- QUICK_START.md - This file!

## Complete the Setup (3 Steps)

### Step 1: Copy Pages and Components

Run the automated PowerShell script:

```powershell
cd "c:\IFS App"
.\copy-pages.ps1
```

This will:
- Copy all 41 main site pages to `apps/main-site/src/pages/`
- Copy all 43 portal pages to `apps/portal/src/pages/`
- Copy marketing components to main site
- Copy portal components to portal
- Copy shared components (admin, utils) to both
- Copy your `.env` file to both apps

### Step 2: Update Environment Variables

Edit both `.env` files and add these lines:

**`apps/main-site/.env`:**
```env
VITE_PORTAL_URL=http://localhost:3001
VITE_MAIN_SITE_URL=http://localhost:3000
```

**`apps/portal/.env`:**
```env
VITE_PORTAL_URL=http://localhost:3001
VITE_MAIN_SITE_URL=http://localhost:3000
```

### Step 3: Create Routing Files

You need to create `src/pages/index.jsx` for both apps. These files will import the pages and set up React Router.

**The routing files need to be created manually because they require:**
1. Importing all page components
2. Setting up React Router routes
3. Wrapping with the Layout component

See `IMPLEMENTATION_GUIDE.md` for templates and examples.

Alternatively, I can help you generate these files if you want.

## Install and Run

```bash
# Install all dependencies (from root)
npm install

# Run both apps in parallel
npm run dev

# Or run individually:
npm run dev:main    # Main site on http://localhost:3000
npm run dev:portal  # Portal on http://localhost:3001
```

## How It Works

### Automatic Redirects

- If someone visits `localhost:3000/Dashboard`, they're automatically redirected to `localhost:3001/Dashboard`
- If someone visits `localhost:3001/About`, they're automatically redirected to `localhost:3000/About`

### Cross-Domain Links

Use the `buildLink()` helper from `@ifs/shared` to create links that automatically point to the correct domain:

```javascript
import { buildLink } from '@ifs/shared/utils/domainRedirect';

// In main site:
<a href={buildLink('/Dashboard', 'main')}>Go to Dashboard</a>
// → Points to portal domain

// In portal:
<a href={buildLink('/About', 'portal')}>About Us</a>
// → Points to main site domain
```

## Production Deployment

When deploying to production:

1. Update `.env` files in both apps:
```env
VITE_PORTAL_URL=https://portal.yourdomain.com
VITE_MAIN_SITE_URL=https://yourdomain.com
```

2. Build both apps:
```bash
npm run build
```

3. Deploy:
   - `apps/main-site/dist/` → yourdomain.com
   - `apps/portal/dist/` → portal.yourdomain.com

## Folder Structure

```
c:\IFS App/
├── apps/
│   ├── main-site/                    # Public website
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── marketing/        # Marketing components
│   │   │   │   ├── admin/            # Admin components
│   │   │   │   └── utils/            # Utility components
│   │   │   ├── pages/                # 41 public pages
│   │   │   │   ├── About.jsx
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── index.jsx         # ← YOU NEED TO CREATE THIS
│   │   │   ├── App.jsx
│   │   │   ├── App.css
│   │   │   └── main.jsx
│   │   ├── .env                      # Add domain URLs here
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── tailwind.config.js
│   │
│   └── portal/                        # Member portal
│       ├── src/
│       │   ├── components/
│       │   │   ├── portal/           # Portal components
│       │   │   ├── admin/            # Admin components
│       │   │   └── utils/            # Utility components
│       │   ├── pages/                # 43 portal pages
│       │   │   ├── Dashboard.jsx
│       │   │   ├── MyProfile.jsx
│       │   │   ├── Layout.jsx
│       │   │   └── index.jsx         # ← YOU NEED TO CREATE THIS
│       │   ├── App.jsx
│       │   ├── App.css
│       │   └── main.jsx
│       ├── .env                      # Add domain URLs here
│       ├── index.html
│       ├── package.json
│       ├── vite.config.js
│       └── tailwind.config.js
│
├── packages/
│   └── shared/                        # Shared code
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/               # shadcn/ui components
│       │   │   └── providers/        # Context providers
│       │   ├── hooks/                # Custom hooks
│       │   ├── lib/                  # Utilities (supabase, utils)
│       │   ├── utils/                # Utility functions
│       │   ├── api/                  # API client code
│       │   └── config/               # Page mappings
│       ├── index.css                 # Global styles
│       ├── App.css
│       └── package.json
│
├── copy-pages.ps1                    # Automation script
├── package.json                      # Root workspace config
├── QUICK_START.md                    # This file
├── IMPLEMENTATION_GUIDE.md           # Detailed guide
└── RESTRUCTURE_PLAN.md               # Architecture overview
```

## Need Help?

- See **IMPLEMENTATION_GUIDE.md** for detailed instructions
- See **RESTRUCTURE_PLAN.md** for architecture details
- Ask if you need help creating the routing files!

## What's Left?

The only remaining task is creating the routing files (`src/pages/index.jsx`) for both apps. These files import all the page components and set up React Router routes.

Would you like me to help generate these routing files?
