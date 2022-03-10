# Price-Targets
The Price Targets repo contains code for a slew of services that retrieve stock price target data, store certain points and flow out desired points.

The goal is to view price target changes on a daily basis for a select amount of stocks.

## Quick Links
- [Requirements](#requirements)
- [Project Overview](#project-overview)
  - [Setup](#setup)
  - [Startup](#startup)
  - [Shutdown](#shutdown)
- [Services](#services)
  - [Bot](#bot)
  - [MongoDB](#mongodb)
  - [Ratings](#ratings)
  - [Ratings History](#ratings-history)
  - [Realtime](#realtime)
  - [Refresher](#refresher)
  - [Ticker](#ticker)

----------------------------------

## Requirements
- Docker

----------------------------------

## Project Overview
### **Setup**
- Clone the repository
- Navigate to the ***Price-Targets*** directory
- Create a ***.env*** file
  - Use the ***.env.template*** file as a template
- In the ***.env*** file, modify the following fields
  - **BOT_SERVER_PORT**=***Bot server port. Ex. 3001***
  - **DISCORD_BOT_TOKEN**=***Discord application bot token***
  - **RATINGS_REQUEST_URL**=***Url of the endpoint to request for price target data***
  - **RATINGS_SERVER_PORT**=***Ratings server port. Ex. 3002***
  - **DATABASE_COLLECTION_NAME**=***Database collection name. Ex. ratings_history***
  - **DATABASE_CONNECT_TIMEOUT**=***Database connection timeout (secs). Ex. 10***
  - **DATABASE_NAME**=***Database name. Ex. price_targets***
  - **DATABASE_URI**=***Database connect uri. Ex. mongodb://mongodb:27017***
  - **RATINGS_HISTORY_SERVER_PORT**=***Ratings server port. Ex. 3003***
  - **REALTIME_SERVER_PORT**=***Realtime server port. Ex. 3004***
  - **REFRESHER_SYMBOLS**=***List of symbols to be utilized by the refresher service***
  - **TICKER_SERVER_PORT**=***Ticker server port. Ex. 3005***
  - **BOT_SERVICE_URI**=***Uri of the bot service endpoint. Ex. http://bot:3001/bot***
  - **RATINGS_SERVICE_URI**=***Uri of the ratings service endpoint. Ex. http://ratings:3001/ratings***
  - **RATINGS_HISTORY_SERVICE_URI**=***Uri of the ratings history service endpoint. Ex. http://ratings_history:3001/ratings_history***
  - **REALTIME_SERVICE_URI**=***Uri of the realtime service endpoint. Ex. http://realtime:3001/realtime***
  - **TICKER_SERVICE_URI**=***Uri of the ticker service endpoint. Ex. http://ticker:3001/ticker***
  - **LOG_LEVEL**=***Log level to apply to the entire application. Ex. INFO***

### **Startup**
- Navigate to the ***Price-Targets*** directory
- Execute the following command to build the **Docker** images and startup the containers
  - Interactive process: ***docker-compose up --build***
  - Detached from the process: ***docker-compose up -d --build***
- View logs and verify no startup errors appear

### **Shutdown**
- Navigate to the ***Price-Targets*** directory
- Execute the following command to stop the **Docker** containers
  - ***docker-compose down***

----------------------------------

## Services
### **Bot**
The **bot** service is responsible for serving price target updates to a *price-targets* channel.  Updates are formed into a Discord Message Embed containing the following data points:
- Company name and symbol
- Current price
- Current/previous highest price target
- Current/previous lowest price target
- Current/previous average price target

![Message Embed](/images/message-embed.PNG)

The service listens to a port for POST requests to send a Discord Embed Message to a *price-targets* channel.

### **MongoDB**
Price Targets utilizes **MongoDB** to store the following historical price target data points:
- Company symbol
- Current/previous highest price target
- Current/previous lowest price target
- Current/previous average price target
- Last updated

### **Ratings**
The **ratings** service is responsible for retrieving and parsing price target data.  The service listens to a port for GET requests to respond with the following data points:
- Current average price target
- Current highest price target
- Current lowest price target

### **Ratings History**
The **ratings_history** service is responsible for storing and serving historical price target data.  The service listens to a port for POST requests to store data in the **MongoDB** and GET requests to respond with data from the **MongoDB**.  The service responsds and expects the following points in the GET/POST request:
- Average price target
- Highest price target
- Lowest price target

### **Realtime**
The **realtime** service is responsible for serving current and historical price target data.  The service listens to a port for GET requests to respond with the following data points:
- Current average/highest/lowest price target
- Previous average/highest/lowest price target
- Company name, stock price, and symbol

### **Refresher**
The **refresher** service is responsible for updating historical price target data and sending any different between current and historical price target data to the **bot** service.  The service requests data from the **ratings_history** and **realtime** services for price target data points.

### **Ticker**
The **ticker** service is responsible for retrieving basic stock information for a desired symbol.  The service listens to a port for GET requests to respond with the following data points:
- Company name
- Current stock price
- Stock symbol