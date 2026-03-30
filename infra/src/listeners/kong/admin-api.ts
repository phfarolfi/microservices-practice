import { appLoadBalancer } from "../../load-balancer"

const adminAPITargetGroup = appLoadBalancer.createTargetGroup("kong-admin-api-tg", {
    port: 8001,
    protocol: "HTTP",
    healthCheck: {
        path: "/",
        protocol: "HTTP",
    }
})

export const adminAPIHTTPListener = appLoadBalancer.createListener("kong-admin-api-http", {
    port: 8001,
    protocol: "HTTP",
    targetGroup: adminAPITargetGroup,
})
