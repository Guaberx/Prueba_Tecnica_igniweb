import { useState, useCallback, useEffect } from 'react';
import {
    CoinSearchResults,
    CoinsHistoricalResponse,
    CoinsLatestResponse,
    UserSignupRequest,
    UserSignupResponse,
    WatchlistResponse,
    AddToWatchlistRequest,
    AddToWatchlistResponse
} from '@/models/api';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface UseApiReturn {
    signup: (userData: UserSignupRequest) => Promise<UserSignupResponse>;
    addToWatchlist: (coinIds: AddToWatchlistRequest) => Promise<AddToWatchlistResponse | null>;
    removeFromWatchlist: (coinIds: AddToWatchlistRequest) => Promise<AddToWatchlistResponse | null>;
    searchState: ApiState<CoinSearchResults>;
    rankState: ApiState<CoinSearchResults>;
    historicalState: ApiState<CoinsHistoricalResponse>;
    latestState: ApiState<CoinsLatestResponse>;
    watchlistState: ApiState<WatchlistResponse>;
}

export const useApi = (userId: number) => {
    const [searchState, setSearchState] = useState<ApiState<CoinSearchResults>>({
        data: null,
        loading: false,
        error: null,
    });

    const [rankState, setRankState] = useState<ApiState<CoinSearchResults>>({
        data: null,
        loading: false,
        error: null,
    });

    const [historicalState, setHistoricalState] = useState<ApiState<CoinsHistoricalResponse>>({
        data: null,
        loading: false,
        error: null,
    });

    const [latestState, setLatestState] = useState<ApiState<CoinsLatestResponse>>({
        data: null,
        loading: false,
        error: null,
    });

    const [watchlistState, setWatchlistState] = useState<ApiState<WatchlistResponse>>({
        data: null,
        loading: false,
        error: null,
    });

    const searchCoins = async (): Promise<CoinSearchResults> => {
        setSearchState({ data: null, loading: true, error: null });

        try {
            if (!watchlistState.data?.length) {
                setSearchState({ data: [], loading: false, error: null });
                return [];
            }
            const query = watchlistState.data.map(coin => coin.coin_id).join(',');
            const response = await fetch(`${API_BASE_URL}/coins?query=${encodeURIComponent(query)}`);
            const result = await response.json();
            setSearchState({ data: result, loading: false, error: null });
            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Search failed';
            setSearchState({ data: null, loading: false, error: message });
            throw error;
        }
    };

    const getRankedCoins = async (): Promise<CoinSearchResults> => {
        setRankState({ data: null, loading: true, error: null });

        try {
            const response = await fetch(`${API_BASE_URL}/coins/rank?start=0&limit=100`);
            const result = await response.json();
            setRankState({ data: result, loading: false, error: null });
            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load ranked coins';
            setRankState({ data: null, loading: false, error: message });
            throw error;
        }
    };

    const getHistoricalData = async (): Promise<CoinsHistoricalResponse> => {
        setHistoricalState({ data: null, loading: true, error: null });

        try {
            if (!watchlistState.data?.length) {
                setHistoricalState({ data: [], loading: false, error: null });
                return [];
            }
            const ids = watchlistState.data.map(coin => coin.coin_id).join(',');
            const response = await fetch(`${API_BASE_URL}/coins/historical?identifiers=${ids}`);
            const result = await response.json();
            setHistoricalState({ data: result, loading: false, error: null });
            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load historical data';
            setHistoricalState({ data: null, loading: false, error: message });
            throw error;
        }
    };

    const getLatestData = async (): Promise<CoinsLatestResponse | null> => {
        setLatestState({ data: null, loading: true, error: null });

        try {
            if (!watchlistState.data?.length) {
                setLatestState({ data: null, loading: false, error: null });
                return null;
            }
            const ids = watchlistState.data.map(coin => coin.coin_id).join(',');
            const response = await fetch(`${API_BASE_URL}/coins/latest?ids=${ids}`);
            const result: CoinsLatestResponse = (await response.json()).data;
            setLatestState({ data: result, loading: false, error: null });
            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load latest data';
            setLatestState({ data: null, loading: false, error: message });
            throw error;
        }
    };

    const getWatchlist = useCallback(async (): Promise<WatchlistResponse> => {
        setWatchlistState({ data: null, loading: true, error: null });

        try {
            const response = await fetch(`${API_BASE_URL}/watchlist/${userId}`);
            const result = await response.json();
            setWatchlistState({ data: result, loading: false, error: null });
            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load watchlist';
            setWatchlistState({ data: null, loading: false, error: message });
            throw error;
        }
    }, [userId]);

    const signup = useCallback(async (userData: UserSignupRequest): Promise<UserSignupResponse> => {
        try {
            const response = await fetch('/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            return await response.json();
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        }
    }, []);

    const addToWatchlist = useCallback(async (coinIds: AddToWatchlistRequest): Promise<AddToWatchlistResponse | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/watchlist/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(coinIds),
            });
            const result = await response.json();
            if (result.success) {
                // Refresh watchlist after adding
                getWatchlist();
            }
            return result;
        } catch (error) {
            console.error('Failed to add to watchlist:', error);
            throw error;
        }
    }, [userId, getWatchlist]);

    const removeFromWatchlist = useCallback(async (coinIds: AddToWatchlistRequest): Promise<AddToWatchlistResponse | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/watchlist/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(coinIds),
            });
            const result = await response.json();
            if (result.success) {
                // Refresh watchlist after removing
                getWatchlist();
            }
            return result;
        } catch (error) {
            console.error('Failed to remove from watchlist:', error);
            throw error;
        }
    }, [userId, getWatchlist]);

    // Auto-fetch data when dependencies change
    useEffect(() => {
        if (userId) {
            getWatchlist();
            getRankedCoins().catch(console.error);
        }
    }, [userId, getWatchlist]);

    useEffect(() => {
        if (watchlistState.data) {
            searchCoins().catch(console.error);
            getHistoricalData().catch(console.error);
        }
    }, [watchlistState.data]);

    return {
        signup,
        searchCoins,
        getLatestData,
        addToWatchlist,
        removeFromWatchlist,
        searchState,
        rankState,
        historicalState,
        latestState,
        watchlistState,
    };
};
