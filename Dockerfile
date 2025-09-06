# Stage 1: Build React (Vite) app
FROM node:22-alpine AS build
WORKDIR /app

# copy package files first for caching; npm ci will install dev deps too
COPY package.json package-lock.json* ./
RUN npm ci --unsafe-perm

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# replace default nginx config with your proxy
RUN rm /etc/nginx/conf.d/default.conf || true
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
