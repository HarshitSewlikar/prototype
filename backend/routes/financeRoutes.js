// routes/financeRoutes.js
const express = require('express');
const {
    getDailyStockData,
    getSectorPerformance,
    getMarketMovers,
    getStockScore
} = require('../controllers/financeController');

const router = express.Router();

// Define routes
router.get('/stock/daily/:symbol', getDailyStockData);
router.get('/sector-performance', getSectorPerformance);
router.get('/market-movers', getMarketMovers);
router.get('/stock/score/:symbol', getStockScore);

module.exports = router;