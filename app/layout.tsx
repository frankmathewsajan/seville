import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// 1. Configure the open-source fonts
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

const jbMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-jb-mono',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        suppressHydrationWarning 
        // 2. Inject the variables and set Inter as the default
        className={`${inter.variable} ${jbMono.variable} font-sans antialiased bg-[#0d0a0b]`}
      >
        {children}
      </body>
    </html>
  );
}