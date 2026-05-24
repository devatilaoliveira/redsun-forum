# ---------- Stage 1: build ----------
FROM eclipse-temurin:21-jdk AS build
ENV MAVEN_CONFIG=/root/.m2
WORKDIR /workspace

COPY apps/api/.mvn/ .mvn/
COPY apps/api/mvnw .
RUN chmod +x mvnw

COPY apps/api/pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -B -e -ntp -DskipTests dependency:go-offline

COPY apps/api/src ./src
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -B -e -ntp -DskipTests clean package

# Copia o JAR gerado para um local fixo dentro do estágio build
RUN JAR_FILE=$(ls target/*-SNAPSHOT.jar 2>/dev/null || ls target/*.jar | head -n1) \
 && cp "$JAR_FILE" /tmp/app.jar

# ---------- Stage 2: runtime ----------
FROM eclipse-temurin:21-jre AS runtime

RUN useradd -u 10001 -r -s /sbin/nologin appuser
USER appuser

WORKDIR /app
# Traz o JAR fixo do estágio build
COPY --from=build /tmp/app.jar /app/app.jar

EXPOSE 8080
ENV SERVER_PORT=8080
ENV JAVA_OPTS=""
ENV SESSION_STORE=none

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD ["bash","-lc","exec 3<>/dev/tcp/127.0.0.1/8080 || exit 1"]

LABEL org.opencontainers.image.title="redsun-api" \
      org.opencontainers.image.description="Spring Boot 3 BFF (Java 21)" \
      org.opencontainers.image.source="https://example.com/redsun-api" \
      org.opencontainers.image.licenses="Apache-2.0"

ENTRYPOINT ["/bin/sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
