FROM node:20-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate
RUN pnpm build

ENV NODE_ENV=production
EXPOSE 10000

CMD ["sh", "-c", "pnpm prisma migrate deploy && if [ \"$SEED_ON_STARTUP\" = \"true\" ]; then pnpm prisma db seed; fi && node dist/index.js"]
