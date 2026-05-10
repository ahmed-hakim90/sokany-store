# AI search / smart catalog — spike notes

## Scope (later phases)

- **Smart search:** hybrid keyword (Woo `/products?search=`) + optional embeddings on title/description (batch index + vector store).
- **Suggestions:** co-occurrence / category proximity; optional LLM rerank with strict product ID allowlist.
- **Compare:** client-side diff of 2–4 `Product` views from existing API.
- **«اسأل عن المنتج»:** RAG over PDP text + policies; Arabic-first prompts; cite product IDs only from retrieved context.
- **WhatsApp order assistant:** defer — needs Business API + order creation contract.

## Suggested stack

- Vercel AI Gateway + AI SDK for chat/compare flows.
- No new dependency until product prioritizes RAG; prototype against `/api/products` + mock.

## Safety

- Never expose `WC_*` keys; all LLM tools call **Next BFF** only.
- Rate-limit public chat endpoint like auth routes.
