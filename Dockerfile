FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN VITE_API_KEY=__VITE_API_KEY_PLACEHOLDER__ VITE_API_BASE_URL=__VITE_API_BASE_URL_PLACEHOLDER__ npm run build

FROM nginx:alpine
RUN sed -i 's|application/javascript.*js;|application/javascript js mjs;|' /etc/nginx/mime.types
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
