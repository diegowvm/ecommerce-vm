import { Product } from '@/integrations/marketplaces/types';

export const createMockProduct = (overrides?: Partial<Product>): Product => ({
  id: 'MLB123456',
  title: 'Produto Teste',
  price: 99.99,
  originalPrice: 129.99,
  currency: 'BRL',
  condition: 'new',
  imageUrl: 'https://example.com/image.jpg',
  images: ['https://example.com/image.jpg'],
  stock: 10,
  categoryId: 'MLB1234',
  category: 'Calçados',
  marketplaceProductId: 'MLB123456',
  marketplaceName: 'MercadoLivre',
  marketplaceUrl: 'https://produto.mercadolivre.com.br/MLB123456',
  attributes: {},
  ...overrides,
});

export const createMockApiConnection = (overrides?: any) => ({
  id: 'api-connection-id',
  connection_name: 'Teste MercadoLivre',
  marketplace_name: 'MercadoLivre',
  oauth_access_token: 'mock_token',
  oauth_refresh_token: 'mock_refresh_token',
  oauth_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
  connection_status: 'connected',
  is_active: true,
  user_id: 'user-id',
  settings: {},
  ...overrides,
});

export const createMockUser = (overrides?: any) => ({
  id: 'user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Usuário Teste',
  },
  ...overrides,
});

export const createMockSession = (overrides?: any) => ({
  access_token: 'mock_session_token',
  refresh_token: 'mock_session_refresh_token',
  expires_at: Date.now() + 3600 * 1000,
  user: createMockUser(),
  ...overrides,
});