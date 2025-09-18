// Component prop types

import { Coin, CoinData, CoinInfo } from './crypto';

export interface CoinSelectorProps {
    selectedCoins: string[];
    setSelectedCoins: React.Dispatch<React.SetStateAction<string[]>>;
}

export interface RealTimeDataProps {
    selectedCoins: string[];
}

export interface HistoricalGraphProps {
    selectedCoins: string[];
}

export interface ContentProps {
    activeTab: string;
    data: { year: number; count: number }[];
    selectedCoins: string[];
    setSelectedCoins: React.Dispatch<React.SetStateAction<string[]>>;
}

export interface NavbarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

// Internal component types
export interface FilteredCoinData extends CoinData {
    // Extended interface for processed coin data
}

export interface ChartDataPoint {
    timestamp: string;
    price: number;
    volume: number;
    marketCap: number;
}

// Constants and enums
export const FALLBACK_LOGO = "https://via.placeholder.com/32x32?text=?";

export enum TabType {
    COIN_SELECTOR = 'coin-selector',
    REAL_TIME_DATA = 'real-time-data',
    HISTORICAL_GRAPH = 'historical-graph'
}

export enum LoadingState {
    IDLE = 'idle',
    LOADING = 'loading',
    SUCCESS = 'success',
    ERROR = 'error'
}
