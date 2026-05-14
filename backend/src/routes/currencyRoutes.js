const express = require('express');
const { AppError } = require('../middleware/errorHandler');
const currencyService = require('../services/currencyService');

const router = express.Router();

/**
 * GET /api/rates
 * Convert currency or get exchange rates
 * Query params:
 *   - from: source currency code (required)
 *   - to: target currency code (required)
 *   - amount: amount to convert (optional, default: 1)
 */
router.get('/rates', async (req, res, next) => {
  try {
    const { from, to, amount = 1 } = req.query;

    // Validate required parameters
    if (!from || !to) {
      throw new AppError('Missing required parameters: from and to are required', 400);
    }

    const result = await currencyService.convertCurrency(from, to, parseFloat(amount));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/rates/:from
 * Get all exchange rates for a base currency
 */
router.get('/rates/:from', async (req, res, next) => {
  try {
    const { from } = req.params;

    const { rates, source, warning } = await currencyService.getExchangeRates(from.toUpperCase());

    res.json({
      success: true,
      data: {
        base: from.toUpperCase(),
        rates,
        source,
        timestamp: new Date().toISOString(),
        ...(warning && { warning })
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/currencies
 * Get list of all supported currencies
 */
router.get('/currencies', async (req, res, next) => {
  try {
    const currencies = currencyService.getSupportedCurrencies();

    res.json({
      success: true,
      data: {
        currencies,
        count: currencies.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats/cache
 * Get cache statistics (for monitoring)
 */
router.get('/stats/cache', async (req, res, next) => {
  try {
    const stats = currencyService.getCacheStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cache/clear
 * Clear cache (for admin/maintenance)
 */
router.post('/cache/clear', async (req, res, next) => {
  try {
    const result = currencyService.clearCache();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;