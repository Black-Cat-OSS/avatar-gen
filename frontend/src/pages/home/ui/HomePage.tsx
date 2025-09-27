import { CounterIncrement } from '@/features/counter-increment'
import { Button } from '@/shared/ui'

export const HomePage = () => {
  return (
    <div className='py-8'>
      <div className='max-w-md mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-foreground mb-4'>
            Web2Bizz
          </h1>
          <p className='text-muted-foreground'>
            Modern web application built with FSD
            architecture
          </p>
        </div>

        <div className='space-y-6 mb-8'>
          <CounterIncrement />
        </div>

        <div className='grid grid-cols-2 gap-4 mb-8'>
          <Button variant='secondary'>Secondary</Button>
          <Button variant='outline'>Outline</Button>
          <Button variant='ghost'>Ghost</Button>
          <Button variant='link'>Link</Button>
        </div>

        <div className='flex justify-center gap-4'>
          <Button size='sm'>Small</Button>
          <Button size='default'>Default</Button>
          <Button size='lg'>Large</Button>
        </div>

        <div className='text-center mt-8'>
          <p className='text-muted-foreground'>
            FSD architecture is working! 🎉
          </p>
        </div>
      </div>
    </div>
  )
}
