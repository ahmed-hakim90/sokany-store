"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { useCategories } from "@/features/categories/hooks/useCategories";
import type { Category } from "@/features/categories/types";
import { ManagedImageUploadField } from "@/features/control/components/control-panel-forms";
import {
  CMS_DEFAULT_HOME_PRODUCT_SECTIONS,
  CMS_DEFAULT_HOME_PRODUCT_SECTIONS_MODE,
  CMS_MAX_HOME_PRODUCT_SECTIONS,
  cmsHomeProductSectionsArraySchema,
  cmsHomeProductSectionsModeSchema,
  type CmsHomeProductSection,
  type CmsHomeProductSectionsMode,
} from "@/schemas/cms";

function categoryDepth(cat: Category, byId: Map<number, Category>): number {
  let d = 0;
  let pid = cat.parentId;
  while (pid !== 0) {
    const p = byId.get(pid);
    if (!p) break;
    d++;
    pid = p.parentId;
    if (d > 30) break;
  }
  return d;
}

function buildCategorySelectOptions(categories: Category[]): { value: number; label: string }[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  return [...categories]
    .sort((a, b) => a.name.localeCompare(b.name, "ar"))
    .map((c) => {
      const depth = categoryDepth(c, byId);
      const prefix = depth > 0 ? `${"— ".repeat(depth)}` : "";
      return { value: c.id, label: `${prefix}${c.name}` };
    });
}

function newSection(categories: Category[], nextOrder: number): CmsHomeProductSection {
  const first = categories[0];
  return {
    id: crypto.randomUUID(),
    active: true,
    order: nextOrder,
    categoryId: first?.id ?? 1,
    bannerImageUrl: "",
    layout: "horizontal",
    productCount: 8,
  };
}

export function HomeProductSectionsForm({
  initialMode,
  initialSections,
  disabled,
  onSave,
}: {
  initialMode: CmsHomeProductSectionsMode | undefined;
  initialSections: CmsHomeProductSection[] | undefined;
  disabled: boolean;
  onSave: (patch: {
    homeProductSectionsMode: CmsHomeProductSectionsMode;
    homeProductSections: CmsHomeProductSection[];
  }) => void;
}) {
  const [mode, setMode] = useState<CmsHomeProductSectionsMode>(
    initialMode ?? CMS_DEFAULT_HOME_PRODUCT_SECTIONS_MODE,
  );
  const [sections, setSections] = useState<CmsHomeProductSection[]>(
    initialSections?.length ? [...initialSections] : [...CMS_DEFAULT_HOME_PRODUCT_SECTIONS],
  );

  const categories = useCategories({ per_page: 100 });
  const categoryOptions = useMemo(
    () => (categories.data ? buildCategorySelectOptions(categories.data) : []),
    [categories.data],
  );

  const sortedIndexes = useMemo(() => {
    const idx = sections.map((_, i) => i);
    idx.sort((a, b) => sections[a]!.order - sections[b]!.order || sections[a]!.id.localeCompare(sections[b]!.id));
    return idx;
  }, [sections]);

  function updateSection(index: number, patch: Partial<CmsHomeProductSection>) {
    setSections((prev) => {
      const next = [...prev];
      const cur = next[index];
      if (!cur) return prev;
      next[index] = { ...cur, ...patch };
      return next;
    });
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }

  function addSection() {
    if (sections.length >= CMS_MAX_HOME_PRODUCT_SECTIONS) {
      toast.error(`الحد الأقصى ${CMS_MAX_HOME_PRODUCT_SECTIONS} قسماً.`);
      return;
    }
    const list = categories.data ?? [];
    const maxOrder = sections.reduce((m, s) => Math.max(m, s.order), 0);
    setSections((prev) => [...prev, newSection(list, maxOrder + 1)]);
  }

  function moveInSortOrder(sortedPosition: number, dir: -1 | 1) {
    const j = sortedPosition + dir;
    if (j < 0 || j >= sortedIndexes.length) return;
    const iA = sortedIndexes[sortedPosition]!;
    const iB = sortedIndexes[j]!;
    setSections((prev) => {
      const next = [...prev];
      const a = next[iA];
      const b = next[iB];
      if (!a || !b) return prev;
      const oa = a.order;
      const ob = b.order;
      next[iA] = { ...a, order: ob };
      next[iB] = { ...b, order: oa };
      return next;
    });
  }

  function handleSave() {
    const modeParsed = cmsHomeProductSectionsModeSchema.safeParse(mode);
    if (!modeParsed.success) {
      toast.error(modeParsed.error.issues.map((i) => i.message).join(" — "));
      return;
    }
    const normalized = sections.map((s) => ({
      ...s,
      bannerImageUrl: s.bannerImageUrl.trim(),
      productCount: s.productCount,
    }));
    const arrParsed = cmsHomeProductSectionsArraySchema.safeParse(normalized);
    if (!arrParsed.success) {
      toast.error(arrParsed.error.issues.map((i) => i.message).join(" — "));
      return;
    }
    onSave({
      homeProductSectionsMode: modeParsed.data,
      homeProductSections: arrParsed.data,
    });
  }

  const catsLoading = categories.isPending;
  const catsError = categories.isError;

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div>
        <h2 className="font-display text-lg font-bold">أقسام المنتجات في الصفحة الرئيسية</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          اختر وضع العرض العام، ثم أضف أقساماً مرتبطة بتصنيفات من المتجر مع بانر أعلى كل قسم وعدد
          المنتجات واتجاه العرض (أفقي أو رأسي).
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">وضع الصفحة الرئيسية</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="homeProductSectionsMode"
            checked={mode === "auto"}
            disabled={disabled}
            onChange={() => setMode("auto")}
          />
          <span>تلقائي فقط — أقسام الأب الحالية من المتجر</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="homeProductSectionsMode"
            checked={mode === "custom"}
            disabled={disabled}
            onChange={() => setMode("custom")}
          />
          <span>مخصص فقط — الأقسام التي تضبطها هنا</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="homeProductSectionsMode"
            checked={mode === "hybrid"}
            disabled={disabled}
            onChange={() => setMode("hybrid")}
          />
          <span>الاثنين — المخصص أولاً ثم الأقسام التلقائية</span>
        </label>
      </fieldset>

      {catsError ? (
        <p className="text-sm text-destructive">تعذر تحميل التصنيفات. أعد المحاولة ثم عدّل الأقسام.</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={disabled || catsLoading} onClick={addSection}>
          <Plus className="me-1 inline size-4" aria-hidden />
          إضافة قسم
        </Button>
        <Button type="button" disabled={disabled} onClick={handleSave}>
          {disabled ? "جاري الحفظ…" : "حفظ أقسام الصفحة الرئيسية"}
        </Button>
      </div>

      <ul className="space-y-4">
        {sortedIndexes.map((sectionIndex, sortedPos) => {
          const s = sections[sectionIndex]!;
          return (
            <li
              key={s.id}
              className="space-y-3 rounded-xl border border-border/80 bg-surface-muted/20 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={s.active}
                    disabled={disabled}
                    onChange={(e) => updateSection(sectionIndex, { active: e.target.checked })}
                  />
                  <span>نشط</span>
                </label>
                <span className="text-xs text-muted-foreground">ترتيب: {s.order}</span>
                <div className="ms-auto flex gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 px-2"
                    disabled={disabled || sortedPos === 0}
                    onClick={() => moveInSortOrder(sortedPos, -1)}
                    aria-label="أعلى"
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 px-2"
                    disabled={disabled || sortedPos >= sortedIndexes.length - 1}
                    onClick={() => moveInSortOrder(sortedPos, 1)}
                    aria-label="أسفل"
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 px-2 text-destructive"
                    disabled={disabled}
                    onClick={() => removeSection(sectionIndex)}
                    aria-label="حذف القسم"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">التصنيف</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    disabled={disabled || catsLoading || categoryOptions.length === 0}
                    value={s.categoryId}
                    onChange={(e) =>
                      updateSection(sectionIndex, { categoryId: Number(e.target.value) })
                    }
                  >
                    {!categoryOptions.some((o) => o.value === s.categoryId) ? (
                      <option value={s.categoryId}>
                        تصنيف محفوظ غير ظاهر في القائمة (معرف {s.categoryId})
                      </option>
                    ) : null}
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <ManagedImageUploadField
                    label="بانر أعلى القسم"
                    value={s.bannerImageUrl}
                    onChange={(url) => updateSection(sectionIndex, { bannerImageUrl: url })}
                    disabled={disabled}
                    placeholder="https://… أو مسار بعد الرفع"
                    helper="صورة بعرض القسم (نسبة تقريبية ١٦∶٥). مطلوبة قبل الحفظ."
                    buttonLabel="اختيار صورة"
                    previewClassName="max-h-28 max-w-full sm:max-w-md"
                    previewImageClassName="h-[100px] w-full object-cover"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">اتجاه المنتجات</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    disabled={disabled}
                    value={s.layout}
                    onChange={(e) =>
                      updateSection(sectionIndex, {
                        layout: e.target.value as "horizontal" | "vertical",
                      })
                    }
                  >
                    <option value="horizontal">أفقي (شريط تمرير)</option>
                    <option value="vertical">رأسي (شبكة)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">عدد المنتجات</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    disabled={disabled}
                    value={s.productCount}
                    onChange={(e) =>
                      updateSection(sectionIndex, {
                        productCount: Math.max(1, Math.min(100, Number(e.target.value) || 8)),
                      })
                    }
                  />
                </div>
              </div>

            </li>
          );
        })}
      </ul>
    </section>
  );
}
