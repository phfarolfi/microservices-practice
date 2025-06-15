import type { Channel, ConsumeMessage } from 'amqplib'

import { broker } from './broker.ts'

const ORDERS_QUEUE = 'orders'

async function initOrderConsumer() {
    try {
        if (!process.env.BROKER_URL) {
            throw new Error('BROKER_URL environment variable is not set')
        }

        const channel: Channel = await broker.createChannel()

        await channel.assertQueue(ORDERS_QUEUE)

        console.log(`Waiting for messages in ${ORDERS_QUEUE}...`)

        channel.consume(
            ORDERS_QUEUE,
            (msg: ConsumeMessage | null) => {
                if (msg) {
                    const content = msg.content.toString()

                    console.log(`Received order: ${content}`)

                    // TODO: Process the order here

                    channel.ack(msg)
                }
            },
            { noAck: false }
        )
    } catch (error) {
        console.error('Failed to initialize order consumer:', error)
    }
}

initOrderConsumer()
