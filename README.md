# Minecraft Server Pulumi Stack

Production-ready Minecraft server deployment on Kubernetes using Pulumi IaC.

## Features

- ✅ **Persistent Storage** - World data persists across restarts
- ✅ **Security Hardened** - Non-root user, network policies, dropped capabilities  
- ✅ **Resource Management** - CPU/memory limits with smart scaling
- ✅ **Health Monitoring** - Startup, liveness, and readiness probes
- ✅ **Highly Configurable** - 20+ configuration options
- ✅ **Multi-Server Support** - Vanilla, Paper, Forge, Fabric, and more
- ✅ **Observability Ready** - Prometheus metrics annotations
- ✅ **Network Flexibility** - ClusterIP, NodePort, or LoadBalancer

## Quick Start

### Prerequisites

- Kubernetes cluster (1.20+)
- Pulumi CLI installed
- Node.js (16+)
- kubectl configured

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Initialize stack:**
```bash
pulumi stack init prod
```

3. **Configure the stack:**
```bash
# Basic configuration
pulumi config set minecraft:namespace games
pulumi config set minecraft:memory 4G
pulumi config set minecraft:storageSize 20Gi

# For external access
pulumi config set minecraft:serviceType LoadBalancer
# OR for NodePort
pulumi config set minecraft:serviceType NodePort
pulumi config set minecraft:nodePort 30565
```

4. **Deploy:**
```bash
pulumi up
```

## Configuration Options

| Parameter | Default | Description |
|-----------|---------|-------------|
| `namespace` | `games` | Kubernetes namespace |
| `serviceType` | `ClusterIP` | Service type (ClusterIP/NodePort/LoadBalancer) |
| `nodePort` | - | NodePort number (30000-32767) |
| `memory` | `2G` | Server memory allocation |
| `cpu` | `1` | CPU limit |
| `storageSize` | `10Gi` | PVC size for world data |
| `storageClass` | `standard` | Storage class name |
| `image` | `itzg/minecraft-server:latest` | Docker image |
| `serverType` | `VANILLA` | Server type (VANILLA/PAPER/FORGE/FABRIC) |
| `version` | `LATEST` | Minecraft version |
| `serverPort` | `25565` | Game server port |
| `queryPort` | `25565` | Query protocol port |
| `rconPort` | `25575` | RCON port |
| `eula` | `true` | Accept EULA |
| `motd` | `Welcome to Pulumi Minecraft Server` | Server message |
| `gameMode` | `survival` | Game mode |
| `difficulty` | `normal` | Difficulty level |
| `maxPlayers` | `20` | Maximum players |
| `viewDistance` | `10` | View distance chunks |
| `onlineMode` | `true` | Online mode (auth) |
| `pvp` | `true` | Enable PvP |
| `allowFlight` | `false` | Allow flying |
| `spawnProtection` | `16` | Spawn protection radius |
| `enableRcon` | `false` | Enable RCON |
| `rconPassword` | - | RCON password (secret) |
| `modsEnabled` | `false` | Enable automatic mod installation |
| `bluemapEnabled` | `false` | Install BlueMap web map viewer |
| `bluemapVersion` | `5.5` | BlueMap version to install |

## Advanced Configuration

### Different Server Types

```bash
# Paper (optimized)
pulumi config set minecraft:serverType PAPER
pulumi config set minecraft:version 1.20.1

# Forge (modded)
pulumi config set minecraft:serverType FORGE
pulumi config set minecraft:version 1.19.4-45.0.66

# Fabric (lightweight modded)
pulumi config set minecraft:serverType FABRIC
```

### RCON Access

```bash
# Enable RCON
pulumi config set minecraft:enableRcon true
pulumi config set --secret minecraft:rconPassword "your-secure-password"

# Access RCON after deployment
kubectl exec -n games -it deployment/minecraft-server -- rcon-cli
```

### Resource Tuning

```bash
# High-performance settings
pulumi config set minecraft:memory 8G
pulumi config set minecraft:cpu 4
pulumi config set minecraft:viewDistance 16
pulumi config set minecraft:maxPlayers 50
```

### Automatic Mod Installation

The stack supports automatic mod installation via init containers. Currently supported:

**BlueMap** - Web-based map viewer
```bash
# Enable BlueMap (works with Paper/Spigot/Bukkit servers)
pulumi config set minecraft:serverType PAPER
pulumi config set minecraft:modsEnabled true
pulumi config set minecraft:bluemapEnabled true

# Optional: specify version
pulumi config set minecraft:bluemapVersion 5.4

# Deploy and access web map at http://<service-ip>:8100
```

**Adding More Mods**

The mod system is extensible. To add new mods:

1. Add mod definition to `SUPPORTED_MODS` in `constants.ts`
2. Add configuration loading in `config.ts` 
3. The init container will automatically download and install

Example mod structure:
```typescript
CUSTOM_MOD: {
  name: 'CustomMod',
  type: 'plugin', // or 'datapack', 'resource-pack'
  downloadUrl: 'https://example.com/mod.jar',
  version: '1.0.0',
  serverTypes: ['PAPER', 'SPIGOT'],
}
```

## Project Structure

```
minecraft/
├── src/
│   ├── index.ts          # Main entry point
│   ├── config.ts         # Configuration management
│   ├── types.ts          # TypeScript interfaces
│   ├── constants.ts      # Constants and defaults
│   ├── utils.ts          # Helper functions
│   └── resources/        # K8s resource definitions
│       ├── namespace.ts
│       ├── storage.ts
│       ├── configmap.ts
│       ├── deployment.ts
│       ├── service.ts
│       └── network-policy.ts
├── package.json
├── tsconfig.json
├── Pulumi.yml
└── Pulumi.example.yml
```

## Monitoring

The stack includes Prometheus annotations for monitoring:

```yaml
prometheus.io/scrape: "true"
prometheus.io/port: "9225"
prometheus.io/path: "/metrics"
```

To enable metrics, deploy [minecraft-prometheus-exporter](https://github.com/sladkoff/minecraft-prometheus-exporter) alongside.

## Backup Strategy

While automated backups aren't included, you can manually backup world data:

```bash
# Create backup
kubectl exec -n games deployment/minecraft-server -- \
  tar czf /tmp/backup.tar.gz /data/world

# Copy backup locally
kubectl cp games/minecraft-server-xxxxx:/tmp/backup.tar.gz \
  ./minecraft-backup-$(date +%Y%m%d).tar.gz
```

## Troubleshooting

### Check server logs
```bash
kubectl logs -n games deployment/minecraft-server -f
```

### Get pod status
```bash
kubectl get pods -n games
kubectl describe pod -n games minecraft-server-xxxxx
```

### Connect to server console
```bash
kubectl attach -n games deployment/minecraft-server -it
```

### Check PVC status
```bash
kubectl get pvc -n games
```

## Development

### Build TypeScript
```bash
npm run build
```

### Watch mode
```bash
npm run watch
```

### Preview changes
```bash
npm run preview
```

## Security Notes

- Server runs as non-root user (UID 1000)
- All capabilities dropped
- Network policies restrict traffic
- No privilege escalation allowed
- Secure defaults for all settings

## License

MIT