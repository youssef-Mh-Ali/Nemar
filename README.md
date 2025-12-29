# Faisal Bin Saedan PWA

A premium real estate PWA for Faisal Bin Saedan Group, built with Next.js 14.

## Features

- 📱 Mobile-first responsive design with bottom navigation
- 🏠 Home page with hero video and latest projects
- 🔍 Search units with filters (project, phase, price, bedrooms, area)
- 🏢 Unit details with gallery and Register Interest form
- 🔐 Owner login with JWT authentication
- 👥 My Community - owned units and case management
- 📞 Contact page with inquiry form
- 📲 PWA support with install prompt and offline page

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS with CSS Variables
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **PWA**: @ducanh2912/next-pwa
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Set these in your Netlify dashboard under **Site settings > Environment variables**:

| Variable | Description |
|----------|-------------|
| `SALESFORCE_CLIENT_ID` | Connected App Consumer Key |
| `SALESFORCE_CLIENT_SECRET` | Connected App Consumer Secret |
| `SALESFORCE_TOKEN_URL` | OAuth token endpoint |
| `SALESFORCE_INSTANCE_URL` | Salesforce instance URL |
| `JWT_SECRET` | Secret key for JWT tokens |

## Deployment on Netlify

1. Connect this repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add the Next.js plugin: `@netlify/plugin-nextjs`
5. Configure environment variables in Netlify dashboard

## Demo Credentials

For testing the owner portal:
- **Username**: `demo`
- **Password**: `demo123`

## Project Structure

```
app/
  (main)/           # Main layout with bottom nav
    page.tsx        # Home
    search/         # Search Units
    unit/[id]/      # Unit Details
    community/      # My Community (auth)
    contact/        # Contact page
  login/            # Login page
  api/              # API routes
components/
  ui/               # Base UI components
  layout/           # Header, BottomNav, InstallBanner
  home/             # Hero, ProjectsGrid
  search/           # Filters, UnitCard
  community/        # CaseForm, CaseList
lib/
  mock-data/        # Mock Salesforce data
  salesforce/       # Salesforce API client
  api-client/       # Frontend API wrapper
  store/            # Zustand stores
  auth/             # JWT utilities
  types/            # TypeScript types
```

## Salesforce Integration

The app includes a Salesforce client (`lib/salesforce/`) ready for integration:

- Uses OAuth 2.0 Client Credentials flow
- Token caching for performance
- SOQL query helper
- CRUD operations for Salesforce objects

### Expected Salesforce Objects

- `Project__c` - Real estate projects
- `Phase__c` - Project phases
- `Unit__c` - Individual units
- `Lead` - Register Interest captures
- `Contact` - Owner accounts
- `Case` - Support requests

## License

© 2024 Faisal Bin Saedan Group. All rights reserved.
