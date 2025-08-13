
import React from 'react';
import type { HistoryEntry } from '../types';

interface HistoryTabProps {
    history: HistoryEntry[];
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ history }) => {
    if (history.length === 0) {
        return (
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">📜 解析履歴</h2>
                <div className="text-center py-12 px-6 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-4xl mb-4">🗂️</div>
                    <h3 className="text-lg font-semibold text-slate-700">AIによる解析履歴はまだありません</h3>
                    <p className="text-slate-500 mt-1">「入力項目」タブから図面を解析すると、ここに履歴が表示されます。</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">📜 解析履歴</h2>
            <div className="space-y-4">
                {history.map((entry) => (
                    <div key={entry.id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 transition-all hover:shadow-md">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-grow">
                                <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                                    entry.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {entry.status === 'success' ? '成功' : '失敗'}
                                </span>
                                <p className="mt-2 font-semibold text-slate-800 break-all">{entry.fileName}</p>
                            </div>
                            <span className="text-sm text-slate-500 flex-shrink-0">
                                {entry.timestamp.toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        {entry.prompt && (
                             <div className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-200">
                                <p><strong className="font-medium text-slate-700">追加指示:</strong> {entry.prompt}</p>
                            </div>
                        )}
                        <div className="mt-3 text-sm text-slate-700">
                             <p>{entry.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
