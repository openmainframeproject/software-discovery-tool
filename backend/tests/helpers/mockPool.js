import { jest } from '@jest/globals';

/**
 * Create a mock MySQL pool for integration tests.
 */
export const createMockPool = (queryImpl = defaultQueryImpl) => ({
  query: jest.fn(queryImpl)
});

const defaultQueryImpl = async (sql) => {
  if (sql.includes('COUNT(*)')) {
    return [[{ total: 0 }]];
  }
  return [[]];
};

export const mockSearchResults = (total, packages = []) => {
  return async (sql) => {
    if (sql.includes('COUNT(*)')) {
      return [[{ total }]];
    }
    return [packages];
  };
};

export const mockDbFailure = () => {
  return async () => {
    throw new Error('Database connection failed');
  };
};
