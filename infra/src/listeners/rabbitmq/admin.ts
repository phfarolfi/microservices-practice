import { appLoadBalancer } from "../../load-balancer"

const rabbitMQAdminTargetGroup = appLoadBalancer.createTargetGroup("rabbitmq-admin-tg", {
    port: 15672,
    protocol: "HTTP",
    healthCheck: {
        path: "/",
        protocol: "HTTP",
    }
})

export const rabbitMQAdminHTTPListener = appLoadBalancer.createListener("rabbitmq-admin-http", {
    port: 15672,
    protocol: "HTTP",
    targetGroup: rabbitMQAdminTargetGroup,
})
