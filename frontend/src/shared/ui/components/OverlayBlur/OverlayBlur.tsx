import React from 'react';
import { createPortal } from 'react-dom';

export interface OverlayBlurProps {
  isVisible: boolean;
  onClick?: () => void;
  blurIntensity?: 'sm' | 'md' | 'lg' | 'xl';
  backgroundOpacity?: '10' | '20' | '30' | '40' | '50' | '60' | '70' | '80' | '90';
  className?: string;
  children?: React.ReactNode;
}

export const OverlayBlur = ({
  isVisible,
  onClick,
  blurIntensity = 'md',
  backgroundOpacity = '50',
  className,
  children,
}: OverlayBlurProps) => {
  if (!isVisible) return null;

  const backdropBlurClass = `backdrop-blur-${blurIntensity}`;
  const backgroundOpacityClass = `bg-black/${backgroundOpacity}`;

  // Use the specific overlay element from HTML, fallback to document.body
  const overlayElement = document.getElementById('overlay') || document.body;

  return createPortal(
    <div
      className={`fixed inset-0 ${backgroundOpacityClass} ${backdropBlurClass} z-50 ${className || ''}`}
      onClick={onClick}
      aria-hidden="true"
    >
      {children}
    </div>,
    overlayElement,
  );
};
