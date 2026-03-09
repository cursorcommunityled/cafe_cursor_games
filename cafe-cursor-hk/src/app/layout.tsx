import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cafe Cursor HK',
  description: 'Cozy coworking. New friends. Great coffee. A social experience at Cafe Cursor Hong Kong.',
  icons: {
    icon: 'https://qfryyzuuqpqwxfnmwsek.supabase.co/storage/v1/object/public/assets/APP_ICON_25D_DARK.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
