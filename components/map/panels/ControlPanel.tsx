"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Left sidebar container for map controls.
 * Collapsible with smooth transition.
 */

interface ControlPanelProps {
  children: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  title?: string;
}

export default function ControlPanel({
  children,
  collapsed,
  onToggle,
  title = "Controls",
}: ControlPanelProps) {
  return (
    <div className="relative flex">
      {/* Sidebar content */}
      <div
        className={`
          flex flex-col bg-[rgba(25,29,22,0.92)] backdrop-blur-md border-r border-[rgba(240,233,217,0.14)]
          transition-all duration-300 ease-in-out overflow-hidden
          ${collapsed ? "w-0 min-w-0 border-r-0" : "w-72 min-w-[18rem]"}
        `}
      >
        {!collapsed && (
          <div className="flex flex-col h-full overflow-y-auto animate-fade-in">
            <div className="px-4 py-3 border-b border-[rgba(240,233,217,0.14)]">
              <h2 className="font-heading text-sm font-bold text-night-text">
                {title}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {children}
            </div>
          </div>
        )}
      </div>

      {/* Toggle button - rendered outside overflow container */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(240,233,217,0.14)] bg-[rgba(25,29,22,0.92)] backdrop-blur-md shadow-sm hover:bg-[rgba(240,233,217,0.10)] transition-colors"
        aria-label={collapsed ? "Expand controls" : "Collapse controls"}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-accent-400" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 text-accent-400" />
        )}
      </button>
    </div>
  );
}
