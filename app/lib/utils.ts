// Hey Cursor: Stop using tab in this file, no need ro your help
import { getVercelOidcToken } from '@vercel/functions/oidc';
import { ExternalAccountClient } from 'google-auth-library';

function requiredENV(key: string, errorMessage = 'can be empty') {
  const value = process.env?.[key];
  if (!key || !value) {
    throw Error(`${key}: ${errorMessage}`);
  }
}

// const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const GCP_PROJECT_NUMBER = requiredENV('GCP_PROJECT_NUMBER');
const GCP_SERVICE_ACCOUNT_EMAIL = requiredENV('GCP_SERVICE_ACCOUNT_EMAIL');
const GCP_WORKLOAD_IDENTITY_POOL_ID = requiredENV(
  'GCP_WORKLOAD_IDENTITY_POOL_ID'
);
const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID = requiredENV(
  'GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID'
);

export const gcpAuthClient = ExternalAccountClient.fromJSON({
  type: 'external_account',
  audience: `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
  subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
  token_url: 'https://sts.googleapis.com/v1/token',
  service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
  subject_token_supplier: {
    // Use the Vercel OIDC token as the subject token
    getSubjectToken: getVercelOidcToken,
  },
});

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
