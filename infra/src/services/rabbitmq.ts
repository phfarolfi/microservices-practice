import * as awsx from "@pulumi/awsx"

import { cluster } from "../cluster"
import { rabbitMQAdminHTTPListener } from "../listeners/rabbitmq/admin"
import { rabbitMQAMQPListener } from "../listeners/rabbitmq/amqp"

export const rabbitMQService = new awsx.classic.ecs.FargateService("fargate-rabbitmq", {
    cluster,
    desiredCount: 1,
    waitForSteadyState: false,
    taskDefinitionArgs: {
        container: {
            image: 'rabbitmq:3-management',
            cpu: 256,
            memory: 512,
            portMappings: [
                rabbitMQAdminHTTPListener,
                rabbitMQAMQPListener
            ],
            environment: [
                { name: "RABBITMQ_DEFAULT_USER", value: "admin" },
                { name: "RABBITMQ_DEFAULT_PASS", value: "admin" }
            ]
        },
    },
})
