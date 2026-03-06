import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { DM_Sans, Press_Start_2P } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
})

const pressStart2P = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-press-start',
})

export const metadata: Metadata = {
  title: 'Script Engine',
  description: 'AI-powered ad script writer',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${dmSans.variable} ${pressStart2P.variable} antialiased`}
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
