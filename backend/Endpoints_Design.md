# Endpoints Design

## Overview

This backend manages cryptocurrency data retrieved from CoinMarketCap (CMC) and exposes it through RESTful APIs.
The system supports:

Searching and storing coins (/map)

Lazy loading of historical prices
 - prices are update every x time

On-demand latest quotes

User watchlists


## Endpoints
### Coins

GET /coins?query=<symbol,name,slug>

Description: Search available coins by exact match of symbol, name or slug. Multiple terms can be provided as comma-separated values.

Source: MySQL coins table (synced daily from CMC /map).

Request:

GET /coins?query=BTC,ETH,Ethereum


Response:
```JSON
[
  {
    "coin_id": 1027,
    "symbol": "ETH",
    "name": "Ethereum",
    "slug": "ethereum",
    "metadata": {
      "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      "description": "Ethereum (ETH) is a smart contract platform...",
      "website": "https://ethereum.org",
      "category": "coin"
    }
  },
  {
    "coin_id": 825,
    "symbol": "USDT",
    "name": "Tether",
    "slug": "tether",
    "metadata": {
      "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
      "description": "Tether (USDT) is a stablecoin...",
      "website": "https://tether.to",
      "category": "token"
    }
  }
]
```

### Coin Metadata
GET /coins/:symbol/info

Description: Get metadata (logo, website, description, etc.) for a coin.

Source: MySQL coin_info (cache of CMC /info).

Request:

GET /coins/BTC/info


Response:
```JSON
{
  "id": 1,
  "symbol": "BTC",
  "name": "Bitcoin",
  "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  "description": "Descripcion detallada del Bitcoin",
  "urls": {
    "website": ["https://bitcoin.org/"],
    "source_code": ["https://github.com/bitcoin/"]
  }
}
```
### Latest Quotes
GET /coins/:symbol/latest

Description: Get the most recent price and market data for a coin.

Source: CMC /quotes/latest, optionally cached.

Request:

GET /coins/ETH/latest


Response:
```JSON
{
  "symbol": "ETH",
  "price": 6602.60,
  "percent_change_1h": 0.98,
  "percent_change_24h": 4.37,
  "market_cap": 852164659250.27,
  "last_updated": "2018-08-09T21:56:28.000Z"
}
```

### Historical Quotes
GET /coins/historical?identifiers=<symbol1,symbol2,...>&interval=1h&start=<ISO>&end=<ISO>

Description: Get time-series price data for multiple coins. Identifiers can be symbols, names, or slugs (comma-separated).

Source: CMC /quotes/historical, cached in DB.

Query Params:

identifiers (required): Comma-separated list of symbols, names, or slugs (max 10)

interval (default: 1h)

start (ISO timestamp)

end (ISO timestamp)

Request:

GET /coins/historical?identifiers=BTC,ETH&interval=1h&start=2023-01-01&end=2023-01-31

Response:
```JSON
[
  {
    "coin_id": 1,
    "coin": {
      "coin_id": 1,
      "symbol": "BTC",
      "name": "Bitcoin",
      "slug": "bitcoin",
      "rank": 1,
      "logo": "https://...",
      "description": "...",
      "website": "https://bitcoin.org",
      "category": "coin"
    },
    "quotes": [
      {
        "timestamp": "2023-01-01T00:00:00Z",
        "price": 16500.34,
        "volume_24h": 1234567890.12,
        "volume_change_24h": 5.67,
        "percent_change_1h": 0.12,
        "percent_change_24h": 2.34,
        "percent_change_7d": -1.23,
        "percent_change_30d": 15.67,
        "market_cap": 1234567890123.45,
        "market_cap_dominance": 45.67,
        "fully_diluted_market_cap": 2345678901234.56,
        "last_updated": "2023-01-01T00:00:00Z"
      }
    ]
  },
  {
    "coin_id": 1027,
    "coin": {
      "coin_id": 1027,
      "symbol": "ETH",
      "name": "Ethereum",
      "slug": "ethereum",
      "rank": 2,
      "logo": "https://...",
      "description": "...",
      "website": "https://ethereum.org",
      "category": "coin"
    },
    "quotes": [
      {
        "timestamp": "2023-01-01T00:00:00Z",
        "price": 1200.50,
        "volume_24h": 567890123.45,
        "volume_change_24h": 2.34,
        "percent_change_1h": 0.45,
        "percent_change_24h": 1.67,
        "percent_change_7d": -0.89,
        "percent_change_30d": 8.92,
        "market_cap": 145678901234.56,
        "market_cap_dominance": 12.34,
        "fully_diluted_market_cap": 145678901234.56,
        "last_updated": "2023-01-01T00:00:00Z"
      }
    ]
  }
]
```


### Latest Quotes by IDs
GET /coins/latest?ids=<coin_id1,coin_id2,...>

Description: Get latest quotes for multiple coins by their CMC IDs.

Source: CMC /quotes/latest.

Query Params:

ids (required): Comma-separated list of CoinMarketCap coin IDs

Request:

GET /coins/latest?ids=1,1027

Response:
```JSON
{
  "data": {
    "1": {
      "id": 1,
      "name": "Bitcoin",
      "symbol": "BTC",
      "slug": "bitcoin",
      "quote": {
        "USD": {
          "price": 45000.00,
          "volume_24h": 1234567890.12,
          "percent_change_1h": 0.12,
          "percent_change_24h": 2.34,
          "percent_change_7d": -1.23,
          "market_cap": 1234567890123.45,
          "last_updated": "2023-01-01T00:00:00Z"
        }
      }
    },
    "1027": {
      "id": 1027,
      "name": "Ethereum",
      "symbol": "ETH",
      "slug": "ethereum",
      "quote": {
        "USD": {
          "price": 3000.00,
          "volume_24h": 567890123.45,
          "percent_change_1h": 0.45,
          "percent_change_24h": 1.67,
          "percent_change_7d": -0.89,
          "market_cap": 345678901234.56,
          "last_updated": "2023-01-01T00:00:00Z"
        }
      }
    }
  }
}
```

### Coins by Rank
GET /coins/rank?start=<number>&limit=<number>

Description: Get coins ordered by market capitalization rank with pagination.

Source: Database (CoinInfo table).

Query Params:

start (optional, default: 0): Starting position (0-based index)

limit (optional, default: 50): Number of coins to return (max: 1000)

Request:

GET /coins/rank?start=0&limit=10

Response:
```JSON
[
  {
    "coin_id": 1,
    "symbol": "BTC",
    "name": "Bitcoin",
    "slug": "bitcoin",
    "rank": 1,
    "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
    "description": "Bitcoin description...",
    "website": "https://bitcoin.org",
    "category": "coin"
  },
  {
    "coin_id": 1027,
    "symbol": "ETH",
    "name": "Ethereum",
    "slug": "ethereum",
    "rank": 2,
    "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    "description": "Ethereum description...",
    "website": "https://ethereum.org",
    "category": "coin"
  }
]
```

### User Watchlist
GET /watchlist/:userId

Description: Get all coins a user has added to their watchlist.

Response:
```JSON
[
  { "symbol": "BTC", "name": "Bitcoin" },
  { "symbol": "ETH", "name": "Ethereum" }
]
```

POST /watchlist/:userId

Description: Add multiple coins to user's watchlist.

Body:
```JSON
{ "coinIds": [1, 1027, 3] }
```

Response:
```JSON
{ "success": true }
```

PUT /watchlist/:userId

Description: Replace entire watchlist with new set of coins.

Body:
```JSON
{ "coinIds": [1, 1027, 3] }
```

Response:
```JSON
{ "success": true }
```

DELETE /watchlist/:userId

Description: Remove multiple coins from user's watchlist.

Body:
```JSON
{ "coinIds": [1, 1027] }
```

Response:
```JSON
{ "success": true }
```

### User Signup
POST /users/signup

Description: Register a new user.

Request:

POST /users/signup
```JSON
Body: { "username": "user", "password": "pass", "email": "user@example.com" }
```
Response:
```JSON
{ "message": "User created", "id": 123 }
```

## Data Flow

Daily Sync Job

 - Updates coins (from /map).

 - Updates coin_info (from /info for new coins).

Live Data

 - /latest fetched on-demand or cached (e.g. Redis, 30–60s).

Historical Data

 - Fetched when user opens charts. Can be cached locally if needed.

User Watchlist

 - Stored in user_coins.
