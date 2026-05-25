import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'EduPath — Your Gateway to Global Opportunities',
    template: '%s | EduPath',
  },
  description:
    'EduPath connects Uzbek high school students with volunteer opportunities, internships, mentors, and AI-powered guidance for international university applications.',
  keywords: [
    'uzbekistan',
    'students',
    'university',
    'internship',
    'volunteer',
    'study abroad',
    'mentor',
    'scholarship',
  ],
  authors: [{ name: 'EduPath Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'EduPath',
    title: 'EduPath — Your Gateway to Global Opportunities',
    description:
      'Empowering Uzbek students to achieve their international education goals.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
