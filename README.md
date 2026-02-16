# NexTask - 本番公開（デプロイ）完全ガイド

NexTaskを世界中に公開し、友人が401エラーなしで閲覧できるようにするための手順書です。

## 💰 料金と「予算額」について
Firebase App Hosting を利用するには、Firebase プロジェクトを **「Blaze プラン（従量制）」** にアップグレードする必要があります。

- **無料枠があります**: 小規模な利用であれば、多くの場合 **実質 0 円** で運用可能です。
- **予算額（予算アラート）**: 支払う金額ではなく「この金額に近づいたら通知する」しきい値です。まずは **1,000円** 程度に設定するのが安心です。

## 🚀 GitHub ログイン用のトークン発行（重要）

`git push` をした際に認証エラーが出る場合は、GitHubの「パーソナルアクセストークン (PAT)」が必要です。

### トークンの発行方法
1. GitHubの **Settings > Developer settings > Personal access tokens > Tokens (classic)** を開く。
2. 「Generate new token (classic)」をクリック。
3. **Note (注記)**: `NexTask-Token` と入力（なんでもOKです）。
4. **Expiration (有効期限)**: `30 days` または `No expiration`（推奨）を選択。
5. **Select scopes (スコープ)**: 一番上の **`repo`** にチェックを入れる（これにより送信権限が付与されます）。
6. 一番下の「Generate token」をクリック。
7. 表示された `ghp_...` で始まる長い文字列をコピーする（※一度しか表示されないので、メモ帳などに必ず控えてください）。

## 🚀 GitHub へのコード送信手順

ターミナルで以下のコマンドを順番に実行します。

### 1. 送信先の再設定
```bash
git remote remove origin
git remote add origin https://github.com/s0823pro-cmyk/nextask-app.git
```

### 2. 送信の実行
```bash
git push -u origin main
```

### 🔑 ログインを求められたら
1. **Username**: `s0823pro-cmyk` と入力して Enter。
2. **Password**: 先ほど発行した **「パーソナルアクセストークン (PAT)」** を貼り付けて Enter。
   - ※貼り付けても画面には何も表示されませんが、入力はされています。

### 💡 どうしてもエラーが出る場合の「最終手段」
以下の `[あなたのトークン]` の部分を自分のトークン（ghp_...）に書き換えて、一行で実行してください。
```bash
git remote set-url origin https://[あなたのトークン]@github.com/s0823pro-cmyk/nextask-app.git
git push -u origin main
```

---

## 🚀 デプロイ手順（Firebase App Hosting）

GitHubにファイルが表示されたら、Firebaseコンソールで設定します。

1. [Firebase Console](https://console.firebase.google.com/) > **「App Hosting」** を選択。
2. GitHub リポジトリ（`nextask-app`）を選択。
3. **設定**:
   - **ライブブランチ**: `main`
   - **アプリのルートディレクトリ**: 空欄（デフォルト）
   - **リージョン**: `asia-east1` (台湾) を推奨
4. 「デプロイ」を実行。