import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearch } from '@tanstack/react-router';
import { Button } from '@/shared/ui';
import { useAvatars } from '@/shared/lib';
import { avatarApi } from '@/shared/api';
import { Link } from '@tanstack/react-router';

// Available sizes from backend (2^4 to 2^9)
const AVAILABLE_SIZES = [
  { value: 16, label: '16px' },
  { value: 32, label: '32px' },
  { value: 64, label: '64px' },
  { value: 128, label: '128px' },
  { value: 256, label: '256px' },
  { value: 512, label: '512px' },
];

// Available filters from backend
const AVAILABLE_FILTERS = [
  { value: '', label: 'None' },
  { value: 'grayscale', label: 'Grayscale' },
  { value: 'sepia', label: 'Sepia' },
  { value: 'negative', label: 'Negative' },
];

export const AvatarViewerPage = () => {
  const { t } = useTranslation();
  const search = useSearch({ from: '/avatar-viewer' });
  const { data, isLoading, isError, error } = useAvatars({ pick: 100 });

  const [size, setSize] = useState(128);
  const [filter, setFilter] = useState('');

  // Find the specific avatar by ID
  const avatar = data?.avatars?.find(a => a.id === search.id);

  const selectedSizeLabel = AVAILABLE_SIZES.find(s => s.value === size)?.label || `${size}px`;
  const selectedFilterLabel = AVAILABLE_FILTERS.find(f => f.value === filter)?.label || 'None';

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('pages.avatarViewer.title')}
          </h1>
          <p className="text-muted-foreground">{t('pages.avatarViewer.subtitle')}</p>
        </div>

        {/* Back to Gallery Button */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline">{t('pages.avatarViewer.backToGallery')}</Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('pages.avatarViewer.loading')}</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-8">
            <p className="text-red-500">
              {t('pages.avatarViewer.error')}:{' '}
              {error instanceof Error ? error.message : t('pages.avatarViewer.unknownError')}
            </p>
          </div>
        )}

        {/* Avatar Not Found */}
        {data && !avatar && search.id && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{t('pages.avatarViewer.avatarNotFound')}</p>
            <Link to="/">
              <Button variant="outline">{t('pages.avatarViewer.backToGallery')}</Button>
            </Link>
          </div>
        )}

        {/* No Avatar Selected */}
        {!search.id && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{t('pages.avatarViewer.noAvatarSelected')}</p>
            <Link to="/">
              <Button variant="outline">{t('pages.avatarViewer.backToGallery')}</Button>
            </Link>
          </div>
        )}

        {/* Avatar Viewer */}
        {avatar && (
          <>
            {/* Controls */}
            <div className="mb-8 bg-card border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Size Control */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('pages.avatarViewer.size')}
                  </label>
                  <select
                    value={size}
                    onChange={e => setSize(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {AVAILABLE_SIZES.map(sizeOption => (
                      <option key={sizeOption.value} value={sizeOption.value}>
                        {sizeOption.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Control */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('pages.avatarViewer.imageFilter')}
                  </label>
                  <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {AVAILABLE_FILTERS.map(filterOption => (
                      <option key={filterOption.value} value={filterOption.value}>
                        {filterOption.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Current Settings Display */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>
                    <strong>{t('pages.avatarViewer.currentSize')}:</strong> {selectedSizeLabel}
                  </span>
                  <span>
                    <strong>{t('pages.avatarViewer.currentFilter')}:</strong> {selectedFilterLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Avatar Information */}
            <div className="mb-8 bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {t('pages.avatarViewer.avatarInfo')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-foreground">{t('pages.avatarViewer.avatarId')}:</strong>
                  <p className="text-muted-foreground font-mono break-all">{avatar.id}</p>
                </div>
                <div>
                  <strong className="text-foreground">{t('pages.avatarViewer.createdAt')}:</strong>
                  <p className="text-muted-foreground">
                    {new Date(avatar.createdAt).toLocaleString()}
                  </p>
                </div>
                {avatar.primaryColor && (
                  <div>
                    <strong className="text-foreground">
                      {t('pages.avatarViewer.primaryColor')}:
                    </strong>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-4 h-4 rounded border border-border"
                        style={{ backgroundColor: avatar.primaryColor }}
                      />
                      <span className="text-muted-foreground font-mono">{avatar.primaryColor}</span>
                    </div>
                  </div>
                )}
                {avatar.foreignColor && (
                  <div>
                    <strong className="text-foreground">
                      {t('pages.avatarViewer.foreignColor')}:
                    </strong>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-4 h-4 rounded border border-border"
                        style={{ backgroundColor: avatar.foreignColor }}
                      />
                      <span className="text-muted-foreground font-mono">{avatar.foreignColor}</span>
                    </div>
                  </div>
                )}
                {avatar.colorScheme && (
                  <div>
                    <strong className="text-foreground">
                      {t('pages.avatarViewer.colorScheme')}:
                    </strong>
                    <p className="text-muted-foreground capitalize">{avatar.colorScheme}</p>
                  </div>
                )}
                {avatar.seed && (
                  <div>
                    <strong className="text-foreground">{t('pages.avatarViewer.seed')}:</strong>
                    <p className="text-muted-foreground font-mono">{avatar.seed}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Avatar Display */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
                {t('pages.avatarViewer.avatarPreview')}
              </h2>

              <div className="flex flex-col items-center space-y-6">
                {/* Main Display */}
                <div className="relative">
                  <div
                    className="bg-muted rounded-lg overflow-hidden shadow-lg"
                    style={{
                      width: Math.min(size * 2, 512),
                      height: Math.min(size * 2, 512),
                      aspectRatio: '1',
                    }}
                  >
                    <img
                      src={avatarApi.getImageUrl(avatar.id, filter, size)}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>

                  {/* Size Label */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                      {selectedSizeLabel}
                    </span>
                  </div>
                </div>

                {/* All Sizes Grid */}
                <div className="w-full">
                  <h3 className="text-lg font-medium text-foreground mb-4 text-center">
                    {t('pages.avatarViewer.allSizes')}
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {AVAILABLE_SIZES.map(sizeOption => (
                      <div key={sizeOption.value} className="text-center">
                        <div
                          className="bg-muted rounded overflow-hidden mx-auto border-2 border-transparent hover:border-primary transition-colors cursor-pointer"
                          style={{
                            width: Math.min(sizeOption.value, 64),
                            height: Math.min(sizeOption.value, 64),
                            aspectRatio: '1',
                          }}
                          onClick={() => setSize(sizeOption.value)}
                        >
                          <img
                            src={avatarApi.getImageUrl(avatar.id, filter, sizeOption.value)}
                            alt={`${avatar.name} - ${sizeOption.label}`}
                            className="w-full h-full object-cover"
                            onError={e => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{sizeOption.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* All Filters Grid */}
                <div className="w-full">
                  <h3 className="text-lg font-medium text-foreground mb-4 text-center">
                    {t('pages.avatarViewer.allFilters')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {AVAILABLE_FILTERS.map(filterOption => (
                      <div key={filterOption.value} className="text-center">
                        <div
                          className="bg-muted rounded overflow-hidden mx-auto border-2 border-transparent hover:border-primary transition-colors cursor-pointer"
                          style={{
                            width: 64,
                            height: 64,
                            aspectRatio: '1',
                          }}
                          onClick={() => setFilter(filterOption.value)}
                        >
                          <img
                            src={avatarApi.getImageUrl(avatar.id, filterOption.value, 64)}
                            alt={`${avatar.name} - ${filterOption.label}`}
                            className="w-full h-full object-cover"
                            onError={e => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{filterOption.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
