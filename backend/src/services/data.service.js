import { GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand, TransactWriteCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import { DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { dynamo, s3, tables } from '../db/aws.js'
import config from '../config/config.js'

export const getById = async (table, id, consistentRead = false) => {
  const result = await dynamo.send(new GetCommand({ TableName: table, Key: { id }, ConsistentRead: consistentRead }))
  return result.Item || null
}

export const putItem = (table, item, condition) => dynamo.send(new PutCommand({
  TableName: table,
  Item: item,
  ...(condition ? { ConditionExpression: condition } : {}),
}))

export const updateItem = (table, key, updateExpression, names, values) => dynamo.send(new UpdateCommand({
  TableName: table,
  Key: key,
  UpdateExpression: updateExpression,
  ExpressionAttributeNames: names,
  ExpressionAttributeValues: values,
  ReturnValues: 'ALL_NEW',
}))

export const queryAll = async (params) => {
  const items = []
  let ExclusiveStartKey
  do {
    const result = await dynamo.send(new QueryCommand({ ...params, ExclusiveStartKey }))
    items.push(...(result.Items || []))
    ExclusiveStartKey = result.LastEvaluatedKey
  } while (ExclusiveStartKey)
  return items
}

export const findUserByEmail = async (email) => {
  const lock = await dynamo.send(new GetCommand({ TableName: tables.emailLocks, Key: { email }, ConsistentRead: true }))
  return lock.Item ? getById(tables.users, lock.Item.userId, true) : null
}

export const getPodcastEpisodes = (podcastId) => queryAll({
  TableName: tables.episodes,
  IndexName: 'PodcastIndex',
  KeyConditionExpression: 'podcastId = :podcastId',
  ExpressionAttributeValues: { ':podcastId': podcastId },
  ScanIndexForward: false,
})

export const getCreatorPodcasts = (creatorId) => queryAll({
  TableName: tables.podcasts,
  IndexName: 'CreatorIndex',
  KeyConditionExpression: 'creator = :creator',
  ExpressionAttributeValues: { ':creator': creatorId },
  ScanIndexForward: false,
})

export const getFeedPodcasts = ({ category, search }) => queryAll({
  TableName: tables.podcasts,
  IndexName: 'FeedIndex',
  KeyConditionExpression: 'feedPartition = :feed',
  ExpressionAttributeValues: {
    ':feed': 'PODCAST',
    ...(category && category !== 'all' ? { ':category': category } : {}),
    ...(search ? { ':search': search.toLocaleLowerCase() } : {}),
  },
  ...(category && category !== 'all' ? { FilterExpression: 'category = :category' } : {}),
  ...(search ? { FilterExpression: `${category && category !== 'all' ? 'category = :category AND ' : ''}contains(searchText, :search)` } : {}),
  ScanIndexForward: false,
})

export const deleteMedia = async (key) => {
  if (key && config.mediaBucket) await s3.send(new DeleteObjectCommand({ Bucket: config.mediaBucket, Key: key }))
}

export const requireUploadedObject = async (key, contentType) => {
  try {
    const result = await s3.send(new HeadObjectCommand({ Bucket: config.mediaBucket, Key: key }))
    if (contentType && result.ContentType !== contentType) throw new Error('Uploaded file type does not match.')
    return result
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      const missing = new Error('Upload not found. Upload the file to S3 before publishing.')
      missing.status = 400
      throw missing
    }
    throw error
  }
}

export const deletePodcastRecords = async (podcastId, podcast) => {
  const episodes = await getPodcastEpisodes(podcastId)
  for (let offset = 0; offset < episodes.length; offset += 25) {
    const batch = episodes.slice(offset, offset + 25)
    let requestItems = { [tables.episodes]: batch.map((episode) => ({ DeleteRequest: { Key: { id: episode.id } } })) }
    let attempts = 0
    while (Object.keys(requestItems).length && attempts < 8) {
      const result = await dynamo.send(new BatchWriteCommand({ RequestItems: requestItems }))
      requestItems = result.UnprocessedItems || {}
      attempts += 1
    }
    if (Object.keys(requestItems).length) throw new Error('Could not finish deleting all podcast episodes. Retry the deletion.')
    await Promise.all(batch.map((episode) => deleteMedia(episode.audioKey)))
  }
  await Promise.all([
    deleteMedia(podcast.coverImageKey),
    dynamo.send(new DeleteCommand({ TableName: tables.podcasts, Key: { id: podcastId } })),
  ])
}

export { GetCommand, DeleteCommand, TransactWriteCommand, dynamo, s3, tables }
