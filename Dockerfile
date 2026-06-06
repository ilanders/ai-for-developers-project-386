FROM node:22-alpine AS spec
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY main.tsp ./
RUN npm run compile

FROM node:22-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json frontend/
RUN cd frontend && npm ci
COPY frontend/ frontend/
RUN cd frontend && npx vite build

FROM eclipse-temurin:21-jdk AS backend
WORKDIR /app
COPY --from=spec /app/tsp-output/ tsp-output/
COPY backend/ backend/
RUN cd backend && ./gradlew installDist --no-daemon

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache nginx gettext

COPY --from=backend /app/backend/build/install/booking-app/ /app/booking-app/
COPY --from=frontend /app/frontend/dist/ /usr/share/nginx/html/
COPY nginx.conf.template /etc/nginx/http.d/default.conf.template

EXPOSE 4010
ENV PORT=4010

CMD ["sh", "-c", "envsubst '$PORT' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf && nginx -g 'daemon off;' & PORT=5000 exec /app/booking-app/bin/booking-app"]
