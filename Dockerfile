FROM node:lts-alpine

WORKDIR /app

COPY . .
RUN corepack enable
RUN yarn  --immutable
RUN yarn build

CMD ["yarn", "start"]
