FROM docker.longbridge-inc.com/library/nginx:1.19.2-alpine

COPY web /home/console-web/
COPY nginx.conf /etc/nginx/nginx.conf
COPY quote-console.conf /opt/nginx/quote-console.conf

CMD ["nginx", "-c", "/etc/nginx/nginx.conf"]
