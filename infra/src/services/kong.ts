import * as awsx from "@pulumi/awsx"
import * as pulumi from "@pulumi/pulumi"

import { cluster } from "../cluster"
import { kongDockerImage } from "../images/kong"
import { ordersHTTPListener } from "../listeners/orders/http"
import { proxyHTTPListener } from "../listeners/kong/proxy"
import { adminHTTPListener } from "../listeners/kong/admin"
import { adminAPIHTTPListener } from "../listeners/kong/admin-api"

export const kongService = new awsx.classic.ecs.FargateService("fargate-kong", {
    cluster,
    desiredCount: 1,
    waitForSteadyState: false,
    taskDefinitionArgs: {
        container: {
            image: kongDockerImage.ref,
            cpu: 256,
            memory: 512,
            portMappings: [
                proxyHTTPListener,
                adminHTTPListener,
                adminAPIHTTPListener
            ],
            environment: [
                { name: "KONG_DATABASE", value: "off" },
                { name: "KONG_ADMIN_LISTEN", value: "0.0.0.0:8001" },
                { name: "ORDERS_SERVICE_URL", value: pulumi.interpolate`http://${ordersHTTPListener.endpoint.hostname}:${ordersHTTPListener.endpoint.port}` }
            ]
        },
    },
})
