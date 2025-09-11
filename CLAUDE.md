# CLAUDE.md

このファイルは Claude Code (claude.ai/code) が、このリポジトリのコードを扱う際のガイドラインを提供します。  

---

## プロジェクト概要
本プロジェクトは **建設業向けの足場計算アプリ** です。  
部材の数量・重量を計算し、搬入車両の見積もりまで行います。  
Google の Gemini API を利用して PDF 図面から自動的に足場条件を読み取る機能も備えています。  

---

## 開発コマンド

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番ビルドのプレビュー
npm run preview
```

---

## 環境設定
- `.env` ファイルを作成し、`VITE_GEMINI_API_KEY=your_gemini_api_key` を設定  
- Gemini API キーは PDF 解析機能に必要  

---

## アーキテクチャ概要

### データの流れ
1. **入力層**: `components/InputForm.tsx` で足場条件を入力  
2. **計算エンジン**: `hooks/useScaffoldingCalculator.ts` が `constants.ts` のルールを使って処理  
3. **AI解析**: `utils/gemini.ts` と `utils/fileProcessor.ts` が PDF を解析  
4. **出力層**: 結果・確認・履歴をタブで表示  

---

## 主なビジネスロジック
- `useScaffoldingCalculator.ts`  
  - 部材数量・重量・特殊部材（ジャッキベース、アンチ、巾木、壁つなぎ等）の計算処理  
  - 4t車を基準とした運搬台数の見積もり  

- `constants.ts`  
  - 重量表（`WEIGHT_DICT`）  
  - 仕様コード（`SPEC_MAP`）  

- `fileProcessor.ts`  
  - PDF を画像へ変換  

- `gemini.ts`  
  - Gemini API を呼び出し、足場データを抽出  

---

## 型定義・定数
- `types.ts`  
  - `ScaffoldingConfig`（入力パラメータ）  
  - `CalculationResults`（計算結果）  
  - `ValidationResults`（バリデーション結果）  

---

## コンポーネント構成
- **タブ構成 (`react-tabs`)**
  - 入力設定  
  - 内容確認  
  - 計算結果・重量・運搬台数  
  - AI解析履歴  

- **入力方法**
  - 手動入力  
  - Excel入出力  
  - PDF解析  
  - 過去設定の再利用  

---

## 足場業務知識
- スパン種類: 600mm / 900mm / 1200mm / 1500mm / 1800mm  
- 段ごとの高さ設定  
- 部材: ジャッキベース、アンチ、巾木  
- 安全設備: 壁つなぎ、層間ネット、外周シート  
- 搬送: 4t車を基準に最適化  

---

## ファイル処理制約
- PDF画像は最大1536pxにリサイズ  
- 圧縮率 0.8 に設定  
- レンダリング倍率は1.5x  
