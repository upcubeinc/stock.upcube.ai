FROM node:20-alpine AS build
WORKDIR /app
COPY stock-dashboard/ .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
