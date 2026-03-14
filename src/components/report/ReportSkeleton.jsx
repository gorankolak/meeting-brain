function SkeletonLine({ className = "" }) {
  return <div className={`h-4 rounded-md bg-surface-200 animate-pulse ${className}`} />;
}

function SkeletonCard({ children, className = "" }) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
      {children}
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="space-y-5">
      <SkeletonCard className="space-y-3">
        <SkeletonLine className="w-28" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-11/12" />
        <SkeletonLine className="w-3/4" />
      </SkeletonCard>

      <div className="grid gap-5 xl:grid-cols-2">
        <SkeletonCard className="space-y-3">
          <SkeletonLine className="w-32" />
          <div className="space-y-3">
            <div className="rounded-lg bg-surface-100 p-3">
              <SkeletonLine className="w-5/6" />
              <SkeletonLine className="mt-3 w-full" />
              <SkeletonLine className="mt-2 w-2/3" />
            </div>
            <div className="rounded-lg bg-surface-100 p-3">
              <SkeletonLine className="w-4/5" />
              <SkeletonLine className="mt-3 w-full" />
              <SkeletonLine className="mt-2 w-1/2" />
            </div>
          </div>
        </SkeletonCard>

        <SkeletonCard className="space-y-3">
          <SkeletonLine className="w-36" />
          <div className="space-y-3">
            <div className="rounded-lg bg-surface-100 p-3">
              <SkeletonLine className="w-full" />
              <SkeletonLine className="mt-3 w-2/3" />
            </div>
            <div className="rounded-lg bg-surface-100 p-3">
              <SkeletonLine className="w-5/6" />
              <SkeletonLine className="mt-3 w-1/2" />
            </div>
          </div>
        </SkeletonCard>
      </div>

      <SkeletonCard className="space-y-3">
        <SkeletonLine className="w-32" />
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-lg bg-surface-100 p-4">
              <SkeletonLine className="w-11/12" />
              <SkeletonLine className="mt-3 w-3/4" />
              <div className="mt-4 grid grid-cols-3 gap-3">
                <SkeletonLine className="w-full" />
                <SkeletonLine className="w-full" />
                <SkeletonLine className="w-full" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonCard>

      <SkeletonCard className="space-y-3">
        <SkeletonLine className="w-24" />
        <div className="space-y-3">
          <div className="rounded-lg bg-surface-100 p-3">
            <SkeletonLine className="w-5/6" />
            <SkeletonLine className="mt-3 w-full" />
          </div>
          <div className="rounded-lg bg-surface-100 p-3">
            <SkeletonLine className="w-4/5" />
            <SkeletonLine className="mt-3 w-2/3" />
          </div>
        </div>
      </SkeletonCard>
    </div>
  );
}
