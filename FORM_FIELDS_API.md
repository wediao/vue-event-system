# 表單欄位管理 API 文檔

## 概述

表單欄位管理 API 提供了完整的 CRUD 操作來管理活動註冊表單的自定義欄位。所有需要修改資料的操作都需要管理員身份驗證。

## 基本資訊

- **Base URL**: `http://localhost:3000/api/form-fields`
- **驗證方式**: Bearer Token (管理員權限)
- **資料格式**: JSON

## API 端點

### 1. 獲取所有欄位

```http
GET /api/form-fields
```

**回應**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "field_name": "name",
      "field_label": "姓名",
      "field_element": "input",
      "field_input_type": "text",
      "placeholder": "請輸入姓名",
      "required": true,
      "createdAt": "2025-07-15T03:26:25.788Z",
      "updatedAt": "2025-07-15T03:26:25.788Z"
    }
  ]
}
```

### 2. 獲取單個欄位

```http
GET /api/form-fields/:id
```

**回應**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "field_name": "name",
    "field_label": "姓名",
    "field_element": "input",
    "field_input_type": "text",
    "placeholder": "請輸入姓名",
    "required": true,
    "createdAt": "2025-07-15T03:26:25.788Z",
    "updatedAt": "2025-07-15T03:26:25.788Z"
  }
}
```

### 3. 創建新欄位

```http
POST /api/form-fields
Authorization: Bearer {admin-token}
Content-Type: application/json
```

**請求資料**:
```json
{
  "field_name": "email",
  "field_label": "電子郵件",
  "field_element": "input",
  "field_input_type": "email",
  "placeholder": "請輸入電子郵件",
  "required": true
}
```

**回應**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "field_name": "email",
    "field_label": "電子郵件",
    "field_element": "input",
    "field_input_type": "email",
    "placeholder": "請輸入電子郵件",
    "required": true,
    "createdAt": "2025-07-15T03:26:25.788Z",
    "updatedAt": "2025-07-15T03:26:25.788Z"
  }
}
```

### 4. 更新欄位

```http
PUT /api/form-fields/:id
Authorization: Bearer {admin-token}
Content-Type: application/json
```

**請求資料**:
```json
{
  "field_name": "email_updated",
  "field_label": "更新後的電子郵件",
  "field_element": "input",
  "field_input_type": "email",
  "placeholder": "請輸入更新後的電子郵件",
  "required": false
}
```

### 5. 刪除欄位

```http
DELETE /api/form-fields/:id
Authorization: Bearer {admin-token}
```

**回應**:
```json
{
  "success": true,
  "message": "表單欄位已刪除"
}
```

### 6. 驗證欄位名稱

```http
POST /api/form-fields/validate
Authorization: Bearer {admin-token}
Content-Type: application/json
```

**請求資料**:
```json
{
  "field_name": "test_name",
  "exclude_id": "uuid" // 可選，用於更新時排除自己
}
```

**回應**:
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "message": "欄位名稱可用"
  }
}
```

### 7. 批量更新欄位順序

```http
PUT /api/form-fields/order
Authorization: Bearer {admin-token}
Content-Type: application/json
```

**請求資料**:
```json
[
  { "id": "uuid1" },
  { "id": "uuid2" },
  { "id": "uuid3" }
]
```

## 欄位屬性說明

| 屬性 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `field_name` | string | ✅ | 欄位名稱，用於程式識別，必須唯一 |
| `field_label` | string | ✅ | 顯示標籤，使用者看到的文字 |
| `field_element` | string | ✅ | 欄位類型：`input`, `textarea`, `select` |
| `field_input_type` | string | ❌ | 當 `field_element` 為 `input` 時的類型 |
| `placeholder` | string | ❌ | 提示文字 |
| `required` | boolean | ❌ | 是否必填，預設 `false` |
| `options` | array | ❌ | 當 `field_element` 為 `select` 時的選項 |

## 錯誤處理

所有 API 都會返回統一的錯誤格式：

```json
{
  "success": false,
  "message": "錯誤描述"
}
```

常見錯誤：
- `400`: 請求資料無效
- `401`: 未授權（需要管理員權限）
- `404`: 資源不存在
- `500`: 伺服器內部錯誤

## 前端使用範例

```javascript
import { formFieldService } from '@/services/formFieldService'

// 獲取所有欄位
const fields = await formFieldService.getFields()

// 創建新欄位
const newField = await formFieldService.createField({
  field_name: 'phone',
  field_label: '電話號碼',
  field_element: 'input',
  field_input_type: 'tel',
  required: true
})

// 更新欄位
const updatedField = await formFieldService.updateField(fieldId, {
  field_label: '更新後的標籤'
})

// 刪除欄位
await formFieldService.deleteField(fieldId)
```

## 資料持久化

所有表單欄位資料都會自動儲存到伺服器的內部資料結構中，並在伺服器重啟時保持狀態。 