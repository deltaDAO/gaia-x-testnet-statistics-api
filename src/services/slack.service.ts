import fetch from 'node-fetch'
import { logger } from '../utils/logger'

function sendNotification(text: string) {
  const body = {
    text
  }
  try {
    fetch(process.env.SLACK_WEBHOOK_SECRET_URL, {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    // Important: don't expose SLACK_WEBHOOK_SECRET_URL to logs
    logger.error('Failed to send slack notification.')
  }
}

export default {
  sendNotification
}
