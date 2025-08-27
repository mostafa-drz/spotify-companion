# OIDC Setup CLI Tool

Interactive CLI tool to automate OIDC (OpenID Connect) setup between Vercel and Google Cloud Platform.

## Quick Start

```bash
npm run oidc:setup
```

## Prerequisites

- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) (`gcloud`)
- [Vercel CLI](https://vercel.com/docs/cli) (`vercel`)
- Node.js 18+ and npm

## Features

- 🔐 **Interactive Setup**: Guided step-by-step configuration
- 🌍 **Multi-Environment Support**: Configure production, preview, and development environments
- 🔑 **Flexible Role Assignment**: Assign IAM roles or skip for manual assignment
- 📋 **Auto-Detection**: Automatically detects Vercel teams, projects, and GCP accounts
- 🛡️ **Permission Validation**: Checks required IAM permissions before setup
- 📄 **Configuration Export**: Generates environment variables and saves config
- 🔧 **CLI Automation**: Automatically sets environment variables in Vercel via CLI
- 📦 **Package Management**: Checks and installs required npm packages
- 🛠️ **Tool Verification**: Validates gcloud and vercel CLI installations
- ⚡ **Graceful Workflow**: Skip any step and complete manually if needed

## Commands

### Setup OIDC

```bash
npm run oidc:setup
```

### List GCP Accounts

```bash
npm run oidc:accounts
```

### List GCP Projects

```bash
npm run oidc:projects
```

## Environment Support

The tool supports three environments:

- **Production**: `production`
- **Preview**: `preview`
- **Development**: `development`

Each environment gets its own:

- Workload Identity Pool
- OIDC Provider
- Service Account

## IAM Roles

### Role Assignment Options

1. **Automatic Assignment**: Enter comma-separated roles during setup
2. **Manual Assignment**: Leave roles empty and assign via GCP Console later

### Role Examples

**Firebase Projects:**

```
roles/firebase.admin,roles/datastore.user,roles/storage.objectAdmin
```

**AI/ML Projects:**

```
roles/aiplatform.user,roles/storage.objectAdmin,roles/bigquery.user
```

**General GCP Projects:**

```
roles/storage.admin,roles/compute.admin,roles/cloudfunctions.developer
```

**Note:** Choose roles based on your specific project requirements. Each project will need different permissions.

## Output Format

### Environment Variables

The tool generates environment variables for each environment and saves them to `.env.oidc.example`:

```bash
# PRODUCTION Environment
GCP_PROJECT_ID_PRODUCTION=your-project-id
GCP_PROJECT_NUMBER_PRODUCTION=1234567890
GCP_SERVICE_ACCOUNT_EMAIL_PRODUCTION=vercel-production@your-project-id.iam.gserviceaccount.com
GCP_WORKLOAD_IDENTITY_POOL_ID_PRODUCTION=vercel-production
GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID_PRODUCTION=vercel-production

# PREVIEW Environment
GCP_PROJECT_ID_PREVIEW=your-project-id
GCP_PROJECT_NUMBER_PREVIEW=1234567890
GCP_SERVICE_ACCOUNT_EMAIL_PREVIEW=vercel-preview@your-project-id.iam.gserviceaccount.com
GCP_WORKLOAD_IDENTITY_POOL_ID_PREVIEW=vercel-preview
GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID_PREVIEW=vercel-preview
```

### Configuration File

Saves setup details to `oidc-config.json`:

```json
{
  "setupDate": "2024-01-15T10:30:00.000Z",
  "vercelTeam": "personal",
  "gcpAccount": "user@example.com",
  "environments": [
    {
      "environment": "production",
      "projectId": "your-project-id",
      "projectNumber": "1234567890",
      "serviceAccountEmail": "vercel-production@your-project-id.iam.gserviceaccount.com",
      "poolId": "vercel-production",
      "providerId": "vercel-production",
      "iamPrincipal": "projects/1234567890/locations/global/workloadIdentityPools/vercel-production/providers/vercel-production",
      "subjectValue": "owner:personal:project:your-project-id:environment:production"
    }
  ]
}
```

## Complete Setup Process

### Step 1: Run the OIDC Setup Tool

```bash
npm run oidc:setup
```

The tool will automatically:

- ✅ Set up GCP OIDC resources (Workload Identity Pools, Service Accounts)
- ✅ Display and optionally set environment variables in Vercel
- ✅ Check and install required npm packages
- ✅ Verify CLI tools (gcloud, vercel)
- ✅ Provide code update guidance

### What Gets Automated

- **GCP Setup**: Workload Identity Pools, OIDC Providers, Service Accounts
- **Environment Variables**: Automatic Vercel CLI configuration + `.env.oidc.example` file
- **Package Management**: Check and install required dependencies
- **Tool Verification**: Ensure gcloud and vercel CLI are available

### Step 4: Update Your Application Code

#### Firebase Admin SDK

```typescript
// Before (with service account key)
import { initializeApp, cert } from 'firebase-admin/app';

const serviceAccount = require('./service-account.json');
initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET_URI,
});

// After (with OIDC)
import { initializeApp, applicationDefault } from 'firebase-admin/app';

initializeApp({
  credential: applicationDefault(),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET_URI,
});
```

#### Google Cloud Services (Text-to-Speech, Storage, etc.)

```typescript
import { getVercelOidcToken } from '@vercel/functions/oidc';
import { ExternalAccountClient } from 'google-auth-library';

const authClient = ExternalAccountClient.fromJSON({
  type: 'external_account',
  audience: `//iam.googleapis.com/projects/${process.env.GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${process.env.GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
  subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
  token_url: 'https://sts.googleapis.com/v1/token',
  service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${process.env.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
  subject_token_supplier: {
    getSubjectToken: getVercelOidcToken,
  },
});
```

### Step 5: Deploy and Test

1. Deploy your application to Vercel
2. Test your Firebase and Google Cloud services
3. Check Vercel function logs for any authentication errors

### Important Notes

- **OIDC only works in Vercel production/preview environments**
- **For local development, you still need service account keys**
- **Make sure your environment variables are set correctly**

## Reference Documentation

- [Vercel OIDC Documentation](https://vercel.com/docs/oidc/gcp)
- [Google Cloud Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)

## Troubleshooting

### Common Issues

1. **Permission Denied**

   - Ensure you have: `roles/iam.workloadIdentityPoolAdmin`, `roles/iam.serviceAccountAdmin`, `roles/resourcemanager.projectIamAdmin`
   - Check: `gcloud projects get-iam-policy YOUR_PROJECT_ID`

2. **Invalid Role Assignment**

   - Some roles can't be assigned at project level
   - Use service-specific roles appropriate for your project

3. **Principal Member Format**
   - Ensure correct principal format for service account access
   - Format: `principal://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID/subject/SUBJECT_VALUE`

### Manual Role Assignment

If role assignment fails or you skip it:

1. Go to [Google Cloud Console → IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Find your service accounts (e.g., `vercel-production`, `vercel-preview`)
3. Click on each service account → "Permissions" tab
4. Add the required IAM roles for your specific project needs

### Cleanup

To remove OIDC resources:

```bash
# Delete service accounts
gcloud iam service-accounts delete vercel-production@YOUR_PROJECT_ID.iam.gserviceaccount.com --quiet
gcloud iam service-accounts delete vercel-preview@YOUR_PROJECT_ID.iam.gserviceaccount.com --quiet

# Delete workload identity pools (includes providers)
gcloud iam workload-identity-pools delete vercel-production --location=global --quiet
gcloud iam workload-identity-pools delete vercel-preview --location=global --quiet
```

## References

- [Vercel OIDC Documentation](https://vercel.com/docs/integrations/google-cloud-platform)
- [Google Cloud Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Google Cloud IAM Roles](https://cloud.google.com/iam/docs/understanding-roles)
