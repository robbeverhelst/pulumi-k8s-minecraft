import { config, Helm } from '@homelab/shared'

const cfg = config('minecraft')
const ns = cfg.get('namespace', 'minecraft')

const chart = new Helm('minecraft', {
  chart: 'minecraft',
  namespace: ns,
  repo: 'https://itzg.github.io/minecraft-server-charts/',
  version: process.env.MINECRAFT_HELM_VERSION,
  values: {
    minecraftServer: {
      eula: 'TRUE',
      version: process.env.MINECRAFT_VERSION || '1.21.6',
      type: cfg.get('serverType', 'VANILLA'),
      gameMode: cfg.get('gamemode', 'survival'),
      difficulty: cfg.get('difficulty', 'easy'),
      maxPlayers: cfg.number('maxPlayers', 20),
      motd: cfg.get('motd', 'Welcome to Minecraft on Kubernetes!'),
      memory: cfg.get('memory', '1024M'),
      serviceType: 'ClusterIP',
      rcon: {
        enabled: cfg.bool('enableRcon', true),
        password: 'minecraft',
      },
    },
    resources: {
      requests: {
        cpu: '500m',
        memory: '512Mi',
      },
      limits: {
        cpu: cfg.get('cpuLimit', '2'),
        memory: cfg.get('memoryLimit', '4Gi'),
      },
    },
    persistence: {
      dataDir: {
        enabled: true,
        Size: cfg.get('storageSize', '10Gi'),
        storageClass: cfg.get('storageClass', 'truenas-hdd-mirror-nfs'),
        accessModes: ['ReadWriteOnce'],
      },
    },
  },
})

export const minecraftNamespace = chart.namespace.metadata.name
export const releaseName = chart.release.name
