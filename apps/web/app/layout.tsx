import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AmaniTrust',
  description: 'Blockchain-backed digital identity and trust platform for Kenya.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
