# EduPath 🎓

> **Your gateway to global opportunities** — A platform empowering Uzbek high school students to find extracurricular activities, internships, mentors, and AI-powered guidance for international university applications.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | shadcn/ui + Tailwind CSS + Radix UI |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| Email | Resend |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| File Uploads | react-dropzone → Supabase Storage |

## Features

- 🤝 **Volunteer Opportunities** — Browse and apply to verified volunteer programs
- 💼 **Internship Programs** — Connect with companies for high school internships
- 👨‍🏫 **Mentor Marketplace** — Book 1-on-1 sessions with university students/alumni
- 🤖 **AI College Advisor** — Streaming AI chat powered by Claude for application guidance
- 🎓 **Scholarship Database** — Curated scholarships for Uzbek students
- 📚 **Video Library** — Lessons on academics, visa, leadership, and more
- 🔔 **Notifications** — Real-time notifications for application updates and bookings
- 🌙 **Dark Mode** — Full theme support

## User Roles

| Role | Capabilities |
|------|-------------|
| `student` | Browse/apply to opportunities, book mentors, use AI assistant |
| `organizer` | Post volunteer opportunities, review applications |
| `company` | Post internship programs, review applications |
| `mentor` | Set availability, accept/decline booking requests |
| `admin` | Review & verify all listings, manage users |

## Getting Started

### Prerequisites

- Node.js 18+ (install via `brew install node`)
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key
- A [Resend](https://resend.com) account (for emails)

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-api03-...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@edupath.uz
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Run the migration in your Supabase SQL Editor:

```bash
# Copy the contents of supabase/migrations/001_initial.sql
# and run it in your Supabase project → SQL Editor
```

Or use the Supabase CLI:

```bash
npx supabase db push
```

### 4. Supabase Storage

Create a storage bucket named `resumes` with public access for resume uploads.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🚀

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Landing, about
│   ├── auth/               # Login, register, callback
│   ├── dashboard/          # Role-based dashboards
│   ├── volunteer/          # Browse + detail pages
│   ├── internships/        # Browse + detail pages
│   ├── mentors/            # Browse + detail + booking
│   ├── resources/          # Videos + scholarships
│   ├── ai-assistant/       # AI chat page
│   ├── admin/              # Admin panel
│   ├── profile/            # User profile editing
│   └── api/                # API routes (ai, applications, upload)
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── shared/             # Custom reusable components
│   │   ├── AIChat          # Streaming AI chat component
│   │   ├── OpportunityCard # Volunteer/internship cards
│   │   ├── MentorCard      # Mentor profile cards
│   │   ├── VideoCard       # Video lesson cards
│   │   ├── ResumeUploader  # Drag & drop PDF upload
│   │   ├── DeadlineCountdown
│   │   ├── ProfileCompletionBar
│   │   ├── ApplicationStatusBadge
│   │   └── VerifiedBadge
│   └── layout/             # Navbar, Footer
├── lib/
│   ├── supabase/           # Browser + server Supabase clients
│   ├── claude.ts           # Anthropic client + system prompt
│   ├── resend.ts           # Email notification helpers
│   └── utils.ts            # Utility functions
├── hooks/
│   └── use-toast.ts        # Toast notification hook
├── types/
│   └── index.ts            # TypeScript interfaces
└── middleware.ts            # Auth session refresh + route protection
```

## AI System Prompt

The EduPath AI advisor responds in Uzbek or English based on the student's language:

```
You are EduPath AI — a friendly and knowledgeable advisor for Uzbek high school students 
who want to study abroad or gain extracurricular experience. You help with resume feedback, 
motivation letter writing, university application guidance, skill development advice, and 
matching students to opportunities. Always be encouraging, specific, and practical.
```

## Business Logic

### Application Flow
1. Student applies to listing → organizer notified
2. Organizer reviews (changes status to `under_review`) → student notified by email
3. Organizer approves or rejects → student notified by email

### Verification Flow
1. Organizer/company registers → listings default to `pending` status
2. Admin reviews listing in `/admin` → approves (sets `active + verified`) or rejects
3. Verified listings get a blue checkmark badge

### Mentor Booking Flow
1. Mentor sets weekly availability in their profile
2. Student picks a date/time and submits booking request
3. Booking created with `pending` status → mentor notified
4. Mentor confirms (optionally adds meeting link) → student notified by email

## Deployment

### Vercel (Recommended)

```bash
# Push to GitHub, then deploy via Vercel dashboard
# Set all environment variables in Vercel project settings
```

### Build Locally

```bash
npm run build
npm start
```

## Contributing

Pull requests welcome! Please open an issue first to discuss major changes.

---

Built with ❤️ for Uzbek students worldwide.
