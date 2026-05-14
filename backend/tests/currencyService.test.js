const currencyService = require('../src/services/currencyService');

describe('Currency Service', () => {
  describe('Currency Conversion', () => {
    test('should convert USD to EUR', async () => {
      const result = await currencyService.convertCurrency('USD', 'EUR', 100);

      expect(result).toHaveProperty('from', 'USD');
      expect(result).toHaveProperty('to', 'EUR');
      expect(result).toHaveProperty('amount', 100);
      expect(result).toHaveProperty('converted');
      expect(result).toHaveProperty('rate');
      expect(result.converted).toBeGreaterThan(0);
      expect(result.rate).toBeGreaterThan(0);
    });

    test('should convert EUR to GBP', async () => {
      const result = await currencyService.convertCurrency('EUR', 'GBP', 100);

      expect(result.from).toBe('EUR');
      expect(result.to).toBe('GBP');
      expect(result.amount).toBe(100);
      expect(result.converted).toBeGreaterThan(0);
    });

    test('should handle same currency conversion', async () => {
      const result = await currencyService.convertCurrency('USD', 'USD', 100);

      expect(result.converted).toBe(100);
      expect(result.rate).toBe(1);
    });

    test('should handle small amounts', async () => {
      const result = await currencyService.convertCurrency('USD', 'JPY', 0.01);

      expect(result.amount).toBe(0.01);
      expect(result.converted).toBeGreaterThan(0);
    });

    test('should handle large amounts', async () => {
      const result = await currencyService.convertCurrency('USD', 'INR', 1000000);

      expect(result.amount).toBe(1000000);
      expect(result.converted).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid source currency', async () => {
      await expect(
        currencyService.convertCurrency('INVALID', 'EUR', 100)
      ).rejects.toThrow('Invalid source currency');
    });

    test('should throw error for invalid target currency', async () => {
      await expect(
        currencyService.convertCurrency('USD', 'INVALID', 100)
      ).rejects.toThrow('Invalid target currency');
    });

    test('should throw error for negative amount', async () => {
      await expect(
        currencyService.convertCurrency('USD', 'EUR', -100)
      ).rejects.toThrow('Invalid amount');
    });

    test('should throw error for invalid amount', async () => {
      await expect(
        currencyService.convertCurrency('USD', 'EUR', 'abc')
      ).rejects.toThrow('Invalid amount');
    });
  });

  describe('Exchange Rates', () => {
    test('should get rates for USD', async () => {
      const result = await currencyService.getExchangeRates('USD');

      expect(result).toHaveProperty('rates');
      expect(result).toHaveProperty('source');
      expect(result.rates).toHaveProperty('EUR');
      expect(result.rates).toHaveProperty('GBP');
      expect(result.rates.USD).toBe(1);
    });

    test('should get rates for EUR', async () => {
      const result = await currencyService.getExchangeRates('EUR');

      expect(result).toHaveProperty('rates');
      expect(result.rates).toHaveProperty('USD');
      expect(result.rates.EUR).toBe(1);
    });

    test('should use cache on second request', async () => {
      const result1 = await currencyService.getExchangeRates('USD');
      const result2 = await currencyService.getExchangeRates('USD');

      expect(result1.rates).toEqual(result2.rates);
    });
  });

  describe('Supported Currencies', () => {
    test('should return all supported currencies', () => {
      const currencies = currencyService.getSupportedCurrencies();

      expect(Array.isArray(currencies)).toBe(true);
      expect(currencies.length).toBeGreaterThan(50);

      const usd = currencies.find(c => c.code === 'USD');
      expect(usd).toBeDefined();
      expect(usd.name).toBe('US Dollar');
      expect(usd.flag).toBe('🇺🇸');
    });

    test('should include major currencies', () => {
      const currencies = currencyService.getSupportedCurrencies();
      const codes = currencies.map(c => c.code);

      expect(codes).toContain('USD');
      expect(codes).toContain('EUR');
      expect(codes).toContain('GBP');
      expect(codes).toContain('JPY');
      expect(codes).toContain('INR');
    });
  });

  describe('Cache Management', () => {
    test('should clear cache', () => {
      const result = currencyService.clearCache();

      expect(result).toHaveProperty('message', 'Cache cleared successfully');
    });

    test('should get cache stats', () => {
      const stats = currencyService.getCacheStats();

      expect(stats).toHaveProperty('totalKeys');
      expect(stats).toHaveProperty('keys');
    });
  });
});

describe('Fallback Rates', () => {
  test('should have fallback rates for major currencies', () => {
    expect(currencyService.FALLBACK_RATES.USD).toBe(1);
    expect(currencyService.FALLBACK_RATES.EUR).toBeGreaterThan(0);
    expect(currencyService.FALLBACK_RATES.GBP).toBeGreaterThan(0);
    expect(currencyService.FALLBACK_RATES.JPY).toBeGreaterThan(0);
  });

  test('should have fallback for INR', () => {
    expect(currencyService.FALLBACK_RATES.INR).toBe(83.12);
  });
});

describe('Currency Metadata', () => {
  test('should have metadata for USD', () => {
    expect(currencyService.CURRENCIES.USD).toEqual({
      flag: '🇺🇸',
      name: 'US Dollar',
      symbol: '$'
    });
  });

  test('should have metadata for INR', () => {
    expect(currencyService.CURRENCIES.INR).toEqual({
      flag: '🇮🇳',
      name: 'Indian Rupee',
      symbol: '₹'
    });
  });

  test('should have metadata for all currencies', () => {
    Object.entries(currencyService.CURRENCIES).forEach(([code, data]) => {
      expect(data).toHaveProperty('flag');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('symbol');
    });
  });
});
