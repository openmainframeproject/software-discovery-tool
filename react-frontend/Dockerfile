# Stage 1: build the React app
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

ARG VITE_REACT_APP_API_URL=/sdt
ENV VITE_REACT_APP_API_URL=$VITE_REACT_APP_API_URL

RUN npm run build

# Stage 2: serve with Apache
FROM httpd:2.4

# Enable proxy, rewrite, and headers modules
RUN sed -i \
    -e 's/#LoadModule proxy_module/LoadModule proxy_module/' \
    -e 's/#LoadModule proxy_http_module/LoadModule proxy_http_module/' \
    -e 's/#LoadModule rewrite_module/LoadModule rewrite_module/' \
    -e 's/#LoadModule headers_module/LoadModule headers_module/' \
    /usr/local/apache2/conf/httpd.conf \
 && echo "Include conf/extra/app.conf" >> /usr/local/apache2/conf/httpd.conf

COPY --from=builder /app/dist /usr/local/apache2/htdocs/
COPY apache.conf /usr/local/apache2/conf/extra/app.conf

EXPOSE 80
