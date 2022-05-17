import fetch from 'node-fetch'
import { logger } from '../utils/logger'

async function sendNotification(text: string): Promise<boolean> {
  const body = {
    text
  }
  try {
    const response = await fetch(process.env.SLACK_WEBHOOK_SECRET_URL, {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    })
    if (response.ok) return true
    return false
  } catch {
    // Important: don't expose SLACK_WEBHOOK_SECRET_URL to logs
    // logging error could expose it
    logger.error('Failed to send slack notification.')
    return false
  }
}

export default {
  sendNotification
}
