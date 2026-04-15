import { apiClient } from "@/lib/api";
import { wpProductSchema } from "@/schemas/wordpress";
import { mapProduct } from "../adapters";
import type { Product } from "../types";

export async function getProductById(id: number): Promise<Product> {
  const response = await apiClient.get(`/products/${id}`);
  return mapProduct(wpProductSchema.parse(response.data));
}
