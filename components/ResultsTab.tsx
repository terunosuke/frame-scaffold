import React, { useState } from 'react';
import type { ScaffoldingConfig, CalculationResults, MaterialItem } from '../types';
import { ResultTable } from './ResultTable';
import { SummaryCard } from './SummaryCard';

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { SPEC_MAP } from "../constants"; // エクセルセット

interface ResultsTabProps {
    config: ScaffoldingConfig;
    results: CalculationResults;
}

export const ResultsTab: React.FC<ResultsTabProps> = ({ config, results }) => {
    const [useSplit, setUseSplit] = useState(false);
    const [selectedSplit, setSelectedSplit] = useState<string>(results.splitOptions[0] || '');

    const downloadCSV = () => {
        const headers = ["部材名", "数量", "単位重量（kg）", "合計重量（kg）"];
        let csvContent = headers.join(",") + "\n";
    
        const materialsWithTotal = [...results.materials];
        materialsWithTotal.push({ name: '🟦 総重量', quantity: 0, unitWeight: 0, totalWeight: results.totalWeight });
    
        materialsWithTotal.forEach((item: MaterialItem) => {
            const row = [
                `"${item.name}"`,
                item.name === '🟦 総重量' ? '' : item.quantity,
                item.name === '🟦 総重量' ? '' : item.unitWeight.toFixed(2),
                item.totalWeight.toFixed(2)
            ].join(",");
            csvContent += row + "\n";
        });
    
        if (config.memo) {
            csvContent += "\n";
            csvContent += '"📝フリーメモ",,,\n';
            csvContent += `"${config.memo.replace(/"/g, '""')}",,,\n`;
        }
    
        const BOM = '\uFEFF'; // ← Windows Excel 対策
        const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
    
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '').substring(2);
        link.setAttribute("href", url);
        link.setAttribute("download", `${today}_枠組足場数量.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ["部材名", "規格", "数量", "単位重量（kg）", "合計重量（kg）"],
            ...results.materials.map((item: MaterialItem) => [
                item.name,
                SPEC_MAP[item.name] || "",
                item.quantity,
                item.unitWeight,
                item.totalWeight
            ]),
            ["🟦 総重量", "", "", "", results.totalWeight],
            [],
            ["📝フリーメモ"],
            [config.memo || ""]
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const memoRow = wsData.length - 1;
        ws["!merges"] = [{ s: { r: memoRow, c: 0 }, e: { r: memoRow, c: 4 } }];
        ws["!cols"] = [
            { wch: 30 }, { wch: 16 }, { wch: 10 }, { wch: 14 }, { wch: 14 }
        ];
        XLSX.utils.book_append_sheet(wb, ws, "拾い出し結果");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '').substring(2);
        saveAs(new Blob([wbout], { type: "application/octet-stream" }), `${today}_枠組足場数量.xlsx`);
    };
    
    {/* 
    const exportToImportFormat = async () => {
        const templateUrl = "/templates/ImportFile.xlsx";
        const res = await fetch(templateUrl, { cache: "no-store" });
        const buffer = await res.arrayBuffer();

        const wb = XLSX.read(buffer, { type: "array" });
        const sheetName = wb.SheetNames[0]; // "Sheet1"
        const ws = wb.Sheets[sheetName];

        // 既存データ（A2:C*）をクリア
        const oldRef = ws["!ref"] || "A1:C1";
        const range = XLSX.utils.decode_range(oldRef);
        for (let r = 1; r <= range.e.r; r++) {
            for (let c = 0; c <= 2; c++) {
            const addr = XLSX.utils.encode_cell({ r, c });
            if (ws[addr]) delete ws[addr];
            }
        }

        // A2以降に 文字列/数値/文字列 でセルを明示的に作成
        results.materials.forEach((item: MaterialItem, i: number) => {
            const r = 1 + i; // データ開始は2行目なので 1+i
            const a = XLSX.utils.encode_cell({ r, c: 0 }); // A列
            const b = XLSX.utils.encode_cell({ r, c: 1 }); // B列
            const c = XLSX.utils.encode_cell({ r, c: 2 }); // C列

            const spec = String(SPEC_MAP[item.name] ?? "");      // 例: "MOK40"
            const qty  = Number.isFinite(item.quantity) ? Math.round(item.quantity) : 0;

            ws[a] = { t: "s", v: spec };   // ← 文字列明示
            ws[b] = { t: "n", v: qty };    // ← 数値明示
            ws[c] = { t: "s", v: "" };     // ← 文字列明示
        });

        // 範囲 A1:Cn を固定
        const lastRow = results.materials.length + 1;
        ws["!ref"] = `A1:C${lastRow}`;

        // 列幅だけ見やすく（インポートには影響なし）
        ws["!cols"] = [{ wch: 16 }, { wch: 10 }, { wch: 25 }];

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const today = new Date().toISOString().slice(0,10).replace(/-/g,"").substring(2);
        // ★ ファイル名はASCIIに
        saveAs(new Blob([wbout], { type: "application/octet-stream" }), `ImportFile_${today}.xlsx`);
    };
    */}

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 拾い出し結果</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SummaryCard title="総重量" value={`${results.totalWeight.toFixed(2)} kg`} icon="⚖️" bgColor="bg-green-50" />
                <SummaryCard title="ユニック車（重量のみ考慮）" value={results.transportUnic} icon="🏗️" />
                <SummaryCard title="平車（重量のみ考慮）" value={results.transportFlatbed} icon="🚛" />
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg mb-8 border border-green-200">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="split-transport"
                        checked={useSplit}
                        onChange={(e) => setUseSplit(e.target.checked)}
                        className="h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="split-transport" className="ml-3 block text-sm font-medium text-gray-700">
                        🧮 車両を分割して運搬する（大型車両が入れない現場）
                    </label>
                </div>

                {useSplit && (
                    <div className="mt-4">
                        {results.splitOptions.length > 0 ? (
                            <div className="flex items-center gap-4">
                               <select 
                                    value={selectedSplit}
                                    onChange={(e) => setSelectedSplit(e.target.value)}
                                    className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-green-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md bg-white"
                               >
                                    {results.splitOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                               </select>
                                <div className="p-2 bg-green-100 text-green-800 text-sm font-semibold rounded-md">
                                     ✅ 選択中の分割案: <strong>{selectedSplit}</strong>
                                </div>
                            </div>
                        ) : (
                            <div className="text-red-600 text-sm font-semibold p-2 bg-red-100 rounded-md">
                                ⚠️ 総重量が小さく、分割の推奨はありません。
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">💻 部材リスト</h3>
                <div className="flex gap-2">
                    <button
                        onClick={downloadCSV}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                        📥 CSV形式でダウンロード
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                        📥 Excel形式でダウンロード
                    </button>
                    {/* 
                    <button
                        onClick={exportToImportFormat}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        📤 インポート用Excel
                    </button>
                    */}
                </div>
            </div>
            
            <ResultTable materials={results.materials} totalWeight={results.totalWeight} />
            
            {config.memo && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">📝 フリーメモ</h3>
                    <div className="p-4 bg-green-100 border-l-4 border-green-500 text-gray-700 rounded-r-lg">
                        <p className="whitespace-pre-wrap">{config.memo}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
