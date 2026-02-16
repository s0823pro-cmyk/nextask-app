# NexTask - 本番公開（デプロイ）完全ガイド

NexTaskを世界中に公開し、友人が401エラーなしで閲覧できるようにするための手順書です。

## 💰 料金と「予算額」について
Firebase App Hosting を利用するには、Firebase プロジェクトを **「Blaze プラン（従量制）」** にアップグレードする必要があります。

- **無料枠があります**: 小規模な利用であれば、多くの場合 **実質 0 円** で運用可能です。
- **予算額（予算アラート）**: 支払う金額ではなく「この金額に近づいたら通知する」しきい値です。まずは **1,000円** 程度に設定するのが安心です。

## 🚀 GitHub へのコード送信手順

ターミナルで以下のコマンドを一行ずつ実行してください。

### 1. 以前の設定を削除
```bash
git remote remove origin
```

### 2. 正しいURL（s0823pro-cmyk様のURL）を登録
```bash
git remote add origin https://github.com/s0823pro-cmyk/nextask-app.git
```

### 3. 送信を実行
```bash
git push -u origin main
```

---

## 🔑 認証（ログイン）で止まったら

`git push` をした後に、以下のいずれかが表示されます。

### A. 「Password」を求められた場合
これはGitHubの通常のパスワードではなく、**「パーソナルアクセストークン」**を入力してください。
1. GitHubの [Settings] > [Developer settings] > [Personal access tokens] > [Tokens (classic)] で発行します。
2. 権限（Scopes）は `repo` にチェックを入れればOKです。
3. 発行された文字列をコピーし、ターミナルの `Password:` のあとに貼り付けます（※貼り付けても文字は表示されませんが、入力はされています）。

### B. 「device login」や「code」が表示された場合
1. ターミナルに表示されている 8桁の英数字（例: `ABCD-1234`）をコピーします。
2. ブラウザで `https://github.com/login/device` を開きます。
3. コードを入力して [Continue] を押せば、ターミナル側の処理が自動で進みます。

---

## 🚀 デプロイ手順（Firebase App Hosting）

GitHubにファイルが表示されたら、Firebaseコンソールで設定します。

1. [Firebase Console](https://console.firebase.google.com/) > **「App Hosting」** を選択。
2. GitHub リポジトリ（`nextask-app`）を選択。
3. **設定**:
   - **ライブブランチ**: `main`
   - **アプリのルートディレクトリ**: 空欄
   - **リージョン**: `asia-east1` (台湾)
4. 「デプロイ」を実行。

完了すると、ついに本番用URLが発行されます！
