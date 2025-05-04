# Deploy to AWS EC2

- Signed in into AWS console
- Launched a new EC2 instance (Ubuntu)
- Choose an instance type
- Configure the security group to allow: SSH(Port 22), HTTP(Port 80), HTTPS(Port 443)
- Download the `.pem` key
- Connect to the EC2 instance. Open git bash terminal from the folder `.pem` key is located.

```

chmod 400 DevTinderKey.pem
ssh -i "DevTinderKey.pem" ubuntu@175.41.162.218

```

- EC2 Setup:
    - Installed exact node.js version using in my local machine.
    - Github Repository Clone:
        - Generate an SSH Key in EC2 using the command `ssh-keygen -t ed25519 -C "ec2@your-instance"`. In our case, `ssh-keygen -t ed25519 -C "ubuntu@DevTinder"` as our instance name is `DevTinder` and OS is `ubuntu`. Press enter to accept default file location (~/.ssh/id_ed25519). Enter a passphrase (optional)
        - Copy the public key using command `cat ~/.ssh/id_ed25519.pub`
        - Go to GitHub → Settings → SSH and GPG Keys
        - Click New SSH Key
        - Give it a name "DevTinder EC2 Key"
        - Paste the copied public key
        - Now, clone repository via SSH URL
    - Go to project root folder and install all project dependencies using the command `npm i`
    - Install process manager `PM2` using the command `npm install pm2 -g`. **`PM2` is a daemon process manager that will help us manage and keep our application online 24/7**
    - Now, run our app using the command `pm2 start npm --start` (`pm2 start npm -- <name_of_script>`) from the project root folder
    - We can see the logs of the backend app using the command `pm2 logs`
    - We can clear the logs from console using the command `pm2 flush <APP_NAME/PROCESS_NAME>`. Here, `<APP_NAME/PROCESS_NAME>` is found on the table printed on console when we run app through `PM2`
    - We can see the list of process/app running through `PM2` by the command `pm2 list`
    - We can stop a running app/process through the command `pm2 stop {APP_NAME/PROCESS_NAME}`
    - We can delete a app/process through the command `pm2 delete {APP_NAME/PROCESS_NAME}`
    - We can give a name to the app/process while running the app through the command `pm2 start --name "devtinder-backend" npm -- start` from the project root folder
    
    ```

    Frontend => http://43.204.96.49/
    Backend => http://43.204.96.49:7777/

    Domain name => devtinder.com => http://43.204.96.49/

    Frontend => devtinder.com
    Backend => devtinder.com:7777 => devtinder.com/api

    ```

    - For above type of mapping, we need nginx proxy pass.
        - We need to modify nginx config file. To do that, go to the root folder of EC2 server. Then open the file in edit mode by the command `sudo nano /etc/nginx/sites-available/default`
        
        ```

        server_name 43.204.96.49; # server_name should be the domain name or the IP address of EC2 if you don't have domain

        location /api/ {
            proxy_pass http://localhost:7777/;  # Pass the request to the Node.js app
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location / {
            try_files $uri $uri/ /index.html;
        }

        ```

    - Restart nginx with the command `sudo systemctl restart nginx` after updating nginx config.
    - Update the backend BASE_URL in frontend `.env` file. And re-deploy the frontend. Create prod build. Copy the build files into `/var/www/html`.
    - `pm2 save` will save the current process list. And `pm2 startup` will print a command. We need to copy and paste that command. That will ensure that saved process list will run on EC2 instance reboot