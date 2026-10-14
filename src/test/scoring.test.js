import { describe, it, expect } from 'vitest'
import { calculateStockScore } from '../utils/stockScoreCalculator'
import { getMockDailyStockData, getMockMarketMovers, getMockSectorPerformance } from '../utils/mockMarketData'
import { filterByRange, isAscendingByDate } from '../utils/chartData'

describe('Superpowers Test Suite: Financial Analysis Engine', () => {
  it('generates deterministic daily stock data in ascending chronological order', () => {
    const data = getMockDailyStockData('IBM')
    expect(data.length).toBe(300)
    expect(isAscendingByDate(data)).toBe(true)
    expect(data[0]).toHaveProperty('close')
    expect(data[0]).toHaveProperty('volume')
  })

  it('filters data series by month range correctly', () => {
    const data = getMockDailyStockData('AAPL')
    const oneMonth = filterByRange(data, 1)
    const threeMonths = filterByRange(data, 3)
    const all = filterByRange(data, null)

    expect(oneMonth.length).toBeLessThan(threeMonths.length)
    expect(threeMonths.length).toBeLessThan(all.length)
  })

  it('calculates a valid composite stock score between 0 and 15', () => {
    const dailyData = getMockDailyStockData('MSFT')
    const result = calculateStockScore(dailyData)

    expect(result).not.toBeNull()
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(15)
    expect(result.metrics).toHaveProperty('volatility')
    expect(result.metrics).toHaveProperty('growthRate')
    expect(result.metrics).toHaveProperty('averageVolume')
  })

  it('returns null score when daily data has fewer than 20 records', () => {
    const shortData = [{ close: 100, volume: 1000 }]
    const result = calculateStockScore(shortData)
    expect(result).toBeNull()
  })

  it('generates sector performance and market movers with required fields', () => {
    const sectors = getMockSectorPerformance()
    expect(sectors.length).toBeGreaterThan(5)
    expect(sectors[0]).toHaveProperty('sector')
    expect(sectors[0]).toHaveProperty('performance')

    const movers = getMockMarketMovers()
    expect(movers.topGainers.length).toBeGreaterThan(0)
    expect(movers.topLosers.length).toBeGreaterThan(0)
    expect(movers.mostActivelyTraded.length).toBeGreaterThan(0)
    expect(movers.topGainers[0].changePercentage).toBeGreaterThan(0)
  })
})
