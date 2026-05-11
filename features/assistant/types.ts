export type PublicKnowledgeKind =
  | "product"
  | "category"
  | "cms"
  | "branch"
  | "retailer"
  | "policy"
  | "page";

export type PublicKnowledgeChunk = {
  id: string;
  title: string;
  url: string;
  kind: PublicKnowledgeKind;
  text: string;
};

export type AssistantSource = {
  title: string;
  url: string;
  kind: PublicKnowledgeKind;
};

export type AssistantDataTypes = {
  sources: AssistantSource[];
};
