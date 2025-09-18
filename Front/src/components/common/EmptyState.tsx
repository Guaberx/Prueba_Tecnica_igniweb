import React from "react";

interface EmptyStateProps {
    icon?: string;
    title: string;
    message: string;
    className?: string;
}

function EmptyState({
    icon = "📊",
    title,
    message,
    className = ""
}: EmptyStateProps) {
    return (
        <div className={`bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 ${className}`}>
            <div className="flex flex-col items-center justify-center space-y-4">
                <span className="text-4xl">{icon}</span>
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                    <p className="text-gray-400">{message}</p>
                </div>
            </div>
        </div>
    );
}

export default EmptyState;
