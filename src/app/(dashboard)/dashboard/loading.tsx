"use client";

import PageHeader from "@/components/ui/PageHeader";

export default function DashboardLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Memuat data..."
      />

      {/* Filter Bar Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end animate-pulse">
          <div className="flex-1 w-full space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
          </div>
          <div className="flex-1 w-full space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
          </div>
          <div className="flex-1 w-full space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
          </div>
          <div className="w-full md:w-32 h-10 bg-blue-100 rounded-lg"></div>
        </div>
      </div>

      {/* Stats Grid Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-6 bg-slate-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
