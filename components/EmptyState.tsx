import { StorefrontEmptyState } from "@/components/StorefrontEmptyState";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <StorefrontEmptyState title={title} description={description} action={action} />
  );
}
