
const calculateStockScore = (dailyData) => {
    if (!dailyData || dailyData.length < 20) { // Need at least 20 days for basic volatility
        console.warn("Insufficient daily data for stock score calculation.");
        return null;
    }

    // Use recent data, e.g., last 20 days for volatility, last 5 for growth
    const recentData = dailyData.slice(-20);
    const growthData = dailyData.slice(-5); // For short-term growth


    const returns = [];
    for (let i = 1; i < recentData.length; i++) {
        const prevClose = recentData[i - 1].close;
        const currentClose = recentData[i].close;
        if (prevClose !== 0) { // Avoid division by zero
            returns.push((currentClose - prevClose) / prevClose);
        }
    }

    if (returns.length === 0) {
        console.warn("Could not calculate returns for volatility.");
        return null;
    }

    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const squaredDifferences = returns.map(r => Math.pow(r - meanReturn, 2));
    const variance = squaredDifferences.reduce((sum, sd) => sum + sd, 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualize volatility (252 trading days)

    // 2. Growth Rate (Percentage change over last few days/week)
    let growthRate = 0;
    if (growthData.length >= 2) {
        const initialPrice = growthData[0].close;
        const finalPrice = growthData[growthData.length - 1].close;
        if (initialPrice !== 0) {
            growthRate = (finalPrice - initialPrice) / initialPrice;
        }
    }

    // 3. Average Volume
    const totalVolume = recentData.reduce((sum, d) => sum + d.volume, 0);
    const averageVolume = totalVolume / recentData.length;

    let score = 0;
    let factors = {};

    const volatilityPoints = volatility < 0.2 ? 5 : (volatility < 0.35 ? 3 : 1);
    score += volatilityPoints;
    factors.volatility = { value: volatility.toFixed(4), points: volatilityPoints };


    // Growth Rate: Higher growth = higher score
    const growthPoints = growthRate > 0.02 ? 5 : (growthRate > 0 ? 3 : 1); // e.g., >2% growth in 5 days is good
    score += growthPoints;
    factors.growthRate = { value: growthRate.toFixed(4), points: growthPoints };

    const volumePoints = averageVolume > 5000000 ? 5 : (averageVolume > 1000000 ? 3 : 1);
    score += volumePoints;
    factors.averageVolume = { value: averageVolume.toFixed(0), points: volumePoints };


    return {
        score: score,
        metrics: {
            volatility: volatility.toFixed(4), // Annualized standard deviation of returns
            growthRate: growthRate.toFixed(4), // Percentage change over recent period
            averageVolume: averageVolume.toFixed(0) // Average daily trading volume
        },
        factors: factors // Breakdown of how points were assigned
    };
};

module.exports = {
    calculateStockScore
};