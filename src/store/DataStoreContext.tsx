import React, { createContext, useContext, useState, ReactNode } from 'react';

import {
  IBKRSectionsData,
  DividendData,
  TradeData,
  RealizedGainsData,
  PositionData,
  CashReportData,
  DataFilter,
  DataStoreState
} from '../types/ibkr';

// DataStore Interface
interface DataStoreContextType {
  // State
  isLoading: boolean;
  error: string | null;
  isDataLoaded: boolean;
  lastUpdated: Date | null;

  // Data Management
  setRawData: (data: IBKRSectionsData) => void;
  clearData: () => void;

  // Data Retrieval Methods
  getDividends: (filter?: DataFilter) => Promise<DividendData[]>;
  getTrades: (filter?: DataFilter) => Promise<TradeData[]>;
  getRealizedGains: (filter?: DataFilter) => Promise<RealizedGainsData[]>;
  getPositions: (filter?: DataFilter) => Promise<PositionData[]>;
  getCashReport: () => Promise<CashReportData[]>;

  // Utility Methods
  getDataSections: () => string[];
  getSectionData: (sectionName: string) => Promise<any[]>;
}

// Create Context
const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined);

// Provider Props
interface DataStoreProviderProps {
  children: ReactNode;
}

// DataStore Provider Component
export const DataStoreProvider: React.FC<DataStoreProviderProps> = ({ children }) => {
  const [state, setState] = useState<DataStoreState>({
    rawData: null,
    isLoading: false,
    error: null,
    lastUpdated: null
  });

  // Helper function to update state
  const updateState = (updates: Partial<DataStoreState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Set raw data from parser
  const setRawData = (data: IBKRSectionsData) => {
    updateState({
      rawData: data,
      error: null,
      lastUpdated: new Date()
    });
  };

  // Clear all data
  const clearData = () => {
    updateState({
      rawData: null,
      error: null,
      lastUpdated: null
    });
  };

  // Get dividends data
  const getDividends = async (filter?: DataFilter): Promise<DividendData[]> => {
    if (!state.rawData) {
      throw new Error('No data loaded');
    }

    try {
      updateState({ isLoading: true, error: null });

      // Get dividend data from statement of funds
      const statementOfFunds = state.rawData.statementOfFunds?.sectionData || [];
      const dividendData = statementOfFunds.filter(
        item => item.activitycode === 'DIV' || item.activitycode === 'PIL'
      );

      // Apply filters if provided
      let filteredData = dividendData;

      if (filter?.symbols && filter.symbols.length > 0) {
        filteredData = filteredData.filter(item => filter.symbols!.includes(item.symbol));
      }

      if (filter?.startDate || filter?.endDate) {
        filteredData = filteredData.filter(item => {
          const payDate = item.paydate;
          if (!payDate || !(payDate instanceof Date)) {
            return true;
          }

          if (filter.startDate && payDate < filter.startDate) {
            return false;
          }
          if (filter.endDate && payDate > filter.endDate) {
            return false;
          }
          return true;
        });
      }

      updateState({ isLoading: false });
      return filteredData as DividendData[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get dividends';
      updateState({ isLoading: false, error: errorMessage });
      throw error;
    }
  };

  // Get trades data
  const getTrades = async (filter?: DataFilter): Promise<TradeData[]> => {
    if (!state.rawData) {
      throw new Error('No data loaded');
    }

    try {
      updateState({ isLoading: true, error: null });

      const tradesData = state.rawData.tradesTradeDateBasis?.sectionData || [];

      // Apply filters
      let filteredData = tradesData;

      if (filter?.symbols && filter.symbols.length > 0) {
        filteredData = filteredData.filter(item => filter.symbols!.includes(item.symbol));
      }

      if (filter?.assetClasses && filter.assetClasses.length > 0) {
        filteredData = filteredData.filter(item => filter.assetClasses!.includes(item.assetclass));
      }

      updateState({ isLoading: false });
      return filteredData as TradeData[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get trades';
      updateState({ isLoading: false, error: errorMessage });
      throw error;
    }
  };

  // Get realized gains data
  const getRealizedGains = async (filter?: DataFilter): Promise<RealizedGainsData[]> => {
    if (!state.rawData) {
      throw new Error('No data loaded');
    }

    try {
      updateState({ isLoading: true, error: null });

      const realizedGainsData =
        state.rawData.realizedUnrealizedPerformanceSummaryInBase?.sectionData || [];

      // Apply filters
      let filteredData = realizedGainsData;

      if (filter?.symbols && filter.symbols.length > 0) {
        filteredData = filteredData.filter(item => filter.symbols!.includes(item.symbol));
      }

      if (filter?.assetClasses && filter.assetClasses.length > 0) {
        filteredData = filteredData.filter(item => filter.assetClasses!.includes(item.assetclass));
      }

      updateState({ isLoading: false });
      return filteredData as RealizedGainsData[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get realized gains';
      updateState({ isLoading: false, error: errorMessage });
      throw error;
    }
  };

  // Get positions data
  const getPositions = async (filter?: DataFilter): Promise<PositionData[]> => {
    if (!state.rawData) {
      throw new Error('No data loaded');
    }

    try {
      updateState({ isLoading: true, error: null });

      const positionsData = state.rawData.positionTradeDateBasis?.sectionData || [];

      // Apply filters
      let filteredData = positionsData;

      if (filter?.symbols && filter.symbols.length > 0) {
        filteredData = filteredData.filter(item => filter.symbols!.includes(item.symbol));
      }

      updateState({ isLoading: false });
      return filteredData as PositionData[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get positions';
      updateState({ isLoading: false, error: errorMessage });
      throw error;
    }
  };

  // Get cash report data
  const getCashReport = async (): Promise<CashReportData[]> => {
    if (!state.rawData) {
      throw new Error('No data loaded');
    }

    try {
      updateState({ isLoading: true, error: null });

      const cashReportData = state.rawData.cashReportTradeDateBasis?.sectionData || [];

      updateState({ isLoading: false });
      return cashReportData as CashReportData[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get cash report';
      updateState({ isLoading: false, error: errorMessage });
      throw error;
    }
  };

  // Get available data sections
  const getDataSections = (): string[] => {
    if (!state.rawData) {
      return [];
    }
    return Object.keys(state.rawData);
  };

  // Get raw section data
  const getSectionData = async (sectionName: string): Promise<any[]> => {
    if (!state.rawData) {
      throw new Error('No data loaded');
    }

    const section = state.rawData[sectionName];
    if (!section) {
      throw new Error(`Section '${sectionName}' not found`);
    }

    return section.sectionData;
  };

  // Context value
  const contextValue: DataStoreContextType = {
    // State
    rawData: state.rawData,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,

    // Data Management
    setRawData,
    clearData,
    isDataLoaded: () => !!state.rawData,

    // Data Retrieval
    getDividends,
    getTrades,
    getRealizedGains,
    getPositions,
    getCashReport,

    // Utilities
    getDataSections,
    getSectionData
  };

  return <DataStoreContext.Provider value={contextValue}>{children}</DataStoreContext.Provider>;
};

// Custom hook to use DataStore
export const useDataStore = (): DataStoreContextType => {
  const context = useContext(DataStoreContext);
  if (!context) {
    throw new Error('useDataStore must be used within a DataStoreProvider');
  }
  return context;
};
