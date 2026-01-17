'use server'

import webpush from 'web-push'
import {WebPushSubscription} from "@/lib/definitions";

webpush.setVapidDetails(
    'mailto:diepminhchi1617@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

const subscriptions: Set<WebPushSubscription> = new Set()

export async function subscribeUser(sub: Record<string, unknown>) {
  try {
    const subscription: WebPushSubscription = {
      endpoint: sub.endpoint as string,
      keys: {
        p256dh: (sub.keys as Record<string, string>).p256dh,
        auth: (sub.keys as Record<string, string>).auth,
      },
    }
    subscriptions.add(subscription)
    console.log('User subscribed to push notifications')
    return { success: true, message: 'Subscribed to notifications' }
  } catch (error) {
    console.error('Error subscribing to push:', error)
    return { success: false, message: 'Failed to subscribe' }
  }
}

export async function unsubscribeUser(sub: Record<string, unknown>) {
  try {
    const endpoint = sub.endpoint as string
    subscriptions.forEach((subscription) => {
      if (subscription.endpoint === endpoint) {
        subscriptions.delete(subscription)
      }
    })
    console.log('User unsubscribed from push notifications')
    return { success: true, message: 'Unsubscribed from notifications' }
  } catch (error) {
    console.error('Error unsubscribing from push:', error)
    return { success: false, message: 'Failed to unsubscribe' }
  }
}

export async function sendNotificationToAll(
    notificationData: {
      title: string
      body: string
      url?: string
      persistent?: boolean
    }
) {
  try {
    if (subscriptions.size === 0) {
      return { success: false, message: 'No active subscriptions' }
    }

    const notification = {
      title: notificationData.title,
      body: notificationData.body,
      icon: '/icon-192x192.png',
      url: notificationData.url || '/admin',
      persistent: notificationData.persistent || false,
    }

    const promises = Array.from(subscriptions).map((subscription) =>
        webpush
            .sendNotification(subscription, JSON.stringify(notification))
            .catch((error) => {
              console.error('Error sending notification:', error)
              subscriptions.delete(subscription)
            })
    )

    await Promise.all(promises)
    console.log(`Notification sent to ${subscriptions.size} users`)
    return { success: true, message: 'Notification sent' }
  } catch (error) {
    console.error('Error sending notification:', error)
    return { success: false, message: 'Failed to send notification' }
  }
}