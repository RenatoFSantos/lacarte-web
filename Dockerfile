FROM node:16.15.1-alpine as angular
WORKDIR /lacarte-web
COPY package.json /lacarte-web
RUN npm install --silent
COPY . .
RUN npm run build

FROM nginx:alpine
WORKDIR /etc/nginx
VOLUME /var/cache/nginx
COPY --from=angular lacarte-web/dist/lacarte-web /usr/share/nginx/html
COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf
ENTRYPOINT [ "nginx" ]
CMD [ "-g", "daemon off;" ]

# docker build -t lacarte-web:v1.0.0 .
# docker run 8081:80 lacarte-web:v1.0.0
