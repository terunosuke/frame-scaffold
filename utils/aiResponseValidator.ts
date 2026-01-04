import type { ScaffoldingConfig } from '../types';

/**
 * AI解析結果のバリデーション結果を表す型
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    sanitizedData: Partial<ScaffoldingConfig>;
}

/**
 * AI解析結果を検証し、異常値を修正する
 * @param raw AIから返された生データ
 * @returns バリデーション結果と修正済みデータ
 */
export function validateAIResponse(raw: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sanitized: Partial<ScaffoldingConfig> = {};

    // ===== 1. スパン方向のチェック =====
    const spanKeys: Array<keyof ScaffoldingConfig> = [
        'span600',
        'span900',
        'span1200',
        'span1500',
        'span1800'
    ];

    spanKeys.forEach(key => {
        const value = raw[key];

        // 型チェック
        if (typeof value !== 'number' || !Number.isInteger(value)) {
            errors.push(`${key}が整数ではありません（値: ${value}）`);
            sanitized[key] = 0;
        }
        // 負数チェック
        else if (value < 0) {
            errors.push(`${key}が負数です（値: ${value}）`);
            sanitized[key] = 0;
        }
        // 異常値チェック（100個以上は異常）
        else if (value > 100) {
            warnings.push(`${key}が異常に大きい値です（値: ${value}）- 建物寸法と誤認している可能性`);
            sanitized[key] = value; // 警告のみで値は保持
        }
        else {
            sanitized[key] = value;
        }
    });

    // ===== 2. levelCount（段数）のチェック =====
    const levelCount = raw.levelCount;

    if (typeof levelCount !== 'number' || !Number.isInteger(levelCount)) {
        errors.push(`levelCountが整数ではありません（値: ${levelCount}）`);
        sanitized.levelCount = 3; // デフォルト値
    }
    else if (levelCount < 1) {
        errors.push(`levelCountが1未満です（値: ${levelCount}）`);
        sanitized.levelCount = 3;
    }
    else if (levelCount > 50) {
        warnings.push(`levelCountが異常に大きい値です（値: ${levelCount}）`);
        sanitized.levelCount = levelCount; // 警告のみで値は保持
    }
    else {
        sanitized.levelCount = levelCount;
    }

    // ===== 3. frameCols（枠方向）のチェック =====
    if (typeof raw.frameCols !== 'object' || raw.frameCols === null) {
        errors.push('frameColsがオブジェクトではありません');
        sanitized.frameCols = {
            "450": 0,
            "600": 0,
            "900": 0,
            "1200": 0
        };
    } else {
        const validKeys = ["450", "600", "900", "1200"];
        const cleaned: { [key: string]: number } = {};

        validKeys.forEach(key => {
            const val = raw.frameCols[key];

            // 型チェック
            if (typeof val !== 'number' || !Number.isInteger(val)) {
                warnings.push(`frameCols.${key}が整数ではありません（値: ${val}）- 0として扱います`);
                cleaned[key] = 0;
            }
            // 負数チェック
            else if (val < 0) {
                warnings.push(`frameCols.${key}が負数です（値: ${val}）- 0として扱います`);
                cleaned[key] = 0;
            }
            // 異常値チェック（20列以上は異常）
            else if (val > 20) {
                warnings.push(`frameCols.${key}が異常に大きい値です（値: ${val}）`);
                cleaned[key] = val; // 警告のみで値は保持
            }
            else {
                cleaned[key] = val;
            }
        });

        sanitized.frameCols = cleaned;
    }

    // ===== 4. 合理性チェック =====

    // 4-1. 全スパン数が0の場合
    const totalSpans = spanKeys.reduce((sum, key) => sum + (sanitized[key] as number || 0), 0);
    if (totalSpans === 0) {
        warnings.push('全スパン数が0です - 図面からスパン情報を読み取れなかった可能性があります');
    }

    // 4-2. 全枠列数が0の場合
    const totalFrameCols = Object.values(sanitized.frameCols || {}).reduce((sum, val) => sum + val, 0);
    if (totalFrameCols === 0) {
        warnings.push('全枠列数が0です - 図面から枠方向の情報を読み取れなかった可能性があります');
    }

    // 4-3. スパンと枠の両方が0の場合（重大）
    if (totalSpans === 0 && totalFrameCols === 0) {
        errors.push('スパンと枠方向の両方が0です - AI解析が失敗した可能性が高いです');
    }

    // ===== 5. faceCount（使用されていない可能性があるが念のため） =====
    if (raw.faceCount !== undefined) {
        const faceCount = raw.faceCount;
        if (typeof faceCount === 'number' && faceCount >= 0) {
            sanitized.faceCount = faceCount;
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        sanitizedData: sanitized
    };
}
