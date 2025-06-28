import * as awsx from "@pulumi/awsx"
import * as pulumi from "@pulumi/pulumi"

import { cluster } from "../cluster"
import { ordersDockerImage } from "../images/orders"
import { ordersHTTPListener } from "../listeners/orders/http"
import { rabbitMQAMQPListener } from "../listeners/rabbitmq/amqp"

export const ordersService = new awsx.classic.ecs.FargateService("fargate-orders", {
    cluster,
    desiredCount: 1,
    waitForSteadyState: false,
    taskDefinitionArgs: {
        container: {
            image: ordersDockerImage.ref,
            cpu: 256,
            memory: 512,
            portMappings: [
                ordersHTTPListener
            ],
            environment: [
                { name: "BROKER_URL", value: pulumi.interpolate`amqp://admin:admin@${rabbitMQAMQPListener.endpoint.hostname}:${rabbitMQAMQPListener.endpoint.port}`},
                { name: "DATABASE_URL", value: "" }, // Used neon.com serverless PostgreSQL
                { name: "OTEL_SERVICE_NAME", value: "orders" },
                { name: "OTEL_TRACES_EXPORTER", value: "otlp" },
                { name: "OTEL_EXPORTER_OTLP_ENDPOINT", value: "" },
                { name: "OTEL_EXPORTER_OTLP_HEADERS", value: "" },
                { name: "OTEL_RESOURCE_ATTRIBUTES", value: "service.name=my-app,service.namespace=my-application-group,deployment.environment=production" },
                { name: "OTEL_NODE_RESOURCE_DETECTORS", value: "env,host,os" },
                { name: "OTEL_NODE_ENABLED_INSTRUMENTATIONS", value: "http,fastify,pg,amqplib" },
            ]
        },
    },
})
