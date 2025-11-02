# Install dependencies
npm install @aws-sdk/client-s3 multer-s3


# Configure AWS S3
In your .env file, put your AWS credentials (use IAM User with S3 permissions):
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=my-app-bucket


# Setup Multer with S3
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

// Create S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure storage for Multer
const storage = multerS3({
  s3,
  bucket: process.env.AWS_S3_BUCKET,
  acl: "public-read", // file will be publicly accessible (optional)
  key: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName); // file name inside S3 bucket
  },
});

// Export upload middleware
export const upload = multer({ storage });


# Usage in Express routes
import express from "express";
import { upload } from "./upload-s3.js"; // <-- your S3 config file

const app = express();

// Upload single file to S3
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    message: "File uploaded successfully to S3!",
    fileUrl: req.file.location, // S3 file URL
  });
});

// Upload multiple files to S3
app.post("/uploads", upload.array("files", 5), (req, res) => {
  res.json({
    message: "Files uploaded successfully to S3!",
    files: req.files.map((f) => f.location), // Array of S3 URLs
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));

# ✅ What happens now
{
  "message": "File uploaded successfully to S3!",
  "fileUrl": "https://my-app-bucket.s3.ap-south-1.amazonaws.com/1695891234-photo.png"
}
