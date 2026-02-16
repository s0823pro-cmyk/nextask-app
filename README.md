# NexTask - 本番公開（デプロイ）完全ガイド

NexTaskを世界中に公開し、友人が401エラーなしで閲覧できるようにするための手順書です。

## 🚀 GitHub へのコード送信手順

Firebase App Hosting を利用するには、まずコードを GitHub に保存する必要があります。

### 1. GitHub リポジトリの準備
- [GitHub](https://github.com/) にサインイン。
- 「New repository」から新しいリポジトリ（例：`nextask-app`）を **Public** または **Private** で作成。
- 作成後の画面に表示されるリポジトリの URL（`https://github.com/ユーザー名/リポジトリ名.git`）をコピー。

### 2. 開発環境のターミナルで実行
開発環境（Firebase Studio）の下部にあるターミナルを開き、以下のコマンドを順に実行します。

```bash
# Gitの初期化
git init

# ファイルのステージング
git add .

# コミット（記録）
git commit -m "initial version of nextask"

# メインブランチの指定
git branch -M main

# リモートリポジトリの紐付け（URLはコピーしたものに書き換え）
git remote add origin https://github.com/あなたの名前/nextask-app.git

# GitHubへ送信
git push -u origin main
```

---

## 🚀 デプロイ手順（Firebase App Hosting）

コードが GitHub に上がったら、以下の手順で公開します。

1. [Firebase Console](https://console.firebase.google.com/) にアクセス。
2. 左メニューから **「App Hosting」** を選択し、**「開始」** をクリック。
3. 作成した GitHub リポジトリを選択。
4. 設定はデフォルトのままで「デプロイ」を実行。
5. 完了すると `https://[プロジェクト名].web.app` という本番用URLが発行されます。

---

## ⚠️ 公開後の重要設定（Authentication）

アプリを正常に動作させるため、Firebaseコンソールの **Authentication > Sign-in method** で以下のステータスが「有効」になっていることを再度確認してください。
- **匿名 (Anonymous)**: 取引先がログインなしで閲覧するために必須。
- **Google**: あなたが管理者としてログインするために必須。

---

## 🛠 トラブルシューティング

### 友人が開こうとすると 401 エラーが出る
- **原因**: 開発環境のURL（`workstations.cloud.google.com` を含むもの）を共有しています。
- **解決策**: App Hosting のダッシュボードに表示されている、**`.web.app` で終わる本番用URL**を共有してください。
