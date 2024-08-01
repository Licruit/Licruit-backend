import AWS from 'aws-sdk';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { S3Client } from '@aws-sdk/client-s3';

dotenv.config();

export const awsSns = new AWS.SNS({
  region: process.env.AWS_SNS_REGION,
  accessKeyId: process.env.AWS_SNS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SNS_SECRET_ACCESS_KEY,
  apiVersion: '2010-03-31',
});

export const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
  },
});

export const imageUploader = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    console.log('file uploader');
    const extension = path.extname(file.originalname).toLowerCase();
    const allowExtensions = ['.png', '.jpg', '.jpeg'];
    if (!allowExtensions.includes(extension)) {
      return callback(new Error('Invalid file extension'));
    }
    console.log('file uploader');
    callback(null, true);
  },
});
