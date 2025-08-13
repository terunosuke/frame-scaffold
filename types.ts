
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
        // 👇これを追加
    frameCols: {
        [key: string]: number;
    };
    levelCount: number;
    heightMode: 'all1800' | 'custom';
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
    tsumaCount: 0 | 1 | 2;
    stairMode: 'none' | 'notTop' | 'custom';
    stairLevels: string;
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
