import { Suspense } from "react";
import { ControlPanel } from "@/features/control/components/ControlPanel";
import { Skeleton } from "@/components/ui/skeleton";

function ControlPanelFallback() {
  return (
    <div
      className="flex w-full min-h-0 min-h-dvh flex-1 flex-col md:flex-row"
      aria-busy
    >
      <div className="h-12 shrink-0 border-b border-slate-200/90 bg-white md:h-auto md:w-60 md:min-h-dvh md:shrink-0 md:self-stretch md:border-b-0 md:border-s md:border-slate-200/90" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f6f9fc]">
        <div className="shrink-0 border-b border-slate-200/90 bg-white px-4 py-3 sm:px-5 sm:py-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-4 w-full max-w-md" />
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4 md:p-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function ControlPage() {
  return (
    <div className="flex w-full min-h-0 min-h-dvh flex-1 flex-col">
      <Suspense fallback={<ControlPanelFallback />}>
        <ControlPanel />
      </Suspense>
    </div>
  );
}
