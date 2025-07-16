import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock das APIs dos marketplaces
  http.get('https://api.mercadolibre.com/sites/MLB/search', () => {
    return HttpResponse.json({
      results: [
        {
          id: 'MLB123456',
          title: 'Produto Teste',
          price: 99.99,
          original_price: 129.99,
          condition: 'new',
          thumbnail: 'https://example.com/image.jpg',
          pictures: [{ secure_url: 'https://example.com/image.jpg' }],
          available_quantity: 10,
          sold_quantity: 5,
          category_id: 'MLB1234',
          attributes: [],
          seller: {
            id: 'SELLER123',
            nickname: 'Vendedor Teste',
          },
          shipping: {
            free_shipping: true,
          },
        },
      ],
      paging: {
        total: 1,
        offset: 0,
        limit: 50,
      },
    });
  }),

  // Mock OAuth do MercadoLivre
  http.post('https://api.mercadolibre.com/oauth/token', () => {
    return HttpResponse.json({
      access_token: 'mock_access_token',
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: 'mock_refresh_token',
      scope: 'offline_access read write',
    });
  }),

  // Mock categorias do MercadoLivre
  http.get('https://api.mercadolibre.com/categories/MLB1234', () => {
    return HttpResponse.json({
      id: 'MLB1234',
      name: 'Calçados',
      picture: 'https://example.com/category.jpg',
      path_from_root: [
        { id: 'MLB1000', name: 'Moda e Beleza' },
        { id: 'MLB1234', name: 'Calçados' },
      ],
    });
  }),

  // Mock Edge Functions
  http.post('https://ikwttetqfltpxpkbqgpj.supabase.co/functions/v1/product-import', () => {
    return HttpResponse.json({
      success: true,
      imported: 5,
      updated: 2,
      errors: [],
    });
  }),

  http.post('https://ikwttetqfltpxpkbqgpj.supabase.co/functions/v1/sync-products', () => {
    return HttpResponse.json({
      success: true,
      synced: 10,
      errors: [],
    });
  }),
];