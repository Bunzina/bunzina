FROM oven/bun:latest AS base

WORKDIR /app

COPY bun.lock package.json bunfig.toml tsconfig.json ./

RUN bun install --production

COPY . .

EXPOSE 3000

ENV PORT=3000

CMD ["bun", "run", "start"]
