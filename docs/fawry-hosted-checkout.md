# Fawry Hosted Checkout

## Current Integration

The storefront uses Fawry's hosted checkout link flow:

1. Checkout creates a WooCommerce order.
2. The browser calls `POST /api/payments/fawry`.
3. The server signs a Fawry hosted charge request and sends it to Fawry.
4. Fawry should return a hosted payment URL (`redirectUrl` / `nextAction.redirectUrl`).
5. The browser immediately redirects with `window.location.href`.
6. Fawry redirects back to `/api/payments/fawry/callback`.

This avoids popups and is the safest option for iPhone Safari, Android Chrome,
and PWA mode.

## Request Fields We Control

- `merchantRefNum`: stable merchant reference for the Woo order.
- `customerName`, `customerMobile`, `customerEmail`.
- `language`: currently `ar-eg`.
- `returnUrl`: the callback URL on this storefront.
- `paymentExpiry`: generated server-side.
- `paymentMethod`: optional restriction via `FAWRY_HOSTED_PAYMENT_METHOD`
  (`PayAtFawry`, `CARD`, `MWALLET`, `VALU`, `CashOnDelivery`).
- `chargeItems`: item id, description, price, quantity.

## Hosted Page Customization

Usually controllable from the Fawry merchant dashboard or through Fawry support:

- Merchant display name.
- Merchant logo.
- Enabled payment methods.
- Whether a single method is forced by `paymentMethod`.
- Hosted page language through the `language` request field.
- Return/callback URL through `returnUrl`.

Usually fixed by Fawry:

- Core hosted page layout.
- Card/payment form fields.
- PCI-sensitive entry screens.
- Most colors and interaction details unless Fawry enables merchant-level branding.

## Diagnosing 9903

The integration logs sanitized request and response details under `[fawry]`.
If Fawry returns `9903` after a valid hosted request, the likely causes are:

- Hosted Checkout is not enabled for the merchant profile.
- The configured `paymentMethod` is not enabled for that merchant.
- Sandbox credentials are being used against a production profile, or vice versa.
- Fawry requires a different merchant secure key for hosted checkout.

Use `GET /api/dev/fawry-charge-test` in development to send a test hosted
charge and inspect the logged payload/signature/response. Outside development,
the route requires `Authorization: Bearer DEV_WOO_DIAG_TOKEN`.
