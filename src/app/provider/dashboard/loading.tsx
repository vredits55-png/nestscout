export default function ProviderDashboardLoading() {
  return (
    <div className="min-h-screen bg-transparent animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white/40 backdrop-blur-md border-b border-outline-variant/20 pt-28 pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="h-9 w-40 bg-surface-container rounded-lg mb-2" />
              <div className="h-5 w-56 bg-surface-container-low rounded-md" />
            </div>
            <div className="h-11 w-36 bg-surface-container rounded-xl shrink-0" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass border border-outline-variant/20 rounded-2xl p-6 shadow-ambient"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center" />
                {i === 2 && <div className="h-6 w-14 bg-primary/10 rounded-md" />}
              </div>
              <div className="h-10 w-20 bg-surface-container rounded-lg mb-2" />
              <div className="h-4 w-28 bg-surface-container-low rounded-md" />
            </div>
          ))}
        </div>

        {/* Properties List Skeleton */}
        <div className="mb-12">
          <div className="h-8 w-48 bg-surface-container rounded-lg mb-6" />
          
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="glass border border-outline-variant/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-5"
              >
                {/* Thumbnail Skeleton */}
                <div className="w-full sm:w-32 h-24 rounded-lg bg-surface-container-low shrink-0" />

                {/* Info Skeleton */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-1/3 bg-surface-container rounded-md" />
                    <div className="h-5 w-14 bg-primary/10 rounded-md" />
                  </div>
                  <div className="h-4 w-1/4 bg-surface-container-low rounded-md" />
                  <div className="flex items-center gap-4">
                    <div className="h-5 w-20 bg-surface-container rounded-md" />
                    <div className="h-4 w-32 bg-surface-container-low rounded-md" />
                  </div>
                </div>

                {/* Actions Skeleton */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-9 h-9 bg-surface-container-low rounded-md" />
                  <div className="w-9 h-9 bg-surface-container-low rounded-md" />
                  <div className="w-9 h-9 bg-surface-container-low rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-44 bg-surface-container rounded-lg" />
            <div className="h-4 w-32 bg-surface-container-low rounded-md" />
          </div>

          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="glass border border-outline-variant/20 rounded-2xl p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-low shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2.5 pt-1">
                    <div className="h-4 w-36 bg-surface-container rounded-md" />
                    <div className="h-3 w-48 bg-surface-container-low rounded-md" />
                    <div className="space-y-2 pt-1">
                      <div className="h-4 w-5/6 bg-surface-container-low rounded-md" />
                      <div className="h-4 w-2/3 bg-surface-container-low rounded-md" />
                    </div>
                  </div>
                  <div className="h-3.5 w-16 bg-surface-container-low rounded-md shrink-0 pt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
