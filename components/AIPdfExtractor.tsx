import React, { useState, useRef } from 'react';
import { Card } from './Card';
import { Alert } from './Alert';

interface AIPdfExtractorProps {
    isAnalyzing: boolean;
    analysisError: string | null;
    analysisSuccess: string | null;
    onAnalyze: (file: File, prompt: string) => void;
}

/**
 * AIによる図面/画像解析を行うためのUIコンポーネント。
 * ファイル選択、追加指示の入力、解析実行の機能を提供する。
 */
export const AIPdfExtractor: React.FC<AIPdfExtractorProps> = ({ isAnalyzing, analysisError, analysisSuccess, onAnalyze }) => {
    // ユーザーが選択したファイルを保持するstate
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // ユーザーが入力したAIへの追加指示を保持するstate
    const [prompt, setPrompt] = useState('');
    // ファイル入力要素への参照
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * ファイル入力が変更されたときに呼ばれるハンドラ。
     * 選択されたファイルをstateにセットする。
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
    };
    
    /**
     * 「ファイルを選択」ボタンがクリックされたときに呼ばれるハンドラ。
     * 非表示のファイル入力要素のクリックイベントを発火させる。
     */
    const handleSelectClick = () => {
        fileInputRef.current?.click();
    };

    /**
     * 「AIで図面を解析」ボタンがクリックされたときに呼ばれるハンドラ。
     * 選択されたファイルとプロンプトを親コンポーネントのonAnalyze関数に渡す。
     */
    const handleAnalyzeClick = () => {
        if (selectedFile) {
            onAnalyze(selectedFile, prompt);
        }
    };

return (
    <div className="flex flex-col md:flex-row gap-6 items-stretch">
        {/* 左カード：解説図 */}
            <Card title="入力フォームの解説" defaultOpen className="w-full md:w-1/2">
            <div className="flex justify-center items-center gap-6 p-4 h-full">
                <div className="flex-1 flex justify-center">
                <img
                    src="/assets/立面図.jpg"
                    alt="立面図"
                    className="h-auto max-h-64 w-auto object-contain"
                />
                </div>
                <div className="flex-1 flex justify-center">
                <img
                    src="/assets/平面図.jpg"
                    alt="平面図"
                    className="h-auto max-h-64 w-auto object-contain"
                />
                </div>
            </div>

            {/* ← ここから追加 */}
            <div className="px-4 pb-4 space-y-1">
                <p className="text-sm text-gray-700">
                <span className="mr-1">⚠️</span>
                片面：ブレス+巾木、片面：ブレス+下桟（+メッシュシート）で算出
                </p>
                <p className="text-sm text-gray-700">
                <span className="mr-1">⚠️</span>
                メッシュシート・ネットは算出対象外。敷板は多めの拾いです。
                </p>
            </div>
            {/* ← ここまで追加 */}
            </Card>

        {/* 右カード：AIフォーム */}
        <Card title="🤖 図面/画像から自動入力 (AI)" defaultOpen className="w-full md:w-1/2">
            <div className="p-4 space-y-4 h-full flex flex-col">
                <p className="text-sm text-gray-600">
                    PDF、JPEG、PNG形式の足場図をアップロードすると、AIがスパン数や段数などの基本情報を自動で読み取り、以下の項目に入力します。
                </p>

                {/* ファイル選択 */}
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-4 p-4 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
                        <input 
                            type="file" 
                            accept="application/pdf,image/jpeg,image/png" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            aria-hidden="true"
                        />
                        <button 
                            onClick={handleSelectClick} 
                            type="button"
                            className="px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 transition-colors duration-200"
                        >
                            ファイルを選択
                        </button>
                        <span className="text-sm text-gray-600 truncate" aria-live="polite">
                            {selectedFile ? selectedFile.name : 'ファイルが選択されていません'}
                        </span>
                    </div>
                </div>

                {/* プロンプト入力 */}
                <div>
                    <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 mb-1">
                        AIへの追加指示（任意）
                    </label>
                    <textarea
                        id="ai-prompt"
                        rows={2}
                        className="w-full p-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                        placeholder="例：これは平面図。段数は3段として。"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isAnalyzing}
                    />
                </div>

                {/* ボタン */}
                <button 
                    onClick={handleAnalyzeClick} 
                    disabled={!selectedFile || isAnalyzing}
                    type="button"
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isAnalyzing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            解析中...
                        </>
                    ) : (
                        'AIで図面を解析'
                    )}
                </button>

                {/* 結果 */}
                {analysisSuccess && <Alert type="success" message={analysisSuccess} />}
                {analysisError && <Alert type="error" message={analysisError} />}
            </div>
        </Card>
    </div>
);
};