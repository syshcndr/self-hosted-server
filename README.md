---

## Using Cloudflare Tunnel (Cloudflared)

Cloudflare Tunnel (formerly Argo Tunnel) allows you to securely expose your local or self-hosted server to the internet without opening ports on your firewall. This is useful for development, remote access, or production deployments behind NAT or restrictive networks.

### 1. Install Cloudflared
Download and install the Cloudflared client from the [official documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/).

For macOS:
```sh
brew install cloudflared
```
For Linux:
```sh
sudo apt install cloudflared
```

### 2. Authenticate Cloudflared with Cloudflare
```sh
cloudflared login
```
This will open a browser window to authenticate and select your domain.

### 3. Create a Tunnel
```sh
cloudflared tunnel create <TUNNEL-NAME>
```
This will generate credentials and a tunnel ID.

### 4. Configure the Tunnel
Create a configuration file (e.g., `config.yml`) in the default directory (usually `~/.cloudflared/`). Example:

```yaml
tunnel: <TUNNEL-ID>
credentials-file: /Users/<your-user>/.cloudflared/<TUNNEL-ID>.json
ingress:
  - hostname: app.example.com
    service: http://localhost:3000
  - service: http_status:404
```
Replace `app.example.com` with your domain/subdomain and `localhost:3000` with your app’s local address.

### 5. Route DNS to the Tunnel
```sh
cloudflared tunnel route dns <TUNNEL-NAME> app.example.com
```
This creates a CNAME in Cloudflare DNS pointing to the tunnel.

### 6. Run the Tunnel
```sh
cloudflared tunnel run <TUNNEL-NAME>
```
Your app is now securely accessible at `https://app.example.com` via Cloudflare’s network.

---
# Project Architecture

## Overview
This document describes the architecture of the `self-hosted-server` project, which consists of a client and server, both containerized and orchestrated via Docker Compose.

---

## Directory Structure

```
self-hosted-server/
├── docker-compose.yml
├── client/

Cloudflare Tunnel (formerly Argo Tunnel) allows you to securely expose your local or self-hosted server to the internet without opening ports on your firewall. This is useful for development, remote access, or production deployments behind NAT or restrictive networks.

---

### Running cloudflared in Docker

You can run cloudflared as a Docker container alongside your other services. This is convenient for production and containerized environments.

#### 1. Authenticate and Create Tunnel (One-Time Setup)
You must first authenticate and create your tunnel credentials on your local machine:

```sh
docker run -it --rm \
  -v ~/.cloudflared:/home/nonroot/.cloudflared \
  cloudflare/cloudflared:latest tunnel login
```

Then create a tunnel and generate credentials:

```sh
docker run -it --rm \
  -v ~/.cloudflared:/home/nonroot/.cloudflared \
  cloudflare/cloudflared:latest tunnel create <TUNNEL-NAME>
```

#### 2. Create config.yml
Place your `config.yml` and credentials file in the `~/.cloudflared` directory (or mount a custom path). Example config:

```yaml
tunnel: <TUNNEL-ID>
credentials-file: /home/nonroot/.cloudflared/<TUNNEL-ID>.json

## Data Flow
1. **Client** sends HTTP requests to the **Server** (API endpoints).
2. **Server** processes requests, applies middleware, and responds with data or metrics.
```

> Replace `app.example.com` with your domain/subdomain and `client:3000` with your service name and port as defined in docker-compose.

#### 3. Add cloudflared to docker-compose.yml

Example service:

```yaml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    restart: unless-stopped
    command: tunnel run
    volumes:
      - ~/.cloudflared:/home/nonroot/.cloudflared
    depends_on:
      - client
```

#### 4. Route DNS to the Tunnel
```sh
docker run -it --rm \
  -v ~/.cloudflared:/home/nonroot/.cloudflared \
  cloudflare/cloudflared:latest tunnel route dns <TUNNEL-NAME> app.example.com
```

#### 5. Start All Services
```sh
docker-compose up -d
```

Your app is now securely accessible at `https://app.example.com` via Cloudflare’s network.

---
3. **Nginx** serves the React app and proxies API requests if configured.

---

## Deployment
- Build and run both containers using Docker Compose:
  ```sh
  docker-compose up --build
  ```
- Access the client via the exposed port (as defined in `docker-compose.yml`).

---

## Extensibility
- Add new React components in `client/src/`.
- Add new API endpoints in `server/src/routes/`.
- Update Dockerfiles for custom build steps.

---

## Security & Best Practices
- Use environment variables for sensitive data (see `.env.example`).
- Use CORS middleware for cross-origin requests.
- Keep dependencies up to date in `package.json` files.

---

## Authors
- Suyash Chandra

---

For more details, see the code and configuration files in each directory.
---

## Using Cloudflare for DNS and Domain Management

You can use Cloudflare to manage your domain and DNS for this self-hosted project. Cloudflare provides DNS hosting, security, and performance features. Here’s how to set it up:

### 1. Add Your Domain to Cloudflare
1. Sign up or log in at [Cloudflare](https://dash.cloudflare.com/).
2. Click **Add a Site** and enter your domain name (e.g., `example.com`).
3. Cloudflare will scan your current DNS records. Review and confirm them.
4. Choose a plan (the free plan is sufficient for most use cases).

### 2. Update Your Domain Registrar’s Nameservers
1. Cloudflare will provide you with new nameservers.
2. Log in to your domain registrar (where you bought your domain).
3. Replace the existing nameservers with the ones provided by Cloudflare.
4. It may take some time for DNS changes to propagate.

### 3. Configure DNS Records in Cloudflare
1. In the Cloudflare dashboard, go to the **DNS** tab for your domain.
2. Add an **A record** pointing your domain (e.g., `@` or `www`) to your server’s public IP address.
  - **Type:** A
  - **Name:** @ (for root domain) or www (for subdomain)
  - **IPv4 address:** Your server’s public IP
  - **Proxy status:** (Orange cloud) enabled for Cloudflare proxy, or disabled for DNS only
3. If you use subdomains (e.g., `api.example.com`), add additional A records as needed.

### 4. (Optional) Enable SSL/TLS
1. In the **SSL/TLS** tab, select the desired encryption mode (e.g., Flexible, Full, or Full (Strict)).
2. Cloudflare can provide a free SSL certificate for your domain.
3. Make sure your server is configured to accept HTTPS traffic if you enable Full SSL.

### 5. (Optional) Page Rules and Security
- Use Cloudflare’s **Page Rules** to redirect HTTP to HTTPS, cache content, or set custom behaviors.
- Enable **Firewall Rules** for extra protection against malicious traffic.

### Example DNS Record
| Type | Name | Content         | Proxy |
|------|------|----------------|-------|
|  A   | @    | 203.0.113.10   | ☁️    |
|  A   | www  | 203.0.113.10   | ☁️    |

Replace `203.0.113.10` with your server’s actual public IP address.

---
---

## How to Run the Project

### Using Docker Compose (Recommended)
1. Ensure you have Docker and Docker Compose installed.
2. In the project root, run:
  ```sh
  docker-compose up --build
  ```
3. Access the client application in your browser at the port specified in `docker-compose.yml` (e.g., http://localhost:3000).
4. The server will be running on its configured port (see `docker-compose.yml`).

### Running Locally (Without Docker)
#### Server
1. Open a terminal and navigate to the `server` directory:
  ```sh
  cd server
  ```
2. Install dependencies:
  ```sh
  npm install
  ```
3. Start the server:
  ```sh
  npm start
  ```

#### Client
1. Open another terminal and navigate to the `client` directory:
  ```sh
  cd client
  ```
2. Install dependencies:
  ```sh
  npm install
  ```
3. Start the React development server:
  ```sh
  npm start
  ```
4. Open your browser to the port shown in the terminal (usually http://localhost:3000).

---
