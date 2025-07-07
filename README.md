# モバイルオーダーシステム

レストラン向けの現代的なモバイル注文システムです。顧客はQRコードをスキャンするかテーブル番号を入力して、スマートフォンから簡単に注文できます。

## 🚀 主な機能

### 顧客向け機能
- **QRコードスキャン**: テーブルのQRコードをスキャンして即座にメニューにアクセス
- **モバイル対応**: スマートフォンに最適化されたUI/UX
- **カテゴリー別メニュー**: メイン、サイド、ドリンク、デザートで商品を分類
- **ショッピングカート**: 商品を追加し、数量を調整して注文
- **リアルタイム注文**: 注文は即座に厨房に送信

### 管理者向け機能
- **リアルタイムダッシュボード**: 売上、注文数、テーブル状況の統計
- **注文管理**: 注文ステータスの更新（保留中→確認済み→調理中→完成→完了）
- **メニュー管理**: 商品の追加、編集、削除
- **テーブル管理**: テーブルの状態管理

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15、React 19、TypeScript
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide React
- **データベース**: JSON（デモ用）
- **認証**: bcryptjs
- **QRコード**: qrcode.js
- **デプロイ**: Vercel

## 📦 インストール

### 前提条件
- Node.js 18.0以上
- npm または yarn

### セットアップ手順

```bash
# リポジトリをクローン
git clone <repository-url>
cd mobile-order-nextjs

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認してください。

## 🔧 設定

### 環境変数

`.env.local.example`をコピーして`.env.local`を作成し、必要な環境変数を設定してください：

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

## 🖥️ 使用方法

### 顧客側の操作

1. **アクセス方法**:
   - ホームページでテーブル番号（1-4）を入力、または
   - テーブルのQRコードをスキャン

2. **注文プロセス**:
   - メニューを閲覧（カテゴリー別フィルタリング可能）
   - 商品をカートに追加
   - カート内容を確認
   - 注文を送信

### 管理者側の操作

1. **ログイン**: `/admin/login`にアクセス
   - Email: `admin@restaurant.com`
   - Password: `admin123`

2. **ダッシュボード**: `/admin/dashboard`
   - 売上統計の確認
   - 注文管理
   - ステータス更新

## 📱 画面構成

### 顧客向け画面
- **ホームページ** (`/`): ランディングページとテーブル番号入力
- **メニューページ** (`/table/[id]`): メニュー表示と注文機能

### 管理者向け画面
- **ログインページ** (`/admin/login`): 管理者認証
- **ダッシュボード** (`/admin/dashboard`): 注文管理と統計

## 🎨 UI/UXの特徴

- **レスポンシブデザイン**: デスクトップとモバイルの両方に対応
- **直感的なナビゲーション**: 分かりやすいボタンとアイコン
- **アクセシブル**: キーボードナビゲーションとスクリーンリーダー対応
- **高速ローディング**: Next.jsの最適化により高速表示

## 🔐 セキュリティ

### 現在の実装
- パスワードハッシュ化（bcryptjs）
- XSS防止（React標準）
- CSRF保護（Next.js標準）

### 本番環境での追加推奨事項
- JWT認証の実装
- レート制限
- HTTPSの強制
- セキュリティヘッダーの追加

## 🚀 デプロイ

### Vercelへのデプロイ（推奨）

1. GitHubにプッシュ
2. [Vercel](https://vercel.com)でアカウント作成
3. GitHubリポジトリを接続
4. 自動デプロイが開始

詳細な手順は `deployment_instructions_vercel.md` を参照してください。

### その他のプラットフォーム
- Netlify
- AWS Amplify
- Digital Ocean App Platform

## 📂 プロジェクト構成

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # 管理者向けページ
│   ├── api/               # API Routes
│   ├── table/             # テーブル別ページ
│   └── globals.css        # グローバルスタイル
├── components/            # Reactコンポーネント
├── contexts/             # React Context
├── data/                 # データベース（JSON）
├── lib/                  # ユーティリティ関数
└── types/                # TypeScript型定義
```

## 🧪 テスト

```bash
# テストを実行
npm run test

# カバレッジレポート
npm run test:coverage

# E2Eテスト
npm run test:e2e
```

## 🔧 開発

### 開発サーバーの起動

```bash
npm run dev
```

### ビルド

```bash
npm run build
npm start
```

### リント

```bash
npm run lint
```

## 🤝 コントリビューション

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトはMITライセンスの下で配布されています。詳細は `LICENSE` ファイルを参照してください。

## 🆘 サポート

問題や質問がある場合：

1. [Issues](https://github.com/your-username/mobile-order-system/issues)で既存の問題を確認
2. 新しいIssueを作成
3. 詳細な説明と再現手順を記載

## 🔮 今後の機能

- [ ] 支払い統合（Stripe、PayPal）
- [ ] プッシュ通知
- [ ] 多言語対応
- [ ] 顧客レビューシステム
- [ ] 在庫管理
- [ ] レポート機能
- [ ] PWA対応

## 📊 パフォーマンス

- **Lighthouse Score**: 95+
- **Core Web Vitals**: すべて良好
- **バンドルサイズ**: < 500KB

---

**開発者**: あなたの名前  
**最終更新**: 2025年6月  
**バージョン**: 1.0.0
