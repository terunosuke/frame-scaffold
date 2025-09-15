export interface CustomHeight {
    height: number;
    count: number;
}

export interface PillarSelection {
    [length: number]: number;
}

export interface ScaffoldingConfig {
    span600: number;
    span900: number;
    span1200: number;
    span1500: number;
    span1800: number;
    faceCount: number;
    faceWidth: number;
    frameCols: {
        [key: string]: number;
    };
    levelCount: number;
    heightMode: 'all1700' | 'custom';
    customHeights: CustomHeight[];
    pillarSelection: PillarSelection;
    isBottom: boolean;
    jackBaseOption: 'allSB20' | 'allSB40' | 'custom';
    sb20Count: number;
    sb40Count: number;
    taiko40: number;
    taiko80: number;
    antiMode: 'all' | 'notBottom' | 'custom';
    antiLevels: string;
    toeboardMode: 'all' | 'sameAsAnti' | 'custom';
    toeboardLevels: string;
    footingType: 'oneSideToeboardOneSideHandrail' | 'bothSideToeboard' | 'bothSideToeboardAndHandrail' | 'bothSideHandrail';
    tsumaCount: 0 | 1 | 2;
    stairMode: 'none' | 'notTop' | 'custom';
    stairLevels: string;
    stairSpanCount: number;
    wallTieMode: 'none' | 'KTS16' | 'KTS20' | 'KTS30' | 'KTS45' | 'KTS60' | 'KTS80' | 'KTS100';
    wallTieLevelMode: 'all' | 'alternate' | 'custom';
    wallTieLevelCount: number;
    wallTieSpanMode: 'all' | 'alternate' | 'custom';
    wallTieSpanCount: number;
    layerNetMode: 'none' | 'required';
    layerNetLevelMode: 'all' | 'alternate' | 'custom';
    layerNetLevelCount: number;
    perimeterSheetMode: 'none' | 'required';
    perimeterSheetLevelMode: 'all' | 'custom';
    perimeterSheetLevelCount: number;
    tsumaSheetCount: 0 | 1 | 2;
    tsumaSheetLevelMode: 'all' | 'custom';
    tsumaSheetLevelCount: number;
    memo: string;
}

export interface MaterialItem {
    name: string;
    quantity: number;
    unitWeight: number;
    totalWeight: number;
}

export interface CalculationResults {
    materials: MaterialItem[];
    totalWeight: number;
    spanTotal: number;
    spanMmTotal: number;
    totalHeight: number;
    jackBaseCount: number;
    pillarText: string;
    transportUnic: string;
    transportFlatbed: string;
    splitOptions: string[];
}

export interface ValidationResults {
    customHeightStatus: 'ok' | 'under' | 'over';
    remainingLevels: number;
    pillarHeightStatus: 'ok' | 'mismatch';
    totalPillarHeight: number;
    jackBaseStatus: 'ok' | 'under' | 'over';
    jackBaseNeeded: number;
    jackBaseProvided: number;
}

export interface HistoryEntry {
    id: string;
    timestamp: Date;
    fileName: string;
    prompt: string;
    status: 'success' | 'error';
    message: string;
}