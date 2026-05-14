const axios = require('axios');
const NodeCache = require('node-cache');
const config = require('../config/env');
const { logger } = require('../middleware/logger');

// Initialize cache
const cache = new NodeCache({
  stdTTL: config.cache.ttl,
  checkperiod: config.cache.checkPeriod
});

// Fallback exchange rates (updated monthly)
const FALLBACK_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  INR: 83.12,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  CNY: 7.24,
  HKD: 7.82,
  SGD: 1.34,
  KRW: 1325,
  MXN: 17.15,
  BRL: 4.97,
  RUB: 90.5,
  ZAR: 18.75,
  TRY: 32.1,
  NOK: 10.6,
  SEK: 10.4,
  DKK: 6.89,
  PLN: 3.97,
  CZK: 22.8,
  HUF: 353,
  ILS: 3.67,
  AED: 3.67,
  SAR: 3.75,
  THB: 35.1,
  MYR: 4.72,
  IDR: 15700,
  PHP: 56.1,
  VND: 24400,
  PKR: 278,
  BDT: 110,
  EGP: 30.9,
  NGN: 1585,
  KWD: 0.308,
  BHD: 0.376,
  OMR: 0.385,
  QAR: 3.64,
  NZD: 1.63,
  TWD: 32.1,
  LKR: 312,
  CLP: 895,
  COP: 3900,
  PEN: 3.72,
  ARS: 870,
  UAH: 37.9,
  RON: 4.58
};

// All supported currencies with metadata
const CURRENCIES = {
  USD: { flag: '🇺🇸', name: 'US Dollar', symbol: '$' },
  EUR: { flag: '🇪🇺', name: 'Euro', symbol: '€' },
  GBP: { flag: '🇬🇧', name: 'British Pound', symbol: '£' },
  JPY: { flag: '🇯🇵', name: 'Japanese Yen', symbol: '¥' },
  INR: { flag: '🇮🇳', name: 'Indian Rupee', symbol: '₹' },
  CAD: { flag: '🇨🇦', name: 'Canadian Dollar', symbol: '$' },
  AUD: { flag: '🇦🇺', name: 'Australian Dollar', symbol: '$' },
  CHF: { flag: '🇨🇭', name: 'Swiss Franc', symbol: '₣' },
  CNY: { flag: '🇨🇳', name: 'Chinese Yuan', symbol: '¥' },
  HKD: { flag: '🇭🇰', name: 'Hong Kong Dollar', symbol: '$' },
  SGD: { flag: '🇸🇬', name: 'Singapore Dollar', symbol: '$' },
  KRW: { flag: '🇰🇷', name: 'South Korean Won', symbol: '₩' },
  MXN: { flag: '🇲🇽', name: 'Mexican Peso', symbol: '$' },
  BRL: { flag: '🇧🇷', name: 'Brazilian Real', symbol: 'R$' },
  RUB: { flag: '🇷🇺', name: 'Russian Ruble', symbol: '₽' },
  ZAR: { flag: '🇿🇦', name: 'South African Rand', symbol: 'R' },
  TRY: { flag: '🇹🇷', name: 'Turkish Lira', symbol: '₺' },
  NOK: { flag: '🇳🇴', name: 'Norwegian Krone', symbol: 'kr' },
  SEK: { flag: '🇸🇪', name: 'Swedish Krona', symbol: 'kr' },
  DKK: { flag: '🇩🇰', name: 'Danish Krone', symbol: 'kr' },
  PLN: { flag: '🇵🇱', name: 'Polish Złoty', symbol: 'zł' },
  CZK: { flag: '🇨🇿', name: 'Czech Koruna', symbol: 'Kč' },
  HUF: { flag: '🇭🇺', name: 'Hungarian Forint', symbol: 'Ft' },
  ILS: { flag: '🇮🇱', name: 'Israeli Shekel', symbol: '₪' },
  AED: { flag: '🇦🇪', name: 'UAE Dirham', symbol: 'د.إ' },
  SAR: { flag: '🇸🇦', name: 'Saudi Riyal', symbol: 'ر.س' },
  THB: { flag: '🇹🇭', name: 'Thai Baht', symbol: '฿' },
  MYR: { flag: '🇲🇾', name: 'Malaysian Ringgit', symbol: 'RM' },
  IDR: { flag: '🇮🇩', name: 'Indonesian Rupiah', symbol: 'Rp' },
  PHP: { flag: '🇵🇭', name: 'Philippine Peso', symbol: '₱' },
  VND: { flag: '🇻🇳', name: 'Vietnamese Dong', symbol: '₫' },
  PKR: { flag: '🇵🇰', name: 'Pakistani Rupee', symbol: '₨' },
  BDT: { flag: '🇧🇩', name: 'Bangladeshi Taka', symbol: '৳' },
  EGP: { flag: '🇪🇬', name: 'Egyptian Pound', symbol: '£' },
  NGN: { flag: '🇳🇬', name: 'Nigerian Naira', symbol: '₦' },
  KWD: { flag: '🇰🇼', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  BHD: { flag: '🇧🇭', name: 'Bahraini Dinar', symbol: '.د.ب' },
  OMR: { flag: '🇴🇲', name: 'Omani Rial', symbol: 'ر.ع' },
  QAR: { flag: '🇶🇦', name: 'Qatari Riyal', symbol: 'ر.ق' },
  NZD: { flag: '🇳🇿', name: 'New Zealand Dollar', symbol: '$' },
  TWD: { flag: '🇹🇼', name: 'Taiwan Dollar', symbol: '$' },
  LKR: { flag: '🇱🇰', name: 'Sri Lankan Rupee', symbol: '₨' },
  CLP: { flag: '🇨🇱', name: 'Chilean Peso', symbol: '$' },
  COP: { flag: '🇨🇴', name: 'Colombian Peso', symbol: '$' },
  PEN: { flag: '🇵🇪', name: 'Peruvian Sol', symbol: 'S/' },
  ARS: { flag: '🇦🇷', name: 'Argentine Peso', symbol: '$' },
  UAH: { flag: '🇺🇦', name: 'Ukrainian Hryvnia', symbol: '₴' },
  RON: { flag: '🇷🇴', name: 'Romanian Leu', symbol: 'lei' }
};

/**
 * Fetch exchange rates from external API with retry logic
 */
const fetchRatesFromAPI = async (baseCurrency) => {
  const url = `${config.api.exchangeRateUrl}/${baseCurrency}`;

  for (let attempt = 1; attempt <= config.api.retries; attempt++) {
    try {
      logger.info(`Fetching rates from API (attempt ${attempt}/${config.api.retries})`, { baseCurrency });

      const response = await axios.get(url, {
        timeout: config.api.timeout,
        headers: {
          'User-Agent': 'CurrencyConverter/1.0'
        }
      });

      if (response.data && response.data.rates) {
        logger.info(`Successfully fetched rates for ${baseCurrency}`, { count: Object.keys(response.data.rates).length });
        return response.data.rates;
      }

      throw new Error('Invalid API response format');
    } catch (error) {
      logger.warn(`API fetch attempt ${attempt} failed for ${baseCurrency}`, { error: error.message });

      if (attempt === config.api.retries) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

/**
 * Get exchange rates for a base currency
 * Uses cache first, then API, then fallback
 */
const getExchangeRates = async (baseCurrency) => {
  const cacheKey = `rates_${baseCurrency.toUpperCase()}`;

  // Try cache first
  const cachedRates = cache.get(cacheKey);
  if (cachedRates) {
    logger.debug(`Cache hit for ${cacheKey}`);
    return {
      source: 'cache',
      rates: cachedRates
    };
  }

  try {
    // Fetch from API
    const apiRates = await fetchRatesFromAPI(baseCurrency);

    // Cache the result
    cache.set(cacheKey, apiRates);

    return {
      source: 'api',
      rates: apiRates
    };
  } catch (error) {
    logger.error(`Failed to fetch rates from API for ${baseCurrency}, using fallback`, { error: error.message });

    // Generate fallback rates
    const fallbackRates = {};
    for (const [code] of Object.entries(CURRENCIES)) {
      if (baseCurrency === 'USD') {
        fallbackRates[code] = FALLBACK_RATES[code] || 1;
      } else if (code === baseCurrency) {
        fallbackRates[code] = 1;
      } else {
        // Calculate cross-rate via USD
        const baseToUSD = baseCurrency === 'USD' ? 1 : (1 / (FALLBACK_RATES[baseCurrency] || 1));
        const usdToTarget = FALLBACK_RATES[code] || 1;
        fallbackRates[code] = usdToTarget * baseToUSD;
      }
    }

    // Cache fallback for shorter duration
    cache.set(cacheKey, fallbackRates, 60); // 1 minute

    return {
      source: 'fallback',
      rates: fallbackRates,
      warning: 'Using fallback rates due to API unavailability'
    };
  }
};

/**
 * Convert amount between currencies
 */
const convertCurrency = async (fromCurrency, toCurrency, amount) => {
  // Validate inputs
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  if (!CURRENCIES[from]) {
    throw new Error(`Invalid source currency: ${fromCurrency}`);
  }
  if (!CURRENCIES[to]) {
    throw new Error(`Invalid target currency: ${toCurrency}`);
  }

  if (isNaN(amount) || amount < 0) {
    throw new Error('Invalid amount: must be a non-negative number');
  }

  // Get rates
  const { rates, source, warning } = await getExchangeRates(from);

  // Calculate conversion
  const rate = rates[to] || 0;
  const converted = amount * rate;

  return {
    from: from,
    to: to,
    amount: parseFloat(amount.toString()),
    converted: parseFloat(converted.toFixed(4)),
    rate: parseFloat(rate.toFixed(6)),
    source,
    timestamp: new Date().toISOString(),
    ...(warning && { warning })
  };
};

/**
 * Get all supported currencies
 */
const getSupportedCurrencies = () => {
  return Object.entries(CURRENCIES).map(([code, data]) => ({
    code,
    ...data
  }));
};

/**
 * Get cache statistics
 */
const getCacheStats = () => {
  const keys = cache.keys();
  const stats = {};

  keys.forEach(key => {
    const ttl = cache.getTtl(key);
    stats[key] = {
      expiresAt: ttl ? new Date(ttl * 1000).toISOString() : null
    };
  });

  return {
    totalKeys: keys.length,
    keys: stats
  };
};

/**
 * Clear cache
 */
const clearCache = () => {
  cache.flushAll();
  return { message: 'Cache cleared successfully' };
};

module.exports = {
  convertCurrency,
  getExchangeRates,
  getSupportedCurrencies,
  getCacheStats,
  clearCache,
  CURRENCIES,
  FALLBACK_RATES
};