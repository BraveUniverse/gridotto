import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Header } from '@/components/layout/Header'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Gridotto | Next-Gen Lottery Platform on LUKSO',
  description: 'Experience the future of decentralized lotteries with multi-asset support, social features, and fair prize distribution on LUKSO blockchain.',
  keywords: 'lottery, blockchain, LUKSO, NFT, token, decentralized, Web3',
  authors: [{ name: 'Gridotto Team' }],
  metadataBase: new URL('https://gridotto.com'),
  openGraph: {
    title: 'Gridotto | Next-Gen Lottery Platform',
    description: 'The most advanced lottery platform on LUKSO blockchain',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gridotto Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gridotto | Next-Gen Lottery Platform',
    description: 'Experience the future of decentralized lotteries',
    images: ['/twitter-image.png']
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FF2975'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-16">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
