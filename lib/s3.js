const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const crypto = require("crypto");

const s3 = new S3Client({ region: process.env.AWS_REGION });

function safeExt(originalname) {
  const ext = (path.extname(originalname || "").toLowerCase() || ".jpg");
  return [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".jpg";
}

function buildImageKey({ userId, originalname }) {
  const ext = safeExt(originalname);
  const rand = crypto.randomBytes(8).toString("hex");
  return `posts/${userId || "anon"}/${Date.now()}-${rand}${ext}`;
}

async function uploadImageToS3({ buffer, mimetype, key }) {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("S3_BUCKET is not set");
  if (!process.env.AWS_REGION) throw new Error("AWS_REGION is not set");

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    CacheControl: "public, max-age=31536000, immutable"
  }));
}

function cloudfrontUrlForKey(key) {
  const domain = process.env.CLOUDFRONT_DOMAIN;
  if (!domain) throw new Error("CLOUDFRONT_DOMAIN is not set");
  return `https://${domain}/${key}`;
}

module.exports = { buildImageKey, uploadImageToS3, cloudfrontUrlForKey };
