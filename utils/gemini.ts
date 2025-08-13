import type { ScaffoldingConfig } from '../types';

/**
 * AIによる図面解析を実行するために、サーバーサイドのAPIエンドポイントを呼び出す。
 * この関数は、ファイルデータとユーザープロンプトをサーバーに送信し、解析結果を待つ。
 *
 * @param fileBase64 - Base64エンコードされたファイルデータ。
 * @param mimeType - ファイルのMIMEタイプ。
 * @param userPrompt - ユーザーからの追加指示。
 * @returns AIによって抽出された足場設定データ。
 * @throws 解析プロセス中にエラーが発生した場合、内容を説明するErrorをスローする。
 */
export async function analyzeScaffoldingFile(
    fileBase64: string,
    mimeType: string,
    userPrompt: string
): Promise<Partial<ScaffoldingConfig>> {
    let response: Response;
    try {
        // サーバーサイドのAPIエンドポイント `/api/gemini` にリクエストを送信
        response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileBase64, mimeType, userPrompt }),
        });
    } catch (networkError) {
        // ネットワーク接続自体に問題がある場合
        console.error("ネットワークエラー:", networkError);
        throw new Error("サーバーに接続できませんでした。ネットワーク接続を確認してください。");
    }

    // 応答のステータスコードを確認
    if (!response.ok) {
        // エラー応答のボディを読み取り、可能な限り詳細な情報を提供する
        let errorMessage = `サーバーエラー (ステータス: ${response.status})`;
        try {
            const errorData = await response.json();
            // サーバーが返した`message`プロパティがあれば、それをエラーメッセージに追加
            if (errorData && errorData.message) {
                errorMessage = errorData.message;
            }
        } catch (jsonError) {
            // エラー応答がJSON形式でない場合、テキストとして読み取ることを試みる
            try {
                const errorText = await response.text();
                if (errorText) {
                    errorMessage = errorText;
                }
            } catch (textError) {
                // テキストの読み取りにも失敗した場合
                 console.error("エラー応答の読み取りに失敗しました:", textError);
            }
        }
        console.error("APIエラー:", errorMessage);
        // このエラーメッセージはユーザーに直接表示されるため、分かりやすく整形
        throw new Error(`図面・画像の解析に失敗しました。(${errorMessage})`);
    }

    try {
        // 正常な応答をJSONとしてパース
        const data = await response.json();
        return data as Partial<ScaffoldingConfig>;
    } catch (parsingError) {
        // サーバーからの応答が期待されるJSON形式でない場合
        console.error("JSONパースエラー:", parsingError);
        throw new Error("サーバーから予期しない形式の応答がありました。");
    }
}
