import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui';

interface CounterIncrementProps {
  initialValue?: number;
  onIncrement?: (value: number) => void;
  className?: string;
}

export const CounterIncrement = ({
  initialValue = 0,
  onIncrement,
  className,
}: CounterIncrementProps) => {
  const { t } = useTranslation();
  const [count, setCount] = useState(initialValue);

  const handleIncrement = () => {
    const newValue = count + 1;
    setCount(newValue);
    onIncrement?.(newValue);
  };

  return (
    <div className={`p-6 border border-border rounded-lg bg-card ${className || ''}`}>
      <p className="text-lg font-medium text-card-foreground mb-4">
        {t('features.counter.count')}: <span className="text-blue-600">{count}</span>
      </p>
      <Button onClick={handleIncrement}>{t('features.counter.increment')}</Button>
    </div>
  );
};
