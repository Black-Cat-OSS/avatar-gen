// Mock uuid module to avoid ES module issues in Jest
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-v4'),
  v1: jest.fn(() => 'mocked-uuid-v1'),
}));

// Mock sharp module for image processing tests
jest.mock('sharp', () => {
  const mockSharp = jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('mocked-image')),
    grayscale: jest.fn().mockReturnThis(),
    negate: jest.fn().mockReturnThis(),
    modulate: jest.fn().mockReturnThis(),
  }));

  return mockSharp;
});
