#!/bin/bash
echo 'installing'
sudo apt install curl
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
npm -v
npm install
sudo apt-get install -q -y -o Dpkg::Options::="--force-confdef" mysql-server;
sudo mysql -e "SET PASSWORD FOR root@localhost = PASSWORD('');FLUSH PRIVILEGES;"
service mysql restart
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';"
service mysql restart