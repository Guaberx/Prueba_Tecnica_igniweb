import React, { useEffect, useMemo } from "react";
import { LatestQuoteData } from "@/models/api";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import EmptyState from "@/components/common/EmptyState";


interface RealTimeDataProps {
    getLatestData: () => Promise<any>;
    latestState: {
        data: Record<string, any> | null;
        loading: boolean;
        error: string | null;
    };
}

interface CoinRowProps {
    coin: any;
}

const RealTimeDataRow: React.FC<CoinRowProps> = ({ coin }) => {
    const usd = coin.quote?.USD;

    return (
        <tr
            key={coin.id}
            className="border-b border-white/5 hover:bg-white/5 transition-colors group"
            title={`Rank #${coin.cmc_rank} - ${coin.name}`}
        >
            <td>
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {coin.symbol?.charAt(0) || '?'}
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <div className="text-white font-medium">
                                {typeof coin.name === 'string' ? coin.name : 'Unknown'}
                            </div>
                            <span className="badge badge-xs badge-outline text-xs">
                                Rank #{typeof coin.cmc_rank === 'number' ? coin.cmc_rank : 'N/A'}
                            </span>
                        </div>
                        <div className="text-gray-400 text-sm">
                            {typeof coin.symbol === 'string' ? coin.symbol : 'N/A'}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                            {Array.isArray(coin.tags) && coin.tags.length > 0 && (
                                <span className="badge badge-xs badge-ghost text-xs">
                                    {typeof coin.tags[0] === 'string' ? coin.tags[0] : 'Tag'}
                                </span>
                            )}
                            {coin.date_added && (
                                <span className="text-xs text-gray-500">
                                    {new Date(coin.date_added).getFullYear()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </td>
            <td className="text-white font-mono">
                ${usd?.price?.toFixed(2) || 'N/A'}
            </td>
            <td>
                <div className="flex items-center space-x-2">
                    <span className={`font-medium ${usd?.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {usd?.percent_change_24h >= 0 ? '↗' : '↘'}
                        {usd?.percent_change_24h?.toFixed(2) || 'N/A'}%
                    </span>
                </div>
            </td>
            <td className="text-gray-300">
                ${usd?.market_cap?.toLocaleString() || 'N/A'}
            </td>
        </tr>
    );
};

interface RealTimeDataTableProps {
    latestData: any[];
}

const RealTimeDataTable: React.FC<RealTimeDataTableProps> = ({ latestData }) => (
    <div className="overflow-x-auto">
        <table className="table w-full">
            <thead>
                <tr className="border-b border-white/10">
                    <th className="text-white font-semibold">Cryptocurrency</th>
                    <th className="text-white font-semibold">Price (USD)</th>
                    <th className="text-white font-semibold">24h Change</th>
                    <th className="text-white font-semibold">Market Cap</th>
                </tr>
            </thead>
            <tbody>
                {latestData.map((coin) => (
                    <RealTimeDataRow key={coin.id} coin={coin} />
                ))}
            </tbody>
        </table>
    </div>
);

const RealTimeData: React.FC<RealTimeDataProps> = ({ getLatestData, latestState }) => {
    const { data, loading, error } = latestState;
    useEffect(() => {
        // Call immediately on mount
        getLatestData().catch(console.error);

        // Set up interval to call every 60 seconds
        const interval = setInterval(() => {
            getLatestData().catch(console.error);
        }, 30_000); // 60,000 ms = 1 minute

        // Clean up on unmount
        return () => clearInterval(interval);
    }, []);

    const latestData = useMemo(() => {
        if (!data) return [];
        return Object.values(data);
    }, [data]);

    if (loading) return <LoadingSpinner size="lg" message="Loading real-time data..." />;
    if (error) return <ErrorMessage message={error} />;
    if (latestData.length === 0) return (
        <EmptyState
            title="No real-time data available"
            message="Select coins to view real-time data"
        />
    );

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Real-time Data</h3>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">Live</span>
                </div>
            </div>
            <RealTimeDataTable latestData={latestData} />
        </div>
    );
};

RealTimeData.displayName = 'RealTimeData';
export default RealTimeData;
