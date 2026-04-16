import { apiClient } from "@/lib/api-client";
import { storeHotlineResponseSchema } from "@/schemas/store-hotline";

export async function getStoreHotline() {
  const response = await apiClient.get("/store/hotline");
  return storeHotlineResponseSchema.parse(response.data);
}
