sudo mkdir -p /etc/ssl/private-node
sudo cp /etc/letsencrypt/live/plku.pcor.me/privkey.pem /etc/ssl/private-node/
sudo cp /etc/letsencrypt/live/plku.pcor.me/cert.pem /etc/ssl/private-node/
sudo cp /etc/letsencrypt/live/plku.pcor.me/fullchain.pem /etc/ssl/private-node/
sudo chown ubuntu:ubuntu /etc/ssl/private-node/*.pem
chmod 600 /etc/ssl/private-node/*.pem
