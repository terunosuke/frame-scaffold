import React from 'react';
import type { ScaffoldingConfig, CalculationResults } from '../types';

interface ConfirmationTabProps {
    config: ScaffoldingConfig;
    results: CalculationResults;
}

export const ConfirmationTab: React.FC<ConfirmationTabProps> = ({ config, results }) => {
    
    const spanSummary = [
        config.span600 > 0 && `600mm×${config.span600}`,
        config.span900 > 0 && `900mm×${config.span900}`,
        config.span1200 > 0 && `1200mm×${config.span1200}`,
        config.span1500 > 0 && `1500mm×${config.span1500}`,
        config.span1800 > 0 && `1800mm×${config.span1800}`,
    ].filter(Boolean).join(', ') || 'なし';

    const antiSummary = {
        'all': '全段',
        'notBottom': '最下段以外',
        'custom': `指定段 (${config.antiLevels})`
    }[config.antiMode];

    const toeboardSummary = {
        'all': '全段',
        'sameAsAnti': 'アンチと同じ段',
        'custom': `指定段 (${config.toeboardLevels})`
    }[config.toeboardMode];

    const stairSummary = config.stairMode === 'none'
        ? '設置しない'
        : `${config.stairSpanCount}スパン × ${{
            'notTop': '最上段以外',
            'custom': `指定段 (${config.stairLevels})`
        }[config.stairMode]}`;

    const tsumaSummary = {
        2: '両側必要（2面）',
        1: '片側のみ（1面）',
        0: '不要（0面）',
    }[config.tsumaCount];

    // 壁つなぎの表示用フォーマット
    const wallTieSummary = (() => {
        if (config.wallTieMode === 'none') return '不要';
        
        let levelText = '';
        if (config.wallTieLevelMode === 'all') levelText = '全段';
        else if (config.wallTieLevelMode === 'alternate') levelText = '隔段';
        else levelText = `${config.wallTieLevelCount}段`;

        let spanText = '';
        if (config.wallTieSpanMode === 'all') spanText = '全スパン';
        else if (config.wallTieSpanMode === 'alternate') spanText = '隔スパン';
        else spanText = `1段当たり${config.wallTieSpanCount}個`;

        return `${config.wallTieMode}（${levelText}・${spanText}）`;
    })();

    // 層間養生ネットの表示用フォーマット
    const layerNetSummary = (() => {
        if (config.layerNetMode === 'none') return '不要';
        
        let levelText = '';
        if (config.layerNetLevelMode === 'all') levelText = '全段';
        else if (config.layerNetLevelMode === 'alternate') levelText = '隔段';
        else levelText = `${config.layerNetLevelCount}段`;

        return `必要（${levelText}）`;
    })();

    // 外周シートの表示用フォーマット
    const perimeterSheetSummary = (() => {
        if (config.perimeterSheetMode === 'none') return '不要';

        let levelText = '';
        if (config.perimeterSheetLevelMode === 'all') levelText = '全段';
        else levelText = `${config.perimeterSheetLevelCount}段`;

        return `必要（${levelText}・3段/1枚計算）`;
    })();

    // 妻側シートの表示用フォーマット
    const tsumaSheetSummary = (() => {
        if (config.tsumaSheetCount === 0) return '不要（0面）';

        let levelText = '';
        if (config.tsumaSheetLevelMode === 'all') levelText = '全段';
        else levelText = `${config.tsumaSheetLevelCount}段`;

        const sideText = config.tsumaSheetCount === 2 ? '両妻必要（2面）' : '片妻のみ（1面）';
        return `${sideText}（${levelText}・3段/1枚計算）`;
    })();

    // 列構成の表示用フォーマット
    const frameCols = config.frameCols || {};
    const frameSummary = Object.entries(frameCols)
        .filter(([_, count]) => count > 0)
        .map(([width, count]) => `${width}mm×${count}`)
        .join(', ') || 'なし';
    const totalCols = Object.values(frameCols).reduce((sum, val) => sum + val, 0);

    const conditions = [
        { item: "スパン構成", value: spanSummary },
        { item: "合計スパン数", value: results.spanTotal },
        { item: "合計スパン長さ", value: `${results.spanMmTotal} mm` },
        { item: "列構成", value: frameSummary },
        { item: "合計列数", value: totalCols },
        { item: "段数", value: config.levelCount },
        { item: "足場高さ", value: `${results.totalHeight} mm` },
        { item: "最下段である（ジャッキベース・敷板が必要）", value: config.isBottom ? "はい" : "いいえ" },
        { item: "アンチ設置段", value: antiSummary },
        { item: "巾木設置段", value: toeboardSummary },
        { item: "妻側手すり", value: tsumaSummary },
        { item: "階段設置", value: stairSummary },
        { item: "壁つなぎ", value: wallTieSummary },
        { item: "層間養生ネット", value: layerNetSummary },
        { item: "外周シート", value: perimeterSheetSummary },
        { item: "妻側シート", value: tsumaSheetSummary },
    ];
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">✅ 入力条件の確認</h2>
            <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                    <tbody className="bg-white divide-y divide-slate-200">
                        {conditions.map(({ item, value }, index) => (
                            <tr key={item} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="px-6 py-4 w-1/3 text-sm font-semibold text-slate-600">{item}</td>
                                <td className="px-6 py-4 text-sm text-slate-900 font-medium">{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {config.memo && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">📝 フリーメモ</h3>
                    <div className="p-4 bg-primary-light border-l-4 border-primary text-slate-700 rounded-r-lg">
                        <p className="whitespace-pre-wrap">{config.memo}</p>
                    </div>
                </div>
            )}
        </div>
    );
};