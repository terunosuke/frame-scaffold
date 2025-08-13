import React from 'react';

interface AlertProps {
    type: 'success' | 'warning' | 'error' | 'info';
    message: React.ReactNode; // ← ここを修正
}

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
    const baseClasses = "text-xs font-semibold p-1.5 rounded-md flex items-center";
    const typeClasses = {
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
    };
    const icons = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️'
    }

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            <span className="mr-1.5">{icons[type]}</span>
            <span>{message}</span> {/* ← JSXでもOKになる */}
        </div>
    );
};
