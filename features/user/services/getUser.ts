import { apiClient } from "@/lib/api";
import { mapUser } from "@/features/user/adapters";
import { wpUserSchema } from "@/schemas/wordpress";
import type { User } from "@/features/user/types";

export async function getUser(): Promise<User> {
  const response = await apiClient.get("/user");
  return mapUser(wpUserSchema.parse(response.data));
}
