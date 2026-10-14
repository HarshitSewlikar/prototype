// Calculates composite stock score from historical daily OHLCV data
export const calculateStockScore = (dailyData) => {
  if (!dailyData || dailyData.length < 20) {
    return null
  }

  // Use recent data: last 20 days for volatility, last 5 for growth
  const recentData = dailyData.slice(-20)
  const growthData = dailyData.slice(-5)

  const returns = []
  for (let i = 1; i < recentData.length; i++) {
    const prevClose = recentData[i - 1].close
    const currentClose = recentData[i].close
    if (prevClose !== 0) {
      returns.push((currentClose - prevClose) / prevClose)
    }
  }

  if (returns.length === 0) {
    return null
  }

  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const squaredDifferences = returns.map((r) => Math.pow(r - meanReturn, 2))
  const variance = squaredDifferences.reduce((sum, sd) => sum + sd, 0) / returns.length
  const volatility = Math.sqrt(variance) * Math.sqrt(252) // Annualized volatility (252 trading days)

  // 2. Growth Rate (Percentage change over last few days)
  let growthRate = 0
  if (growthData.length >= 2) {
    const initialPrice = growthData[0].close
    const finalPrice = growthData[growthData.length - 1].close
    if (initialPrice !== 0) {
      growthRate = (finalPrice - initialPrice) / initialPrice
    }
  }

  // 3. Average Volume
  const totalVolume = recentData.reduce((sum, d) => sum + d.volume, 0)
  const averageVolume = totalVolume / recentData.length

  let score = 0
  const factors = {}

  const volatilityPoints = volatility < 0.2 ? 5 : volatility < 0.35 ? 3 : 1
  score += volatilityPoints
  factors.volatility = { value: volatility.toFixed(4), points: volatilityPoints }

  // Growth Rate: Higher growth = higher score
  const growthPoints = growthRate > 0.02 ? 5 : growthRate > 0 ? 3 : 1
  score += growthPoints
  factors.growthRate = { value: growthRate.toFixed(4), points: growthPoints }

  const volumePoints = averageVolume > 5000000 ? 5 : averageVolume > 1000000 ? 3 : 1
  score += volumePoints
  factors.averageVolume = { value: averageVolume.toFixed(0), points: volumePoints }

  return {
    score,
    metrics: {
      volatility: volatility.toFixed(4),
      growthRate: (growthRate * 100).toFixed(2) + '%',
      averageVolume: Math.round(averageVolume).toLocaleString(),
    },
    factors,
  }
}
