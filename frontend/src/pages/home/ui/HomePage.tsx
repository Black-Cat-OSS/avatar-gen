import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { useAvatars } from '@/shared/lib';
import { Button, Callout } from '@/shared/ui';
import { AvatarCard } from '@/widgets';
import type { Avatar } from '@/shared/api';

export const HomePage = () => {
  const { t } = useTranslation();
  const [offset, setOffset] = useState(0);
  const [allAvatars, setAllAvatars] = useState<Avatar[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, isError, error, refetch } = useAvatars({ pick: 10, offset });

  // Update accumulated avatars when new data arrives
  useEffect(() => {
    if (data) {
      setAllAvatars(prev => [...prev, ...data.avatars]);
      setHasMore(data.pagination.hasMore);
    }
  }, [data, offset]);

  const handleLoadMore = () => {
    setOffset(prevOffset => prevOffset + 10);
  };

  const handleRefresh = () => {
    setOffset(0);
    setAllAvatars([]);
    setHasMore(true);
    refetch();
  };

  const showLoadMore = allAvatars.length > 0 && hasMore && !isLoading;

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">{t('pages.home.title')}</h1>
          <p className="text-muted-foreground mb-6">{t('pages.home.subtitle')}</p>

          {/* Create Avatar Button */}
          <Link to="/avatar-generator">
            <Button variant="default" size="lg">
              {t('pages.home.generateAvatar')}
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          {isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('pages.home.loading')}</p>
            </div>
          )}

          {isError && (
            <Callout title={t('pages.home.error')} type='error' text={error}/>
          )}

          {!isLoading && allAvatars.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">{t('pages.home.noAvatars')}</p>
              <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
                {isLoading ? t('pages.home.refreshing') : t('pages.home.refresh')}
              </Button>
            </div>
          )}

          {allAvatars.length > 0 && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {t('pages.home.avatarsFound')}: {data?.pagination.total ?? allAvatars.length}
                </div>
                <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
                  {isLoading ? t('pages.home.refreshing') : t('pages.home.refresh')}
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allAvatars.map(avatar => (
                  <AvatarCard key={avatar.id} avatar={avatar} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {showLoadMore && (
          <div className="text-center mt-8">
            <Button onClick={handleLoadMore} variant="outline" disabled={isLoading} size="lg">
              {isLoading ? t('pages.home.loading') : t('pages.home.loadMore')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
