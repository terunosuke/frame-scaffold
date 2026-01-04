import { GoogleGenAI, Type } from "@google/genai";

// このファイルはVercelやNetlifyなどのサーバーレス環境で実行されるAPIルートです。
// クライアントからのリクエストを受け取り、安全にGoogle Gemini APIを呼び出します。

/**
 * Gemini APIからの期待されるJSON応答のスキーマ定義。
 * これにより、AIは指定された構造で応答を返すようになります。
 */
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        span600: { type: Type.INTEGER, description: "600mmスパンの数。" },
        span900: { type: Type.INTEGER, description: "900mmスパンの数。" },
        span1200: { type: Type.INTEGER, description: "1200mmスパンの数。" },
        span1500: { type: Type.INTEGER, description: "1500mmスパンの数。" },
        span1800: { type: Type.INTEGER, description: "1800mmスパンの数。" },
        faceCount: { type: Type.INTEGER, description: "面の数（列数）。" },
        frameCols: {
            type: Type.OBJECT,
            properties: {
                "450": { type: Type.INTEGER },
                "600": { type: Type.INTEGER },
                "900": { type: Type.INTEGER },
                "1200": { type: Type.INTEGER },
            },
            required: [],
        },
        levelCount: { type: Type.INTEGER, description: "垂直方向の段の総数。" },
    },
    required: [
        "span600", "span900", "span1200", "span1500", "span1800",
        "faceCount", "levelCount", "frameCols"  // ✅ ここも忘れず追加！
    ]
};

/**
 * APIリクエストを処理するメインのハンドラ関数。
 * @param req リクエストオブジェクト
 * @param res レスポンスオブジェクト
 */
export default async function handler(req: any, res: any) {
    // --- 1. リクエストの検証 ---
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    // --- 2. APIキーの検証 (セキュリティ上、最も重要) ---
    // APIキーは、ホスティングサービスの環境変数（例: VercelのEnvironment Variables）に
    // `GEMINI_API_KEY`という名前で設定する必要があります。
    // このキーが設定されていない場合、API呼び出しは機能しません。
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("重大な設定エラー: 環境変数 'GEMINI_API_KEY' が設定されていません。");
        // このエラーは、デプロイ環境の設定に問題があることを示します。
        return res.status(500).json({ message: "サーバー設定エラー: APIキーが設定されていません。" });
    }

    try {
        // --- 3. リクエストボディの解析と検証 ---
        const { fileBase64, mimeType, userPrompt } = req.body;
        if (!fileBase64 || !mimeType) {
            return res.status(400).json({ message: 'リクエストに画像データまたはMIMEタイプが不足しています。' });
        }

        // --- 4. Gemini APIクライアントの初期化 ---
        const ai = new GoogleGenAI({ apiKey });

        // --- 5. プロンプトの構築 ---
        const filePart = { inlineData: { mimeType, data: fileBase64 } };
        const systemInstruction = `あなたは建設用の足場図面を解析する専門家です。`;

        const taskInstruction = `
図面から以下の情報を抽出し、JSON形式で返してください。

━━━━━━━━━━━━━━━━━━━━━━
【重要】図面の読み取り方針
━━━━━━━━━━━━━━━━━━━━━━
この図面には「建物本体の寸法」と「足場の寸法」が混在しています。
必ず以下のルールに従って、足場の寸法のみを抽出してください。

◆ 足場の寸法を見分ける方法：

1. 【引き出し線に注目】
   ・足場部分（斜線の入った四角、またはバッテン）から引き出し線が出ている
   ・その引き出し線の先に書かれた寸法が足場のスパン情報
   ・例：足場部分 → 引き出し線 → 「@1800×12」

2. 【建物寸法との区別】
   ✗ 通り芯記号（X1, X2, Y1, Y2など）の近くの大きな数字 → これは建物寸法
   ✗ 4桁以上の大きな数字（7000, 9630, 37430など） → これは建物寸法
   ✓ 足場を示す図形から引き出された線の先の数字 → これが足場寸法

3. 【色に依存しない判定】
   ・足場は緑色で描かれることが多いが、常にそうとは限らない
   ・色ではなく、「斜線パターン」「バッテン」「引き出し線」で判定する

━━━━━━━━━━━━━━━━━━━━━━
【0】図面の種類を判定する
━━━━━━━━━━━━━━━━━━━━━━
まず、この図面が平面図か立面図かを判定してください：

◆ 平面図の特徴：
・四角に一本斜線（□に／）が描かれている
・これは足場を上から見た表現
・ここから読み取る情報：スパン方向の個数、枠方向の列数

◆ 立面図の特徴：
・バッテン（□に×）が描かれている
・これはブレス（筋交い）の表現
・ここから読み取る情報：段数（高さ方向）、スパン方向の個数

重要：1枚の図面に平面図と立面図の両方が含まれている場合もあります。

━━━━━━━━━━━━━━━━━━━━━━
【1】スパン方向（長手方向）の寸法
━━━━━━━━━━━━━━━━━━━━━━
以下の各サイズが何個あるか数えてください：
→ span600: 600mmスパンの個数
→ span900: 900mmスパンの個数
→ span1200: 1200mmスパンの個数
→ span1500: 1500mmスパンの個数
→ span1800: 1800mmスパンの個数

【読み取り方法】
1. 足場を示す図形（斜線四角 or バッテン）を探す
2. その図形から引き出し線が出ているか確認する
3. 引き出し線の先に書かれた寸法を読み取る

【図面の記法について】
スパンの個数は図面上で様々な記法で表現されます。以下のいずれの記法でも正確に読み取ってください：
・「12@1800=21600」→ 1800mmスパンが12個
・「@1800×12=21600」→ 1800mmスパンが12個
・「1800×12」→ 1800mmスパンが12個
・「12-1800」→ 1800mmスパンが12個
・「1800 12コ」→ 1800mmスパンが12個

重要：「@」や「×」の前後どちらに個数が書かれていても、必ず個数を正確に抽出してください。

【除外する寸法】
以下は足場のスパンではないので除外してください：
✗ 通り芯記号（X1-X8, Y1-Y7など）の近くの寸法
✗ 4桁以上の大きな数字（例：7000, 9630, 37430）
✗ 引き出し線がない単独の寸法線上の数字

注意点：
・端部の短いスパンも必ず数える
・平面図、立面図の両方に記載がある場合は、より詳細な方を採用
・足場を示す図形から引き出された寸法のみを読み取る
・図面に記載がない場合は 0

━━━━━━━━━━━━━━━━━━━━━━
【2】枠方向（短手方向）の列数
━━━━━━━━━━━━━━━━━━━━━━
以下の各幅の枠が何列あるか数えてください：
→ frameCols.450: 450mm幅の列数
→ frameCols.600: 600mm幅の列数
→ frameCols.900: 900mm幅の列数
→ frameCols.1200: 1200mm幅の列数

【読み取り方法】
1. 主に平面図から読み取る
2. 足場部分から引き出し線が出ている場合、その寸法を確認
3. 引き出し線がない場合は、足場の幅を目視で判断

注意点：
・同じ寸法が図面の両端に書かれていても、実際の列数を数える
・例: 図面に「1200」が左右に書かれていても、列として1つなら 1 を返す
・図面に記載がない場合は 0

━━━━━━━━━━━━━━━━━━━━━━
【3】高さ方向の段数
━━━━━━━━━━━━━━━━━━━━━━
→ levelCount: 垂直方向の段数

注意点：
・主に立面図から読み取る
・バッテン（×印）の段数を数える
・図面から読み取れない場合は 0

━━━━━━━━━━━━━━━━━━━━━━
【判定ルール】
━━━━━━━━━━━━━━━━━━━━━━
✓ 足場から引き出された寸法のみ読み取る
✓ 建物寸法（通り芯、構造寸法）は除外する
✓ 図面に記載がない → 0 を返す
✓ 文字が読めない → 0 を返す
✓ 推測しない → 確実に読める情報のみ抽出
`;

        const userContentParts = [
            { text: taskInstruction },
            { text: "上記のルールに従って、この図面を解析してください。" },
            filePart,
        ];

        // ユーザーからの追加指示があれば、プロンプトに含める
        if (userPrompt) {
            userContentParts.unshift({
                text: `━━━ 最優先指示 ━━━\n${userPrompt}\n━━━━━━━━━━━━━━━\n上記のユーザー指示を最優先で従ってください。`
            });
        }

        // --- 6. Gemini APIの呼び出し ---
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { role: "user", parts: userContentParts },
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema,
            },
        });
        
        // --- 7. 応答の処理と返却 ---
        const jsonString = response.text.trim();
        const parsedData = JSON.parse(jsonString);

        return res.status(200).json(parsedData);

    } catch (error) {
        // --- 8. エラーハンドリング ---
        console.error("Gemini APIの呼び出し中にエラーが発生しました:", error);
        
        const errorMessage = error instanceof Error ? error.message : "不明な内部サーバーエラーです。";

        return res.status(500).json({ message: `AI解析中にエラーが発生しました: ${errorMessage}` });
    }
}
