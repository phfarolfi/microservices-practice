import { z } from "zod"
import { fastify } from "fastify"
import { randomUUID } from "node:crypto"
import { fastifyCors } from "@fastify/cors"
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod"

import "../broker/subscriber.ts"

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, { origin: '*' })

app.get('/health', () => {
    return 'OK'
})

app.listen({ host: '0.0.0.0', port: 3334 }).then(() => {
    console.log('[Invoices] HTTP Server running!')
})
