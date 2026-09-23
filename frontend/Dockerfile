# ===== Build Stage: Node 22 Alpine =====
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files để tận dụng Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Copy source code và build production bundle
COPY . .
RUN npm run build

# ===== Runtime Stage: Nginx Alpine =====
FROM nginx:alpine AS runtime

# Xóa cấu hình Nginx mặc định
RUN rm /etc/nginx/conf.d/default.conf

# Copy cấu hình Nginx tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy React 19 SPA build artifacts
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
