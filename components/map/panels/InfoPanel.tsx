"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Right sidebar container for information panels.
 * Collapsible with smooth transition.
 */

interface InfoPanelProps {
  children: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  title?: string;
}

export default function InfoPanel({
  children,
  collapsed,
  onToggle,
  title = "Info",
}: InfoPanelProps) {
  return (
    <div className="relative flex">
      {/* Toggle button - rendered outside overflow container */}
      <button
        onClick={onToggle}
        className="absolute -left-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-card-border bg-card-bg shadow-sm hover:bg-green-50 transition-colors"
        aria-label={collapsed ? "Expand info" : "Collapse info"}
      >
        {collapsed ? (
          <ChevronLeft className="h-3.5 w-3.5 text-green-700" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-green-700" />
        )}
      </button>

      {/* Sidebar content */}
      <div
        className={`
          flex flex-col bg-card-bg border-l border-card-border
          transition-all duration-300 ease-in-out overflow-hidden
          ${collapsed ? "w-0 min-w-0 border-l-0" : "w-80 min-w-[20rem]"}
        `}
      >
        {!collapsed && (
          <div className="flex flex-col h-full overflow-y-auto animate-fade-in">
            <div className="px-4 py-3 border-b border-card-border">
              <h2 className="font-heading text-sm font-bold text-green-900">
                {title}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
