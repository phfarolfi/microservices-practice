import { appLoadBalancer } from "../../load-balancer"

const ordersTargetGroup = appLoadBalancer.createTargetGroup("orders-tg", {
    port: 3333,
    protocol: "HTTP",
    healthCheck: {
        path: "/health",
        protocol: "HTTP",
    }
})

export const ordersHTTPListener = appLoadBalancer.createListener("orders-http", {
    port: 3333,
    protocol: "HTTP",
    targetGroup: ordersTargetGroup,
})
