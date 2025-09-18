import React, { useState, useEffect, useCallback } from 'react';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { useApi } from '@/hooks/useApi';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Content from '@/components/layout/Content';

// Inner component that can use the user context
function AppContent() {
  const { userId } = useUser();
  const {
    signup,
    searchCoins,
    getLatestData,
    addToWatchlist,
    removeFromWatchlist,
    searchState,
    rankState,
    historicalState,
    latestState,
    watchlistState, } = useApi(userId);
  const [activeTab, setActiveTab] = useState('coin-selector');
  const [selectedCoins, setSelectedCoins] = useState([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <Navbar />
      </div>

      {/* Main Dashboard Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedCoins={selectedCoins}
        />

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                Crypto Dashboard
              </h1>
              <p className="text-gray-400">
                Monitor cryptocurrency prices and performance in real-time
              </p>
            </div>

            {/* Content */}
            <Content
              searchCoins={searchCoins}
              getLatestData={getLatestData}
              activeTab={activeTab}
              signup={signup}
              addToWatchlist={addToWatchlist}
              removeFromWatchlist={removeFromWatchlist}
              searchState={searchState}
              rankState={rankState}
              historicalState={historicalState}
              latestState={latestState}
              watchlistState={watchlistState}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
