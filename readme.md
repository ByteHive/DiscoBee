# DiscoBee

DiscoBee is a free tool developed by ByteHive that simplifies viewing NDI — Network Device Interface  sources registered on a Discovery server.

## Features

- Display all NDI sources registered on a Discovery server
- Currently supports localhost
- Includes an API for programmatic access
- Search for String in Source
## Usage

For Production environments, we recommend using one of the Prebuilt Binaries.

### Linux 
 1. Download the binary using curl : 
 ``` wget https://github.com/ByteHive/DiscoBee/releases/download/v0.1.0/discobee-linux-0-1 ```
 2. Make it executable by running  : 
 ```chmod 777 discobee-linux-0-1```
 3. Now you can run it using the following command:
    ```sudo ./discobee-linux-0-1```
#### Autostart
1. Create a new file in /etc/systemd/system/ with a .service extension. Let's call it discobee.service:
```sudo nano /etc/systemd/system/discobee.service  ```
2. add the following content to the file : 
```
[Unit]
Description=Discobee Linux Service
After=network.target

[Service]
ExecStart=/home/ubuntu/discobee-linux-0-1
Restart=on-failure
User=root

[Install]
WantedBy=multi-user.target
```
3. close the editor and save
4. Reload systems : 
``` sudo systemctl daemon-reload ```
6. Enable the service to start on boot:
  ```sudo systemctl enable discobee.service ```
8. Start the service:
   ```sudo systemctl start discobee.service ```
## Development
Clone this Repository and then run the following commands:
 npm install 
 npm run start


## API
/api/sources 
list all the available sources
## Current Limitations

- Only supports localhost as the Discovery server
- No caching 
- No automatic updates

## Roadmap

We're actively working on improving DiscoBee. Here are some features in development:

- Support for multiple Discovery Servers and the ability to compare them
- Expanding support to hosts other than localhost



## Contact

Please open an Issue for Feature Requests and Issues. 

---

Developed with ❤️ by ByteHive
