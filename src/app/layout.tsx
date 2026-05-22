import './globals.css'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme/theme-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Akari',
  description: 'Multi-provider AI chat with persona switching and local-first storage.',
}

// Runs before hydration so the first paint already matches the user's saved
// theme — no flash of the wrong colour scheme.
//
// NOTE: React 19 emits a dev-only console warning ("Encountered a script tag
// while rendering React component") for any inline <script> in the component
// tree. It is a known false positive — the script *does* execute during SSR,
// which is exactly when we need it. The same warning affects next-themes,
// shadcn/ui, and heroui. It does not appear in production builds.
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('akari-theme');
    var theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    var resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.style.colorScheme = resolved;
  } catch (_) {}
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, app-controlled theme bootstrap script — must run before hydration */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
