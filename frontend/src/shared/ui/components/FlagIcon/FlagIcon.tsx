import { cn } from '../../../lib/utils/utils';
import {
  GB,
  RU,
  ES,
  US,
  FR,
  DE,
  IT,
  PT,
  NL,
  PL,
  CN,
  JP,
  KR,
  BR,
  CA,
  AU,
  IN,
  EE,
  type FlagComponent,
} from 'country-flag-icons/react/3x2';

export interface FlagIconProps {
  countryCode: string;
  size?: 'sm' | 'md' | 'lg';
  overrideSize?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs w-4 h-3',
  md: 'text-sm w-5 h-4',
  lg: 'text-base w-6 h-4',
};

// Country code to component mapping
const flagComponents: Record<string, FlagComponent> = {
  gb: GB,
  ru: RU,
  es: ES,
  us: US,
  fr: FR,
  de: DE,
  it: IT,
  pt: PT,
  nl: NL,
  pl: PL,
  cn: CN,
  jp: JP,
  kr: KR,
  br: BR,
  ca: CA,
  au: AU,
  in: IN,
  ee: EE,
};

export const FlagIcon = ({ countryCode, size = 'md', overrideSize, className }: FlagIconProps) => {
  const FlagComponent = flagComponents[countryCode.toLowerCase()];

  const sizeClass = overrideSize || sizeClasses[size];

  if (!FlagComponent) {
    return (
      <div
        className={cn(
          'bg-gray-300 rounded flex items-center justify-center text-gray-600 text-xs font-bold',
          sizeClass,
          className,
        )}
      >
        {countryCode.toUpperCase()}
      </div>
    );
  }

  return <FlagComponent className={cn(sizeClass, className)} />;
};
