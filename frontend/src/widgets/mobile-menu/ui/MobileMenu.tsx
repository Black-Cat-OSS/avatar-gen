import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button, NavigationLink } from '@/shared/ui'
import { ThemeToggle } from '@/features'
import { useMobileMenu } from '@/shared/lib/contexts'

interface MobileMenuProps {
  showLogin?: boolean
}

export const MobileMenu = ({ showLogin = false }: MobileMenuProps) => {
  const { t } = useTranslation()
  const { isOpen, close: onClose } = useMobileMenu()

  // Add blur effect to content behind sidebar
  React.useEffect(() => {
    if (isOpen) {
      // Find the header and blur it specifically
      const headerElement = document.querySelector('header')
      if (headerElement) {
        headerElement.style.filter = 'blur(2px)'
        headerElement.style.transition = 'filter 0.3s ease'
      }

      // Find main content and blur it
      const mainContent = document.querySelector(
        'main, [role="main"], .main-content',
      ) as HTMLElement
      if (mainContent) {
        mainContent.style.filter = 'blur(2px)'
        mainContent.style.transition = 'filter 0.3s ease'
      }
    } else {
      // Remove blur from header
      const headerElement = document.querySelector('header')
      if (headerElement) {
        headerElement.style.filter = 'none'
      }

      // Remove blur from main content
      const mainContent = document.querySelector(
        'main, [role="main"], .main-content',
      ) as HTMLElement
      if (mainContent) {
        mainContent.style.filter = 'none'
      }
    }

    // Cleanup on unmount
    return () => {
      const headerElement = document.querySelector('header')
      if (headerElement) {
        headerElement.style.filter = 'none'
      }

      const mainContent = document.querySelector(
        'main, [role="main"], .main-content',
      ) as HTMLElement
      if (mainContent) {
        mainContent.style.filter = 'none'
      }
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 lg:hidden'
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
        />
      )}

      {/* Side Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out lg:hidden shadow-lg ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--background)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center p-4 border-b border-border'>
            <button
              onClick={onClose}
              className='p-2 rounded-md hover:bg-muted transition-colors mr-3'
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
            <h2 className='text-lg font-semibold text-foreground'>
              {t('mobileMenu.title')}
            </h2>
          </div>

          {/* Navigation Links */}
          <nav className='flex-1 p-4'>
            <div className='space-y-2'>
              <NavigationLink
                to='/'
                className='block px-4 py-3 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors'
                onClick={onClose}
              >
                {t('common.home')}
              </NavigationLink>
              <NavigationLink
                to='/about'
                className='block px-4 py-3 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors'
                onClick={onClose}
              >
                {t('common.about')}
              </NavigationLink>
              <NavigationLink
                to='/avatar-generator'
                className='block px-4 py-3 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors'
                onClick={onClose}
              >
                {t('pages.avatarGenerator.title')}
              </NavigationLink>
              <NavigationLink
                to='/avatar-viewer'
                className='block px-4 py-3 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors'
                onClick={onClose}
              >
                {t('pages.avatarViewer.title')}
              </NavigationLink>
            </div>
          </nav>

          {/* Footer with Theme Toggle and Login */}
          <div className='p-4 border-t border-border space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>
                {t('common.theme')}
              </span>
              <ThemeToggle />
            </div>
            {showLogin && (
              <NavigationLink to='/login' className='block'>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full'
                >
                  {t('common.login')}
                </Button>
              </NavigationLink>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
