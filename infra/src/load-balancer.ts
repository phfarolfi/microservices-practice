import * as awsx from "@pulumi/awsx"

import { cluster } from "./cluster"

// HTTP / HTTPs
export const appLoadBalancer = new awsx.classic.lb.ApplicationLoadBalancer("app-lb", {
    securityGroups: cluster.securityGroups, // This service will see only other services from the same cluster
})

// TCP / UDP
export const networkLoadBalancer = new awsx.classic.lb.NetworkLoadBalancer("net-lb", {
    subnets: cluster.vpc.publicSubnetIds, // The same meaning of security groups, but for network
})
