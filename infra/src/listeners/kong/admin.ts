import { appLoadBalancer } from "../../load-balancer"

const adminTargetGroup = appLoadBalancer.createTargetGroup("kong-admin-tg", {
    port: 8002,
    protocol: "HTTP",
    healthCheck: {
        path: "/",
        protocol: "HTTP",
    }
})

export const adminHTTPListener = appLoadBalancer.createListener("kong-admin-http", {
    port: 8002,
    protocol: "HTTP",
    targetGroup: adminTargetGroup,
})
