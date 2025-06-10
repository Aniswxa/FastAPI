FROM nginx:alpine
COPY front /usr/share/nginx/html
COPY nginx.conf /etc/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
