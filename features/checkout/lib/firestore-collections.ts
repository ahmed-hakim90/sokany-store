/**
 * Firestore collection for B2C shoppers after Phone Auth.
 * Intentionally not named `customers` — avoids collision with ERP rules / other apps on the same project.
 */
export const STOREFRONT_CUSTOMERS_COLLECTION = "storefront_customers" as const;
