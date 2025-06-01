import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Food Express',
  description: 'Food app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
