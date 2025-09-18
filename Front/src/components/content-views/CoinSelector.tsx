import React, { useCallback, useState, useMemo } from "react";
import { CoinSearchResult } from "@/models/api";

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/32x32?text=?';

interface CoinSelectorProps {
    searchState: {
        data: CoinSearchResult[] | null;
        loading: boolean;
        error: string | null;
    };
    watchlistState: {
        data: CoinSearchResult[] | null;
        loading: boolean;
        error: string | null;
    };
    addToWatchlist: (coinIds: { coinIds: number[] }) => Promise<any>;
    removeFromWatchlist: (coinIds: { coinIds: number[] }) => Promise<any>;
    rankState?: {
        data: CoinSearchResult[] | null;
        loading: boolean;
        error: string | null;
    };
}

interface CoinCardProps {
    coin: CoinSearchResult;
    isInWatchlist: boolean;
    onToggle: (coinId: number, isInWatchlist: boolean) => void;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, isInWatchlist, onToggle }) => {
    const handleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        onToggle(coin.coin_id, isInWatchlist);
    }, [coin.coin_id, isInWatchlist, onToggle]);

    return (
        <div
            className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${isInWatchlist
                    ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
            onClick={handleClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <img
                        src={coin.logo}
                        alt={`${coin.name} logo`}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                            e.currentTarget.src = PLACEHOLDER_IMAGE;
                        }}
                    />
                    <div className="flex-1">
                        <h4 className="font-semibold text-white">{coin.name}</h4>
                        <p className="text-sm text-gray-400">{coin.symbol}</p>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="badge badge-xs badge-ghost text-xs">
                                Rank #{coin.rank}
                            </span>
                            {isInWatchlist && (
                                <span className="badge badge-xs badge-warning text-xs">
                                    ⭐ In Watchlist
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={isInWatchlist}
                    readOnly
                />
            </div>
        </div>
    );
};

const CoinSelector: React.FC<CoinSelectorProps> = ({
    searchState,
    watchlistState,
    addToWatchlist,
    removeFromWatchlist,
    rankState
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Followed coins from watchlistState.data
    const followedCoins = useMemo(() => {
        return watchlistState.data || [];
    }, [watchlistState.data]);

    // Popular coins to select from rankState.data, filtered by search
    const popularCoins = useMemo(() => {
        if (!rankState?.data) return [];
        if (!searchQuery.trim()) return rankState.data.slice(0, 20);

        const query = searchQuery.toLowerCase();
        return rankState.data
            .filter(coin =>
                coin.name.toLowerCase().includes(query) ||
                coin.symbol.toLowerCase().includes(query) ||
                coin.slug?.toLowerCase().includes(query)
            )
            .slice(0, 20);
    }, [rankState?.data, searchQuery]);

    // Handle coin toggle
    const handleCoinToggle = useCallback(async (coinId: number, isInWatchlist: boolean) => {
        try {
            if (isInWatchlist) {
                await removeFromWatchlist({ coinIds: [coinId] });
            } else {
                await addToWatchlist({ coinIds: [coinId] });
            }
        } catch (error) {
            console.error('Failed to toggle coin:', error);
        }
    }, [addToWatchlist, removeFromWatchlist]);

    // Check if coin is in watchlist
    const isInWatchlist = useCallback((coinId: number): boolean => {
        return followedCoins.some(coin => coin.coin_id === coinId);
    }, [followedCoins]);

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Select Cryptocurrencies</h3>
                <div className="badge badge-primary badge-lg">
                    {followedCoins.length} followed
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search cryptocurrencies by name, symbol, or slug..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        className="input input-bordered w-full bg-white/10 border-white/20 text-white placeholder-gray-400 pr-10"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {searchState.loading ? (
                            <span className="loading loading-spinner loading-sm text-purple-400"></span>
                        ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        )}
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    Search for specific coins or browse the top ranked cryptocurrencies
                </p>
            </div>

            {/* Current Watchlist */}
            {followedCoins.length > 0 && (
                <>
                    <h4 className="text-white font-medium mb-4">Your Watchlist ({followedCoins.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {followedCoins.map((coin) => (
                            <CoinCard
                                key={coin.coin_id}
                                coin={coin}
                                isInWatchlist={true}
                                onToggle={handleCoinToggle}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Available Popular Coins */}
            <div className="bg-gradient-to-r from-slate-600/20 to-gray-600/20 rounded-lg p-4 border border-gray-500/30 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{followedCoins.length}</div>
                        <div className="text-xs text-gray-400">Following</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{popularCoins.length}</div>
                        <div className="text-xs text-gray-400">Available</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{followedCoins.length}</div>
                        <div className="text-xs text-gray-400">Total</div>
                    </div>
                </div>
                <p className="text-sm text-gray-400 text-center">
                    Browse popular cryptocurrencies and add them to your watchlist
                </p>
            </div>

            {/* Popular Coins Grid */}
            <div>
                <h4 className="text-white font-medium mb-4">
                    Popular Cryptocurrencies ({popularCoins.length > 20 ? 'Top 20' : popularCoins.length})
                </h4>

                {rankState?.loading && popularCoins.length === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="p-4 rounded-lg border border-white/10 bg-white/5 animate-pulse">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-600 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-600 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {popularCoins.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {popularCoins.map((coin) => (
                            <CoinCard
                                key={coin.coin_id}
                                coin={coin}
                                isInWatchlist={isInWatchlist(coin.coin_id)}
                                onToggle={handleCoinToggle}
                            />
                        ))}
                    </div>
                ) : (
                    !rankState?.loading && (
                        <div className="text-center text-gray-400 py-8">
                            No cryptocurrencies found matching your search.
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

CoinSelector.displayName = 'CoinSelector';

export default CoinSelector;
