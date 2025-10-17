import React from 'react';
import { useTranslation } from 'react-i18next';
import { AngleVisualizer } from '@/shared/ui';

interface AnglePresetsProps {
  /**
   * Current selected angle
   */
  currentAngle: number;
  /**
   * Callback when preset angle is selected
   */
  onAngleSelect: (angle: number) => void;
  /**
   * Size of each preset visualizer
   */
  size?: number;
}

/**
 * Component for displaying angle presets
 * 
 * Shows a grid of predefined angle values with visual indicators.
 * Users can click on any preset to quickly select that angle.
 */
export const AnglePresets: React.FC<AnglePresetsProps> = ({
  currentAngle,
  onAngleSelect,
  size = 70,
}) => {
  const { t } = useTranslation();

  const presetAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        {presetAngles.map((presetAngle) => (
          <button
            key={presetAngle}
            type="button"
            onClick={() => onAngleSelect(presetAngle)}
            className={`p-2 rounded border transition-all ${
              currentAngle === presetAngle
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <AngleVisualizer
              angle={presetAngle}
              onChange={() => {}} // Readonly
              size={size}
              readonly={true}
            />
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {t('features.avatarGenerator.anglePresets')}
      </p>
    </div>
  );
};
