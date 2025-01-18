const {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} = require('@aws-sdk/client-s3');
const config = require('../config');

class S3Service {
  AWS_REGION = config.aws.region;
  AWS_ACCESS_KEY_ID = config.aws.accessKeyId;
  AWS_SECRET_ACCESS_KEY = config.aws.secretAccessKey;
  AWS_S3_BUCKET = config.aws.bucket;
  AWS_CDN_URL = config.aws.cdnUrl;

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

  async deleteFolder(baseKey) {
    try {
      let continuationToken = undefined;

      do {
        // List all objects in the folder
        const listCommand = new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: baseKey,
          ContinuationToken: continuationToken,
        });

        const listedObjects = await this.s3Client.send(listCommand);

        if (listedObjects.Contents && listedObjects.Contents.length > 0) {
          // Delete all listed objects
          const deleteCommand = new DeleteObjectsCommand({
            Bucket: this.bucket,
            Delete: {
              Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
              Quiet: true,
            },
          });

          await this.s3Client.send(deleteCommand);
        }

        // Check if there are more objects to delete
        continuationToken = listedObjects.NextContinuationToken;
      } while (continuationToken);
    } catch (error) {
      throw new Error(`Error deleting folder ${baseKey}: ${error.message}`);
    }
  }

  async deleteAllFolders() {
    try {
      let continuationToken = undefined;

      do {
        // List all objects in the bucket
        const listCommand = new ListObjectsV2Command({
          Bucket: this.bucket,
          ContinuationToken: continuationToken,
        });

        const listedObjects = await this.s3Client.send(listCommand);

        if (listedObjects.Contents && listedObjects.Contents.length > 0) {
          // Delete all listed objects
          const deleteParams = {
            Bucket: this.bucket,
            Delete: { Objects: [] },
          };

          listedObjects.Contents.forEach(({ Key }) => {
            deleteParams.Delete.Objects.push({ Key });
          });

          if (deleteParams.Delete.Objects.length > 0) {
            const deleteCommand = new DeleteObjectsCommand(deleteParams);
            await this.s3Client.send(deleteCommand);
          }
        }

        continuationToken = listedObjects.NextContinuationToken;
      } while (continuationToken);
    } catch (error) {
      console.error('Error deleting all folders:', error);
      throw error;
    }
  }

  getPublicUrl(key) {
    return `${this.AWS_CDN_URL}/${key}`;
  }
}

module.exports = new S3Service();
