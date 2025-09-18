import React, { useState, useEffect } from "react";

function Navbar() {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="navbar px-6 py-4">
            <div className="navbar-start">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">₿</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">CryptoTracker</h1>
                        <p className="text-xs text-gray-400">Professional Dashboard</p>
                    </div>
                </div>
            </div>

            <div className="navbar-end">
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-sm text-white font-medium">
                            {currentTime.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                            {currentTime.toLocaleTimeString()}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">U</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;
