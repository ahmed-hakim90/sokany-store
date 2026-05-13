import { apiClient } from "@/lib/api";
import { mapUser } from "@/features/user/adapters";
import { wpUserSchema } from "@/schemas/wordpress";
import type { User } from "@/features/user/types";

export async function updateUser(
  data: Record<string, string | number | boolean>,
): Promise<User> {
  const response = await apiClient.put("/user", data);
  return mapUser(wpUserSchema.parse(response.data));
}
