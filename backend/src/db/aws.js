import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'
import config from '../config/config.js'

const region = config.awsRegion

export const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})
export const s3 = new S3Client({ region })

export const tables = {
  users: config.usersTable,
  emailLocks: config.emailLocksTable,
  podcasts: config.podcastsTable,
  episodes: config.episodesTable,
  subscriptions: config.subscriptionsTable,
}
