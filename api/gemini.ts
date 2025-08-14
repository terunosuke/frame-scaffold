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
                "904": { type: Type.INTEGER },
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
    // `API_KEY`という名前で設定する必要があります。
    // このキーが設定されていない場合、API呼び出しは機能しません。
    const apiKey = process.env.VITE_GEMINI_API_KEY ;
    if (!apiKey) {
        console.error("重大な設定エラー: 環境変数 'API_KEY' が設定されていません。");
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
        const systemInstruction = `あなたは建設用の足場図面を解析する専門家です。提供された図面（PDFまたは画像）から以下の情報を抽出し、指定されたJSON形式で正確に返してください。
- 各スパン（600, 900, 1200, 1500, 1800mm）の数。
- 列数（スパン方向と直角の面の数）。
- 各枠方向サイズ（450, 600, 900, 1200mm）の数。
- 段数（垂直方向の層の数）。
📌 **注意**：
- スパン方向について、特に端部の短いスパン（例：1200mmが1本だけなど）も必ず正確に数えてください。  
- 同じ寸法の数値が左右両端に書かれていても、実際に列が連なってない場合は重複として数えず、1列として扱ってください（例：1200が両端にあるだけなら1列とする）。
- 図面から値を特定できない項目は0にしてください。
- 枠方向の読み取れない場合は枠サイズは900、列数は1をデフォルト値としてください。
`;
        
        const userContentParts = [
            { text: "この足場図面を解析してください。" },
            filePart,
        ];

        // ユーザーからの追加指示があれば、プロンプトに含める
        if (userPrompt) {
            userContentParts.unshift({ text: `ユーザーからの追加指示: 「${userPrompt}」。この指示を最優先してください。` });
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
