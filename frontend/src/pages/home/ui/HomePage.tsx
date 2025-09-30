import { useTranslation } from 'react-i18next'
import { avatarApi } from '@/shared/api'
import { useAvatars } from '@/shared/lib'
import { Button } from '@/shared/ui'

export const HomePage = () => {
  const { t } = useTranslation()
  const { data, isLoading, isError, error, refetch } = useAvatars({ pick: 10 })

  return (
    <div className='py-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-foreground mb-4'>
            {t('pages.home.title')}
          </h1>
          <p className='text-muted-foreground'>
            {t('pages.home.subtitle')}
          </p>
        </div>

        <div className='mb-8'>
          {isLoading && (
            <div className='text-center py-8'>
              <p className='text-muted-foreground'>{t('pages.home.loading')}</p>
            </div>
          )}

          {isError && (
            <div className='text-center py-8'>
              <p className='text-red-500'>
                {t('pages.home.error')}: {error instanceof Error ? error.message : t('pages.home.unknownError')}
              </p>
            </div>
          )}

          {data && data.avatars.length === 0 && (
            <div className='text-center py-8'>
              <p className='text-muted-foreground'>{t('pages.home.noAvatars')}</p>
            </div>
          )}

          {data && data.avatars.length > 0 && (
            <div>
              <div className='mb-4 text-sm text-muted-foreground'>
                {t('pages.home.avatarsFound')}: {data.pagination.total}
              </div>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {data.avatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    className='border rounded-lg p-4 bg-card hover:shadow-lg transition-shadow'
                  >
                    <div className='aspect-square bg-muted rounded-md mb-3 overflow-hidden'>
                      <img
                        src={avatarApi.getImageUrl(avatar.id)}
                        alt={avatar.name}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                    <div className='space-y-1'>
                      <p className='text-xs font-medium truncate' title={avatar.id}>
                        {t('pages.home.avatarId')}: {avatar.id.slice(0, 8)}...
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {new Date(avatar.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='flex justify-center gap-4'>
          <Button 
            onClick={() => refetch()}
            variant='outline'
            disabled={isLoading}
          >
            {isLoading ? t('pages.home.refreshing') : t('pages.home.refresh')}
          </Button>
        </div>
      </div>
    </div>
  )
}
