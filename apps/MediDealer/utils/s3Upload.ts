import RNFS from 'react-native-fs';
import { bucketName, region, accessKey, secretKey } from '../config/s3Config';
import CryptoJS from 'crypto-js';

// base64 인코딩 함수
const base64Encode = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
};

// ISO 형식의 날짜 문자열 생성
const getFormattedDate = () => {
  const date = new Date();
  return date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
};

export const uploadToS3 = async (imageUri: string): Promise<string> => {
  try {
    const filePath = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;
    console.log('File path:', filePath);

    const exists = await RNFS.exists(filePath);
    console.log('File exists:', exists);
    if (!exists) {
      throw new Error('File does not exist');
    }

    const imageData = await RNFS.readFile(filePath, 'base64');
    if (!imageData) {
      throw new Error('Failed to read file');
    }
    console.log('File read successful, size:', imageData.length);

    const filename = `images/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const contentType = 'image/jpeg';
    const amzDate = getFormattedDate();
    const dateStamp = amzDate.slice(0, 8);

    // AWS 서명 v4 생성
    const credential = `${accessKey}/${dateStamp}/${region}/s3/aws4_request`;
    const policy = {
      expiration: new Date(Date.now() + 3600 * 1000).toISOString(),
      conditions: [
        { bucket: bucketName },
        { key: filename },
        { 'content-type': contentType },
        { 'x-amz-credential': credential },
        { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
        { 'x-amz-date': amzDate }
      ]
    };

    const policyBase64 = base64Encode(JSON.stringify(policy));
    const dateKey = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + secretKey);
    const dateRegionKey = CryptoJS.HmacSHA256(region, dateKey);
    const dateRegionServiceKey = CryptoJS.HmacSHA256('s3', dateRegionKey);
    const signingKey = CryptoJS.HmacSHA256('aws4_request', dateRegionServiceKey);
    const signature = CryptoJS.HmacSHA256(policyBase64, signingKey).toString();

    // FormData 생성
    const formData = new FormData();
    formData.append('key', filename);
    formData.append('content-type', contentType);
    formData.append('x-amz-credential', credential);
    formData.append('x-amz-algorithm', 'AWS4-HMAC-SHA256');
    formData.append('x-amz-date', amzDate);
    formData.append('policy', policyBase64);
    formData.append('x-amz-signature', signature);
    formData.append('file', {
      uri: filePath,
      type: contentType,
      name: filename
    });

    console.log('Policy:', JSON.stringify(policy, null, 2));
    console.log('Credential:', credential);
    console.log('Signature:', signature);
    console.log('Attempting S3 upload...');

    const response = await fetch(`https://${bucketName}.s3.${region}.amazonaws.com/`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('S3 Error Response:', errorText);
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
    }

    console.log('Upload successful');
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${filename}`;
    console.log('S3 URL:', s3Url);
    return s3Url;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
}; 