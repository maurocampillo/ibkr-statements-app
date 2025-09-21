// IBKR Data Types
export interface IBKRSection {
  sectionName: string;
  sectionData: Record<string, any>[];
}

export interface IBKRSectionsData {
  realizedUnrealizedPerformanceSummaryInBase?: IBKRSection;
  cashReportTradeDateBasis?: IBKRSection;
  statementOfFunds?: IBKRSection;
  positionTradeDateBasis?: IBKRSection;
  netStockPositionSummary?: IBKRSection;
  tradesTradeDateBasis?: IBKRSection;
  incomingOutgoingTradeTransfersTradeDateBasis?: IBKRSection;
  changeInDividendAccruals?: IBKRSection;
  openDividendAccruals?: IBKRSection;
  [key: string]: IBKRSection | undefined;
}

// Processed Data Types
export interface DividendData {
  symbol: string;
  description: string;
  exdate?: Date;
  paydate?: Date;
  grossamount: number;
  netamount: number;
  tax?: number;
  fee?: number;
  activitycode: string;
  [key: string]: any;
}

export interface TradeData {
  symbol: string;
  description: string;
  tradedate?: Date;
  settledate?: Date;
  quantity: number;
  price: number;
  amount: number;
  assetclass: string;
  [key: string]: any;
}

export interface RealizedGainsData {
  symbol: string;
  description: string;
  assetclass: string;
  totalrealizedpnl: number;
  totalunrealizedpnl: number;
  totalfifopnl: number;
  [key: string]: any;
}

export interface PositionData {
  symbol: string;
  description: string;
  assetclass: string;
  quantity: number;
  marketvalue: number;
  averagecost: number;
  [key: string]: any;
}

export interface CashReportData {
  currency: string;
  total: number;
  securities: number;
  futures: number;
  [key: string]: any;
}

// Filter interfaces
export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface SymbolFilter {
  symbols?: string[];
}

export interface AssetClassFilter {
  assetClasses?: string[];
}

export type DataFilter = DateRangeFilter & SymbolFilter & AssetClassFilter;

// DataStore State
export interface DataStoreState {
  rawData: IBKRSectionsData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
