import React from "react";

interface LoadingSpinnerProps {
    size?: "xs" | "sm" | "md" | "lg";
    color?: string;
    message?: string;
    className?: string;
}

function LoadingSpinner({
    size = "md",
    color = "text-purple-500",
    message,
    className = ""
}: LoadingSpinnerProps) {
    const sizeClasses = {
        xs: "loading-xs",
        sm: "loading-sm",
        md: "loading-md",
        lg: "loading-lg"
    };

    return (
        <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
            <span className={`loading loading-spinner ${sizeClasses[size]} ${color}`} />
            {message && <p className="text-gray-400">{message}</p>}
        </div>
    );
}

export default LoadingSpinner;
