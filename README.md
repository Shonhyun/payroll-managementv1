# Payroll Management System

A modern, secure payroll management system built with Next.js 15, React, TypeScript, and Supabase.

## Features

- 🔐 Secure user authentication powered by Supabase
- 🛡️ Protected dashboard with automatic session management
- 🔄 Auto-refresh session and persistent authentication
- 📱 Responsive design with modern UI
- 👥 Employee and payroll management
- 📊 Real-time reporting and analytics
- 🎨 Professional sidebar navigation with user profile

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`

3. Set up environment variables:
   
   Create a `.env.local` file in the root directory:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   \`\`\`
   
   You can find these values in your Supabase project settings under API.

4. Run the development server:
   \`\`\`bash
   pnpm dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication

This application uses **Supabase Authentication** for secure user management:
- ✅ User registration (email + password)
- ✅ User login with email/password
- ✅ Secure session management
- ✅ Automatic token refresh
- ✅ Protected routes with AuthGuard
- ✅ Persistent sessions across page reloads

### Creating Your First Account

1. Navigate to `/signup` page
2. Enter your full name, email, and password (minimum 6 characters)
3. After successful registration, you'll be automatically logged in
4. You'll be redirected to the dashboard

### Login

1. Navigate to `/login` page
2. Enter your email and password
3. Upon successful login, you'll be redirected to the dashboard

## Project Structure

\`\`\`
app/
├── api/
│   └── auth/              # Authentication endpoints
├── dashboard/             # Protected dashboard pages
├── login/                 # Login page
├── contexts/              # Auth context provider
└── layout.tsx             # Root layout

components/
├── auth-guard.tsx         # Authentication guard component
├── dashboard-sidebar.tsx  # Dashboard navigation
├── login-form.tsx         # Login form component
└── ui/                    # shadcn/ui components

hooks/
└── use-auth.ts            # Custom auth hook
\`\`\`

## Authentication Flow

1. User submits credentials on login/register page
2. Supabase validates credentials and creates/manages session
3. Session is stored securely in browser localStorage
4. AuthContext manages authentication state across the app
5. AuthGuard component protects dashboard routes
6. User is automatically redirected to login if session expires
7. Session automatically refreshes when needed

## API Endpoints

- `POST /api/auth/login` - Login user
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

## Customization

### Modifying Theme Colors

Edit `app/globals.css` to customize the color scheme. The system uses CSS custom properties with support for light and dark modes.

### Adding New Pages

1. Create a new route directory in `app/`
2. Add `page.tsx` file
3. Wrap with `AuthGuard` if authentication required

## Security Features

This application uses Supabase for production-ready security:
- ✅ Password hashing handled by Supabase
- ✅ Secure session tokens with automatic expiration
- ✅ HTTPS-only in production
- ✅ Built-in rate limiting via Supabase
- ✅ Input validation on client and server
- ✅ Protected API routes
- ✅ Automatic token refresh

### Additional Production Recommendations

- Configure Supabase Row Level Security (RLS) policies
- Enable email confirmation if required
- Set up password reset flow
- Add 2FA if needed
- Monitor authentication logs in Supabase dashboard

## Production Deployment

1. Set `NODE_ENV=production`
2. Build the application: `npm run build`
3. Deploy to Vercel or your hosting provider
4. Configure environment variables for production

## Support

For issues or questions, please open an issue in the repository.

## License

MIT
