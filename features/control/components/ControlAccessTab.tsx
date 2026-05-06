"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { CONTROL_TABS_EXCLUDING_ACCESS, type ControlPanelTabId } from "@/features/control/lib/control-tabs";
import {
  ControlAdvancedDetails,
  ControlFormSection,
} from "@/features/control/components/control-page-chrome";
import {
  allTabsDefaultSet,
  CONTROL_TAB_LABEL_AR,
  formatControlAccessSummary,
} from "@/features/control/lib/control-access-labels";
import { controlPanelAccessDocSchema, type ControlPanelAccessDoc } from "@/schemas/control-panel-access";
import { cn } from "@/lib/utils";
import { ControlFieldHelp } from "@/features/control/components/control-field-help";

type Row = { uid: string; email: string | null; doc: unknown };

function parseDoc(d: unknown): ControlPanelAccessDoc | null {
  const p = controlPanelAccessDocSchema.safeParse(d);
  return p.success ? p.data : null;
}

export function ControlAccessTab() {
  const [list, setList] = useState<Row[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [uidDirect, setUidDirect] = useState("");
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [mode, setMode] = useState<"full" | "media">("media");
  const [tabPicks, setTabPicks] = useState<Set<ControlPanelTabId>>(() => allTabsDefaultSet());
  const [mediaRaw, setMediaRaw] = useState("");

  const reload = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/control/panel-access");
      const j = (await res.json().catch(() => ({}))) as { items?: Row[]; error?: string };
      if (res.status === 401) {
        window.location.href = "/control/login";
        return;
      }
      if (!res.ok) {
        setLoadError(j.error ?? "تعذر الجلب");
        return;
      }
      setList(Array.isArray(j.items) ? j.items : []);
    } catch {
      setLoadError("خطأ شبكة");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  function clearFormForNew() {
    setEditingUid(null);
    setEmail("");
    setUidDirect("");
    setMode("media");
    setTabPicks(allTabsDefaultSet());
    setMediaRaw("");
  }

  function loadRowForEdit(r: Row) {
    const parsed = parseDoc(r.doc);
    if (!parsed) {
      toast.error("وثيقة صلاحية غير صالحة");
      return;
    }
    setEditingUid(r.uid);
    setUidDirect(r.uid);
    setEmail(r.email ?? "");
    setMode(parsed.mode);
    if (parsed.mode === "media") {
      setTabPicks(new Set<ControlPanelTabId>(["media"]));
    } else if (parsed.tabIds == null) {
      setTabPicks(allTabsDefaultSet());
    } else if (parsed.tabIds.length === 0) {
      setTabPicks(new Set());
    } else {
      setTabPicks(
        new Set(
          (parsed.tabIds as string[]).filter((x): x is ControlPanelTabId =>
            (CONTROL_TABS_EXCLUDING_ACCESS as readonly string[]).includes(x),
          ),
        ),
      );
    }
    const mf = parsed.mediaSubfolders;
    setMediaRaw(mf == null || mf.length === 0 ? "" : mf.join(", "));
    toast.info("جاهز للتعديل — راجع واضغط «حفظ»");
  }

  function toggleTab(id: ControlPanelTabId) {
    setTabPicks((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  }

  async function onSave() {
    const mfs = mediaRaw
      .split(/[,\n]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const allCore = CONTROL_TABS_EXCLUDING_ACCESS;
    const isEveryTabPicked =
      mode === "full" &&
      allCore.length > 0 &&
      allCore.every((id) => tabPicks.has(id));
    const body: Record<string, unknown> = {
      mode,
      tabIds:
        mode === "full" ? (isEveryTabPicked ? null : tabPicks.size === 0 ? [] : [...tabPicks]) : null,
      mediaSubfolders: mfs.length > 0 ? mfs : null,
    };
    if (editingUid) {
      body.uid = editingUid;
    } else {
      const em = email.trim();
      if (em) {
        body.email = em;
      } else if (uidDirect.trim()) {
        body.uid = uidDirect.trim();
      } else {
        toast.error("اكتب بريد الشخص أولًا، أو استخدم المعرف الداخلي من الإعدادات الإضافية.");
        return;
      }
    }
    setSaving(true);
    try {
      const res = await fetch("/api/control/panel-access", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; ok?: boolean };
      if (!res.ok) {
        throw new Error(j.error ?? "فشل الحفظ");
      }
      toast.success("تم حفظ الصلاحية. اطلب من الشخص تسجيل الدخول مرة جديدة لظهور التغيير.");
      clearFormForNew();
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل");
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteRow(uid: string) {
    if (!confirm("هل تريد إزالة صلاحية هذا الشخص من لوحة التحكم؟")) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/control/panel-access?uid=${encodeURIComponent(uid)}`,
        { method: "DELETE" },
      );
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? "فشل الحذف");
      }
      toast.success("تم");
      if (editingUid === uid) {
        clearFormForNew();
      }
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {loadError}
        <Button type="button" variant="secondary" className="mt-2" onClick={() => void reload()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <ControlFormSection
        title={editingUid ? "تعديل صلاحية مستخدم" : "إضافة شخص للوحة التحكم"}
        description="من هنا تحدد من يقدر يدخل لوحة التحكم، وما هي الأقسام التي يراها داخلها."
        actions={
          editingUid || email || uidDirect ? (
            <Button
              type="button"
              variant="secondary"
              className="shrink-0"
              disabled={saving}
              onClick={clearFormForNew}
            >
              بدء إدخال جديد
            </Button>
          ) : null
        }
      >
        {editingUid ? (
          <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-sm text-amber-950" dir="ltr">
            <span className="font-medium" dir="rtl">تعديل القيد: </span>
            {email || "—"}{" "}
            <span className="font-mono text-xs">({editingUid})</span>
          </p>
        ) : null}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">1. اختيار الشخص</h3>
            <p className="mt-1 text-xs text-slate-500">
              الأفضل استخدام البريد. لو لا يوجد بريد، ستجد المعرف الداخلي داخل الإعدادات الإضافية.
            </p>
          </div>
          <div className={cn(!!editingUid && "pointer-events-none opacity-70")}>
            <div>
              <label className="text-sm font-medium" htmlFor="cp-email">
                البريد
              </label>
              <ControlFieldHelp>
                اكتب إيميل الشخص لو عنده حساب جاهز وعايز توصله بصلاحية الدخول.
              </ControlFieldHelp>
              <input
                id="cp-email"
                type="email"
                dir="ltr"
                className="mt-1 w-full min-h-12 rounded-lg border border-border px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                disabled={saving || Boolean(editingUid)}
                placeholder="user@example.com"
              />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-950">2. تحديد نوع الوصول</h3>
            <label className="text-sm font-medium" htmlFor="cp-mode">
              نطاق الوصول
            </label>
            <ControlFieldHelp>
              من هنا تحدد الشخص يدخل على كل اللوحة ولا على الوسائط فقط.
            </ControlFieldHelp>
            <select
              id="cp-mode"
              className="mt-1 w-full min-h-12 rounded-lg border border-border bg-white px-3 py-2"
              value={mode}
              onChange={(e) => {
                const v = e.target.value as "full" | "media";
                setMode(v);
                if (v === "media") {
                  setTabPicks(new Set<ControlPanelTabId>(["media"]));
                }
              }}
              disabled={saving}
            >
              <option value="full">دخول لأقسام من اللوحة</option>
              <option value="media">الوسائط فقط</option>
            </select>
          </div>
          {mode === "full" ? (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">3. الأقسام المسموح بها</legend>
              <p className="text-xs text-muted-foreground">
                أي قسم غير محدد لن يظهر لهذا الشخص داخل لوحة التحكم.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setTabPicks(allTabsDefaultSet())}
                  disabled={saving}
                >
                  تحديد كل الأقسام
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setTabPicks(new Set())}
                  disabled={saving}
                >
                  إلغاء التحديد
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {CONTROL_TABS_EXCLUDING_ACCESS.map((id) => (
                  <label key={id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={tabPicks.has(id)}
                      onChange={() => toggleTab(id)}
                    />
                    {CONTROL_TAB_LABEL_AR[id] ?? id}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          <ControlAdvancedDetails summary="إعدادات إضافية">
            <div>
              <label className="text-sm font-medium" htmlFor="cp-uid">
                المعرف الداخلي
              </label>
              <ControlFieldHelp>
                استخدمه فقط لو لا يوجد بريد لهذا الشخص وتريد ربطه مباشرة بحسابه الداخلي.
              </ControlFieldHelp>
              <input
                id="cp-uid"
                dir="ltr"
                className="mt-1 w-full min-h-12 rounded-lg border border-border px-3 py-2 font-mono text-sm"
                value={uidDirect}
                onChange={(e) => setUidDirect(e.target.value)}
                autoComplete="off"
                disabled={saving || Boolean(editingUid)}
                placeholder="firebase uid"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="cp-mf">
                مجلدات الوسائط المسموحة
              </label>
              <ControlFieldHelp>
                لو تريد حصر الشخص في مجلدات معينة داخل الوسائط، اكتب أسماءها هنا. لو تركتها فارغة، يرى كل المجلدات المسموح بها له.
              </ControlFieldHelp>
              <textarea
                id="cp-mf"
                dir="ltr"
                className="mt-1 w-full min-h-20 rounded-lg border border-border px-3 py-2 font-mono text-sm"
                value={mediaRaw}
                onChange={(e) => setMediaRaw(e.target.value)}
                disabled={saving}
                placeholder="documents, hero"
              />
            </div>
          </ControlAdvancedDetails>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void onSave()} disabled={saving || loading}>
              {saving ? "جارٍ الحفظ…" : editingUid ? "حفظ التعديل" : "حفظ وربط المستخدم"}
            </Button>
          </div>
        </div>
      </ControlFormSection>

      <ControlFormSection
        title="الأشخاص المسموح لهم بالدخول"
        description="القائمة التالية تعرض من يمكنه استخدام لوحة التحكم حاليًا، وما نوع الوصول المسموح له."
      >
        {loading ? (
          <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            لا يوجد أي شخص مضاف هنا بعد. أضف أول شخص من النموذج السابق.
          </p>
        ) : (
          <ul className="divide-y divide-border/70">
            {list.map((r) => {
              const parsed = parseDoc(r.doc);
              const sum = parsed ? formatControlAccessSummary(parsed) : null;
              return (
                <li key={r.uid} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-stretch sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-1" dir="auto">
                    <div className="font-medium" dir="ltr">
                      {r.email ?? "— بلا بريد —"}
                    </div>
                    {sum ? (
                      <>
                        <p className="pt-1 text-sm font-medium text-foreground">
                          {sum.typeLine}
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">{sum.detailLine}</p>
                      </>
                    ) : (
                      <p className="text-sm text-amber-800">تعذر قراءة بيانات القيد (صيغة قديمة؟)</p>
                    )}
                    <details className="pt-1">
                      <summary className="cursor-pointer text-xs text-slate-500">
                        عرض التفاصيل الداخلية
                      </summary>
                      <div className="pt-2 font-mono text-xs text-muted-foreground" dir="ltr">
                        {r.uid}
                      </div>
                    </details>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:w-40">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => loadRowForEdit(r)}
                      disabled={saving}
                    >
                      تعديل
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="text-destructive hover:text-destructive"
                      size="sm"
                      onClick={() => void onDeleteRow(r.uid)}
                      disabled={saving}
                    >
                      حذف القيد
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </ControlFormSection>
    </div>
  );
}
