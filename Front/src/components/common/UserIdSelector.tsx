import React from 'react';
import { useUser } from '@/contexts/UserContext';

const UserIdSelector: React.FC = () => {
    const { userId, setUserId } = useUser();

    const handleUserIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newUserId = parseInt(event.target.value, 10);
        if (!isNaN(newUserId) && newUserId > 0) {
            setUserId(newUserId);
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">👤</span>
                    </div>
                    <div>
                        <h4 className="text-white font-medium">Debug: User ID Selector</h4>
                        <p className="text-xs text-gray-400">Change user ID for testing watchlist features</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <label htmlFor="userId" className="text-sm text-gray-400">
                        User ID:
                    </label>
                    <input
                        id="userId"
                        type="number"
                        value={userId}
                        onChange={handleUserIdChange}
                        className="input input-bordered input-sm w-20 bg-white/10 border-white/20 text-white"
                        min="1"
                        placeholder="1"
                    />
                </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
                Current User ID: <span className="font-mono text-purple-400">{userId}</span>
            </div>
        </div>
    );
};

export default UserIdSelector;
