import React from 'react';

interface SummaryCardProps {
    title: string;
    value: string;
    icon: string;
    bgColor?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, bgColor = "bg-white" }) => {
    const isWeightCard = title === "総重量";

    return (
        <div className={`${bgColor} p-6 rounded-lg shadow-md border border-slate-200 flex items-center space-x-4`}>
            <div className="text-4xl">{icon}</div>
            <div>
                <p className={`text-sm font-medium ${isWeightCard ? "text-green-800" : "text-slate-500"}`}>
                    {title}
                </p>
                <p className={`text-lg font-bold ${isWeightCard ? "text-green-800" : "text-slate-900"}`}>
                    {value}
                </p>
            </div>
        </div>
    );
};
