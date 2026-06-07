FROM node:24-alpine AS spec
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY main.tsp ./
RUN npm run compile

FROM node:24-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json frontend/
RUN cd frontend && npm ci
COPY frontend/ frontend/
RUN cd frontend && npx vite build

FROM eclipse-temurin:21-jdk AS backend
ENV JAVA_TOOL_OPTIONS="-XX:-UsePerfData"
WORKDIR /app
COPY --from=spec /app/tsp-output/ tsp-output/
COPY backend/ backend/
RUN printf '\norg.gradle.daemon=false\norg.gradle.vfs.watch=false\nkotlin.compiler.execution.strategy=in-process\nkotlin.incremental=false\n' >> backend/gradle.properties \
    && cd backend \
    && ./gradlew installDist --no-daemon --no-watch-fs \
    && rm -rf /tmp/kotlin-* /tmp/hsperfdata_* /root/.kotlin

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache nginx gettext

COPY --from=backend /app/backend/build/install/booking-app/ /app/booking-app/
COPY --from=frontend /app/frontend/dist/ /usr/share/nginx/html/
COPY nginx.conf.template /etc/nginx/http.d/default.conf.template

EXPOSE 8080
ENV PORT=8080
ENV BACKEND_PORT=5000

CMD ["sh", "-c", "envsubst '$PORT $BACKEND_PORT' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf && nginx -g 'daemon off;' & PORT=$BACKEND_PORT exec /app/booking-app/bin/booking-app"]
