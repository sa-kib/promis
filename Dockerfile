# TODO maybe nginx:alpine?
# TODO: special rights on /etc/ssl.d/
FROM nginx:1.11.5
ADD index.html /var/www/promis/
ADD nginx.conf /etc/nginx/
ADD promis.conf /etc/nginx/

# EnvPlate to replace templates
# See LICENSE.endplate for copyright information
ADD ep-linux /usr/local/bin/ep
CMD [ "/usr/local/bin/ep", "-v", "/etc/nginx/nginx.conf", "/etc/nginx/promis.conf", "/var/www/promis/index.html", "--", "/usr/sbin/nginx", "-c", "/etc/nginx/nginx.conf" ]
