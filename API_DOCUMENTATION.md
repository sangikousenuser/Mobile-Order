# 外部レジシステム連携API

このAPIは外部のレジシステムと連携するためのエンドポイントです。

## エンドポイント: `/api/payment`

### 1. 注文情報取得 (GET)

バーコードを使って注文情報を取得します。

**リクエスト:**
```
GET /api/payment?barcode={BARCODE}
```

**レスポンス:**
```json
{
  "orderId": "5908c2f7-4eee-4b8d-b667-fb64ae5def3d",
  "tableNumber": "1",
  "items": [
    {
      "name": "チーズバーガー",
      "quantity": 2,
      "price": 1400,
      "subtotal": 2800,
      "notes": ""
    },
    {
      "name": "フライドポテト",
      "quantity": 1,
      "price": 600,
      "subtotal": 600
    }
  ],
  "totalAmount": 3400,
  "status": "ready",
  "customerName": "田中太郎",
  "createdAt": "2025-06-25T10:30:00.000Z"
}
```

### 2. バーコード生成 (POST)

注文確定時にバーコードを生成します（顧客側で使用）。

**リクエスト:**
```json
{
  "orderId": "5908c2f7-4eee-4b8d-b667-fb64ae5def3d"
}
```

**レスポンス:**
```json
{
  "barcode": "ORDER_5908c2f7-4eee-4b8d-b667-fb64ae5def3d_1719313800000",
  "orderId": "5908c2f7-4eee-4b8d-b667-fb64ae5def3d",
  "message": "バーコードが生成されました"
}
```

### 3. 会計完了通知 (PATCH)

レジシステムで会計が完了した際に呼び出します。

**リクエスト:**
```json
{
  "barcode": "ORDER_5908c2f7-4eee-4b8d-b667-fb64ae5def3d_1719313800000",
  "paymentStatus": "completed",
  "paymentMethod": "cash",
  "paidAmount": 3400
}
```

**レスポンス:**
```json
{
  "message": "会計処理が完了しました",
  "orderId": "5908c2f7-4eee-4b8d-b667-fb64ae5def3d",
  "status": "completed"
}
```

## エラーレスポンス

```json
{
  "error": "エラーメッセージ"
}
```

## 利用フロー

1. 顧客がモバイルアプリで注文完了
2. 顧客がお会計ボタンを押して確認
3. システムがバーコードを生成・表示
4. 顧客がレジでバーコードを提示
5. レジシステムがバーコードをスキャン
6. レジシステムが `GET /api/payment?barcode={BARCODE}` で注文情報を取得
7. レジで会計処理を実行
8. レジシステムが `PATCH /api/payment` で会計完了を通知
9. 注文ステータスが「完了」に更新

## セキュリティ

- バーコードには注文IDと生成タイムスタンプが含まれています
- 無効なバーコードは適切にエラーレスポンスを返します
- 存在しない注文IDに対しては404エラーを返します

## 連携テスト用

開発環境でのテスト用にPostmanやcurlコマンドでAPIをテストできます。

**バーコード例:**
```
ORDER_5908c2f7-4eee-4b8d-b667-fb64ae5def3d_1719313800000
```

**テストコマンド例:**
```bash
# 注文情報取得
curl "http://localhost:3000/api/payment?barcode=ORDER_5908c2f7-4eee-4b8d-b667-fb64ae5def3d_1719313800000"

# 会計完了通知
curl -X PATCH http://localhost:3000/api/payment \
  -H "Content-Type: application/json" \
  -d '{
    "barcode": "ORDER_5908c2f7-4eee-4b8d-b667-fb64ae5def3d_1719313800000",
    "paymentStatus": "completed",
    "paymentMethod": "cash",
    "paidAmount": 3400
  }'
```
