import { Deployment } from '@pulumi/kubernetes/apps/v1'
import { Namespace, Service } from '@pulumi/kubernetes/core/v1'
import { Config } from '@pulumi/pulumi'

const config = new Config()
const namespaceName = config.get('namespace') ?? 'games'
const replicas = config.getNumber('replicas') ?? 1
const image = config.get('image') ?? 'itzg/minecraft-server:latest'
const serverPort = config.getNumber('serverPort') ?? 25565
const memory = config.get('memory') ?? '1G'
const eula = config.getBoolean('eula') ?? true
const motd = config.get('motd') ?? 'Welcome to Pulumi Minecraft'

const ns = new Namespace('minecraft-ns', {
  metadata: { name: namespaceName },
})

const appLabels = { app: 'minecraft' }

const deployment = new Deployment('minecraft-deploy', {
  metadata: { namespace: namespaceName },
  spec: {
    replicas,
    selector: { matchLabels: appLabels },
    template: {
      metadata: { labels: appLabels },
      spec: {
        containers: [
          {
            name: 'minecraft',
            image,
            ports: [{ containerPort: serverPort, name: 'mc' }],
            env: [
              { name: 'EULA', value: eula ? 'TRUE' : 'FALSE' },
              { name: 'MEMORY', value: memory },
              { name: 'MOTD', value: motd },
            ],
          },
        ],
      },
    },
  },
})

const service = new Service('minecraft-svc', {
  metadata: { namespace: namespaceName },
  spec: {
    type: 'ClusterIP',
    selector: appLabels,
    ports: [{ port: serverPort, targetPort: serverPort, protocol: 'TCP', name: 'mc' }],
  },
})

export const namespace = ns.metadata.name
export const name = deployment.metadata.name
export const serviceName = service.metadata.name
