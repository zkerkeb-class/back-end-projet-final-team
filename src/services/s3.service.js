const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');
const config = require('../config');

class S3Service {
  AWS_REGION = config.aws.region;
  AWS_ACCESS_KEY_ID = config.aws.accessKeyId;
  AWS_SECRET_ACCESS_KEY = config.aws.secretAccessKey;
  AWS_S3_BUCKET = config.aws.bucket;

  constructor() {
    this.s3Client = new S3Client({
      region: this.AWS_REGION,
      credentials: {
        accessKeyId: this.AWS_ACCESS_KEY_ID,
        secretAccessKey: this.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucket = this.AWS_S3_BUCKET;
  }

  async uploadBuffer(buffer, key, contentType) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await this.s3Client.send(command);
    return this.getPublicUrl(key);
  }

  async deleteObject(key) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async deleteObjects(keys) {
    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    });

    await this.s3Client.send(command);
  }

  getPublicUrl(key) {
    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
}

module.exports = new S3Service();
