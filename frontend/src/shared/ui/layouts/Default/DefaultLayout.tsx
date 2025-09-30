import type { ReactNode } from 'react'
import { Footer, HeaderDefault } from '@/widgets'

interface DefaultLayoutProps {
  children: ReactNode
  className?: string
}

export const DefaultLayout = ({
  children,
  className,
}: DefaultLayoutProps) => {
  return (
    <div className='min-h-screen flex flex-col'>
      <HeaderDefault />
      <main className='flex-1 mt-16 min-h-[calc(100vh-4rem-8rem)]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className={className}>{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
