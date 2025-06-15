import type { OrderCreatedMessage } from '../../../../contracts/messages/order-created-message.ts'
import { channels } from '../channels/index.ts'

export function dispatchOrderCreatedMessage(data: OrderCreatedMessage): void {
    channels.orders.sendToQueue('orders', Buffer.from(JSON.stringify(data)));
}
