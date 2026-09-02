import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediKiosk — Patient Pre-Consultation Kiosk',
  description: 'AI-Powered Patient Case-Taking and Pre-Consultation Platform for Healthcare',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
