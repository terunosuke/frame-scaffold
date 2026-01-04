
import * as pdfjsLib from 'pdfjs-dist';

// 注: このファイルはクライアントサイド（ブラウザ）で実行されるユーティリティです。

// PDF.jsのワーカーを設定。これにより、PDFの解析がメインスレッドをブロックせずに行われる。
// esm.shのCDN経由でワーカーを取得している。
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs`;

// --- 定数定義 ---
// 処理後の画像の最大辺の長さ（ピクセル）。サーバーレス関数のペイロード上限を考慮し、値を調整。
const MAX_IMAGE_DIMENSION = 2048; // 1536から向上（+33%）- 図面の細かい文字を読み取りやすく
// 処理後のJPEG画像の品質（0.0〜1.0）。
const IMAGE_QUALITY = 0.92; // 0.8から向上 - ほぼロスレス圧縮で文字の鮮明さを保持
// PDFをレンダリングする際の解像度スケール。高解像度すぎるとペイロード上限を超えるため値を調整。
const PDF_RENDER_SCALE = 2.0; // 1.5から向上（+33%）- PDF内の小さな寸法表記を読み取りやすく


/**
 * Data URL (例: `data:image/jpeg;base64,...`) からBase64部分のみを抽出するヘルパー関数。
 * @param dataUrl - Base64エンコードされたデータを含むData URL。
 * @returns Base64文字列。
 */
const getBase64FromDataUrl = (dataUrl: string): string => dataUrl.split(',')[1];

/**
 * 画像ファイル（JPEG/PNG）を処理する。
 * 画像が大きすぎる場合はリサイズし、常にJPEG形式に圧縮して返す。
 * @param file - 処理対象の画像ファイル。
 * @returns Base64エンコードされた画像データとそのMIMEタイプを含むオブジェクトのPromise。
 */
async function processImage(file: File): Promise<{ base64Data: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Canvasの2Dコンテキストを取得できませんでした。'));
                }

                let { width, height } = img;

                // 画像の幅または高さが最大許容サイズを超えている場合はリサイズ
                if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
                    if (width > height) {
                        height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
                        width = MAX_IMAGE_DIMENSION;
                    } else {
                        width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
                        height = MAX_IMAGE_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // 形式をJPEGに統一し、圧縮してData URLを取得
                const dataUrl = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
                resolve({
                    base64Data: getBase64FromDataUrl(dataUrl),
                    mimeType: 'image/jpeg',
                });
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

/**
 * PDFファイルを処理する。
 * 最初の1ページを高解像度の画像としてレンダリングし、圧縮されたJPEG形式で返す。
 * @param file - 処理対象のPDFファイル。
 * @returns レンダリングされた画像のBase64データとMIMEタイプを含むオブジェクトのPromise。
 */
async function processPdf(file: File): Promise<{ base64Data: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async (event) => {
            try {
                if (!event.target?.result) {
                    return reject(new Error("PDFファイルの読み込みに失敗しました。"));
                }
                const pdfData = new Uint8Array(event.target.result as ArrayBuffer);
                // PDFドキュメントを読み込む
                const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
                // 最初のページを取得
                const page = await pdf.getPage(1);

                // 指定されたスケールでビューポートを作成
                const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                 if (!ctx) {
                    return reject(new Error('Canvasの2Dコンテキストを取得できませんでした。'));
                }

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // ページの内容をCanvasに描画
                await page.render({ canvasContext: ctx, viewport: viewport }).promise;

                // Canvasの内容を圧縮されたJPEG形式のData URLに変換
                const dataUrl = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
                resolve({
                    base64Data: getBase64FromDataUrl(dataUrl),
                    mimeType: 'image/jpeg',
                });

            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
    });
}


/**
 * ユーザーが選択したファイル（PDF, JPEG, PNG）をAI解析のために前処理する。
 * 大きな画像はリサイズ・圧縮され、PDFは最初のページが画像に変換される。
 * これにより、サーバー側のファイルサイズ上限を超えるのを防ぐ。
 * @param file - ユーザーが選択したファイル。
 * @returns 前処理後のBase64データと最終的なMIMEタイプを含むオブジェクトのPromise。
 */
export async function processFileForAnalysis(file: File): Promise<{ base64Data: string; mimeType: string }> {
    if (file.type === 'application/pdf') {
        return processPdf(file);
    } else if (file.type === 'image/jpeg' || file.type === 'image/png') {
        return processImage(file);
    } else {
        // サポートされていないファイル形式の場合はエラー
        return Promise.reject(new Error('サポートされていないファイル形式です。PDF, JPEG, PNGのいずれかを使用してください。'));
    }
}