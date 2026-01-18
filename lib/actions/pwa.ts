'use server'

import webpush from 'web-push'
import {Subscription} from "@/lib/definitions";
import Logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import {auth} from "@/auth";

const LOGGER = new Logger('PWA')

webpush.setVapidDetails(
    'mailto:diepminhchi1617@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

export async function subscribeUser(sub: Record<string, unknown>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      LOGGER.error('User is not logged in, cannot subscribe')
      return { success: false, message: 'User is not logged in, cannot subscribe' }
    }
    const userId = parseInt(session.user.id)
    const subscription = await prisma.subscription.create({
      data: {
        endpoint: sub.endpoint as string,
        p256dhKey: (sub.keys as Record<string, string>).p256dh,
        authKey: (sub.keys as Record<string, string>).auth,
        userId: userId
      }
    })
    if (!subscription) {
      LOGGER.error('Failed to create subscription')
      return { success: false, message: 'Failed to create subscription' }
    }
    LOGGER.info(`User ${userId} subscribed to push notifications`)
    return { success: true, message: 'Subscribed to notifications' }
  } catch (error) {
    LOGGER.error(`Error subscribing to push: ${error}`)
    return { success: false, message: 'Failed to subscribe' }
  }
}

export async function unsubscribeUser(sub: Record<string, unknown>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      LOGGER.error('User is not logged in, cannot subscribe')
      return { success: false, message: 'User is not logged in, cannot subscribe' }
    }
    const userId = parseInt(session.user.id)
    const endpoint = sub.endpoint as string
    await prisma.subscription.deleteMany({
      where: { endpoint, userId }
    })
    LOGGER.info(`User ${userId} unsubscribed from push notifications with endpoint ${endpoint}`)
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
    const subscriptions = await prisma.subscription.findMany()
    if (subscriptions.length === 0) {
      return { success: false, message: 'No active subscriptions' }
    }

    const notification = {
      title: notificationData.title,
      body: notificationData.body,
      icon: '/icon-192x192.png',
      url: notificationData.url || '/',
      persistent: notificationData.persistent || false,
    }

    const mapToPushNotification = (subscription: Subscription) => ({
      ...subscription, keys: {
        p256dh: subscription.p256dhKey,
        auth: subscription.authKey
      }
    })

    const promises = Array.from(subscriptions).map((subscription) =>
        webpush
            .sendNotification(mapToPushNotification(subscription), JSON.stringify(notification))
            .catch((error) => {
              LOGGER.error(`Error sending notification: ${error}`)
              prisma.subscription.delete({ where: { id: subscription.id } })
            })
    )

    await Promise.all(promises)
    LOGGER.info(`Notification sent to ${subscriptions.length} users`)
    return { success: true, message: 'Notification sent' }
  } catch (error) {
    LOGGER.error(`Error sending notification: ${error}`)
    return { success: false, message: 'Failed to send notification' }
  }
}