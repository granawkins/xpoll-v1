## Development
```
docker-compose up --build -d
```

## Production
```
docker-compose -f docker-compose.prod.yaml up --build -d
```

## Setting up Linode environment

0. Point the xpoll domain at the working IP address. Navigate to cloud.linode.com/domains, click on xpoll, click "Add an A/AAAA Record", then input the IP address of the active container.

1. Install and configure git. [Source](https://www.linode.com/docs/guides/how-to-install-git-and-clone-a-github-repository/)
```
sudo apt-get update
sudo apt-get install git -y
git config --global user.name "First Last"
git config --global user.email "example@example.com"
```

2. Clone repo
```
git clone https://github.com/granawkins/xpoll.git
cd xpoll
```

1. Install `docker-compose`. Source: https://docs.docker.com/engine/install/debian/#set-up-the-repository

```
// Remove any prior installations of Docker
sudo apt remove docker docker-engine docker.io

// Install packages required to configure Docker's repository:
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg lsb-release

// Add docker's GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

// Setup the respository
echo \
 "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
 $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

// Install Docker Engine and other required packages
sudo apt update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```
