import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: number;
    username: string;
    email: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    userId: number;
    setUserId: (id: number) => void;
    isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userId, setUserId] = useState<number>(1); // Default user ID for debugging

    // Load user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedUserId = localStorage.getItem('userId');

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Failed to parse saved user:', error);
            }
        }

        if (savedUserId) {
            try {
                setUserId(parseInt(savedUserId, 10));
            } catch (error) {
                console.error('Failed to parse saved userId:', error);
            }
        }
    }, []);

    // Save user to localStorage when it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    // Save userId to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('userId', userId.toString());
    }, [userId]);

    const value: UserContextType = {
        user,
        setUser,
        userId,
        setUserId,
        isAuthenticated: !!user,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export default UserContext;
