% FSCloud 面向个人有自部署能力的用户开放试用啦～
% 王福强
% 2026-08-11

安装部署很简单，

首先确保本地已经安装了Docker（Docker Desktop或者OrbStack等都可以）

然后[下载](https://keevol.cn/fscloud/docker-compose.yml)或者保存如下`docker-compose.yaml`配置内容到本地任意目录(保存到文件名依然需要是`docker-compose.yaml`)：

```yml
x-app-env: &app-env
  FSCLOUD_PROFILE: development
  FS_DATABASE__URL: postgres://fscloud:fscloud@postgres:5432/fscloud?sslmode=disable
  FS_REDIS__ADDR: redis:6379
  FS_REDIS__PASSWORD: fscloud
  FS_REDIS__DB: "0"
  FS_MINIO__ENDPOINT: minio:9000
  FS_MINIO__ACCESS_KEY: minioadmin
  FS_MINIO__SECRET_KEY: minioadmin
  FS_MINIO__BUCKET: fscloud
  FS_MINIO__USE_SSL: "false"
  FS_MINIO__REGION: us-east-1
  FS_JWT__ACCESS_SECRET: ${FS_JWT_SECRET:-fscloud-trial-jwt-secret}
  FS_JWT__REFRESH_SECRET: ${FS_JWT_SECRET:-fscloud-trial-jwt-secret}
  FS_NODE__REGION: local

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: fscloud
      POSTGRES_PASSWORD: fscloud
      POSTGRES_DB: fscloud
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fscloud -d fscloud"]
      interval: 5s
      timeout: 3s
      retries: 20
    restart: unless-stopped

  migrate:
    image: ${IMAGE_REGISTRY:-fujohnwang}/fscloud-migrations:${IMAGE_TAG:-latest}
    environment:
      POSTGRES_USER: fscloud
      POSTGRES_PASSWORD: fscloud
      POSTGRES_DB: fscloud
      PGHOST: postgres
      PGPORT: "5432"
      PGPASSWORD: fscloud
    depends_on:
      postgres:
        condition: service_healthy
    restart: "no"

  redis:
    image: redis:7-alpine
    command:
      - redis-server
      - --requirepass
      - fscloud
      - --appendonly
      - "yes"
      - --appendfsync
      - everysec
      - --maxmemory-policy
      - noeviction
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "fscloud", "ping"]
      interval: 5s
      timeout: 3s
      retries: 20
    restart: unless-stopped

  minio:
    image: pgsty/minio:RELEASE.2026-04-17T00-00-00Z
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio-data:/data
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 5s
      timeout: 3s
      retries: 20
    restart: unless-stopped

  gateway:
    image: ${IMAGE_REGISTRY:-fujohnwang}/fscloud-gateway:${IMAGE_TAG:-latest}
    ports:
      - "${FS_HTTP_PORT:-4432}:4432"
      - "${FS_QUIC_PORT:-4433}:4433/udp"
      - "${FS_WEBDAV_PORT:-4434}:4434"
    environment:
      <<: *app-env
      FS_QUIC__LISTEN_ADDR: 0.0.0.0:4433
      FS_QUIC__ADVERTISE_ADDR: ${FS_QUIC_ADVERTISE_ADDR:-localhost:4433}
      FS_TLS__CERT_FILE: ""
      FS_TLS__KEY_FILE: ""
    depends_on:
      migrate:
        condition: service_completed_successfully
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    restart: unless-stopped

  admin:
    image: ${IMAGE_REGISTRY:-fujohnwang}/fscloud-admin:${IMAGE_TAG:-latest}
    ports:
      - "${FS_ADMIN_PORT:-4431}:4431"
    environment:
      FSCLOUD_PROFILE: development
      API_BASE: http://gateway:4432
      DATABASE_URL: postgres://fscloud:fscloud@postgres:5432/fscloud?sslmode=disable
      ADMIN_COOKIE_SECURE: "false"
    depends_on:
      migrate:
        condition: service_completed_successfully
      gateway:
        condition: service_started
    restart: unless-stopped

volumes:
  postgres-data:
  redis-data:
  minio-data:

```

然后到`docker-compose.yaml`所在目录下执行：`docker compose up -d`

即可启动FSCloud各项服务。

启动成功后：

- 访问 <http://localhost:4432> 注册新用户并登录web端
- 访问 <http://localhost:4432/cfg> 可以下载macOS版客户端，native 客户端支持实时同步等高级功能。
- 【可选】访问 <http://localhost:4431> 设置初始管理员账号，并登录和管理FSCloud

Enjoy ～

