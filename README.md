# Baybayin Hand-writing Gatherer

## Local Installation
 1. Make sure you have installed `bun` in your local, run `bun --version` to check if you have installed it, if not, install it in command `curl -fsSL https://bun.sh/install | bash` for Mac/Linux or `powershell -c "irm bun.sh/install.ps1 | iex"` for Windows
 2. Clone the project `git clone https://github.com/jamesnogra/baybayin-draw-2026.git`
 3. Go inside the new cloned directory `cd baybayin-draw-2026`
 4. Run the project `bun run dev` on one terminal and run `bun run scripts/build-client.ts` on another terminal
 5. Open in the browser the URL `http://localhost:8887/`

## Running in Ubuntu Server 24.04
 1. Follow steps 1 to 3 in the `Local Installation`
 2. Create a service `/etc/systemd/system/baybayin-draw.service` with the contents
 ```
    [Unit]
    Description=Baybayin Draw Bun App
    After=network.target

    [Service]
    Type=simple
    User=james
    Group=james
    WorkingDirectory=/var/www/html/baybayin-draw-2026

    ExecStart=/home/james/.bun/bin/bun run server/src/index.tsx
    Environment=NODE_ENV=production

    Restart=on-failure
    RestartSec=3

    # Hardening
    NoNewPrivileges=true
    PrivateTmp=true

    [Install]
    WantedBy=multi-user.target
 ```
 3. Enable the service by running `systemctl enable baybayin-draw` and then start the service `systemctl start baybayin-draw`
    - When changes are made from local and then pulled to the remote server, run `systemctl restart baybayin-draw` to reload the changes
 4. The app can not be accessible at `http://UBUNTU_IP_ADDRESS:8887/`