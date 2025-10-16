import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGenerateAvatar } from '@/shared/lib';
import { Button } from '@/shared/ui';
import { InputField } from '@/shared/ui';
import { AngleVisualizer } from '@/shared/ui/angle-visualizer';
import { avatarApi } from '@/shared/api';

// Predefined color palettes
const colorPalettes = {
  default: {
    primaryColor: '#3b82f6',
    foreignColor: '#ef4444',
    name: 'Default',
  },
  monochrome: {
    primaryColor: '#333333',
    foreignColor: '#666666',
    name: 'Monochrome',
  },
  vibrant: {
    primaryColor: '#FF6B35',
    foreignColor: '#F7931E',
    name: 'Vibrant',
  },
  pastel: {
    primaryColor: '#FFB3BA',
    foreignColor: '#FFDFBA',
    name: 'Pastel',
  },
  ocean: {
    primaryColor: '#0077BE',
    foreignColor: '#00A8CC',
    name: 'Ocean',
  },
  sunset: {
    primaryColor: '#FF8C42',
    foreignColor: '#FF6B35',
    name: 'Sunset',
  },
  forest: {
    primaryColor: '#2E8B57',
    foreignColor: '#32CD32',
    name: 'Forest',
  },
  royal: {
    primaryColor: '#6A0DAD',
    foreignColor: '#8A2BE2',
    name: 'Royal',
  },
};

// Generate random mnemonic seed phrase
const generateMnemonicSeed = (): string => {
  const adjectives = [
    'bright',
    'dark',
    'happy',
    'sad',
    'fast',
    'slow',
    'big',
    'small',
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    'orange',
    'pink',
    'brown',
    'cool',
    'warm',
    'hot',
    'cold',
    'soft',
    'hard',
    'smooth',
    'rough',
    'loud',
    'quiet',
    'high',
    'low',
    'deep',
    'shallow',
    'wide',
    'narrow',
  ];

  const nouns = [
    'cat',
    'dog',
    'bird',
    'fish',
    'tree',
    'flower',
    'star',
    'moon',
    'sun',
    'cloud',
    'mountain',
    'river',
    'ocean',
    'forest',
    'desert',
    'castle',
    'house',
    'car',
    'bike',
    'book',
    'music',
    'dance',
    'dream',
    'magic',
    'light',
    'shadow',
    'fire',
    'ice',
    'wind',
    'earth',
    'sky',
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;

  return `${adjective}-${noun}-${number}`.substring(0, 32);
};

// Generate random color palette
const generateRandomPalette = () => {
  const paletteKeys = Object.keys(colorPalettes).filter(key => key !== 'default');
  const randomKey = paletteKeys[Math.floor(Math.random() * paletteKeys.length)];
  return {
    key: randomKey,
    ...colorPalettes[randomKey as keyof typeof colorPalettes],
  };
};

export const AvatarGeneratorForm = () => {
  const { t } = useTranslation();
  const generateAvatar = useGenerateAvatar();

  const [formData, setFormData] = useState({
    primaryColor: '#3b82f6',
    foreignColor: '#ef4444',
    colorScheme: 'default',
    seed: '',
    type: 'pixelize',
    angle: 90,
  });

  // Generate initial seed on component mount
  useEffect(() => {
    if (!formData.seed) {
      setFormData(prev => ({
        ...prev,
        seed: generateMnemonicSeed(),
      }));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = {
      primaryColor: formData.primaryColor || undefined,
      foreignColor: formData.foreignColor || undefined,
      colorScheme: formData.colorScheme !== 'default' ? formData.colorScheme : undefined,
      seed: formData.seed || undefined,
      type: formData.type || 'pixelize',
      angle: formData.type === 'gradient' ? formData.angle : undefined,
    };

    generateAvatar.mutate(params);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePaletteChange = (paletteKey: string) => {
    if (paletteKey === 'default') {
      setFormData(prev => ({ ...prev, colorScheme: 'default' }));
    } else {
      const palette = colorPalettes[paletteKey as keyof typeof colorPalettes];
      setFormData(prev => ({
        ...prev,
        colorScheme: paletteKey,
        primaryColor: palette.primaryColor,
        foreignColor: palette.foreignColor,
      }));
    }
  };

  const handleRandomPalette = () => {
    const randomPalette = generateRandomPalette();
    setFormData(prev => ({
      ...prev,
      colorScheme: randomPalette.key,
      primaryColor: randomPalette.primaryColor,
      foreignColor: randomPalette.foreignColor,
    }));
  };

  const handleGenerateSeed = () => {
    setFormData(prev => ({
      ...prev,
      seed: generateMnemonicSeed(),
    }));
  };

  const isCustomPalette = formData.colorScheme === 'default';
  const currentPalette = colorPalettes[formData.colorScheme as keyof typeof colorPalettes];

  const colorSchemes = [
    { value: 'default', label: t('features.avatarGenerator.colorSchemes.default') },
    { value: 'monochrome', label: t('features.avatarGenerator.colorSchemes.monochrome') },
    { value: 'vibrant', label: t('features.avatarGenerator.colorSchemes.vibrant') },
    { value: 'pastel', label: t('features.avatarGenerator.colorSchemes.pastel') },
    { value: 'ocean', label: t('features.avatarGenerator.colorSchemes.ocean') },
    { value: 'sunset', label: t('features.avatarGenerator.colorSchemes.sunset') },
    { value: 'forest', label: t('features.avatarGenerator.colorSchemes.forest') },
    { value: 'royal', label: t('features.avatarGenerator.colorSchemes.royal') },
  ];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Color Palette Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-foreground">
              {t('features.avatarGenerator.colorScheme')}
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRandomPalette}
              className="text-xs"
            >
              {t('features.avatarGenerator.randomPalette')}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {colorSchemes.map(scheme => {
              const palette = colorPalettes[scheme.value as keyof typeof colorPalettes];
              const isSelected = formData.colorScheme === scheme.value;
              return (
                <button
                  key={scheme.value}
                  type="button"
                  onClick={() => handlePaletteChange(scheme.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'shadow-lg ring-2 ring-offset-2 ring-primary/20'
                      : 'border-border hover:border-primary/50 hover:shadow-md'
                  }`}
                  style={{
                    borderColor: isSelected ? palette.primaryColor : undefined,
                    backgroundColor: isSelected ? `${palette.primaryColor}15` : undefined,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: palette.primaryColor }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: palette.foreignColor }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">{scheme.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Palette Display */}
        {!isCustomPalette && (
          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">
                {t('features.avatarGenerator.currentPalette')}
              </h3>
              <span className="text-xs text-muted-foreground capitalize">
                {currentPalette?.name || formData.colorScheme}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full border-2 border-border shadow-sm flex-shrink-0"
                  style={{ backgroundColor: formData.primaryColor }}
                />
                <div className="text-sm min-w-0">
                  <p className="font-medium text-foreground">
                    {t('features.avatarGenerator.primaryColor')}
                  </p>
                  <p className="text-muted-foreground font-mono text-xs truncate">
                    {formData.primaryColor}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full border-2 border-border shadow-sm flex-shrink-0"
                  style={{ backgroundColor: formData.foreignColor }}
                />
                <div className="text-sm min-w-0">
                  <p className="font-medium text-foreground">
                    {t('features.avatarGenerator.foreignColor')}
                  </p>
                  <p className="text-muted-foreground font-mono text-xs truncate">
                    {formData.foreignColor}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Colors (only when default palette is selected) */}
        {isCustomPalette && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {t('features.avatarGenerator.primaryColor')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={e => handleInputChange('primaryColor', e.target.value)}
                  className="w-12 h-10 rounded border border-input bg-background cursor-pointer"
                />
                <InputField
                  type="text"
                  value={formData.primaryColor}
                  onChange={e => handleInputChange('primaryColor', e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                  label={t('features.avatarGenerator.primaryColor')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {t('features.avatarGenerator.foreignColor')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.foreignColor}
                  onChange={e => handleInputChange('foreignColor', e.target.value)}
                  className="w-12 h-10 rounded border border-input bg-background cursor-pointer"
                />
                <InputField
                  type="text"
                  value={formData.foreignColor}
                  onChange={e => handleInputChange('foreignColor', e.target.value)}
                  placeholder="#ef4444"
                  className="flex-1"
                  label={t('features.avatarGenerator.foreignColor')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Generator Type Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            {t('features.avatarGenerator.generatorType')}
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleInputChange('type', 'pixelize')}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.type === 'pixelize'
                  ? 'shadow-lg ring-2 ring-offset-2 ring-primary/20'
                  : 'border-border hover:border-primary/50 hover:shadow-md'
              }`}
              style={{
                borderColor: formData.type === 'pixelize' ? formData.primaryColor : undefined,
                backgroundColor: formData.type === 'pixelize' ? `${formData.primaryColor}15` : undefined,
              }}
            >
              <div className="text-center">
                <div className="text-sm font-medium text-foreground mb-1">
                  {t('features.avatarGenerator.generatorTypes.pixelize')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('features.avatarGenerator.generatorTypes.pixelizeDescription')}
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('type', 'wave')}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.type === 'wave'
                  ? 'shadow-lg ring-2 ring-offset-2 ring-primary/20'
                  : 'border-border hover:border-primary/50 hover:shadow-md'
              }`}
              style={{
                borderColor: formData.type === 'wave' ? formData.primaryColor : undefined,
                backgroundColor: formData.type === 'wave' ? `${formData.primaryColor}15` : undefined,
              }}
            >
              <div className="text-center">
                <div className="text-sm font-medium text-foreground mb-1">
                  {t('features.avatarGenerator.generatorTypes.wave')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('features.avatarGenerator.generatorTypes.waveDescription')}
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('type', 'gradient')}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.type === 'gradient'
                  ? 'shadow-lg ring-2 ring-offset-2 ring-primary/20'
                  : 'border-border hover:border-primary/50 hover:shadow-md'
              }`}
              style={{
                borderColor: formData.type === 'gradient' ? formData.primaryColor : undefined,
                backgroundColor: formData.type === 'gradient' ? `${formData.primaryColor}15` : undefined,
              }}
            >
              <div className="text-center">
                <div className="text-sm font-medium text-foreground mb-1">
                  {t('features.avatarGenerator.generatorTypes.gradient')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('features.avatarGenerator.generatorTypes.gradientDescription')}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Angle Control - only for gradient */}
        {formData.type === 'gradient' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              {t('features.avatarGenerator.angle')}
            </label>
            
            <div className="flex items-center gap-1">
              {/* Angle presets */}
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((presetAngle) => (
                    <button
                      key={presetAngle}
                      type="button"
                      onClick={() => handleInputChange('angle', presetAngle)}
                      className={`p-2 rounded border transition-all ${
                        formData.angle === presetAngle
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <AngleVisualizer
                        angle={presetAngle}
                        onChange={() => {}} // Readonly
                        size={70}
                        readonly={true}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {t('features.avatarGenerator.anglePresets')}
                </p>
              </div>
              
              {/* Interactive angle visualizer */}
              <div className="flex flex-col items-center w-full">
                <AngleVisualizer
                  angle={formData.angle}
                  onChange={(angle) => handleInputChange('angle', angle)}
                  size={230}
                />
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {t('features.avatarGenerator.dragToRotate')}
                </p>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {t('features.avatarGenerator.angleDescription')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Seed Generation - hidden for gradient */}
        {formData.type !== 'gradient' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-foreground">
              {t('features.avatarGenerator.seed')}
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateSeed}
              className="text-xs"
            >
              {t('features.avatarGenerator.generateSeed')}
            </Button>
          </div>
          <InputField
            type="text"
            value={formData.seed}
            onChange={e => handleInputChange('seed', e.target.value)}
            placeholder={t('features.avatarGenerator.seedPlaceholder')}
            maxLength={32}
            label=""
          />
          <p className="text-xs text-muted-foreground">
            {t('features.avatarGenerator.seedDescription')}
          </p>
        </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button type="submit" disabled={generateAvatar.isPending} className="px-8 py-2">
            {generateAvatar.isPending
              ? t('features.avatarGenerator.generating')
              : t('features.avatarGenerator.generate')}
          </Button>
        </div>

        {/* Success Message */}
        {generateAvatar.isSuccess && generateAvatar.data && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm mb-3">{t('features.avatarGenerator.success')}</p>
            <div className="text-center">
              <img
                src={avatarApi.getImageUrl(generateAvatar.data.id)}
                alt={generateAvatar.data.name}
                className="mx-auto rounded-full w-32 h-32 object-cover border-4 border-primary"
              />
              <p className="mt-2 text-sm text-muted-foreground">ID: {generateAvatar.data.id}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {generateAvatar.isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">
              {t('features.avatarGenerator.error')}: {generateAvatar.error?.message}
            </p>
          </div>
        )}
      </form>
    </div>
  );
};
