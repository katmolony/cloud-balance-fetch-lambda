# ☁️ cloud-balance-fetch-lambda

This AWS Lambda function is part of the **Cloud Balance** project. It fetches AWS cost and EC2 resource data for a given IAM role using temporary credentials via **STS AssumeRole**, then returns the data to the backend for storage.

---

## 🚀 Features

- Assumes an IAM role using STS with optional `external_id`
- Fetches:
  - 💰 **Cost Explorer data** (Unblended costs for the last day)
  - 🖥️ **EC2 instance details** (IDs, Tags)
- Returns structured JSON for API processing and storage
- Designed for **secure cross-account access**

---

## 📦 Project Structure

```
cloud-balance-fetch-lambda/
│
├── src/                   # Lambda source code
│   ├── index.js           # Lambda handler
│   ├── fetchCostData.js   # AWS Cost Explorer client logic
│   ├── fetchEC2Data.js    # EC2 client logic
│   └── assumeRole.js      # STS AssumeRole logic
│
├── package.json           # Lambda dependencies (uses aws-sdk v3)
└── README.md              # You're here!
```

---

## ⚙️ Setup & Deployment

### Prerequisites

- Node.js 18+
- AWS CLI configured
- Terraform installed
- A valid IAM Role to assume in the target AWS account

### 1. Install Dependencies

```bash
npm install
```

### 2. Zip for Deployment

From the project root:

```bash
zip -r lambda.zip src node_modules package.json
```

Then move the zip to your Terraform repo:

```bash
mv lambda.zip ../terraform-aws-backend/
```

## 🧪 Local Testing

You can test the Lambda locally using:

```js
node -e "require('./src/index').handler({
  user_id: 123,
  role_arn: 'arn:aws:iam::123456789012:role/TestRole',
  external_id: 'optional-external-id'
}, {}, console.log)"
```

Or write a test script using `aws-sdk-client-mock` for mocking AWS responses.

---

## 📥 Expected Input

```json
{
  "user_id": 123,
  "role_arn": "arn:aws:iam::123456789012:role/TestRole",
  "external_id": "optional-external-id"
}
```

---

## 📤 Response Format

```json
{
  "user_id": 123,
  "cost": [
    {
      "TimePeriod": { "Start": "2025-04-01", "End": "2025-04-02" },
      "Total": {
        "UnblendedCost": { "Amount": "12.34" }
      }
    }
  ],
  "ec2_instances": [
    {
      "Instances": [
        {
          "InstanceId": "i-abc123",
          "Tags": [{ "Key": "Env", "Value": "Prod" }]
        }
      ]
    }
  ]
}
```

---

## 🔒 Security Notes

- No hardcoded credentials are used.
- All AWS access is done via `AssumeRole` using secure STS temporary credentials.
- Role trust policies must allow the Lambda's execution role to assume the target role.

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

## ✨ Credits

Part of the **Cloud Balance** final year project.
Maintained by [Kate](https://github.com/katmolony).