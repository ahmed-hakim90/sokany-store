/** Focus the visible header product search field (mobile vs desktop). */
export function focusProductSearchHeaderInput() {
  for (const el of document.querySelectorAll<HTMLInputElement>(
    "input[data-product-search-header]",
  )) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      el.focus();
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
  }
}
