FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
