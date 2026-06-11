import type { Metadata } from 'next';
import './globals.css';
import ClientShell from '@/app/components/ClientShell';

export const metadata: Metadata = {
  title: 'AuraPrep AI | Premium AI Interview Simulator',
  description: 'Practice interactive web development and engineering interviews with real-time Voice AI, resume-customized queries, simulated camera eye-tracking, and detailed analytics reports.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientShell>
          {children}
        </ClientShell>
      </body>
    </html>
  );
}
