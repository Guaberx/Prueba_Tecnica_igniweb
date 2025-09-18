import React from "react";

interface ErrorMessageProps {
    title?: string;
    message: string;
    icon?: string;
    className?: string;
}

function ErrorMessage({
    title = "Error Loading Data",
    message,
    icon = "⚠️",
    className = ""
}: ErrorMessageProps) {
    return (
        <div className={`bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20 p-6 ${className}`}>
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <span className="text-red-400">{icon}</span>
                </div>
                <div>
                    <h3 className="text-red-400 font-semibold">{title}</h3>
                    <p className="text-gray-400 text-sm">{message}</p>
                </div>
            </div>
        </div>
    );
}

export default ErrorMessage;
