# syntax=docker/dockerfile:1
FROM node:24.22.0-bookworm-slim AS build
WORKDIR /app
ENV EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 CI=1
COPY package.json package-lock.json .npmrc ./
RUN npm install --global npm@12.2.0 && npm ci --no-audit --no-fund
COPY . .
RUN npm run release:assets && npm run web:export && npm run release:stage && npm run release:verify

FROM node:24.22.0-bookworm-slim AS runtime
ARG VERSION=0.1.0-preview.1
ARG REVISION=unknown
LABEL org.opencontainers.image.title="Tarih Atlası" \
      org.opencontainers.image.description="Kaynakları izlenebilir, Türkçe 3D tarih atlası — teknik önizleme" \
      org.opencontainers.image.source="https://github.com/Teknoloji-Filozoflari/Tarih_Atlasi" \
      org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.revision=$REVISION \
      org.opencontainers.image.licenses="MIT AND BSD-3-Clause AND CC-BY-4.0 AND CC0-1.0"
WORKDIR /app
ENV NODE_ENV=production ATLAS_HOST=0.0.0.0 ATLAS_PORT=8081
COPY --from=build /app/.release/web/ /app/
USER node
EXPOSE 8081
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "scripts/healthcheck.mjs"]
CMD ["node", "scripts/server.mjs"]
