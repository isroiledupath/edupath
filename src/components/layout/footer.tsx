import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const footerLinks = {
  Platform: [
    { href: '/volunteer', label: 'Volunteer Opportunities' },
    { href: '/internships', label: 'Internships' },
    { href: '/mentors', label: 'Find a Mentor' },
    { href: '/resources', label: 'Learning Resources' },
    { href: '/ai-assistant', label: 'AI Assistant' },
  ],
  Company: [
    { href: '/about', label: 'About EduPath' },
    { href: '/auth/register?role=organizer', label: 'Post Opportunities' },
    { href: '/auth/register?role=company', label: 'Post Internships' },
    { href: '/auth/register?role=mentor', label: 'Become a Mentor' },
  ],
  Resources: [
    { href: '/resources?category=university_guide', label: 'University Guide' },
    { href: '/resources?category=visa', label: 'Visa Information' },
    { href: '/resources?category=academics', label: 'Academic Tips' },
    { href: '/resources?category=skills', label: 'Skill Development' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container-page py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <span className="text-2xl">🎓</span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EduPath
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering Uzbek students to achieve their international education goals through opportunities, mentorship, and AI guidance.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Powered by Claude AI</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-3">
              <h4 className="font-semibold text-sm">{title}</h4>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} EduPath. Built for Uzbek students worldwide.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
