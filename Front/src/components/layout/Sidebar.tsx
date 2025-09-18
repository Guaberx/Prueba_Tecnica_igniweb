import React from "react";
import UserIdSelector from "@/components/common/UserIdSelector";
import Card from "@/components/common/Card";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

function Sidebar({
    activeTab,
    setActiveTab,

}: SidebarProps) {
    return (
        <div className="w-80 bg-black/20 backdrop-blur-sm border-r border-white/10 p-6">
            <div className="space-y-6">
                {/* User ID Selector for Debugging */}
                <UserIdSelector />

                {/* Quick Actions */}
                <Card title="Quick Actions">
                    <div className="space-y-2">
                        <button
                            onClick={() => setActiveTab('coin-selector')}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                activeTab === 'coin-selector'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-300 hover:bg-white/10'
                            }`}
                        >
                            📊 Coin Selector
                        </button>
                        <button
                            onClick={() => setActiveTab('real-time-data')}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                activeTab === 'real-time-data'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-300 hover:bg-white/10'
                            }`}
                        >
                            📈 Real-time Data
                        </button>
                        <button
                            onClick={() => setActiveTab('historical-graph')}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                activeTab === 'historical-graph'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-300 hover:bg-white/10'
                            }`}
                        >
                            📉 Historical Graph
                        </button>
                    </div>
                </Card>

                {/* Market Status */}
                {/* <Card title="Market Status">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-sm">Market Open</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-2">
                        Last updated: {new Date().toLocaleTimeString()}
                    </p>
                </Card> */}
            </div>
        </div>
    );
}

export default Sidebar;
