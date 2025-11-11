import React, { useState, ReactNode } from 'react';

interface CardProps {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
    alwaysOpen?: boolean;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, defaultOpen = false, alwaysOpen = false, className = '' }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    if (alwaysOpen) {
        return (
            <div className={`bg-green-50 border border-green-200 rounded-lg shadow-sm ${className}`}>
                <div className="w-full flex justify-between items-center p-4 text-left rounded-t-lg">
                    <h3 className="text-lg font-bold text-green-800">{title}</h3>
                </div>
                <div className="border-t border-green-200 bg-white">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-green-50 border border-green-200 rounded-lg shadow-sm ${className}`}>
            <button
                className="w-full flex justify-between items-center p-4 text-left focus:outline-none hover:bg-green-100 transition-colors duration-200 rounded-t-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="text-lg font-bold text-green-800">{title}</h3>
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>
            {isOpen && (
                <div className="border-t border-green-200 bg-white">
                    {children}
                </div>
            )}
        </div>
    );
};