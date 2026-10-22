FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    openssl \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY tsconfig.json ./
COPY server.ts ./
COPY prisma.ts ./
COPY controllers ./controllers/
COPY middleware ./middleware/
COPY models ./models/
COPY routes ./routes/
COPY services ./services/
COPY types ./types/
RUN npx tsc

EXPOSE 3334

CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/server.js"]
