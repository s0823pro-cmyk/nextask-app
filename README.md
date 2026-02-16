# NexTask - 本番公開（デプロイ）完全ガイド

NexTaskを世界中に公開し、友人が401エラーなしで閲覧できるようにするための手順書です。

## 💰 料金と「予算額」について
Firebase App Hosting を利用するには、Firebase プロジェクトを **「Blaze プラン（従量制）」** にアップグレードする必要があります。

- **無料枠があります**: 小規模な利用であれば、多くの場合 **実質 0 円** で運用可能です。
- **予算額（予算アラート）**: 支払う金額ではなく「この金額に近づいたら通知する」しきい値です。まずは **1,000円** 程度に設定するのが安心です。

## 🚀 GitHub へのコード送信（重要：詰まったらここを見てください）

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

### 🔑 ログインを求められたら（認証の突破方法）

`git push` をした後に、以下のいずれかが表示されます。

#### A. 「Username」と「Password」を求められた場合
1. **Username**: `s0823pro-cmyk` と入力して Enter。
2. **Password**: **GitHubのパスワードではありません！** GitHubで発行した **「パーソナルアクセストークン (PAT)」** を貼り付けて Enter。
   - ※貼り付けても画面には何も表示されませんが、入力はされています。

#### B. どうしてもエラーが出る場合の「最終手段」
GitHubで発行したトークン（例: `ghp_xxxx...`）を直接URLに埋め込んで送信します。
以下の `[あなたのトークン]` の部分を自分のトークンに書き換えて実行してください。
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
   - **アプリのルートディレクトリ**: 空欄（または `/`）
   - **リージョン**: `asia-east1` (台湾)
4. 「デプロイ」を実行。

完了すると、ついに本番用URLが発行されます！
