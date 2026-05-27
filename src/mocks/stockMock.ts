import type { ChartPeriod, StockMarketData } from '../types/stock';

function createOrderBook(currentPrice: number, changeRate: number) {
  return {
    askOrders: [400, 300, 200, 100, 0].map((gap, index) => ({
      price: currentPrice + gap,
      quantity: [3214, 5892, 7441, 4122, 9567][index],
      changeRate: changeRate + (4 - index) * 0.13,
    })),
    bidOrders: [100, 200, 300, 400, 500].map((gap, index) => ({
      price: currentPrice - gap,
      quantity: [6234, 4891, 8123, 3456, 7789][index],
      changeRate: changeRate - (index + 1) * 0.14,
    })),
  };
}

const periodLabels: Record<ChartPeriod, string[]> = {
  '1m': ['09:00', '', '', '09:03', '', '', '09:06', '', '', '09:09', '', '', '09:12', '', '', '현재'],
  '5m': ['09:00', '', '', '09:15', '', '', '09:30', '', '', '09:45', '', '', '10:00', '', '', '현재'],
  '15m': ['09:00', '', '', '09:45', '', '', '10:30', '', '', '11:15', '', '', '12:00', '', '', '현재'],
  day: ['5/1', '', '', '5/8', '', '', '5/15', '', '', '5/22', '', '', '5/28', '', '', '오늘'],
  week: ['1주', '', '', '4주', '', '', '7주', '', '', '10주', '', '', '13주', '', '', '현재'],
  month: ['1월', '', '', '3월', '', '', '5월', '', '', '7월', '', '', '9월', '', '', '현재'],
};

const periodGapOffsets: Record<ChartPeriod, number> = {
  '1m': -180,
  '5m': -320,
  '15m': -520,
  day: 0,
  week: 850,
  month: 1350,
};

const periodVolumeScale: Record<ChartPeriod, number> = {
  '1m': 0.24,
  '5m': 0.36,
  '15m': 0.48,
  day: 1,
  week: 1.35,
  month: 1.8,
};

function createPeriodChartData(currentPrice: number, period: ChartPeriod) {
  const baseGaps = [-1200, -850, -650, -300, 150, -50, 520, 380, 840, 700, 1180, 1350, 980, 1460, 1280, 1720];
  const dates = periodLabels[period];
  const gapOffset = periodGapOffsets[period];
  const volumeScale = periodVolumeScale[period];

  return baseGaps.map((gap, index) => {
    const price = currentPrice + gap + gapOffset + (period === 'month' ? index * 24 : 0);

    return {
      date: dates[index],
      price,
      ma5: price - 280 + index * 12,
      ma20: price - 720 + index * 8,
      ma60: price - 1550 + index * 5,
      volume: Math.round(
        [510, 640, 570, 980, 520, 620, 590, 1120, 530, 620, 1180, 1160, 700, 910, 930, 1250][
          index
        ] * volumeScale,
      ),
      direction: index % 4 === 2 || index % 5 === 0 ? 'fall' : 'rise',
    } as const;
  });
}

function createChartData(currentPrice: number) {
  return {
    '1m': createPeriodChartData(currentPrice, '1m'),
    '5m': createPeriodChartData(currentPrice, '5m'),
    '15m': createPeriodChartData(currentPrice, '15m'),
    day: createPeriodChartData(currentPrice, 'day'),
    week: createPeriodChartData(currentPrice, 'week'),
    month: createPeriodChartData(currentPrice, 'month'),
  };
}

function createTradeTrendData(currentPrice: number) {
  return [
    { time: '10:00', todayValue: currentPrice - 820, previousValue: currentPrice - 1340 },
    { time: '12:00', todayValue: currentPrice - 360, previousValue: currentPrice - 760 },
    { time: '14:00', todayValue: currentPrice - 120, previousValue: currentPrice - 980 },
    { time: '16:00', todayValue: currentPrice + 280, previousValue: currentPrice - 420 },
    { time: '18:00', todayValue: currentPrice + 120, previousValue: currentPrice - 180 },
  ];
}

function createTradeHistoryData(currentPrice: number, changeAmount: number) {
  const rows = [
    ['10:32:06', 0, 4, 217.25, 'UP', 'DOWN'],
    ['10:32:05', 0, 5, 217.98, 'UP', 'DOWN'],
    ['10:32:03', -100, 1, 218.19, 'UP', 'DOWN'],
    ['10:32:02', 100, 1, 218.22, 'UP', 'UP'],
    ['10:32:00', -100, 16, 218.21, 'UP', 'DOWN'],
    ['10:32:00', 0, 1, 218.82, 'UP', 'DOWN'],
    ['10:31:57', 100, 1, 219.32, 'UP', 'UP'],
    ['10:31:53', 0, 2, 219.31, 'UP', 'DOWN'],
    ['10:31:53', 100, 1, 219.37, 'UP', 'UP'],
    ['10:31:51', -200, 12, 216.44, 'DOWN', 'DOWN'],
    ['10:31:48', -100, 7, 216.12, 'DOWN', 'DOWN'],
    ['10:31:45', 0, 20, 217.01, 'UP', 'UP'],
  ] as const;

  return rows.map(([tradeTime, priceGap, quantity, strength, direction, quantityDirection]) => ({
    tradeTime,
    price: currentPrice + priceGap,
    changeAmount: changeAmount + priceGap,
    quantity,
    strength,
    direction,
    quantityDirection,
  }));
}

export const stockMocks: StockMarketData[] = [
  {
    summary: {
      stockName: '삼성전자',
      stockCode: '005930',
      currentPrice: 75400,
      changeAmount: 1200,
      changeRate: 1.62,
      volume: '12.3M',
      openPrice: 74200,
      highPrice: 75900,
      lowPrice: 74100,
      previousClose: 74200,
    },
    orderBook: createOrderBook(75400, 1.62),
    chart: createChartData(75400),
    tradeTrend: createTradeTrendData(75400),
    tradeHistory: createTradeHistoryData(75400, 1200),
  },
  {
    summary: {
      stockName: '삼성SDI',
      stockCode: '006400',
      currentPrice: 384500,
      changeAmount: 6500,
      changeRate: 1.72,
      volume: '1.8M',
      openPrice: 377000,
      highPrice: 388000,
      lowPrice: 376500,
      previousClose: 378000,
    },
    orderBook: createOrderBook(384500, 1.72),
    chart: createChartData(384500),
    tradeTrend: createTradeTrendData(384500),
    tradeHistory: createTradeHistoryData(384500, 6500),
  },
  {
    summary: {
      stockName: '삼성바이오로직스',
      stockCode: '207940',
      currentPrice: 812000,
      changeAmount: 9000,
      changeRate: 1.12,
      volume: '0.7M',
      openPrice: 805000,
      highPrice: 817000,
      lowPrice: 801000,
      previousClose: 803000,
    },
    orderBook: createOrderBook(812000, 1.12),
    chart: createChartData(812000),
    tradeTrend: createTradeTrendData(812000),
    tradeHistory: createTradeHistoryData(812000, 9000),
  },
  {
    summary: {
      stockName: '삼성물산',
      stockCode: '028260',
      currentPrice: 146800,
      changeAmount: -1200,
      changeRate: -0.81,
      volume: '2.4M',
      openPrice: 148400,
      highPrice: 149200,
      lowPrice: 146100,
      previousClose: 148000,
    },
    orderBook: createOrderBook(146800, -0.81),
    chart: createChartData(146800),
    tradeTrend: createTradeTrendData(146800),
    tradeHistory: createTradeHistoryData(146800, -1200),
  },
  {
    summary: {
      stockName: '삼성전기',
      stockCode: '009150',
      currentPrice: 157300,
      changeAmount: 2300,
      changeRate: 1.48,
      volume: '3.1M',
      openPrice: 155000,
      highPrice: 158600,
      lowPrice: 154300,
      previousClose: 155000,
    },
    orderBook: createOrderBook(157300, 1.48),
    chart: createChartData(157300),
    tradeTrend: createTradeTrendData(157300),
    tradeHistory: createTradeHistoryData(157300, 2300),
  },
  {
    summary: {
      stockName: '삼성증권',
      stockCode: '016360',
      currentPrice: 48250,
      changeAmount: 450,
      changeRate: 0.94,
      volume: '1.2M',
      openPrice: 47800,
      highPrice: 48600,
      lowPrice: 47650,
      previousClose: 47800,
    },
    orderBook: createOrderBook(48250, 0.94),
    chart: createChartData(48250),
    tradeTrend: createTradeTrendData(48250),
    tradeHistory: createTradeHistoryData(48250, 450),
  },
  {
    summary: {
      stockName: 'SK하이닉스',
      stockCode: '000660',
      currentPrice: 182500,
      changeAmount: 5000,
      changeRate: 2.8,
      volume: '8.7M',
      openPrice: 178000,
      highPrice: 184000,
      lowPrice: 177500,
      previousClose: 177500,
    },
    orderBook: createOrderBook(182500, 2.8),
    chart: createChartData(182500),
    tradeTrend: createTradeTrendData(182500),
    tradeHistory: createTradeHistoryData(182500, 5000),
  },
  {
    summary: {
      stockName: 'NAVER',
      stockCode: '035420',
      currentPrice: 198000,
      changeAmount: -1000,
      changeRate: -0.5,
      volume: '2.1M',
      openPrice: 199500,
      highPrice: 201000,
      lowPrice: 197500,
      previousClose: 199000,
    },
    orderBook: createOrderBook(198000, -0.5),
    chart: createChartData(198000),
    tradeTrend: createTradeTrendData(198000),
    tradeHistory: createTradeHistoryData(198000, -1000),
  },
  {
    summary: {
      stockName: '현대차',
      stockCode: '005380',
      currentPrice: 215500,
      changeAmount: 1900,
      changeRate: 0.9,
      volume: '4.5M',
      openPrice: 213000,
      highPrice: 216500,
      lowPrice: 212500,
      previousClose: 213600,
    },
    orderBook: createOrderBook(215500, 0.9),
    chart: createChartData(215500),
    tradeTrend: createTradeTrendData(215500),
    tradeHistory: createTradeHistoryData(215500, 1900),
  },
  {
    summary: {
      stockName: '카카오',
      stockCode: '035720',
      currentPrice: 44350,
      changeAmount: -500,
      changeRate: -1.1,
      volume: '6.4M',
      openPrice: 44900,
      highPrice: 45100,
      lowPrice: 44100,
      previousClose: 44850,
    },
    orderBook: createOrderBook(44350, -1.1),
    chart: createChartData(44350),
    tradeTrend: createTradeTrendData(44350),
    tradeHistory: createTradeHistoryData(44350, -500),
  },
];

export const stockMock = stockMocks[0];
