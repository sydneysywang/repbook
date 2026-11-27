"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { LeaveGuardProvider, useLeave, useLeaveLinkClick } from "./LeaveGuard";
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

/** Small orange dot shown on the Workout tab while a workout is running. */
function RunningDot({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`absolute size-2 rounded-full bg-orange ${className}`} />;
}

function useWorkoutRunning(): boolean {
  return useStore().data.activeWorkout !== null;
}

/* ---------- Back ---------- */

/** The main tab pages; every other address gets a "Back" button above its title. */
function isTabRoot(pathname: string): boolean {
  return TABS.some((tab) => tab.href === pathname);
}

/** The tab a page belongs to, e.g. /history/abc → /history; /about → Home. */
function sectionTab(pathname: string): string {
  const tab = TABS.find((t) => t.href !== "/" && isActive(t.href, pathname));
  return tab?.href ?? "/";
}

/**
 * "Back" always returns to the main tab the user last came from, however many
 * pages (or in-place edits) they went through since, e.g. Home → a past
 * workout → Back = Home, but History → a past workout → Back = History.
 * It never uses browser history, so it can't loop or leave Repbook.
 * Kept in sessionStorage so a refresh remembers it; a page opened directly
 * falls back to its own section's tab.
 */
const ORIGIN_KEY = "repbook:back-to";
let lastPathname: string | null = null;

function readOrigin(): string | null {
  try {
    return sessionStorage.getItem(ORIGIN_KEY);
  } catch {
    return null;
  }
}

function useTrackOriginTab(pathname: string) {
  useEffect(() => {
    if (lastPathname !== null && lastPathname !== pathname && isTabRoot(lastPathname)) {
      try {
        sessionStorage.setItem(ORIGIN_KEY, lastPathname);
      } catch {
        // Storage blocked: Back falls back to the section's tab.
      }
    }
    lastPathname = pathname;
  }, [pathname]);
}

function backTarget(pathname: string): string {
  const origin = readOrigin();
  if (origin && origin !== pathname && isTabRoot(origin)) return origin;
  const section = sectionTab(pathname);
  return section === pathname ? "/" : section; // e.g. a running /workout → Home
}

function BackButton() {
  const pathname = usePathname();
  const running = useWorkoutRunning();
  const leave = useLeave();
  useTrackOriginTab(pathname);
  // A running workout is a page you were sent to (from Home, a template or the
  // start screen), so it gets "Back" even though /workout is a tab. Going back
  // leaves the workout running; the resume bar brings you back to it.
  const onRunningWorkout = running && pathname === "/workout";
  if (isTabRoot(pathname) && !onRunningWorkout) return null;

  return (
    <button
      type="button"
      onClick={() => leave(backTarget(pathname))}
      className="relative z-10 mb-4 inline-flex min-h-11 items-center gap-2 rounded-[4px] border border-rule px-3 text-sm font-medium text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <Icon name="arrow-left" size={18} />
      Back
    </button>
  );
}

/* ---------- Phone: floating tab dock ---------- */

function BottomTabLinks({ pathname }: { pathname: string | null }) {
  const running = useWorkoutRunning();
  const onLinkClick = useLeaveLinkClick();
  return (
    <ul className="grid grid-cols-4">
      {TABS.map((tab) => {
        const active = isActive(tab.href, pathname);
        return (
          <li key={tab.href}>
            <Link
              href={tab.href}
              onClick={(e) => onLinkClick(e, tab.href)}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-16 flex-col items-center justify-center gap-1 overflow-hidden text-xs font-medium focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-on-nav ${
                active ? "text-on-nav" : "text-on-nav/65 hover:text-on-nav"
              }`}
            >
              {active && (
                <>
                  <span aria-hidden className="nav-glow-bloom absolute inset-0" />
                  <span aria-hidden className="nav-glow-strip absolute inset-x-3 top-0 h-[3px]" />
                </>
              )}
              <span className="relative">
                <Icon name={tab.icon} size={22} strokeWidth={active ? 2 : 1.6} />
                {running && tab.href === "/workout" && <RunningDot className="-top-0.5 -right-1" />}
              </span>
              <span className={`relative ${active ? "font-bold" : ""}`}>{tab.label}</span>
              {running && tab.href === "/workout" && <span className="sr-only">(in progress)</span>}
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
  const onLinkClick = useLeaveLinkClick();
  return (
    <ul className="nav-dock flex items-stretch gap-1 rounded-[4px] bg-nav p-1">
      {TOP_BAR.map((item) => {
        const active = isActive(item.href, pathname);
        return (
          <li key={item.href} className="flex">
            <Link
              href={item.href}
              onClick={(e) => onLinkClick(e, item.href)}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-10 items-center gap-2 overflow-hidden rounded-[2px] px-3.5 text-sm font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-on-nav ${
                active ? "text-on-nav" : "text-on-nav/65 hover:text-on-nav"
              }`}
            >
              {active && (
                <>
                  <span aria-hidden className="nav-glow-bloom absolute inset-0" />
                  <span aria-hidden className="nav-glow-strip absolute inset-x-2 bottom-0 h-[3px]" />
                </>
              )}
              <Icon name={item.icon} size={18} strokeWidth={active ? 2 : 1.6} className="relative" />
              <span className={`relative ${active ? "font-bold" : ""}`}>{item.label}</span>
              {running && item.href === "/workout" && (
                <>
                  <RunningDot className="top-2 right-1.5" />
                  <span className="sr-only">(in progress)</span>
                </>
              )}
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
  const onLinkClick = useLeaveLinkClick();
  if (!running || pathname === null || isActive("/workout", pathname)) return null;
  return (
    <div className={`border-b border-on-nav/15 ${className}`}>
      <Link
        href="/workout"
        onClick={(e) => onLinkClick(e, "/workout")}
        className="flex min-h-11 items-center justify-between gap-3 px-4 text-sm font-medium text-on-nav focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-on-nav"
      >
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-2 animate-pulse rounded-full bg-orange motion-reduce:animate-none" />
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
  const pathname = usePathname();
  const running = useWorkoutRunning();
  if (!running || isActive("/workout", pathname)) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 hidden px-8 md:block">
      <div className="nav-dock pointer-events-auto mx-auto max-w-[640px] rounded-[4px] bg-nav">
        <ResumeBar pathname={pathname} className="border-b-0" />
      </div>
    </div>
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
  return (
    <LeaveGuardProvider>
      <Shell>{children}</Shell>
    </LeaveGuardProvider>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { ready } = useStore();
  const running = useWorkoutRunning();
  const onLinkClick = useLeaveLinkClick();

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      {/* Phone header */}
      <header className="sticky top-0 z-20 border-b border-rule bg-bg/85 backdrop-blur-md md:hidden">
        <div className="mx-auto flex h-14 max-w-[640px] items-center justify-between px-5">
          <Link href="/" aria-label="Repbook home" onClick={(e) => onLinkClick(e, "/")}>
            <Wordmark />
          </Link>
          <Link
            href="/about"
            aria-label="About Repbook"
            onClick={(e) => onLinkClick(e, "/about")}
            className="-mr-2 flex size-11 items-center justify-center text-ink"
          >
            <Icon name="info" size={24} />
          </Link>
        </div>
      </header>

      {/* Laptop top bar */}
      <header className="sticky top-0 z-20 hidden border-b border-rule bg-bg/85 backdrop-blur-md md:block">
        <div className="mx-auto flex h-18 max-w-[960px] items-center gap-4 px-8">
          <Link href="/" aria-label="Repbook home" onClick={(e) => onLinkClick(e, "/")}>
            <Wordmark />
          </Link>
          <nav aria-label="Main" className="ml-auto">
            <Suspense fallback={<TopBarLinks pathname={null} />}>
              <ActiveTopBarLinks />
            </Suspense>
          </nav>
        </div>
      </header>

      <main className={`relative isolate mx-auto w-full max-w-[640px] flex-1 px-5 pt-8 md:px-8 md:pt-14 ${
          running ? "pb-44 md:pb-32" : "pb-32 md:pb-20"
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
        <div hidden={!ready}>
          <Suspense fallback={null}>
            <BackButton />
          </Suspense>
          {children}
        </div>
      </main>

      {/* Laptop resume bar */}
      <Suspense fallback={null}>
        <LaptopResumeBar />
      </Suspense>

      {/* Phone tab dock (with the resume bar on top of it) */}
      <nav
        aria-label="Main"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-20 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      >
        {/* Only the dock itself takes taps; the clear gutters around it don't. */}
        <div className="nav-dock pointer-events-auto mx-auto max-w-[640px] overflow-hidden rounded-[4px] bg-nav">
          <Suspense fallback={<BottomTabLinks pathname={null} />}>
            <ActiveBottomTabs />
          </Suspense>
        </div>
      </nav>
    </div>
  );
}
