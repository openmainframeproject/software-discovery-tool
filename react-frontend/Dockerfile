# Stage 1: build the React app
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

ARG VITE_REACT_APP_API_URL=/sdt
ENV VITE_REACT_APP_API_URL=$VITE_REACT_APP_API_URL

RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
