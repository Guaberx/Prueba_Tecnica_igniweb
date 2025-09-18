import React from "react";
import RealTimeDataView from "@/components/content-views/RealTimeData";
import { ApiState } from "@/hooks/useApi";
import { CoinSearchResult, TabType } from "@/models";
import HistoricalGraph from "../content-views/HistoricalGraph";
import CoinSelector from "../content-views/CoinSelector";

interface ContentProps {
    activeTab: TabType | string;
    getLatestData: () => Promise<ApiState<any> | null>;
    watchlistState: ApiState<CoinSearchResult[]>;
    addToWatchlist: (coinIds: { coinIds: number[] }) => Promise<any>;
    removeFromWatchlist: (coinIds: { coinIds: number[] }) => Promise<any>;
    searchState: ApiState<CoinSearchResult[]>;
    rankState: ApiState<CoinSearchResult[]>;
    historicalState: ApiState<any>;
    latestState: ApiState<any>;
}

function Content({
    activeTab,
    getLatestData,
    watchlistState,
    addToWatchlist,
    removeFromWatchlist,
    searchState,
    rankState,
    historicalState,
    latestState,
}: ContentProps) {
    const renderContent = () => {
        switch (activeTab) {
            case 'coin-selector':
                return (
                    <CoinSelector
                        searchState={searchState}
                        watchlistState={watchlistState}
                        addToWatchlist={addToWatchlist}
                        removeFromWatchlist={removeFromWatchlist}
                        rankState={rankState}
                    />
                );
            case 'real-time-data':
                return <RealTimeDataView getLatestData={getLatestData} latestState={latestState} />
            case 'historical-graph':
                return <HistoricalGraph historicalState={historicalState} />;
            default:
                return (
                    <h1>404 - Page Not Found</h1>
                );
        }
    };

    return (
        <div className="w-full">
            {renderContent()}

        </div>
    );
}

export default Content;
