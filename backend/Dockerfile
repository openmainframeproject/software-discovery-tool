FROM node:22-slim

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/ ./

# config.js reads ../config/distros.json — keep at both paths
COPY config/ /config/
COPY config/ ./config/

# database_build.js reads distro_data/data_files/ relative to repo root
COPY distro_data/ ./distro_data/

# bin/ scripts (database_build.js)
COPY bin/ ./bin/

EXPOSE 5000

CMD ["node", "index.js"]
