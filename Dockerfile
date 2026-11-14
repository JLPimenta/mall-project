# syntax=docker/dockerfile:1

FROM node:24-alpine AS frontend-build
WORKDIR /workspace/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

FROM eclipse-temurin:21-jdk AS backend-build
WORKDIR /workspace/backend
COPY backend/.mvn backend/mvnw backend/pom.xml ./
RUN chmod +x mvnw && ./mvnw -q -B dependency:go-offline
COPY backend/src ./src
RUN ./mvnw -q -B package -DskipTests

FROM nginx:1.29-alpine
RUN apk add --no-cache bash openjdk21-jre
WORKDIR /app

COPY --from=backend-build /workspace/backend/target/*.jar /app/backend.jar
COPY --from=frontend-build /workspace/frontend/dist /usr/share/nginx/html

COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 8080;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8081/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

ENV PORT=8080
ENV SERVER_PORT=8081
ENV SPRING_PROFILES_ACTIVE=docker

EXPOSE 8080

CMD ["bash", "-lc", "java -Dserver.port=${SERVER_PORT} -jar /app/backend.jar --spring.profiles.active=${SPRING_PROFILES_ACTIVE} & nginx -g 'daemon off;'"]