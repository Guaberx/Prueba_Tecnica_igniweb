## Database schema

coins → from /map, synced daily.

coin_info → from /info, synced occasionally (doesn’t change much).

coin_quotes_latest → optional cache for /latest.

coin_quotes_historical → optional cache if you want to avoid calling CMC too often.



## Endpoints

GET /coins/:symbol/info
→ Returns metadata for a coin (logo, website, description).

GET /coins/:symbol/latest
→ Returns the latest price and changes.

You can fetch from CMC directly and/or cache it briefly (e.g. Redis or DB).

GET /coins/:symbol/historical?interval=1h&start=...&end=...
→ Returns historical prices for charting.

GET /user-coins/:userId
→ Returns user’s selected coins, enriched with /latest data (so their dashboard shows current prices).

POST /user-coins
→ Add coin to user’s watchlist.