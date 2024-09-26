# DiscoBee

DiscoBee is a free tool developed by ByteHive that simplifies viewing NDI — Network Device Interface  sources registered on a Discovery server.

## Features

- Display all NDI sources registered on a Discovery server
- Currently supports localhost
- Includes an API for programmatic access
- Search for String in Source
## Usage

For Production environments, we recommend using one of the Prebuilt Binaries.


## Development
Clone this Repository and then run the following commands:
 npm install 
 npm run start


## API

/api/sources 
list all the available sources
## Current Limitations

- Only supports localhost as the Discovery server
- Opens a TCP port for every new check 
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
