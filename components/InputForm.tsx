import React from 'react';
import type { ScaffoldingConfig, CustomHeight, ValidationResults } from '../types';
import { Card } from './Card';
import { InputGroup } from './InputGroup';
import { Alert } from './Alert';
import { AIPdfExtractor } from './AIPdfExtractor';

interface InputFormProps {
    config: ScaffoldingConfig;
    setConfigField: <K extends keyof ScaffoldingConfig>(field: K, value: ScaffoldingConfig[K]) => void;
    setCustomHeights: (heights: CustomHeight[]) => void;
    setPillarSelection: (length: number, count: number) => void;
    validation: ValidationResults;
    isAnalyzing: boolean;
    analysisError: string | null;
    analysisSuccess: string | null;
    onAnalyzeFile: (file: File, prompt: string) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ 
    config, setConfigField, setCustomHeights, setPillarSelection, validation,
    isAnalyzing, analysisError, analysisSuccess, onAnalyzeFile
}) => {
    
    const handleCustomHeightChange = (index: number, field: keyof CustomHeight, value: number) => {
        const newHeights = [...config.customHeights];
        newHeights[index] = { ...newHeights[index], [field]: value };
        setCustomHeights(newHeights);
    };

    const addCustomHeightRow = () => {
        setCustomHeights([...config.customHeights, { height: 1700, count: 1 }]);
    };

    const removeCustomHeightRow = (index: number) => {
        setCustomHeights(config.customHeights.filter((_, i) => i !== index));
    };
    
    const totalHeight = config.heightMode === 'all1700' 
        ? config.levelCount * 1700 
        : config.customHeights.reduce((sum, item) => sum + (item.height * item.count), 0);

    return (
        <div className="space-y-6">
            <AIPdfExtractor
                isAnalyzing={isAnalyzing}
                analysisError={analysisError}
                analysisSuccess={analysisSuccess}
                onAnalyze={onAnalyzeFile}
            />

            <fieldset disabled={isAnalyzing} className="space-y-6 disabled:opacity-60 transition-opacity">
                <Card title="大枠の設定" defaultOpen>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                        {/* Span Direction */}
                        <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-100">
                            <h4 className="font-semibold text-green-800">◎ スパン方向（長手）</h4>
                            <InputGroup label="600mmスパン数" type="number" value={config.span600} onChange={e => setConfigField('span600', parseInt(e.target.value) || 0)} min={0} />
                            <InputGroup label="900mmスパン数" type="number" value={config.span900} onChange={e => setConfigField('span900', parseInt(e.target.value) || 0)} min={0} />
                            <InputGroup label="1200mmスパン数" type="number" value={config.span1200} onChange={e => setConfigField('span1200', parseInt(e.target.value) || 0)} min={0} />
                            <InputGroup label="1500mmスパン数" type="number" value={config.span1500} onChange={e => setConfigField('span1500', parseInt(e.target.value) || 0)} min={0} />
                            <InputGroup label="1800mmスパン数" type="number" value={config.span1800} onChange={e => setConfigField('span1800', parseInt(e.target.value) || 0)} min={0} />
                        </div>
                        {/* Frame Direction */}
                        <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-100">
                            <h4 className="font-semibold text-green-800">◎ 枠方向（短手）</h4>
                            <InputGroup
                                label="450幅の列数"
                                type="number"
                                value={config.frameCols?.["450"] || 0}
                                onChange={e =>
                                    setConfigField("frameCols", {
                                        ...config.frameCols,
                                        "450": parseInt(e.target.value) || 0,
                                    })
                                }
                                min={0}
                            />
                            <InputGroup
                                label="600幅の列数"
                                type="number"
                                value={config.frameCols?.["600"] || 0}
                                onChange={e =>
                                    setConfigField("frameCols", {
                                        ...config.frameCols,
                                        "600": parseInt(e.target.value) || 0,
                                    })
                                }
                                min={0}
                            />
                            <InputGroup
                                label="900幅の列数"
                                type="number"
                                value={config.frameCols?.["900"] || 0}
                                onChange={e =>
                                    setConfigField("frameCols", {
                                        ...config.frameCols,
                                        "900": parseInt(e.target.value) || 0,
                                    })
                                }
                                min={0}
                            />
                            <InputGroup
                                label="1200幅の列数"
                                type="number"
                                value={config.frameCols?.["1200"] || 0}
                                onChange={e =>
                                    setConfigField("frameCols", {
                                        ...config.frameCols,
                                        "1200": parseInt(e.target.value) || 0,
                                    })
                                }
                                min={0}
                            />
                        </div>
                        {/* Height Direction */}
                        <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-100">
                            <h4 className="font-semibold text-green-800">◎ 高さ方向</h4>
                            <InputGroup label="段数" type="number" value={config.levelCount} onChange={e => setConfigField('levelCount', parseInt(e.target.value) || 1)} min={1} />
                            <InputGroup label="各段の高さ" as="select" value={config.heightMode} onChange={e => setConfigField('heightMode', e.target.value as 'all1700' | 'custom')}>
                                <option value="all1700">全段1700mm</option>
                                <option value="custom">一部を指定する</option>
                            </InputGroup>
                            {config.heightMode === 'custom' && (
                                <div className="space-y-2 pt-2 border-t border-green-200 mt-2">
                                    {config.customHeights.map((row, index) => (
                                        <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                                            <InputGroup label={`高さ`} hideLabel as="select" value={row.height} onChange={e => handleCustomHeightChange(index, 'height', parseInt(e.target.value))}>
                                                <option value={1700}>1700</option>
                                                <option value={1200}>1200</option>
                                                <option value={900}>900</option>
                                                <option value={600}>600</option>
                                                <option value={400}>400</option>
                                            </InputGroup>
                                            <InputGroup label={`段数`} hideLabel type="number" value={row.count} min={1} onChange={e => handleCustomHeightChange(index, 'count', parseInt(e.target.value) || 1)} />
                                            {config.customHeights.length > 1 && <button onClick={() => removeCustomHeightRow(index)} className="text-red-500 hover:text-red-700 font-bold">✖️</button>}
                                        </div>
                                    ))}
                                    <button onClick={addCustomHeightRow} className="text-sm text-green-700 hover:text-green-800 font-semibold mt-2">+ 行を追加</button>
                                    {validation.customHeightStatus === 'under' && <Alert type="warning" message={`現在 ${config.levelCount - validation.remainingLevels} 段 指定済（残り ${validation.remainingLevels} 段）`} />}
                                    {validation.customHeightStatus === 'over' && <Alert type="error" message={`段数が超過しています！`} />}
                                    {validation.customHeightStatus === 'ok' && <Alert type="success" message="指定段数が一致しました" />}
                                </div>
                            )}
                            <div className="pt-2 text-sm font-medium text-gray-600">足場の総高さ: H {totalHeight} mm</div>
                        </div>
                    </div>
                </Card>

                <Card title="個別部材の設定">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                        {/* Jack Base */}
                        <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-100">
                            <h4 className="font-semibold text-green-800">◎ ジャッキベース</h4>
                            <InputGroup label="最下段である（ジャッキベース・敷板必要）" as="checkbox" checked={config.isBottom} onChange={e => setConfigField('isBottom', e.target.checked)} />
                            {config.isBottom && (
                                <>
                                    <InputGroup label="ジャッキベースの種類" as="select" value={config.jackBaseOption} onChange={e => setConfigField('jackBaseOption', e.target.value as 'allSB20' | 'allSB40' | 'custom')}>
                                        <option value="allSB20">全てSB20（H58-H230）</option>
                                        <option value="allSB40">全てSB40（H58-H350）</option>
                                        <option value="custom">個別指定</option>
                                    </InputGroup>
                                    {config.jackBaseOption === 'custom' && (
                                        <div className="space-y-2">
                                            <InputGroup label="SB20の本数" type="number" min={0} value={config.sb20Count} onChange={e => setConfigField('sb20Count', parseInt(e.target.value) || 0)} />
                                            <InputGroup label="SB40の本数" type="number" min={0} value={config.sb40Count} onChange={e => setConfigField('sb40Count', parseInt(e.target.value) || 0)} />
                                            {validation.jackBaseStatus === 'under' && <Alert type="warning" message={`支柱の箇所数に対して不足しています (必要: ${validation.jackBaseNeeded} / 指定: ${validation.jackBaseProvided})`} />}
                                            {validation.jackBaseStatus === 'over' && <Alert type="error" message={`支柱の箇所数に対して超過しています (必要: ${validation.jackBaseNeeded} / 指定: ${validation.jackBaseProvided})`} />}
                                            {validation.jackBaseStatus === 'ok' && <Alert type="success" message="支柱の箇所数とジャッキの本数が一致しています" />}
                                        </div>
                                    )}
                                    <InputGroup label="タイコ40" type="number" min={0} value={config.taiko40} onChange={e => setConfigField('taiko40', parseInt(e.target.value) || 0)} />
                                    <InputGroup label="タイコ80" type="number" min={0} value={config.taiko80} onChange={e => setConfigField('taiko80', parseInt(e.target.value) || 0)} />
                                </>
                            )}
                        </div>
                        {/* Other */}
                        <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-100">
                            
                            {/* アンチ設置段 */}
                            <h4 className="font-semibold text-green-800">◎ アンチ設置段（各段の下部に設置とする）</h4>
                            <InputGroup label="" as="select" value={config.antiMode} onChange={e => setConfigField('antiMode', e.target.value as 'all' | 'notBottom' | 'custom')}>
                                <option value="all">全段（既存足場の上に更に組む場合）</option>
                                <option value="notBottom">最下段以外（GLから組み始める場合）</option>
                                <option value="custom">指定段</option>
                            </InputGroup>
                            {config.antiMode === 'custom' && (
                                <div className="ml-4">
                                    <InputGroup label="段番号 (カンマ区切り)" placeholder="例: 1,3,5" value={config.antiLevels} onChange={e => setConfigField('antiLevels', e.target.value)} />
                                </div>
                            )}

                            {/* 巾木設置段 */}
                            <h4 className="font-semibold text-green-800 mt-6">◎ 巾木設置段（各段の下部に設置とする）</h4>
                            <InputGroup label="" as="select" value={config.toeboardMode} onChange={e => setConfigField('toeboardMode', e.target.value as 'all' | 'sameAsAnti' | 'custom')}>
                                <option value="all">全段</option>
                                <option value="sameAsAnti">アンチと同じ段</option>
                                <option value="custom">指定段</option>
                            </InputGroup>
                            {config.toeboardMode === 'custom' && (
                                <div className="ml-4">
                                    <InputGroup label="段番号 (カンマ区切り)" placeholder="例: 1,3,5" value={config.toeboardLevels} onChange={e => setConfigField('toeboardLevels', e.target.value)} />
                                </div>
                            )}
                            
                            {/* 妻側手すり */}
                            <h4 className="font-semibold text-green-800 mt-6">◎ 妻側手すり</h4>
                            <InputGroup label="" as="select" value={config.tsumaCount} onChange={e => setConfigField('tsumaCount', parseInt(e.target.value) as 0|1|2)}>
                                <option value={2}>両側必要（新規足場）→2面</option>
                                <option value={1}>片側のみ→1面</option>
                                <option value={0}>不要→0面</option>
                            </InputGroup>

                            {/* 階段設置 */}
                            <h4 className="font-semibold text-green-800 mt-6">◎ 階段設置</h4>
                            <InputGroup label="" as="select" value={config.stairMode} onChange={e => setConfigField('stairMode', e.target.value as 'none' | 'notTop' | 'custom')}>
                                <option value="none">設置しない</option>
                                <option value="notTop">最上段以外</option>
                                <option value="custom">指定段のみ</option>
                            </InputGroup>
                            {config.stairMode === 'custom' && (
                                <div className="ml-4">
                                    <InputGroup label="段番号 (カンマ区切り)" placeholder="例: 1,2,4" value={config.stairLevels} onChange={e => setConfigField('stairLevels', e.target.value)} />
                                </div>
                            )}

                            {/* 壁つなぎ */}
                            <h4 className="font-semibold text-green-800 mt-6">◎ 壁つなぎ</h4>
                            <InputGroup label="" as="select" value={config.wallTieMode} onChange={e => setConfigField('wallTieMode', e.target.value as 'none' | 'KTS16' | 'KTS20' | 'KTS30' | 'KTS45' | 'KTS60' | 'KTS80' | 'KTS100')}>
                                <option value="none">不要</option>
                                <option value="KTS16">KTS16（160-200）</option>
                                <option value="KTS20">KTS20（200-240）</option>
                                <option value="KTS30">KTS30（240-320）</option>
                                <option value="KTS45">KTS45（320-480）</option>
                                <option value="KTS60">KTS60（480-670）</option>
                                <option value="KTS80">KTS80（670-860）</option>
                                <option value="KTS100">KTS100（860-1050）</option>
                            </InputGroup>
                            {config.wallTieMode !== 'none' && (
                                <div className="ml-4 space-y-2">
                                    <InputGroup label="設置段数" as="select" value={config.wallTieLevelMode} onChange={e => setConfigField('wallTieLevelMode', e.target.value as 'all' | 'alternate' | 'custom')}>
                                        <option value="all">全段</option>
                                        <option value="alternate">隔段</option>
                                        <option value="custom">設置段数を手入力</option>
                                    </InputGroup>
                                    {config.wallTieLevelMode === 'custom' && (
                                        <div className="ml-4">
                                            <InputGroup label="段数" type="number" placeholder="全5段中3段だけ設置→3" value={config.wallTieLevelCount} min={0} onChange={e => setConfigField('wallTieLevelCount', parseInt(e.target.value) || 0)} />
                                        </div>
                                    )}
                                    
                                    <InputGroup label="1段当たりの設置数" as="select" value={config.wallTieSpanMode} onChange={e => setConfigField('wallTieSpanMode', e.target.value as 'all' | 'alternate' | 'custom')}>
                                        <option value="all">全スパン</option>
                                        <option value="alternate">隔スパン</option>
                                        <option value="custom">1段当たりの設置数を手入力</option>
                                    </InputGroup>
                                    {config.wallTieSpanMode === 'custom' && (
                                        <div className="ml-4">
                                            <InputGroup label="1段当たりの設置数" type="number" placeholder="各段20個ずつ→20" value={config.wallTieSpanCount} min={0} onChange={e => setConfigField('wallTieSpanCount', parseInt(e.target.value) || 0)} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 層間養生ネット */}
                            <h4 className="font-semibold text-green-800 mt-6">◎ 層間養生ネット</h4>
                            <InputGroup label="" as="select" value={config.layerNetMode} onChange={e => setConfigField('layerNetMode', e.target.value as 'none' | 'required')}>
                                <option value="none">不要</option>
                                <option value="required">必要</option>
                            </InputGroup>
                            {config.layerNetMode === 'required' && (
                                <div className="ml-4 space-y-2">
                                    <InputGroup label="設置段数" as="select" value={config.layerNetLevelMode} onChange={e => setConfigField('layerNetLevelMode', e.target.value as 'all' | 'alternate' | 'custom')}>
                                        <option value="all">全段</option>
                                        <option value="alternate">隔段</option>
                                        <option value="custom">設置段数を手入力</option>
                                    </InputGroup>
                                    {config.layerNetLevelMode === 'custom' && (
                                        <div className="ml-4">
                                            <InputGroup label="段数" type="number" placeholder="全5段中3段だけ設置→3" value={config.layerNetLevelCount} min={0} onChange={e => setConfigField('layerNetLevelCount', parseInt(e.target.value) || 0)} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                <Card title="📝 フリーメモ">
                    <div className="p-4">
                        <textarea
                            className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                            rows={4}
                            placeholder="現場名、日付、担当者、部位など自由記入"
                            value={config.memo}
                            onChange={e => setConfigField('memo', e.target.value)}
                        />
                    </div>
                </Card>
            </fieldset>
        </div>
    );
};