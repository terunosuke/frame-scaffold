import React from 'react';
import type { MaterialItem } from '../types';
import { SPEC_MAP } from '../constants';

interface ResultTableProps {
    materials: MaterialItem[];
    totalWeight: number;
}

export const ResultTable: React.FC<ResultTableProps> = ({ materials, totalWeight }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            部材名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            規格
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            数量
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            単位重量（kg）
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            合計重量（kg）
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {materials.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {SPEC_MAP[item.name] || ""}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {item.unitWeight.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {item.totalWeight.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    {/* 総重量行 */}
                    <tr className="bg-green-50 border-t-2 border-green-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-800">
                            🟦 総重量
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            -
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            -
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            -
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-green-800">
                            {totalWeight.toFixed(2)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};