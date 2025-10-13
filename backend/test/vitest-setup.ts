import { vi } from 'vitest';

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mocked-uuid-v4'),
  v1: vi.fn(() => 'mocked-uuid-v1'),
}));

vi.mock('sharp', () => {
  const mockSharp = vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('mocked-image')),
    grayscale: vi.fn().mockReturnThis(),
    negate: vi.fn().mockReturnThis(),
    modulate: vi.fn().mockReturnThis(),
  }));

  return { default: mockSharp };
});

