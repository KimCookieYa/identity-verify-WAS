FROM node:20-alpine3.17 as base

WORKDIR /app
RUN apk add --no-cache curl

FROM base AS container
COPY package*.json /app/
RUN npm ci
COPY . /app
COPY .env.docker .env
RUN echo "homepage-container"
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]