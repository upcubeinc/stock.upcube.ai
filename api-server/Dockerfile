FROM node:22-alpine
WORKDIR /srv
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./
EXPOSE 8080
CMD ["node","server.js"]

# ensure curl present for Coolify healthchecks
RUN apk add --no-cache curl || true
