import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { avatarApi } from '@/shared/api';

interface AvatarCardProps {
  avatar: {
    id: string;
    name: string;
    createdAt: string;
    version: string;
    primaryColor?: string;
    foreignColor?: string;
    colorScheme?: string;
    seed?: string;
  };
  showDetails?: boolean;
  imageSize?: number;
  imageFilter?: string;
  className?: string;
}

export const AvatarCard = ({
  avatar,
  showDetails = true,
  imageSize,
  imageFilter,
  className = '',
}: AvatarCardProps) => {
  const { t } = useTranslation();

  return (
    <div className={`border rounded-lg p-4 bg-card hover:shadow-lg transition-shadow ${className}`}>
      <div className="aspect-square bg-muted rounded-md mb-3 overflow-hidden">
        <img
          src={avatarApi.getImageUrl(avatar.id, imageFilter, imageSize)}
          alt={avatar.name}
          className="w-full h-full object-cover"
          onError={e => {
            const target = e.target as HTMLImageElement;
            target.src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>

      {showDetails && (
        <div className="space-y-1">
          <Link
            to="/avatar-viewer"
            search={{ id: avatar.id }}
            className="text-xs font-medium truncate text-primary hover:text-primary/80 transition-colors block"
            title={avatar.id}
          >
            {t('pages.home.avatarId')}: {avatar.id.slice(0, 8)}...
          </Link>
          <p className="text-xs text-muted-foreground">
            {new Date(avatar.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};
