``` sql
CREATE TABLE coin_info (
  coin_id INT PRIMARY KEY,      -- CMC id
  symbol VARCHAR(20) UNIQUE,
  name VARCHAR(100),
  slug VARCHAR(100),
  logo VARCHAR(255),
  description TEXT,
  website VARCHAR(255),
  category VARCHAR(50)
);

CREATE TABLE coin_quotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coin_id INT NOT NULL,
  price DECIMAL(20,8) NOT NULL,
  volume_24h DECIMAL(20,2),
  market_cap DECIMAL(20,2),
  percent_change_1h DECIMAL(10,4),
  percent_change_24h DECIMAL(10,4),
  percent_change_7d DECIMAL(10,4),
  timestamp DATETIME NOT NULL,
  FOREIGN KEY (coin_id) REFERENCES coin_info(coin_id)
);

CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_coins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  coin_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (coin_id) REFERENCES coin_info(coin_id),
  UNIQUE KEY (user_id, coin_id)
);

```

## Update Strategy

1. Static metadata (coin_info)

   - Updated daily (via /map + /info).

   - Doesn’t change often (logos, websites, descriptions).

2. Quotes (coin_quotes)

   - Latest market data (/quotes/latest) can be polled every 5–10 minutes.

   - Why?

    - 1 minute would generate too much data (millions of rows over time).

    - 5–10 minutes gives enough granularity for charts while keeping storage reasonable.

  - Historical imports (/quotes/historical) can fill in back data (e.g. daily candles, hourly prices).

3. Realtime Display (Frontend)

  - The DB doesn’t need to store every second.

  - Frontend can call /coins/:symbol/latest directly (or through backend proxy with short caching, e.g. Redis).

  - DB holds the time-series baseline for charts.


### Example Flow

Every 10 minutes:

Cron job → call /quotes/latest?symbol=BTC,ETH,... for all coins
