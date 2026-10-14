// src/features/market/MarketDashboardPage.jsx
import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  BarChart2, 
  PieChart as PieIcon,
  Flame,
  Layers
} from 'lucide-react'

import LineChartCard from '../../components/LineChartCard'
import PieChartCard from '../../components/PieChartCard'
import BarChartCard from '../../components/BarChartCard'
import HeatmapCard from '../../components/HeatmapCard'
import TableComponent from '../../components/TableComponent'
import { ErrorState, Spinner } from '../../components/common/Ui'
import { queryKeys } from '../../app/queryClient'
import { filterByRange } from '../../utils/chartData'
import { getDailyStock, getMovers, getSectors, getStockScore } from '../../services/endpoints'

const STOCK_SYMBOLS = [
  { symbol: 'IBM', name: 'Intl. Business Machines' },
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
]

const TIME_RANGES = [
  { value: '1M', label: '1M', months: 1 },
  { value: '3M', label: '3M', months: 3 },
  { value: '6M', label: '6M', months: 6 },
  { value: '1Y', label: '1Y', months: 12 },
  { value: 'ALL', label: 'All', months: null },
]

const MarketDashboardPage = () => {
  const [symbol, setSymbol] = useState('IBM')
  const [range, setRange] = useState(TIME_RANGES[3])

  const daily = useQuery({
    queryKey: queryKeys.marketDaily(symbol),
    queryFn: () => getDailyStock(symbol),
  })
  const sectors = useQuery({ queryKey: queryKeys.marketSectors, queryFn: getSectors })
  const movers = useQuery({ queryKey: queryKeys.marketMovers, queryFn: getMovers })
  const score = useQuery({
    queryKey: queryKeys.marketScore(symbol),
    queryFn: () => getStockScore(symbol),
  })

  const rawDailyData = daily.data?.data || []
  const dailyData = useMemo(
    () => filterByRange(rawDailyData, range.months),
    [rawDailyData, range]
  )

  const latestQuote = useMemo(() => {
    if (!rawDailyData || rawDailyData.length === 0) return null
    const latest = rawDailyData[rawDailyData.length - 1]
    const prev = rawDailyData.length > 1 ? rawDailyData[rawDailyData.length - 2] : latest
    const change = latest.close - prev.close
    const changePct = prev.close !== 0 ? (change / prev.close) * 100 : 0
    return {
      price: latest.close,
      change,
      changePct,
      high: latest.high,
      low: latest.low,
      volume: latest.volume,
    }
  }, [rawDailyData])

  const mostActiveColumns = useMemo(
    () => [
      { 
        header: 'Ticker', 
        accessor: 'ticker',
        formatter: (v) => <span className="font-bold text-slate-900 font-mono">{v}</span>
      },
      { 
        header: 'Price', 
        accessor: 'price', 
        formatter: (v) => <span className="font-mono tabular-nums font-semibold">${Number(v).toFixed(2)}</span> 
      },
      {
        header: 'Change ($)',
        accessor: 'changeAmount',
        formatter: (v) => {
          const num = Number(v)
          return (
            <span className={`font-mono tabular-nums font-medium ${num >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {num >= 0 ? '+' : ''}{num.toFixed(2)}
            </span>
          )
        },
      },
      {
        header: '% Change',
        accessor: 'changePercentage',
        formatter: (v) => {
          const num = Number(v)
          return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold ${
              num >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {num >= 0 ? '+' : ''}{num.toFixed(2)}%
            </span>
          )
        },
      },
      { 
        header: 'Volume', 
        accessor: 'volume', 
        formatter: (v) => <span className="font-mono tabular-nums text-slate-600">{Number(v).toLocaleString()}</span> 
      },
    ],
    []
  )

  const detailColumns = useMemo(
    () => [
      {
        header: 'Date',
        accessor: 'date',
        formatter: (v) => {
          try {
            return <span className="font-medium text-slate-800">{format(new Date(v), 'MMM dd, yyyy')}</span>
          } catch {
            return v
          }
        },
      },
      { header: 'Open', accessor: 'open', formatter: (v) => <span className="font-mono tabular-nums">${Number(v).toFixed(2)}</span> },
      { header: 'High', accessor: 'high', formatter: (v) => <span className="font-mono tabular-nums text-emerald-700">${Number(v).toFixed(2)}</span> },
      { header: 'Low', accessor: 'low', formatter: (v) => <span className="font-mono tabular-nums text-rose-700">${Number(v).toFixed(2)}</span> },
      { header: 'Close', accessor: 'close', formatter: (v) => <span className="font-mono tabular-nums font-bold text-slate-900">${Number(v).toFixed(2)}</span> },
      { header: 'Volume', accessor: 'volume', formatter: (v) => <span className="font-mono tabular-nums text-slate-600">{Number(v).toLocaleString()}</span> },
    ],
    []
  )

  const moversData = movers.data?.data

  return (
    <div className="space-y-6">
      {/* Top FinTech Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Stock KPI */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
            <span>Selected Asset</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-slate-900 font-mono">{symbol}</span>
              <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                {STOCK_SYMBOLS.find(s => s.symbol === symbol)?.name}
              </p>
            </div>
            {latestQuote && (
              <div className="text-right">
                <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                  ${latestQuote.price.toFixed(2)}
                </span>
                <div className={`text-xs font-mono font-semibold flex items-center justify-end gap-0.5 ${
                  latestQuote.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {latestQuote.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3 text-rose-600" />}
                  {latestQuote.change >= 0 ? '+' : ''}{latestQuote.changePct.toFixed(2)}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Composite Score KPI */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
            <span>Stock Rating</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {score.data?.data?.score ?? '—'}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 15</span>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              (score.data?.data?.score || 0) >= 10
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {(score.data?.data?.score || 0) >= 10 ? 'Strong Bullish' : 'Moderate'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Multi-factor volatility & volume</p>
        </div>

        {/* Sector Lead KPI */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
            <span>Lead Market Sector</span>
            <PieIcon className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 block truncate">
              {sectors.data?.data?.[0]?.sector || 'Technology'}
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-slate-500">Allocation Weight:</span>
              <span className="text-xs font-mono font-bold text-emerald-600">
                +{((sectors.data?.data?.[0]?.performance || 0.82) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Market Breadth */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
            <span>Market Movers Activity</span>
            <Layers className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Top Gainer:</span>
              <span className="text-xs font-mono font-bold text-emerald-600">
                {moversData?.topGainers?.[0]?.ticker || 'AAPL'} (+{moversData?.topGainers?.[0]?.changePercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Top Loser:</span>
              <span className="text-xs font-mono font-bold text-rose-600">
                {moversData?.topLosers?.[0]?.ticker || 'PTON'} ({moversData?.topLosers?.[0]?.changePercentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Switcher & Range Toolbar (UI/UX Pro Max Clean Segmented Controls) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        {/* Ticker pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Asset:</span>
          {STOCK_SYMBOLS.map((s) => (
            <button
              key={s.symbol}
              onClick={() => setSymbol(s.symbol)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                symbol === s.symbol
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              {s.symbol}
            </button>
          ))}
        </div>

        {/* Time range pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
          {TIME_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                range.value === r.value
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {daily.isError && <ErrorState message="Failed to load daily stock data." />}
      {daily.isLoading && <Spinner label={`Loading ${symbol} data…`} />}
      {!daily.isLoading && !daily.isError && (
        <LineChartCard
          data={dailyData}
          title={`${symbol} Daily Close Trend (${range.label})`}
          dataKey="close"
          tooltipLabel="Close Price"
        />
      )}

      {/* Quantitative Stock Score Breakdown */}
      {score.data?.data && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                {symbol} Quantitative Stock Score Breakdown
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated algorithmic scoring from price volatility, trailing growth, and liquidity volume
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Total Composite:</span>
              <span className="text-2xl font-black text-blue-600 font-mono bg-blue-50/70 border border-blue-200/60 px-3 py-0.5 rounded-lg">
                {score.data.data.score} <span className="text-xs font-normal text-slate-400">/ 15</span>
              </span>
            </div>
          </div>
          {score.data.data.metrics && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Annualized Volatility</span>
                <span className="text-lg font-mono font-bold text-slate-900 mt-0.5 block">{score.data.data.metrics.volatility}</span>
                <span className="text-[10px] text-slate-400">Risk rating points: {score.data.data.factors?.volatility?.points ?? '—'} / 5</span>
              </div>
              <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">5-Day Growth Rate</span>
                <span className="text-lg font-mono font-bold text-slate-900 mt-0.5 block">{score.data.data.metrics.growthRate}</span>
                <span className="text-[10px] text-slate-400">Momentum points: {score.data.data.factors?.growthRate?.points ?? '—'} / 5</span>
              </div>
              <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Average Daily Volume</span>
                <span className="text-lg font-mono font-bold text-slate-900 mt-0.5 block">{score.data.data.metrics.averageVolume}</span>
                <span className="text-[10px] text-slate-400">Liquidity points: {score.data.data.factors?.averageVolume?.points ?? '—'} / 5</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sector Performance Distribution */}
      {sectors.isError && <ErrorState message="Failed to load sector performance." />}
      {sectors.isLoading && <Spinner label="Loading sector performance…" />}
      {sectors.data?.data && (
        <PieChartCard
          data={sectors.data.data}
          title="Sector Performance Distribution (%)"
          dataKey="performance"
          nameKey="sector"
        />
      )}

      {/* Movers and Heatmap */}
      {movers.isError && <ErrorState message="Failed to load market movers." />}
      {moversData && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <BarChartCard
              data={moversData.topGainers.slice(0, 10)}
              title="Top 10 Market Gainers (%)"
              barKey="changePercentage"
              nameKey="ticker"
              barColor="#10b981"
            />
            <BarChartCard
              data={moversData.topLosers.slice(0, 10)}
              title="Top 10 Market Losers (%)"
              barKey="changePercentage"
              nameKey="ticker"
              barColor="#f43f5e"
            />
          </div>
          <HeatmapCard data={moversData} title="Comprehensive Market Movers Heatmap" />
        </>
      )}

      {/* Tables */}
      {moversData?.mostActivelyTraded && (
        <TableComponent
          data={moversData.mostActivelyTraded.slice(0, 15)}
          columns={mostActiveColumns}
          title="Most Actively Traded Stocks"
        />
      )}

      {dailyData && dailyData.length > 0 && (
        <TableComponent
          data={[dailyData[dailyData.length - 1]]}
          columns={detailColumns}
          title={`${symbol} Latest Market Session Detail`}
        />
      )}
    </div>
  )
}

export default MarketDashboardPage
