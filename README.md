# NexTask - 本番公開（デプロイ）完全ガイド

NexTaskを世界中に公開し、友人が401エラーなしで閲覧できるようにするための手順書です。

## 💰 料金と「予算額」について
Firebase App Hosting を利用するには、Firebase プロジェクトを **「Blaze プラン（従量制）」** にアップグレードする必要があります。

- **無料枠があります**: 小規模な利用（月間数千アクセス程度）であれば、Google Cloud の無料枠内に収まるため、多くの場合 **実質 0 円** で運用可能です。
- **予算額（予算アラート）の設定**: 設定画面で求められる「予算額」は、支払う金額ではなく、**「この金額に近づいたらメールで通知する」ためのしきい値**です。
  - **推奨設定**: まずは **1,000円** 程度に設定しておくのが安心です。
- クレジットカードの登録が必要ですが、無料枠を超えない限り請求は発生しません。

## 🚀 GitHub へのコード送信手順

Firebase App Hosting を利用するには、まずコードを GitHub に保存する必要があります。

### 1. GitHub リポジトリの準備
- GitHub で「空のリポジトリ」を作成します。
- **重要**: README、.gitignore、License の追加には**チェックを入れない**でください。
- リポジトリの URL（`https://github.com/.../nextask-app.git`）をコピーします。

### 2. 開発環境のターミナルで実行
画面下部の「Terminal」タブを開き、以下のコマンドを一行ずつ実行してください。

```bash
# Gitの初期化
git init

# ファイルのステージング
git add .

# コミット
git commit -m "initial version of nextask"

# メインブランチの指定
git branch -M main

# リモートリポジトリの紐付け（コピーしたURLに書き換えてください）
git remote add origin https://github.com/あなたの名前/nextask-app.git

# GitHubへ送信
git push -u origin main
```

---

## 🚀 デプロイ手順（Firebase App Hosting）

1. [Firebase Console](https://console.firebase.google.com/) にアクセス。
2. 左メニューから **「App Hosting」** を選択し、**「開始」** をクリック。
3. 作成した GitHub リポジトリを選択。
4. **リージョンの選択**:
   - 第1候補: **`asia-northeast1` (Tokyo)** または **`asia-northeast2` (Osaka)**
   - 第2候補: **`asia-east1` (Taiwan)** ← 東京・大阪がない場合はこちらがおすすめ
   - これらは日本から近く、高速に動作します。
5. 設定はデフォルトのままで「デプロイ」を実行。
6. 数分後、完了すると `https://[プロジェクト名].web.app` という本番用URLが発行されます。

---

## ⚠️ 公開後の重要設定（Authentication）

アプリを正常に動作させるため、Firebaseコンソールの **Authentication > Sign-in method** で以下が「有効」であることを確認してください。
- **匿名 (Anonymous)**: 取引先がログインなしで閲覧するために必須。
- **Google**: 管理者としてログインするために必須。

---

## 🛠 トラブルシューティング

### 友人が開こうとすると 401 エラーが出る
- **原因**: 開発環境のURL（`workstations.cloud.google.com` を含むもの）を共有しています。
- **解決策**: App Hosting のダッシュボードに表示されている、**`.web.app` で終わる本番用URL**を共有してください。
