# Booking API

## POST `/api/booking`

Schedule a property visit.

### Request Body

| Field              | Type   | Required | Description                     |
|--------------------|--------|----------|---------------------------------|
| propertyId         | string | yes      | Property ID to schedule visit   |
| name               | string | yes      | Full name of the visitor        |
| nif                | string | yes      | NIF or passport number          |
| utilityBillCount   | number | no       | Number of utility bill files    |
| incomeReceiptCount | number | no       | Number of income receipt files  |

> **Note:** File uploads are currently tracked by count only. In production, files should be uploaded via multipart/form-data or a separate upload endpoint with presigned URLs.

### Validation Rules

- `propertyId` must be a non-empty string
- `name` must be a non-empty string
- `nif` must be at least 6 characters

### Response

```json
{
  "success": true,
  "bookingId": "mock-1709712000000",
  "propertyId": "property-123",
  "message": "Booking created successfully"
}
```

### Authentication

Not implemented yet. Production version will require authenticated user session.

### File Storage

Not implemented yet. Production version should:
- Accept file uploads via multipart/form-data or presigned URL flow
- Store files in S3/GCS with server-side encryption
- Associate files with the booking record
- Validate file types (PDF, JPG, PNG) and size limits (max 10MB per file)
