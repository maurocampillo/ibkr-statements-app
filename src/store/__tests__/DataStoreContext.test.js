import { renderHook, act } from '@testing-library/react';

import { DataStoreProvider, useDataStore } from '../DataStoreContext.tsx';

// Mock data based on real IBKR statement structure
const mockIBKRData = {
  realizedUnrealizedPerformanceSummaryInBase: {
    sectionData: [
      {
        clientaccountid: 'U3350149',
        assetclass: 'STK',
        subcategory: 'COMMON',
        symbol: 'ADBE',
        description: 'ADOBE INC',
        conid: '265768',
        securityid: 'US00724F1012',
        realizedshorttermpnl: 0,
        realizedlongtermprofit: 0,
        totalrealizedpnl: 0,
        unrealizedprofit: 23.628848,
        unrealizedloss: -8578.995526,
        totalunrealizedpnl: -8555.366678,
        totalfifopnl: -8555.366678
      },
      {
        clientaccountid: 'U3350149',
        assetclass: 'STK',
        subcategory: 'COMMON',
        symbol: 'AMZN',
        description: 'AMAZON.COM INC',
        conid: '3691937',
        securityid: 'US0231351067',
        realizedshorttermpnl: 7239.61920043,
        realizedlongtermprofit: 0,
        totalrealizedpnl: 7238.391589,
        unrealizedprofit: 0,
        unrealizedloss: 0,
        totalunrealizedpnl: 0,
        totalfifopnl: 7238.391589
      }
    ]
  },
  statementOfFunds: {
    sectionData: [
      {
        clientaccountid: 'U3350149',
        currencyprimary: 'USD',
        assetclass: 'STK',
        subcategory: 'COMMON',
        symbol: 'NKE',
        description: 'NIKE INC -CL B',
        conid: '10291',
        securityid: 'US6541061031',
        reportdate: new Date('2025-01-02'),
        date: new Date('2025-01-02'),
        paydate: new Date('2025-01-02'),
        activitycode: 'DIV',
        activitydescription:
          'NKE(US6541061031) Cash Dividend USD 0.40 per Share (Ordinary Dividend)',
        amount: 184,
        balance: 16973.161743886
      },
      {
        clientaccountid: 'U3350149',
        currencyprimary: 'USD',
        assetclass: 'STK',
        subcategory: 'COMMON',
        symbol: 'DG',
        description: 'DOLLAR GENERAL CORP',
        conid: '70212228',
        securityid: 'US2566771059',
        reportdate: new Date('2025-01-07'),
        date: new Date('2025-01-07'),
        paydate: new Date('2025-01-21'),
        activitycode: 'DIV',
        activitydescription:
          'DG(US2566771059) Cash Dividend USD 0.59 per Share (Ordinary Dividend)',
        amount: 59,
        balance: 17032.161743886
      },
      {
        clientaccountid: 'U3350149',
        currencyprimary: 'USD',
        assetclass: 'STK',
        subcategory: 'COMMON',
        symbol: 'ADBE',
        description: 'ADOBE INC',
        conid: '265768',
        securityid: 'US00724F1012',
        reportdate: new Date('2025-01-03'),
        date: new Date('2025-01-03'),
        activitycode: 'BUY',
        activitydescription: 'Buy 1 ADOBE INC',
        tradeprice: 427.88,
        amount: -428.880035,
        balance: 16489.081708886
      }
    ]
  },
  tradesTradeDateBasis: {
    sectionData: [
      {
        clientaccountid: 'U3350149',
        currencyprimary: 'USD',
        assetclass: 'STK',
        subcategory: 'COMMON',
        symbol: 'ADBE',
        description: 'ADOBE INC',
        conid: '265768',
        securityid: 'US00724F1012',
        tradeid: '7097679126',
        reportdate: new Date('2025-01-03'),
        datetime: new Date('2025-01-03T11:08:24'),
        tradedate: new Date('2025-01-03'),
        transactiontype: 'ExchTrade',
        exchange: 'ISLAND',
        quantity: 1,
        tradeprice: 427.88,
        trademoney: 427.88,
        proceeds: -427.88,
        ibcommission: -1.000035,
        netcash: -428.880035,
        closeprice: 430.57,
        fifopnlrealized: 0,
        mtmpnl: 2.69,
        buysell: 'BUY'
      },
      {
        clientaccountid: 'U3350149',
        currencyprimary: 'USD',
        assetclass: 'STK',
        subcategory: 'COMMON',
        symbol: 'AMZN',
        description: 'AMAZON.COM INC',
        conid: '3691937',
        securityid: 'US0231351067',
        tradeid: '7200000000',
        reportdate: new Date('2025-02-15'),
        datetime: new Date('2025-02-15T10:30:00'),
        tradedate: new Date('2025-02-15'),
        transactiontype: 'ExchTrade',
        exchange: 'NASDAQ',
        quantity: -10,
        tradeprice: 180.5,
        trademoney: -1805.0,
        proceeds: 1805.0,
        ibcommission: -1.5,
        netcash: 1803.5,
        closeprice: 180.5,
        fifopnlrealized: 1200.0,
        mtmpnl: 0,
        buysell: 'SELL'
      }
    ]
  },
  cashReportTradeDateBasis: {
    sectionData: [
      {
        clientaccountid: 'U3350149',
        currencyprimary: 'BASE_SUMMARY',
        fxratetobase: 1,
        cash: 16710.286525286,
        securities: 150000.0,
        commodities: 0,
        total: 166710.286525286,
        brokerinterest: 24.12
      },
      {
        clientaccountid: 'U3350149',
        currencyprimary: 'USD',
        fxratetobase: 1,
        cash: 16710.286525286,
        securities: 150000.0,
        commodities: 0,
        total: 166710.286525286,
        brokerinterest: 24.12
      }
    ]
  },
  changeInDividendAccruals: {
    sectionData: [
      {
        clientaccountid: 'U3350149',
        currencyprimary: 'EUR',
        fxratetobase: 1.0246,
        assetclass: 'STK',
        subcategory: 'COMMON',
        symbol: 'REPe',
        description: 'REPSOL SA',
        conid: '30314140',
        securityid: 'ES0173516115',
        reportdate: new Date('2025-01-10'),
        date: new Date('2025-01-09'),
        exdate: new Date('2025-01-10'),
        paydate: new Date('2025-01-14'),
        quantity: 150,
        tax: 0,
        fee: 0,
        grossrate: 0.45,
        grossamount: 67.5,
        netamount: 67.5,
        code: 'Po'
      }
    ]
  }
};

// Test wrapper component
const TestWrapper = ({ children }) => <DataStoreProvider>{children}</DataStoreProvider>;

describe('DataStoreContext', () => {
  describe('DataStoreProvider', () => {
    it('should provide initial state', () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      expect(result.current.rawData).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdated).toBeNull();
      expect(typeof result.current.isDataLoaded).toBe('function');
    });

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useDataStore());
      }).toThrow('useDataStore must be used within a DataStoreProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('setRawData', () => {
    it('should set raw data and update state', () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.setRawData(mockIBKRData);
      });

      expect(result.current.rawData).toEqual(mockIBKRData);
      expect(result.current.isDataLoaded()).toBe(true);
      expect(result.current.lastUpdated).toBeInstanceOf(Date);
      expect(result.current.error).toBeNull();
    });
  });

  describe('clearData', () => {
    it('should clear all data and reset state', () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      // First set some data
      act(() => {
        result.current.setRawData(mockIBKRData);
      });

      expect(result.current.isDataLoaded()).toBe(true);

      // Then clear it
      act(() => {
        result.current.clearData();
      });

      expect(result.current.rawData).toBeNull();
      expect(result.current.isDataLoaded()).toBe(false);
      expect(result.current.lastUpdated).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('getDataSections', () => {
    it('should return empty array when no data', () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      expect(result.current.getDataSections()).toEqual([]);
    });

    it('should return section keys when data is loaded', () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.setRawData(mockIBKRData);
      });

      const sections = result.current.getDataSections();
      expect(sections).toContain('realizedUnrealizedPerformanceSummaryInBase');
      expect(sections).toContain('statementOfFunds');
      expect(sections).toContain('tradesTradeDateBasis');
      expect(sections).toContain('cashReportTradeDateBasis');
      expect(sections).toContain('changeInDividendAccruals');
    });
  });

  describe('getDividends', () => {
    beforeEach(() => {
      // Mock setTimeout to make async operations synchronous in tests
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throw error when no data is loaded', async () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      await expect(result.current.getDividends()).rejects.toThrow('No data loaded');
    });

    it('should return dividend data from statementOfFunds section', async () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.setRawData(mockIBKRData);
      });

      const promise = result.current.getDividends();

      // Fast-forward timers
      act(() => {
        jest.advanceTimersByTime(100);
      });

      const dividends = await promise;
      expect(dividends).toHaveLength(2); // NKE and DG dividends
      expect(dividends[0].symbol).toBe('NKE');
      expect(dividends[0].amount).toBe(184);
      expect(dividends[0].paydate).toBeInstanceOf(Date);
      expect(dividends[1].symbol).toBe('DG');
      expect(dividends[1].amount).toBe(59);
    });

    it('should filter dividends by symbol', async () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.setRawData(mockIBKRData);
      });

      const promise = result.current.getDividends({ symbols: ['NKE'] });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const dividends = await promise;
      expect(dividends).toHaveLength(1);
      expect(dividends[0].symbol).toBe('NKE');
    });

    it('should filter dividends by date range', async () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.setRawData(mockIBKRData);
      });

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const promise = result.current.getDividends({ startDate, endDate });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const dividends = await promise;
      expect(dividends).toHaveLength(2); // Both NKE and DG are in January 2025
      expect(dividends[0].paydate).toBeInstanceOf(Date);
      expect(dividends[0].paydate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
      expect(dividends[0].paydate.getTime()).toBeLessThanOrEqual(endDate.getTime());
    });
  });

  describe('getTrades', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throw error when no data is loaded', async () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      await expect(result.current.getTrades()).rejects.toThrow('No data loaded');
    });

    it('should return trade data from tradesTradeDateBasis section', async () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.setRawData(mockIBKRData);
      });

      const promise = result.current.getTrades();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const trades = await promise;
      expect(trades).toHaveLength(2);
      expect(trades[0].symbol).toBe('ADBE');
      expect(trades[0].buysell).toBe('BUY');
      expect(trades[1].symbol).toBe('AMZN');
      expect(trades[1].buysell).toBe('SELL');
    });

    it('should filter trades by symbol', async () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.setRawData(mockIBKRData);
      });

      const promise = result.current.getTrades({ symbols: ['ADBE'] });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const trades = await promise;
      expect(trades).toHaveLength(1);
      expect(trades[0].symbol).toBe('ADBE');
    });
  });

  describe('getRealizedGains', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return realized gains data', async () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.setRawData(mockIBKRData);
      });

      const promise = result.current.getRealizedGains();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const realizedGains = await promise;
      expect(realizedGains).toHaveLength(2);
      expect(realizedGains[0].symbol).toBe('ADBE');
      expect(realizedGains[1].symbol).toBe('AMZN');
      expect(realizedGains[1].totalrealizedpnl).toBe(7238.391589);
    });
  });

  describe('getCashReport', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return cash report data', async () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.setRawData(mockIBKRData);
      });

      const promise = result.current.getCashReport();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const cashReport = await promise;
      expect(cashReport).toHaveLength(2);
      expect(cashReport[0].currencyprimary).toBe('BASE_SUMMARY');
      expect(cashReport[0].brokerinterest).toBe(24.12);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should handle missing section gracefully', async () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      // Set data without statementOfFunds section
      const incompleteData = {
        realizedUnrealizedPerformanceSummaryInBase:
          mockIBKRData.realizedUnrealizedPerformanceSummaryInBase
      };

      act(() => {
        result.current.setRawData(incompleteData);
      });

      const promise = result.current.getDividends();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const dividends = await promise;
      expect(dividends).toEqual([]); // Should return empty array when no statementOfFunds
    });

    it('should set error state when operations fail', async () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      await expect(result.current.getDividends()).rejects.toThrow('No data loaded');
    });
  });

  describe('loading states', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should set loading state during async operations', async () => {
      const { result } = renderHook(() => useDataStore(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.setRawData(mockIBKRData);
      });

      // Start async operation and immediately check loading state
      let promise;
      act(() => {
        promise = result.current.getDividends();
      });

      // Complete the operation
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await promise;

      // Check loading state is false after operation
      expect(result.current.isLoading).toBe(false);
    });
  });
});
