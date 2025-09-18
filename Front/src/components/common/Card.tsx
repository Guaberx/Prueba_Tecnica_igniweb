import React from "react";

interface CardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

function Card({ title, children, className = "" }: CardProps) {
    return (
        <div className={`bg-white/5 rounded-xl p-4 ${className}`}>
            <h3 className="text-white font-semibold mb-3">{title}</h3>
            {children}
        </div>
    );
}

export default Card;
