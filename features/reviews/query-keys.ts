export function reviewQueryKey(productId: number) {
  return ["reviews", productId] as const;
}
