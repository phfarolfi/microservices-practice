import { appLoadBalancer } from "../../load-balancer"

const proxyTargetGroup = appLoadBalancer.createTargetGroup("kong-proxy-tg", {
    port: 8000,
    protocol: "HTTP",
    healthCheck: {
        path: "/orders/health",
        protocol: "HTTP",
    }
})

export const proxyHTTPListener = appLoadBalancer.createListener("kong-proxy-http", {
    port: 80,
    protocol: "HTTP",
    targetGroup: proxyTargetGroup,
})
