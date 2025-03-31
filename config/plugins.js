module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.example.com'),
        port: env('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
        // ... any custom nodemailer options
      },
      settings: {
        defaultFrom: env('SMTP_FROM'),
        defaultReplyTo: env('SMTP_USERNAME'),
      },
    },
  },
  // ...
  // Otras configuraciones de plugins
  "users-permissions": {
    config: {
      register: {
        allowedFields: [
          "phone",
          "firstName",
          "lastName"  // Permitir el campo 'phone'
        ],
      },
    },
  },
  // S3
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: env('MINIO_PUBLIC_ENDPOINT'),
        s3Options: {
          credentials: {
            accessKeyId: env('MINIO_ROOT_USER'),
            secretAccessKey: env('MINIO_ROOT_PASSWORD'),
          },
          endpoint: env('MINIO_PRIVATE_ENDPOINT'),
          region: env('MINIO_REGION'),
          forcePathStyle: true,
          params: {
            Bucket: env('MINIO_BUCKET'),
          },
        }
      },
    },
  },

});