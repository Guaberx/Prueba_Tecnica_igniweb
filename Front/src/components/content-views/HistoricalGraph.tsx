import { ApiState } from '@/hooks/useApi';
import { CoinsHistoricalResponse, CoinSearchResult } from '@/models';
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Chart, ChartDataset, registerables } from 'chart.js';

Chart.register(...registerables);

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/32x32?text=?';

interface HistoricalGraphProps {
    historicalState: ApiState<CoinsHistoricalResponse>;
}

interface CoinCardProps {
    coin: CoinSearchResult;
    isSelected: boolean;
    onToggle: (coinId: number) => void;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, isSelected, onToggle }) => {
    const handleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        onToggle(coin.coin_id);
    }, [coin.coin_id, onToggle]);

    return (
        <div
            className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                isSelected
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
                            {isSelected && (
                                <span className="badge badge-xs badge-success text-xs">
                                    📈 In Chart
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={isSelected}
                    readOnly
                />
            </div>
        </div>
    );
};

const HistoricalGraph: React.FC<HistoricalGraphProps> = ({ historicalState }) => {
    const historicalData = historicalState?.data || [];
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);
    const [selectedCoins, setSelectedCoins] = useState<number[]>([]);

    // Get unique coins from historical data
    const uniqueCoins = useMemo(() => {
        const coins: CoinSearchResult[] = historicalData.map(hd => hd.coin);
        return coins.filter((coin, index, self) =>
            index === self.findIndex(c => c.coin_id === coin.coin_id)
        );
    }, [historicalData]);

    // Default: select all coins
    useEffect(() => {
        setSelectedCoins(uniqueCoins.map(c => c.coin_id));
    }, [uniqueCoins]);

    const labels = useMemo(() => {
        if (!historicalData.length || !historicalData[0].quotes) return [];
        return historicalData[0].quotes.map(q =>
            new Date(q.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        );
    }, [historicalData]);

    const datasets: ChartDataset<'line'>[] = useMemo(
        () =>
            historicalData
                .filter(c => selectedCoins.includes(c.coin_id))
                .map((c, idx) => {
                    const color = `hsl(${(idx * 70) % 360}, 70%, 60%)`;
                    return {
                        label: c.coin.name,
                        data: c.quotes.map(q => q.price),
                        borderColor: color,
                        backgroundColor: `${color}33`,
                        tension: 0.4,
                        fill: true
                    };
                }),
        [historicalData, selectedCoins]
    );

    useEffect(() => {
        if (!canvasRef.current || !datasets.length) return;

        chartRef.current?.destroy();

        chartRef.current = new Chart(canvasRef.current, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#fff' } } },
                scales: {
                    x: { ticks: { color: '#ccc' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                    y: {
                        ticks: { color: '#ccc', callback: v => `$${v}` },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });

        return () => chartRef.current?.destroy();
    }, [datasets, labels]);

    const toggleCoin = useCallback((id: number) =>
        setSelectedCoins(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        ), []);

    if (historicalState?.loading) {
        return (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="text-center text-gray-400 py-8">Loading historical data...</div>
            </div>
        );
    }

    if (historicalState?.error) {
        return (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="text-center text-red-400 py-8">Error: {historicalState.error}</div>
            </div>
        );
    }

    if (!uniqueCoins.length) {
        return (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="text-center text-gray-400 py-8">No historical data available</div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Historical Price Graph</h3>
                <div className="badge badge-primary badge-lg">
                    {selectedCoins.length} selected
                </div>
            </div>

            {/* Coin Selection Grid */}
            <div className="mb-8">
                <h4 className="text-white font-medium mb-4">
                    Available Coins ({uniqueCoins.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {uniqueCoins.map((coin) => (
                        <CoinCard
                            key={coin.coin_id}
                            coin={coin}
                            isSelected={selectedCoins.includes(coin.coin_id)}
                            onToggle={toggleCoin}
                        />
                    ))}
                </div>
            </div>

            {/* Chart Section */}
            <div className="mt-8">
                <h4 className="text-white font-medium mb-4">
                    Price History Chart ({datasets.length} series)
                </h4>
                <div className="bg-black/20 rounded-lg p-4">
                    {datasets.length > 0 ? (
                        <canvas ref={canvasRef} className="w-full"></canvas>
                    ) : (
                        <div className="text-center text-gray-400 py-8">
                            No coins selected for chart
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoricalGraph;
