import { z } from "zod"
import { fastify } from "fastify"
import { randomUUID } from "node:crypto"
import { fastifyCors } from "@fastify/cors"
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod"

import { db } from "../db/client.ts"
import { schema } from "../db/schema/index.ts"
import { channels } from "../broker/channels/index.ts"
import { dispatchOrderCreatedMessage } from "../broker/messages/order-created.ts"

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, { origin: '*' })

app.get('/health', () => {
    return 'OK'
})

app.post('/orders', {
    schema: {
        body: z.object({
            amount: z.coerce.number()
        })
    }
}, async (request, reply) => {
    const { amount } = request.body

    console.log('Creating an order with amount', amount)

    const orderId = randomUUID()

    dispatchOrderCreatedMessage({
        orderId,
        amount,
        customer: {
            id: 'b6ee17f3-be98-4054-a5a9-de4183b5d62d'
        }
    })

    await db.insert(schema.orders).values({
        id: orderId,
        customerId: 'b6ee17f3-be98-4054-a5a9-de4183b5d62d',
        amount
    })

    return reply.status(201).send()
})

app.listen({ host: '0.0.0.0', port: 3333}).then(() => {
    console.log('[Orders] HTTP Server running!')
})
