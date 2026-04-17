# Sokany-eg Snapshot Data

This folder contains a manually refreshed snapshot scraped from `https://sokany-eg.com` using the public WooCommerce Store API.

## What is stored here

- `products.json`: products transformed to the shape required by `wpProductsSchema`
- `categories.json`: categories transformed to the shape required by `wpCategoriesSchema`
- `manifest.json`: metadata about source, totals, and scrape options
- `_errors.json`: validation/download failures (intentionally gitignored)

## Commands

```bash
npm run scrape:sokany
npm run scrape:sokany:dry
```

- `scrape:sokany`: full scrape + write JSON + download images
- `scrape:sokany:dry`: fetch + transform + validate only (no writes)

## Reset and rebuild snapshot

```bash
rm -rf data/sokany-eg public/images/sokany-eg
npm run scrape:sokany
```

## Notes and limits

- Snapshot refresh is manual by design.
- Product/category images are downloaded to `public/images/sokany-eg/**` and referenced using local paths (no hotlinking).
- The Store API does not expose all WooCommerce admin fields with full fidelity (for example rich attributes and some editorial metadata). For full parity, switch to authenticated WooCommerce REST v3 later.
