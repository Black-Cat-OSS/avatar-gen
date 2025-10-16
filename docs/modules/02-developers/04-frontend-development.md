# Frontend разработка

## 🎯 Цель

Научиться разрабатывать UI и frontend функциональность в Avatar Generator.

## ⏱️ Время изучения

**45 минут**

## 📋 Предварительные знания

- [Backend разработка](03-backend-development.md) - понимание API
- Базовые знания React
- Понимание TypeScript
- Опыт работы с Redux Toolkit

## 🏗️ Архитектура Frontend

```
┌─────────────────────────────────────────────────┐
│                React Application                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐  ┌────────────┐  ┌─────────┐ │
│  │   Pages     │  │  Widgets   │  │ Features│ │
│  │ (Routes)    │  │ (UI Blocks)│  │ (Logic) │ │
│  └──────┬──────┘  └─────┬──────┘  └────┬────┘ │
│         │                │               │      │
│         ↓                ↓               ↓      │
│  ┌─────────────┐  ┌────────────┐  ┌─────────┐ │
│  │  Entities   │  │   Shared   │  │   API   │ │
│  │ (Business)  │  │  (Common)  │  │ (HTTP)  │ │
│  └─────────────┘  └────────────┘  └─────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🎨 Feature-Sliced Design

### Pages (Страницы)

```typescript
// src/pages/avatar-generator/AvatarGeneratorPage.tsx
import React from 'react';
import { AvatarGeneratorForm } from '@/features/avatar-generator';
import { PageLayout } from '@/shared/ui/layouts';

export const AvatarGeneratorPage: React.FC = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Avatar Generator</h1>
        <AvatarGeneratorForm />
      </div>
    </PageLayout>
  );
};
```

### Widgets (Виджеты)

```typescript
// src/widgets/avatar-card/AvatarCard.tsx
import React from 'react';
import { Avatar } from '@/entities/avatar';
import { Button } from '@/shared/ui/button';
import { DownloadIcon, FilterIcon } from 'lucide-react';

interface AvatarCardProps {
  avatar: Avatar;
  onDownload: (id: string) => void;
  onFilter: (id: string, filter: string) => void;
}

export const AvatarCard: React.FC<AvatarCardProps> = ({
  avatar,
  onDownload,
  onFilter,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{avatar.name}</h3>
        <span className="text-sm text-gray-500">{avatar.createdAt}</span>
      </div>

      <div className="flex justify-center mb-4">
        <img
          src={`/api/${avatar.id}`}
          alt={avatar.name}
          className="w-32 h-32 rounded-full"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => onDownload(avatar.id)}
          className="flex-1"
        >
          <DownloadIcon className="w-4 h-4 mr-2" />
          Download
        </Button>

        <Button
          variant="outline"
          onClick={() => onFilter(avatar.id, 'grayscale')}
        >
          <FilterIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
```

### Features (Фичи)

```typescript
// src/features/avatar-generator/AvatarGeneratorForm.tsx
import React, { useState } from 'react';
import { useGenerateAvatar } from '../model/useGenerateAvatar';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

export const AvatarGeneratorForm: React.FC = () => {
  const [formData, setFormData] = useState({
    seed: '',
    colorScheme: 'pastel',
    primaryColor: '',
    foreignColor: '',
  });

  const { generateAvatar, isLoading, error } = useGenerateAvatar();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateAvatar(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="seed" className="block text-sm font-medium mb-2">
          Seed (опционально)
        </label>
        <Input
          id="seed"
          type="text"
          value={formData.seed}
          onChange={(e) => handleInputChange('seed', e.target.value)}
          placeholder="Введите seed для генерации"
          maxLength={32}
        />
      </div>

      <div>
        <label htmlFor="colorScheme" className="block text-sm font-medium mb-2">
          Цветовая схема
        </label>
        <Select
          value={formData.colorScheme}
          onValueChange={(value) => handleInputChange('colorScheme', value)}
        >
          <option value="pastel">Pastel</option>
          <option value="vibrant">Vibrant</option>
          <option value="monochrome">Monochrome</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="primaryColor" className="block text-sm font-medium mb-2">
            Основной цвет
          </label>
          <Input
            id="primaryColor"
            type="color"
            value={formData.primaryColor}
            onChange={(e) => handleInputChange('primaryColor', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="foreignColor" className="block text-sm font-medium mb-2">
            Дополнительный цвет
          </label>
          <Input
            id="foreignColor"
            type="color"
            value={formData.foreignColor}
            onChange={(e) => handleInputChange('foreignColor', e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          Ошибка: {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Генерация...' : 'Сгенерировать аватар'}
      </Button>
    </form>
  );
};
```

### Entities (Сущности)

```typescript
// src/entities/avatar/model/types.ts
export interface Avatar {
  id: string;
  name: string;
  createdAt: string;
  version: string;
  primaryColor?: string;
  foreignColor?: string;
  colorScheme?: string;
  seed?: string;
}

export interface GenerateAvatarRequest {
  seed?: string;
  primaryColor?: string;
  foreignColor?: string;
  colorScheme?: string;
}

export interface GenerateAvatarResponse {
  statusCode: number;
  message: string;
  data: {
    id: string;
    createdAt: string;
    version: string;
  };
}

export interface AvatarListResponse {
  statusCode: number;
  message: string;
  data: {
    avatars: Avatar[];
    pagination: {
      total: number;
      offset: number;
      pick: number;
      hasMore: boolean;
    };
  };
}
```

### Shared (Общие компоненты)

```typescript
// src/shared/ui/button/Button.tsx
import React from 'react';
import { cn } from '@/shared/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors';

  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

## 🔄 State Management (Redux Toolkit)

### Store Configuration

```typescript
// src/app/providers/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { avatarApi } from '@/entities/avatar/api/avatarApi';
import { avatarGeneratorSlice } from '@/features/avatar-generator/model/avatarGeneratorSlice';

export const store = configureStore({
  reducer: {
    avatarGenerator: avatarGeneratorSlice.reducer,
    [avatarApi.reducerPath]: avatarApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(avatarApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### API Slice (RTK Query)

```typescript
// src/entities/avatar/api/avatarApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  Avatar,
  GenerateAvatarRequest,
  GenerateAvatarResponse,
} from '../model/types';

export const avatarApi = createApi({
  reducerPath: 'avatarApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
  }),
  tagTypes: ['Avatar'],
  endpoints: builder => ({
    generateAvatar: builder.mutation<
      GenerateAvatarResponse,
      GenerateAvatarRequest
    >({
      query: body => ({
        url: '/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Avatar'],
    }),

    getAvatarList: builder.query<Avatar[], { pick?: number; offset?: number }>({
      query: ({ pick = 10, offset = 0 }) =>
        `/list?pick=${pick}&offset=${offset}`,
      providesTags: ['Avatar'],
    }),

    getAvatar: builder.query<
      Blob,
      { id: string; size?: number; filter?: string }
    >({
      query: ({ id, size, filter }) => {
        const params = new URLSearchParams();
        if (size) params.append('size', size.toString());
        if (filter) params.append('filter', filter);

        return {
          url: `/${id}${params.toString() ? `?${params.toString()}` : ''}`,
          responseHandler: response => response.blob(),
        };
      },
    }),

    deleteAvatar: builder.mutation<void, string>({
      query: id => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Avatar'],
    }),
  }),
});

export const {
  useGenerateAvatarMutation,
  useGetAvatarListQuery,
  useGetAvatarQuery,
  useDeleteAvatarMutation,
} = avatarApi;
```

### Feature Slice

```typescript
// src/features/avatar-generator/model/avatarGeneratorSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AvatarGeneratorState {
  currentAvatar: string | null;
  isLoading: boolean;
  error: string | null;
  formData: {
    seed: string;
    colorScheme: string;
    primaryColor: string;
    foreignColor: string;
  };
}

const initialState: AvatarGeneratorState = {
  currentAvatar: null,
  isLoading: false,
  error: null,
  formData: {
    seed: '',
    colorScheme: 'pastel',
    primaryColor: '',
    foreignColor: '',
  },
};

export const avatarGeneratorSlice = createSlice({
  name: 'avatarGenerator',
  initialState,
  reducers: {
    setFormData: (
      state,
      action: PayloadAction<Partial<AvatarGeneratorState['formData']>>,
    ) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setCurrentAvatar: (state, action: PayloadAction<string>) => {
      state.currentAvatar = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetForm: state => {
      state.formData = initialState.formData;
      state.currentAvatar = null;
      state.error = null;
    },
  },
});

export const {
  setFormData,
  setCurrentAvatar,
  setLoading,
  setError,
  resetForm,
} = avatarGeneratorSlice.actions;
```

## 🎣 Custom Hooks

### Avatar Generator Hook

```typescript
// src/features/avatar-generator/model/useGenerateAvatar.ts
import { useCallback } from 'react';
import { useGenerateAvatarMutation } from '@/entities/avatar/api/avatarApi';
import { useAppDispatch } from '@/shared/lib/hooks';
import { setCurrentAvatar, setLoading, setError } from './avatarGeneratorSlice';

export const useGenerateAvatar = () => {
  const dispatch = useAppDispatch();
  const [generateAvatarMutation, { isLoading, error }] =
    useGenerateAvatarMutation();

  const generateAvatar = useCallback(
    async (formData: any) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const response = await generateAvatarMutation(formData).unwrap();

        dispatch(setCurrentAvatar(response.data.id));
      } catch (err: any) {
        dispatch(setError(err.message || 'Ошибка генерации аватара'));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [generateAvatarMutation, dispatch],
  );

  return {
    generateAvatar,
    isLoading,
    error,
  };
};
```

### Avatar List Hook

```typescript
// src/entities/avatar/model/useAvatarList.ts
import { useState, useCallback } from 'react';
import {
  useGetAvatarListQuery,
  useDeleteAvatarMutation,
} from '../api/avatarApi';

export const useAvatarList = () => {
  const [pagination, setPagination] = useState({ pick: 10, offset: 0 });

  const {
    data: avatars = [],
    isLoading,
    error,
  } = useGetAvatarListQuery(pagination);
  const [deleteAvatarMutation] = useDeleteAvatarMutation();

  const loadMore = useCallback(() => {
    setPagination(prev => ({ ...prev, offset: prev.offset + prev.pick }));
  }, []);

  const deleteAvatar = useCallback(
    async (id: string) => {
      try {
        await deleteAvatarMutation(id).unwrap();
      } catch (err) {
        console.error('Ошибка удаления аватара:', err);
      }
    },
    [deleteAvatarMutation],
  );

  return {
    avatars,
    isLoading,
    error,
    loadMore,
    deleteAvatar,
  };
};
```

## 🎨 Styling (Tailwind CSS)

### Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### Utility Classes

```typescript
// src/shared/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateAvatarUrl(
  id: string,
  size?: number,
  filter?: string,
): string {
  const params = new URLSearchParams();
  if (size) params.append('size', size.toString());
  if (filter) params.append('filter', filter);

  return `/api/${id}${params.toString() ? `?${params.toString()}` : ''}`;
}
```

## 🧪 Testing

### Component Tests

```typescript
// src/features/avatar-generator/AvatarGeneratorForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AvatarGeneratorForm } from './AvatarGeneratorForm';
import { store } from '@/app/providers/store';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('AvatarGeneratorForm', () => {
  it('renders form fields', () => {
    renderWithProvider(<AvatarGeneratorForm />);

    expect(screen.getByLabelText(/seed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/цветовая схема/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /сгенерировать/i })).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    renderWithProvider(<AvatarGeneratorForm />);

    const seedInput = screen.getByLabelText(/seed/i);
    const submitButton = screen.getByRole('button', { name: /сгенерировать/i });

    fireEvent.change(seedInput, { target: { value: 'test-seed' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/генерация/i)).toBeInTheDocument();
    });
  });
});
```

### Hook Tests

```typescript
// src/features/avatar-generator/model/useGenerateAvatar.test.ts
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useGenerateAvatar } from './useGenerateAvatar';
import { store } from '@/app/providers/store';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

describe('useGenerateAvatar', () => {
  it('should generate avatar', async () => {
    const { result } = renderHook(() => useGenerateAvatar(), { wrapper });

    await act(async () => {
      await result.current.generateAvatar({ seed: 'test' });
    });

    expect(result.current.isLoading).toBe(false);
  });
});
```

## 🚀 Performance Optimization

### React.memo

```typescript
// src/widgets/avatar-card/AvatarCard.tsx
import React, { memo } from 'react';

export const AvatarCard = memo<AvatarCardProps>(
  ({ avatar, onDownload, onFilter }) => {
    // Component implementation
  },
);
```

### useMemo and useCallback

```typescript
// src/features/avatar-generator/AvatarGeneratorForm.tsx
import React, { useMemo, useCallback } from 'react';

export const AvatarGeneratorForm: React.FC = () => {
  const colorSchemeOptions = useMemo(
    () => [
      { value: 'pastel', label: 'Pastel' },
      { value: 'vibrant', label: 'Vibrant' },
      { value: 'monochrome', label: 'Monochrome' },
    ],
    [],
  );

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Component implementation
};
```

### Code Splitting

```typescript
// src/app/router/AppRouter.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const AvatarGeneratorPage = lazy(() => import('@/pages/avatar-generator'));
const AvatarViewerPage = lazy(() => import('@/pages/avatar-viewer'));

export const AppRouter = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<AvatarGeneratorPage />} />
        <Route path="/viewer" element={<AvatarViewerPage />} />
      </Routes>
    </Suspense>
  );
};
```

## ✅ Проверка знаний

После изучения frontend разработки вы должны уметь:

- [ ] Создавать React компоненты с TypeScript
- [ ] Использовать Feature-Sliced Design архитектуру
- [ ] Работать с Redux Toolkit и RTK Query
- [ ] Создавать кастомные хуки
- [ ] Стилизовать компоненты с Tailwind CSS
- [ ] Писать тесты для компонентов и хуков
- [ ] Оптимизировать производительность React приложений

## 🔗 Связанные темы

### Предварительные знания

- [Backend разработка](03-backend-development.md) - понимание API
- [React документация](https://react.dev/) - библиотека UI
- [Redux Toolkit документация](https://redux-toolkit.js.org/) - управление
  состоянием

### Следующие шаги

- [Добавление функций](05-adding-features.md) - интеграция frontend и backend
- [Кастомизация](06-customization.md) - настройка UI
- [Тестирование](07-testing.md) - углубленное тестирование

---

**Предыдущий раздел:** [Backend разработка](03-backend-development.md)  
**Следующий раздел:** [Добавление функций](05-adding-features.md)  
**Версия:** 1.0  
**Обновлено:** 2025-01-15
