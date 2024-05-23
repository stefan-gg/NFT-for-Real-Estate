import { S3 } from "aws-sdk";
import axios from "axios";

const s3 = new S3({
  accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
  endpoint: "https://s3.filebase.com",
  region: "us-east-1",
  signatureVersion: "v4",
});

export async function uploadJSON(name, jsonData, onUploaded) {
  const request = s3.putObject({
    Bucket: "nft-first-project",
    Key: name,
    Body: JSON.stringify(jsonData),
    ContentType: "application/json; charset=utf-8",
  });

  request.on("httpHeaders", (_, headers) => {
    onUploaded(headers["x-amz-meta-cid"]);
  });

  request.on("error", (error) => {
    console.error(error);
  });

  request.send();
}

async function uploadImage(file) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: 'nft-first-project',
      Key: Date.now().toString() + file.name,
      ContentType: file.type,
      Body: file,
    };

    const request = s3.putObject(params);

    request.on("httpHeaders", (_, headers) => {
      resolve(headers["x-amz-meta-cid"]);
    });

    request.on("error", (error) => {
      reject(error);
    });

    request.send();
  });
}

export async function getFilesCids(files) {
  const promises = files.map(file => uploadImage(file));
  const cids = await Promise.all(promises);
  return cids;
}

export async function getMetadata(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);

    return {};
  }
}