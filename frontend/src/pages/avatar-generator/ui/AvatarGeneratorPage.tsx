import { useTranslation } from 'react-i18next'
import { AvatarGeneratorForm } from '@/features/avatar-generator'

export const AvatarGeneratorPage = () => {
  const { t } = useTranslation()

  return (
    <div className='py-8'>
      <div className='max-w-2xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-foreground mb-4'>
            {t('pages.avatarGenerator.title')}
          </h1>
          <p className='text-muted-foreground'>
            {t('pages.avatarGenerator.subtitle')}
          </p>
        </div>

        <div className='bg-card border rounded-lg p-6 shadow-sm'>
          <AvatarGeneratorForm />
        </div>

        <div className='mt-8 text-center'>
          <p className='text-sm text-muted-foreground'>
            {t('pages.avatarGenerator.description')}
          </p>
        </div>
      </div>
    </div>
  )
}
