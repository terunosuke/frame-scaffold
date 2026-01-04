import React, { useState, useMemo, useCallback } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { InputForm } from './components/InputForm';
import { ConfirmationTab } from './components/ConfirmationTab';
import { ResultsTab } from './components/ResultsTab';
import { HistoryTab } from './components/HistoryTab';
import type { ScaffoldingConfig, CustomHeight, HistoryEntry } from './types';
import { useScaffoldingCalculator } from './hooks/useScaffoldingCalculator';
import 'react-tabs/style/react-tabs.css';
import { analyzeScaffoldingFile } from './utils/gemini';
import { processFileForAnalysis } from './utils/fileProcessor';
import { validateAIResponse } from './utils/aiResponseValidator';

// 薄い緑を基調とした統一されたカラーパレット
const customStyles = `
    .react-tabs__tab { /* 通常タブ */
        padding: 12px 24px;
        border-radius: 8px 8px 0 0;
        font-weight: 600;
        color: #64748b; /* ちょい濃いグレー */
        background: #dcfce7; /* 薄い緑ボーダー */
        border: 1px solid #86efac; /* 緑ボーダー */
        border-bottom: none;
        transition: all 0.2s ease-in-out;
        font-size: 0.875rem;
    }
    .react-tabs__tab--selected { /* 選択表示中タブ */
        background: #ffffff; /* 白背景 */
        color: #047857; /* 落ち着いた濃い緑 */
        border-color: #86efac; /* 緑ボーダー */
        border-bottom: 2px solid #047857; /* 濃い緑の強調線 */
        position: relative;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.02);
    }
    .react-tabs__tab:hover:not(.react-tabs__tab--selected) { /* 接触タブ */
        background: #f9fafb; /* 薄いグレーホバー */
        color: #047857; /* 落ち着いた緑 */
    }
    .react-tabs__tab:focus {
        outline: none;
        box-shadow: 0 0 0 1px rgba(4, 120, 87, 0.15);
    }
    .react-tabs__tab-list {
        border-bottom: 1px solid #86efac; /* 緑ボーダー */
        margin: 0;
        background: transparent; /* 透明背景 */
    }
    .react-tabs__tab-panel {
        background:  #ffffff; /* 白背景 */
        border-radius: 0 0 12px 12px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
`;

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisSuccess, setAnalysisSuccess] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    const [config, setConfig] = useState<ScaffoldingConfig>({
        span600: 0,
        span900: 0,
        span1200: 0,
        span1500: 0,
        span1800: 0,
        levelCount: 3,
        heightMode: 'all1700',
        customHeights: [{ height: 1700, count: 3 }],
        pillarSelection: { 225: 0, 450: 0, 900: 0, 1800: 0, 2700: 0, 3600: 0 },
        jackBaseMode: 'jackBaseOnly',
        jackBaseOption: 'allSB20',
        sb20Count: 0,
        sb40Count: 0,
        taiko40: 0,
        taiko80: 0,
        antiMode: 'all',
        antiLevels: '1,2,3',
        toeboardMode: 'sameAsAnti',
        toeboardLevels: '',
        footingType: 'oneSideToeboardOneSideHandrail',
        tsumaCount: 2,
        stairMode: 'none',
        stairLevels: '',
        stairSpanCount: 1,
        wallTieMode: 'none',
        wallTieLevelMode: 'all',
        wallTieLevelCount: 0,
        wallTieSpanMode: 'all',
        wallTieSpanCount: 0,
        layerNetMode: 'none',
        layerNetLevelMode: 'all',
        layerNetLevelCount: 0,
        perimeterSheetMode: 'none',
        perimeterSheetLevelMode: 'all',
        perimeterSheetLevelCount: 0,
        tsumaSheetCount: 0,
        tsumaSheetLevelMode: 'all',
        tsumaSheetLevelCount: 0,
        memo: '',
        frameCols: {
            "450": 0,
            "600": 0,
            "900": 0,
            "1200": 0
        },
        faceCount: 0,
        faceWidth: 900
    });

    const setConfigField = useCallback(<K extends keyof ScaffoldingConfig>(field: K, value: ScaffoldingConfig[K]) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    }, []);

    const setCustomHeights = useCallback((heights: CustomHeight[]) => {
        setConfig(prev => ({ ...prev, customHeights: heights }));
    }, []);

    const setPillarSelection = useCallback((length: number, count: number) => {
        setConfig(prev => ({
            ...prev,
            pillarSelection: {
                ...prev.pillarSelection,
                [length]: count,
            }
        }));
    }, []);

    const handleAnalyzeFile = useCallback(async (file: File, prompt: string) => {
        if (!file) return;
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysisSuccess(null);

        try {
            const { base64Data, mimeType } = await processFileForAnalysis(file);
            const extractedData = await analyzeScaffoldingFile(base64Data, mimeType, prompt);

            // ===== バリデーション =====
            const validation = validateAIResponse(extractedData);

            // エラーがある場合は処理を中断
            if (!validation.isValid) {
                throw new Error(`AI解析結果が不正です:\n${validation.errors.join('\n')}`);
            }

            // 警告がある場合はコンソールに出力（ユーザーには成功として扱う）
            if (validation.warnings.length > 0) {
                console.warn('⚠️ AI解析の警告:', validation.warnings);
            }

            // バリデーション済みのデータを使用
            const validatedData = validation.sanitizedData;

            // 枠組足場用の寸法変換（インチ系からキリのいい数字へ）
            const dimensionMapping = {
                1829: 1800,
                1524: 1500,
                1219: 1200,
                914: 900,
                610: 600,
                450: 450
            };

            // バリデーション済みデータの寸法を変換
            const convertedData = { ...validatedData };

            // スパン寸法の変換
            ['span600', 'span900', 'span1200', 'span1500', 'span1800'].forEach(key => {
                if (validatedData[`span${dimensionMapping[parseInt(key.slice(4))]}`] !== undefined) {
                    convertedData[key] = validatedData[`span${dimensionMapping[parseInt(key.slice(4))]}`];
                }
            });

            // 枠幅の変換
            if (validatedData.frameCols) {
                const newFrameCols = {};
                Object.entries(validatedData.frameCols).forEach(([width, count]) => {
                    const mappedWidth = dimensionMapping[parseInt(width)] || width;
                    newFrameCols[mappedWidth] = count;
                });
                convertedData.frameCols = newFrameCols;
            }

            // faceWidthの変換
            if (validatedData.faceWidth) {
                convertedData.faceWidth = dimensionMapping[validatedData.faceWidth] || validatedData.faceWidth;
            }

            setConfig(prev => {
                const updatedConfig = { ...prev, ...convertedData };
                const validFaceWidths = [450, 600, 900, 1200];
                if (convertedData.faceWidth && !validFaceWidths.includes(convertedData.faceWidth)) {
                    updatedConfig.faceWidth = 900;
                }
                return updatedConfig;
            });

            const successMessage = ( 
                <>
                    AI解析が完了し、大枠項目が更新されました。※画像認識は完全ではありません。必ず内容をご確認ください。
                </>
            );
            setAnalysisSuccess(successMessage);
            setHistory(prev => [{
                id: Date.now().toString(),
                timestamp: new Date(),
                fileName: file.name,
                prompt,
                status: 'success',
                message: successMessage
            }, ...prev]);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "ファイル処理または解析中に不明なエラーが発生しました。";
            setAnalysisError(errorMessage);
            setHistory(prev => [{
                id: Date.now().toString(),
                timestamp: new Date(),
                fileName: file.name,
                prompt,
                status: 'error',
                message: errorMessage
            }, ...prev]);
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    const { results, validation } = useScaffoldingCalculator(config);

    const renderTabPanel = (index: number, Component: React.ElementType) => (
        <TabPanel key={index}>
            <div className="p-4 md:p-8 bg-white rounded-lg shadow-sm border border-green-100">
                <Component 
                    config={config} 
                    setConfigField={setConfigField} 
                    setCustomHeights={setCustomHeights} 
                    setPillarSelection={setPillarSelection} 
                    results={results} 
                    validation={validation}
                    isAnalyzing={isAnalyzing}
                    analysisError={analysisError}
                    analysisSuccess={analysisSuccess}
                    onAnalyzeFile={handleAnalyzeFile}
                />
            </div>
        </TabPanel>
    );

    return (
        <div className="min-h-screen bg-green-50 font-sans text-gray-800">
            {/* ヘッダー */}
            <header className="bg-white shadow-sm border-b border-green-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">枠組足場</h1>
                            <p className="text-sm text-gray-600">仮設足場拾い出しツール</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <style>{customStyles}</style>

                <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
                    <TabList>
                        <Tab>📥 入力項目</Tab>
                        <Tab>✅ 入力条件の確認</Tab>
                        <Tab>📊 拾い出し結果</Tab>
                        <Tab>📜 解析履歴</Tab>
                    </TabList>

                    {renderTabPanel(0, InputForm)}
                    {renderTabPanel(1, ConfirmationTab)}
                    {renderTabPanel(2, ResultsTab)}
                    <TabPanel>
                        <div className="p-4 md:p-8 bg-white">
                            <HistoryTab history={history} />
                        </div>
                    </TabPanel>
                </Tabs>
            </main>

            {/* フッター */}
            <footer className="text-center py-6 text-sm text-gray-600 bg-white border-t border-green-200">
                <p>&copy; {new Date().getFullYear()}　Teruna Masamichi. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default App;