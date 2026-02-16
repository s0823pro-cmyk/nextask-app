# NexTask - 本番公開（デプロイ）完全ガイド

NexTaskを世界中に公開し、友人が401エラーなしで閲覧できるようにするための手順書です。

## 💰 料金と「予算額」について
Firebase App Hosting を利用するには、Firebase プロジェクトを **「Blaze プラン（従量制）」** にアップグレードする必要があります。

- **無料枠があります**: 小規模な利用であれば、多くの場合 **実質 0 円** で運用可能です。
- **予算額（予算アラート）**: 支払う金額ではなく「この金額に近づいたら通知する」しきい値です。まずは **1,000円** 程度に設定するのが安心です。

## 🚀 GitHub へのコード送信手順（決定版）

ターミナルで以下のコマンドを一行ずつ、順番に実行してください。

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

**【注意】ユーザー名やパスワードを求められたら**
- `Username`: `s0823pro-cmyk` を入力。
- `Password`: GitHubで発行した「パーソナルアクセストークン」を入力（※本物のパスワードではエラーになります）。

---

## 🚀 デプロイ手順（Firebase App Hosting）

GitHubにファイルが表示されたら、Firebaseコンソールで設定します。

1. [Firebase Console](https://console.firebase.google.com/) > **「App Hosting」** を選択。
2. GitHub リポジトリ（`nextask-app`）を選択。
3. **設定**:
   - **ライブブランチ**: `main`
   - **アプリのルートディレクトリ**: 空欄（または `/`）
   - **リージョン**: `asia-east1` (台湾)
4. 「デプロイ」を実行。完了すると本番用URL（`.web.app`）が発行されます。
