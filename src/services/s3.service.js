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

  getPublicUrl(key) {
    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
}

module.exports = new S3Service();
