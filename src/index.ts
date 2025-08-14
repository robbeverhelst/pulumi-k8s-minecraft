import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const namespaceName = config.get("namespace") ?? "games";
const replicas = config.getNumber("replicas") ?? 1;
const image = config.get("image") ?? "itzg/minecraft-server:latest";
const serverPort = config.getNumber("serverPort") ?? 25565;
const memory = config.get("memory") ?? "1G";
const eula = config.getBoolean("eula") ?? true;
const motd = config.get("motd") ?? "Welcome to Pulumi Minecraft";

const ns = new k8s.core.v1.Namespace("minecraft-ns", {
  metadata: { name: namespaceName },
});

const appLabels = { app: "minecraft" };

const deployment = new k8s.apps.v1.Deployment("minecraft-deploy", {
  metadata: { namespace: namespaceName },
  spec: {
    replicas,
    selector: { matchLabels: appLabels },
    template: {
      metadata: { labels: appLabels },
      spec: {
        containers: [
          {
            name: "minecraft",
            image,
            ports: [{ containerPort: serverPort, name: "mc" }],
            env: [
              { name: "EULA", value: eula ? "TRUE" : "FALSE" },
              { name: "MEMORY", value: memory },
              { name: "MOTD", value: motd },
            ],
          },
        ],
      },
    },
  },
});

const service = new k8s.core.v1.Service("minecraft-svc", {
  metadata: { namespace: namespaceName },
  spec: {
    type: "ClusterIP",
    selector: appLabels,
    ports: [{ port: serverPort, targetPort: serverPort, protocol: "TCP", name: "mc" }],
  },
});

export const namespace = ns.metadata.name;
export const name = deployment.metadata.name;
export const serviceName = service.metadata.name;
