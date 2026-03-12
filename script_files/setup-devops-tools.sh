#!/bin/bash

set -e

echo "Updating system..."
sudo apt update -y
sudo apt upgrade -y

echo "Installing basic utilities..."
sudo apt install -y \
curl \
git \
wget \
unzip \
apt-transport-https \
ca-certificates \
gnupg \
lsb-release

echo "Installing Docker..."

sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

sudo usermod -aG docker $USER

echo "Docker Installed"

docker --version

echo "Installing kubectl..."

curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl"

chmod +x kubectl

sudo mv kubectl /usr/local/bin/

kubectl version --client

echo "Installing Google Cloud SDK..."
    
curl https://sdk.cloud.google.com | bash

exec -l $SHELL

echo "All DevOps tools installed successfully"