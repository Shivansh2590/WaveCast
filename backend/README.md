# WaveCast AWS backend

WaveCast uses an Express API adapted to AWS Lambda, DynamoDB for accounts and podcast data, and a private S3 bucket for cover images and episode audio. Uploads use short-lived presigned S3 URLs, so large media files never pass through API Gateway. No EC2 instances are created.

## AWS resources

- Lambda and API Gateway HTTP API serve the existing `/api` routes.
- DynamoDB on-demand tables store users, unique email locks, podcasts, episodes, and subscriptions.
- A private S3 bucket stores audio and cover images. Objects are accessed through time-limited signed URLs.
- A second private S3 bucket hosts the frontend, served through CloudFront with an origin access control. The frontend bucket is not public.
- Lambda receives least-scope access to the tables and media bucket through SAM policies.

## Deploy

Requirements: Node.js 22+, AWS CLI v2, AWS SAM CLI, an AWS account, and AWS credentials with permission to create CloudFormation, Lambda, API Gateway, DynamoDB, IAM roles, S3, and CloudFront resources. Docker is optional for this Node.js Lambda build.

1. Configure AWS credentials with `aws configure` or an AWS SSO profile, then select the intended region:

   ```powershell
   aws configure
   ```

2. From this directory install dependencies and build the Lambda package:

   ```powershell
   npm ci
   sam build
   ```

3. Deploy and provide a random JWT secret of at least 32 characters. For the first deploy, leave `ClientUrl` at its default; the stack creates the CloudFront site and prints its URL:

   ```powershell
   sam deploy --guided
   ```

   Keep the JWT secret private. SAM stores guided deployment settings in `samconfig.toml`; do not commit that file because it may contain the secret.

4. Set `ClientUrl` to the stack's `FrontendUrl` output and update the stack. SAM will reuse the other guided parameters:

   ```powershell
   sam deploy --parameter-overrides ClientUrl=https://your-cloudfront-domain.cloudfront.net
   ```

5. Build and upload the frontend. Use `ApiUrl` from the stack outputs and append `/api`:

   ```powershell
   cd ..\frontend
   $env:VITE_API_URL = 'https://your-api-id.execute-api.your-region.amazonaws.com/api'
   npm ci
   npm run build
   aws s3 sync dist/ s3://your-frontend-bucket --delete
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths '/*'
   ```

   Get `FrontendBucketName` and `FrontendDistributionId` from the stack outputs. If the frontend origin changes, update `ClientUrl` and redeploy; it controls API and S3 upload CORS.

## Local development

Copy `.env.example` to `.env`, set AWS credentials and `JWT_SECRET`, and provide the deployed table names and media bucket. Then run `npm run dev`. The local Express server uses the same AWS resources as production. Never commit `.env` or AWS credentials.

## API and media flow

The API paths remain `/api/auth/*`, `/api/users/*`, and `/api/podcasts/*`. To create a podcast or episode, the authenticated creator requests `POST /api/podcasts/upload-url`, uploads the file with `PUT` to the returned `uploadUrl`, then submits the returned S3 `key` to the podcast or episode create endpoint. Read responses include time-limited `coverImageUrl` and `audioUrl` values.

Existing MongoDB records and Cloudinary/ImageKit media are not migrated automatically. Export/import them before switching a production frontend to this stack. DynamoDB uses on-demand billing and the stack creates no EC2 instances; Lambda, API Gateway, S3, and CloudFront usage can still incur AWS charges.
