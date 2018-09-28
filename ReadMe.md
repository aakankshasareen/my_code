Dev App Setup 

```
cd /home/
git clone <project> exchange
cd exchange
git remote rename origin gitlab 
git checkout -b dev ; git pull gitlab dev
npm install
cp config/config.js.example config/config.js
bash starter.sh
```

#### Open Bashrc by:
```
$ gedit ~/.bashrc
```
#### Append following & save
```javascript
function exchange_removehost() { sudo sed -i 's/exchange.demo.sofocle.com//g' /etc/hosts ; }
function exchange_addhost() { echo '127.0.0.1 exchange.demo.sofocle.com' | sudo tee --append /etc/hosts ; }  
``` 

#### Create a new virtual host file :

```
<VirtualHost *:80>
ServerName exchange.demo.sofocle.com:80
ServerAlias exchange.demo.sofocle.com
DocumentRoot "/home/ankita"
ServerAdmin root@localhost
ErrorLog ${APACHE_LOG_DIR}/dev.error.log
CustomLog ${APACHE_LOG_DIR}/dev.access.log combined
<Location />
Allow from all                                                                                                                                                
</Location>
RewriteEngine On
RewriteCond %{HTTP:Upgrade} =websocket [NC]
RewriteRule /(.*)           ws://localhost:4000/$1 [P,L]
RewriteCond %{HTTP:Upgrade} !=websocket [NC]
RewriteRule /(.*)           http://localhost:4000/$1 [P,L]
ProxyPassReverse / http://localhost:4000/
Timeout 600
ProxyTimeout 600
</VirtualHost>
```

#### To implement a proxy/gateway for Apache HTTP Server, to listen to port 4000:

```
sudo gedit /etc/apache2/sites-enabled/exchange.conf
sudo apt install libapache2-mod-proxy-uwsgi
sudo a2enmod rewrite on
sudo a2enmod proxy_http on
sudo service apache2 restart
```

Node >= 6.*
