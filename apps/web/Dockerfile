# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY apps/web/package*.json ./
RUN npm ci
COPY apps/web/ ./
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Environment variable injected at runtime
ENV API_BASE_URL=""

# Generate env.js on container startup
RUN mkdir -p /docker-entrypoint.d
COPY apps/web/docker/20-env.sh /docker-entrypoint.d/20-env.sh
RUN chmod +x /docker-entrypoint.d/20-env.sh

# Nginx configuration for SPA
COPY apps/web/docker/nginx.conf /etc/nginx/nginx.conf

# Copy built app to Nginx web root
COPY --from=build /app/dist/redsun-web/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
