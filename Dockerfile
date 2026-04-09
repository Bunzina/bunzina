FROM public.ecr.aws/awsgithubtools/lambda-web-adapter:latest AS lambda-adapter

FROM oven/bun:latest AS base

WORKDIR /app

COPY --from=lambda-adapter /lambda-web-adapter /opt/extensions/lambda-web-adapter

COPY bun.lock package.json bunfig.toml tsconfig.json ./

RUN bun install --production

COPY . .

EXPOSE 3000

ENV PORT=3000
ENV AWS_LWA_PORT=3000
ENV AWS_LWA_READINESS_CHECK_PATH=/health

CMD ["bun", "run", "start"]