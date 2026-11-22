"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { Wordmark } from "./Wordmark";

type NavItem = { href: string; label: string; icon: IconName };

const TABS: NavItem[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/workout", label: "Workout", icon: "workout" },
  { href: "/history", label: "History", icon: "history" },
  { href: "/templates", label: "Templates", icon: "templates" },
];

const TOP_BAR: NavItem[] = [...TABS, { href: "/about", label: "About", icon: "info" }];

function isActive(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/* ---------- Phone: bottom tabs ---------- */

/** Small orange dot shown on the Workout tab while a workout is running. */
function RunningDot({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`absolute size-2 rounded-full bg-orange ${className}`} />;
}

function useWorkoutRunning(): boolean {
  return useStore().data.activeWorkout !== null;
}

function BottomTabLinks({ pathname }: { pathname: string | null }) {
  const running = useWorkoutRunning();
  return (
    <ul className="mx-auto grid max-w-[640px] grid-cols-4">
      {TABS.map((tab) => {
        const active = isActive(tab.href, pathname);
        return (
          <li key={tab.href}>
            <Link
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 pt-2 pb-1.5 text-xs font-medium ${
                active ? "text-ink" : "text-muted"
              }`}
            >
              <span className="relative">
                <Icon name={tab.icon} size={22} />
                {running && tab.href === "/workout" && <RunningDot className="-top-0.5 -right-1" />}
              </span>
              <span>{tab.label}</span>
              {running && tab.href === "/workout" && <span className="sr-only">(in progress)</span>}
              <span
                aria-hidden
                className={`h-0.5 w-5 rounded-full ${active ? "bg-ink" : "bg-transparent"}`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveBottomTabs() {
  const pathname = usePathname();
  return (
    <>
      <ResumeBar pathname={pathname} />
      <BottomTabLinks pathname={pathname} />
    </>
  );
}

/* ---------- Laptop: top bar links ---------- */

function TopBarLinks({ pathname }: { pathname: string | null }) {
  const running = useWorkoutRunning();
  return (
    <ul className="flex items-stretch gap-6">
      {TOP_BAR.map((item) => {
        const active = isActive(item.href, pathname);
        return (
          <li key={item.href} className="flex">
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-11 items-center text-sm font-medium ${
                active ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {item.label}
              {running && item.href === "/workout" && (
                <>
                  <RunningDot className="top-2.5 -right-2.5" />
                  <span className="sr-only">(in progress)</span>
                </>
              )}
              <span
                aria-hidden
                className={`absolute inset-x-0 bottom-1 h-0.5 rounded-full ${
                  active ? "bg-ink" : "bg-transparent"
                }`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveTopBarLinks() {
  return <TopBarLinks pathname={usePathname()} />;
}

/* ---------- Resume bar ---------- */

/** "Workout in progress · Resume" while a workout runs and the user is elsewhere. */
function ResumeBar({ pathname, className = "" }: { pathname: string | null; className?: string }) {
  const running = useWorkoutRunning();
  if (!running || pathname === null || isActive("/workout", pathname)) return null;
  return (
    <div className={`border-b border-rule bg-surface/95 ${className}`}>
      <Link
        href="/workout"
        className="mx-auto flex min-h-11 max-w-[640px] items-center justify-between gap-3 px-5 text-sm font-medium md:px-8"
      >
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-2 rounded-full bg-orange" />
          Workout in progress
        </span>
        <span className="flex items-center gap-1">
          Resume
          <Icon name="arrow-right" size={16} />
        </span>
      </Link>
    </div>
  );
}

function LaptopResumeBar() {
  return (
    <ResumeBar
      pathname={usePathname()}
      className="fixed inset-x-0 bottom-0 z-20 hidden border-t border-b-0 backdrop-blur-md md:block"
    />
  );
}

/* ---------- Storage problems ---------- */

function StorageBanner() {
  const { storageError, resetData, dismissStorageError } = useStore();
  if (!storageError) return null;

  const messages = {
    corrupt: {
      title: "We couldn't read your saved data.",
      helper:
        "It may have been damaged. Nothing will be saved until you start fresh, which clears it.",
    },
    full: {
      title: "Your browser's storage is full.",
      helper: "Your latest change wasn't saved. Free up space in this browser and try again.",
    },
    unavailable: {
      title: "This browser isn't letting Repbook save.",
      helper:
        "Private browsing or blocked site data can do this. Changes will be lost when you close the tab.",
    },
  } as const;
  const { title, helper } = messages[storageError];

  return (
    <div role="alert" className="mb-6 border-y border-rule py-4">
      <p className="flex items-center gap-2 font-bold">
        <Icon name="asterisk" size={18} className="shrink-0 text-red" />
        {title}
      </p>
      <p className="mt-1 text-sm text-muted">{helper}</p>
      <div className="mt-3">
        {storageError === "corrupt" ? (
          <Button variant="secondary" onClick={resetData}>
            Start fresh
          </Button>
        ) : (
          <Button variant="secondary" onClick={dismissStorageError}>
            OK
          </Button>
        )}
      </div>
    </div>
  );
}

/* ---------- Shell ---------- */

export function AppShell({ children }: { children: ReactNode }) {
  const { ready } = useStore();
  const running = useWorkoutRunning();

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      {/* Phone header */}
      <header className="sticky top-0 z-20 border-b border-rule bg-bg/85 backdrop-blur-md md:hidden">
        <div className="mx-auto flex h-14 max-w-[640px] items-center justify-between px-5">
          <Link href="/" aria-label="Repbook home">
            <Wordmark />
          </Link>
          <Link
            href="/about"
            aria-label="About Repbook"
            className="-mr-2 flex size-11 items-center justify-center text-ink"
          >
            <Icon name="info" size={24} />
          </Link>
        </div>
      </header>

      {/* Laptop top bar */}
      <header className="sticky top-0 z-20 hidden border-b border-rule bg-bg/85 backdrop-blur-md md:block">
        <nav
          aria-label="Main"
          className="mx-auto flex h-16 max-w-[960px] items-center justify-between px-8"
        >
          <Link href="/" aria-label="Repbook home">
            <Wordmark />
          </Link>
          <Suspense fallback={<TopBarLinks pathname={null} />}>
            <ActiveTopBarLinks />
          </Suspense>
        </nav>
      </header>

      <main className={`relative isolate mx-auto w-full max-w-[640px] flex-1 px-5 pt-8 md:px-8 md:pt-14 ${
          running ? "pb-40 md:pb-28" : "pb-28 md:pb-20"
        }`}>
        <StorageBanner />
        {/* Pages always render (Next validates every segment renders), but
            stay hidden until browser storage has been read to avoid a flash
            of empty content. */}
        {!ready && (
          <p className="pt-6 text-muted" aria-live="polite">
            Loading…
          </p>
        )}
        <div hidden={!ready}>{children}</div>
      </main>

      {/* Laptop resume bar */}
      <Suspense fallback={null}>
        <LaptopResumeBar />
      </Suspense>

      {/* Phone bottom tabs (with the resume bar above them) */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-rule bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <Suspense fallback={<BottomTabLinks pathname={null} />}>
          <ActiveBottomTabs />
        </Suspense>
      </nav>
    </div>
  );
}
