# Fawry Hosted Checkout

## Current Integration

The storefront uses Fawry's hosted checkout link flow:

1. Checkout creates a WooCommerce order.
2. The browser calls `POST /api/payments/fawry`.
3. The server signs a Fawry hosted charge request and sends it to Fawry.
4. Fawry should return a hosted payment URL (`redirectUrl`, `nextAction.redirectUrl`,
   or an equivalent hosted URL field).
5. The browser validates the URL and immediately redirects with `window.location.assign`.
6. Fawry redirects back to `/api/payments/fawry/callback`.

This avoids popups and is the safest option for iPhone Safari, Android Chrome,
and PWA mode.

## Request Fields We Control

- `merchantRefNum`: unique per hosted payment attempt, while preserving the Woo
  order id in the format `sokany-{orderId}-{attemptSuffix}` so callbacks can map
  back to the order.
- `customerName`, `customerMobile`, `customerEmail`.
- `language`: currently `ar-eg`.
- `returnUrl`: the callback URL on this storefront.
- `paymentExpiry`: generated server-side.
- `paymentMethod`: optional restriction via `FAWRY_HOSTED_PAYMENT_METHOD`
  (`PayAtFawry`, `CARD`, `MWALLET`, `VALU`, `CashOnDelivery`). If this variable
  is omitted, the request omits `paymentMethod` and lets the merchant profile
  show all methods enabled by Fawry.
- `chargeItems`: item id, description, price, quantity.

## Environment Checklist

Use one consistent environment end to end. Sandbox merchant credentials should
use the staging Fawry host; production credentials should use the production host.

| Variable | Required | Notes |
| --- | --- | --- |
| `FAWRY_MERCHANT_CODE` | Yes | Merchant identifier from Fawry. |
| `FAWRY_SECURE_KEY` or `FAWRY_SECRET_KEY` | Yes | Signing key. The app masks this and never logs it. |
| `FAWRY_ENABLED` | No | Set to `false` to hide/disable Fawry. |
| `FAWRY_SANDBOX` | Yes | `true` for staging credentials, `false` for production. |
| `FAWRY_BASE_URL` | No | Overrides the default staging/production charge endpoint. Keep it aligned with `FAWRY_SANDBOX`. |
| `FAWRY_REQUEST_TIMEOUT_MS` | No | Charge request timeout in milliseconds. Defaults to `45000` and caps at `120000`; use this if Fawry production is slow to create hosted sessions. |
| `FAWRY_HOSTED_PAYMENT_METHOD` | No | Only set this if Fawry confirms the method is enabled for the merchant. Leave unset to avoid forcing `PayAtFawry`. |
| `NEXT_PUBLIC_SITE_URL` | Production | Must be the public HTTPS storefront origin so `returnUrl` points to a reachable callback. |

The service logs warnings for common mismatches, including staging URL with
production mode, production URL with sandbox mode, quoted env values, invalid
Egyptian mobile format, and non-HTTPS production return URLs.

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
- The configured `paymentMethod` is not enabled for that merchant. If unsure,
  remove `FAWRY_HOSTED_PAYMENT_METHOD` and let Fawry show the enabled methods.
- Sandbox credentials are being used against a production profile, or vice versa.
- Fawry requires a different merchant secure key for hosted checkout.
- `NEXT_PUBLIC_SITE_URL` or the callback URL is not reachable over public HTTPS
  in production.

When 9903 happens, the payment page will not open because Fawry did not create a
hosted session. Inspect the `[fawry] charge status failure` log entry: it includes
the request id, merchant reference, HTTP status, Fawry status code, status
description, response body, environment mode, endpoint host, and whether a payment
URL was present.

Use `GET /api/dev/fawry-charge-test` in development to send a test hosted
charge and inspect the logged payload/signature/response. Outside development,
the route requires `Authorization: Bearer DEV_WOO_DIAG_TOKEN`.

## Diagnosing Timeouts

If logs show `[fawry] charge timeout`, the app sent the charge request but aborted
before Fawry returned a response. The request log includes `timeoutMs`; the
default is 45 seconds. If Fawry support confirms longer hosted-session creation
times, increase `FAWRY_REQUEST_TIMEOUT_MS` up to `120000`.

## Retry and Duplicate Behavior

The storefront disables the submit button while the checkout mutation is pending,
which prevents normal double-click duplicate submissions. The Fawry reference is
also unique per hosted payment attempt, so a failed or abandoned attempt can be
retried without reusing the same Fawry `merchantRefNum`. The Woo order id remains
embedded in the reference, so callbacks still update the correct Woo order.

## Mobile Redirect Compatibility

The production flow uses a same-tab redirect after the backend returns the hosted
URL. It does not use `window.open`, delayed popups, or a browser popup window.
This is the preferred path for iPhone Safari, Chrome Android, and PWA mode.

## Optional Embedded Experiences

A modal or iframe can only be considered if Fawry explicitly supports embedding
the returned hosted URL and its CSP/frame headers allow it. Keep card/payment
entry inside Fawry-hosted PCI-controlled screens; the app may customize checkout
before redirect, but it should not collect PCI-sensitive payment details itself.
