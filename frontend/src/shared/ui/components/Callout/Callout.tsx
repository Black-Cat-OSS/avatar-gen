import type { ReactNode } from 'react';
import styles from './Callout.module.scss';

export type CalloutType = 'info' | 'warning' | 'error' | 'tips' | 'success' | 'quote' | 'default';

export interface CalloutProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  type?: CalloutType;
}

export const Callout = ({
  title,
  subtitle,
  children,
  className = '',
  variant = 'default',
  type = 'default',
}: CalloutProps) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'compact':
        return styles.compact;
      case 'detailed':
        return styles.detailed;
      default:
        return styles.default;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'info':
        return styles.calloutInfo;
      case 'warning':
        return styles.calloutWarning;
      case 'error':
        return styles.calloutError;
      case 'tips':
        return styles.calloutTips;
      case 'success':
        return styles.calloutSuccess;
      case 'quote':
        return styles.calloutQuote;
      default:
        return styles.calloutDefault;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'info':
        return (
          <div className={`${styles.calloutIcon} flex-shrink-0 w-5 h-5`}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className={`${styles.calloutIcon} flex-shrink-0 w-5 h-5`}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.725-1.36 3.49 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className={`${styles.calloutIcon} flex-shrink-0 w-5 h-5`}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case 'tips':
        return (
          <div className={`${styles.calloutIcon} flex-shrink-0 w-5 h-5`}>
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zM9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z" />
              <path d="M12 6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className={`${styles.calloutIcon} flex-shrink-0 w-5 h-5`}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case 'quote':
        return (
          <div className={`${styles.calloutIcon} flex-shrink-0 w-5 h-5`}>
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.callout} ${getTypeClass()} ${className}`}>
      <div className={styles.calloutHeader}>
        {getIcon()}
        <h2 className={styles.calloutTitle}>{title}</h2>
      </div>
      {subtitle && <p className={styles.calloutSubtitle}>{subtitle}</p>}
      {children && (
        <div className={`${styles.calloutContent} ${getVariantClass()}`}>{children}</div>
      )}
    </div>
  );
};
