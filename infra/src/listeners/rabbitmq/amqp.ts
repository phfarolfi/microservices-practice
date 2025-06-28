import { networkLoadBalancer } from "../../load-balancer"

const rabbitMQAMQPTargetGroup = networkLoadBalancer.createTargetGroup("rabbitmq-amqp-tg", {
    protocol: "TCP",
    port: 5672,
    targetType: "ip",
    healthCheck: {
        protocol: "TCP",
        port: "5672",
    }
})

export const rabbitMQAMQPListener = networkLoadBalancer.createListener("rabbitmq-amqp", {
    port: 5672,
    protocol: "TCP",
    targetGroup: rabbitMQAMQPTargetGroup,
})
