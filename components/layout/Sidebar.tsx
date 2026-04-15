"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV = [
  {
    href: "/playground",
    label: "Playground",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="2"
          width="5"
          height="5"
          rx="1.5"
          fill="currentColor"
          opacity=".7"
        />
        <rect x="9" y="2" width="5" height="5" rx="1.5" fill="currentColor" />
        <rect x="2" y="9" width="5" height="5" rx="1.5" fill="currentColor" />
        <rect
          x="9"
          y="9"
          width="5"
          height="5"
          rx="1.5"
          fill="currentColor"
          opacity=".7"
        />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 5v3.5l2 1.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/templates",
    label: "Templates",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="2"
          width="12"
          height="3"
          rx="1"
          fill="currentColor"
          opacity=".9"
        />
        <rect
          x="2"
          y="7"
          width="7"
          height="2"
          rx="1"
          fill="currentColor"
          opacity=".6"
        />
        <rect
          x="2"
          y="11"
          width="10"
          height="2"
          rx="1"
          fill="currentColor"
          opacity=".6"
        />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-bg-base border-r border-line-subtle">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-line-subtle">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glow-sm flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 5h10M3 8h7M3 11h8.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-ink-primary">Prompt</div>
          <div className="text-xs text-ink-muted">Playground</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {NAV.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn("nav-link", isActive && "active")}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* <div className="p-4 border-t border-line-subtle">
        <p className="text-[11px] text-ink-muted leading-relaxed">
          Powered by{' '}
          <a href="https://console.groq.com" target="blank" rel="noopener noreferrer"
             className="text-accent-light hover:underline">
            Groq
          </a>
          {' '}· Free tier
        </p>
      </div> */}
    </aside>
  );
}
