# Stage 1: Build React (Vite) app
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 inside the container
EXPOSE 80

# Run nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]

