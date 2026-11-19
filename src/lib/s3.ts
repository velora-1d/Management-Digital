import { S3Client } from "@aws-sdk/client-s3";

const hasR2Config = Boolean(
  process.env.R2_ACCESS_KEY_ID && 
  process.env.R2_SECRET_ACCESS_KEY && 
  process.env.R2_ACCOUNT_ID
);

export const s3Client = hasR2Config 
  ? new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    })
  : (null as unknown as S3Client);

export const R2_BUCKET = process.env.R2_BUCKET_NAME || "";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || process.env.R2_ENDPOINT || "";
export const R2_PREFIX = process.env.R2_PREFIX || "";
