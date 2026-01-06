"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";

const featureList = [
  {
    title: "Virtual Queues",
    description: "Let users join lines remotely and skip the physical crowd.",
  },
  {
    title: "Live Kiosk Displays",
    description: "Show queue status publicly so everyone stays informed.",
  },
  {
    title: "Estimated Wait Times",
    description: "Smart calculations keep expectations clear and accurate.",
  },
  {
    title: "Operator Dashboards",
    description: "Manage flow, call next, and resolve issues quickly.",
  },
  {
    title: "Admin Analytics",
    description: "Track demand patterns and optimize staffing decisions.",
  },
];

const audienceList = [
  {
    title: "Students & Visitors",
    description:
      "Join queues from anywhere and get notified at the right time.",
  },
  {
    title: "Operators",
    description: "Serve faster with live controls and queue visibility.",
  },
  {
    title: "Admins",
    description: "Monitor performance and improve services with data.",
  },
];

const steps = ["Join Queue", "Track Progress", "Get Notified", "Get Served"];

export default function LandingPage() {
  const { isAuthenticated, logout } = useAuth();
  const primaryCta = isAuthenticated ? "/dashboard/user" : "/login";
  const secondaryCta = isAuthenticated ? "/dashboard/user" : "/signup";
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 scroll-smooth">
      <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur animate-in fade-in slide-in-from-top duration-700 relative">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between relative z-30">
            <Link href="/landing" className="flex items-center gap-3 group">
              <img
                src="/logo/LOGO.svg"
                alt="CampusOR logo"
                className="h-11 w-auto object-contain drop-shadow-[0_4px_12px_rgba(15,23,42,0.18)] transition-transform duration-300 group-hover:scale-[1.03] md:h-14"
              />
            </Link>

            <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
              <a
                href="#solution"
                className="transition-all duration-300 hover:text-slate-900 hover:scale-105"
              >
                Solution
              </a>
              <a
                href="#how"
                className="transition-all duration-300 hover:text-slate-900 hover:scale-105"
              >
                How It Works
              </a>
              <a
                href="#features"
                className="transition-all duration-300 hover:text-slate-900 hover:scale-105"
              >
                Features
              </a>
            </div>

            <div className="hidden items-center gap-3 text-sm font-medium md:flex">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={logout}
                    className="text-slate-500 transition-all duration-300 hover:text-slate-900 hover:scale-105"
                  >
                    Logout
                  </button>
                  <Link
                    href="/dashboard/user"
                    className="rounded-full bg-slate-900 px-4 py-2 text-white transition-all duration-300 hover:bg-slate-800 hover:scale-105 hover:shadow-lg"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-slate-500 transition-all duration-300 hover:text-slate-900 hover:scale-105"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-full bg-slate-900 px-4 py-2 text-white transition-all duration-300 hover:bg-slate-800 hover:scale-105 hover:shadow-lg"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-white/90 p-2.5 text-slate-700 shadow-sm ring-1 ring-slate-200/80 transition-all duration-200 hover:bg-slate-50 active:scale-95 md:hidden"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                {isMenuOpen ? (
                  <>
                    <path strokeLinecap="round" d="M6 6l12 12" />
                    <path strokeLinecap="round" d="M18 6l-12 12" />
                  </>
                ) : (
                  <>
                    <path strokeLinecap="round" d="M4 7h16" />
                    <path strokeLinecap="round" d="M4 12h16" />
                    <path strokeLinecap="round" d="M4 17h16" />
                  </>
                )}
              </svg>
            </button>

            <div
              id="mobile-nav"
              className={`absolute inset-x-0 top-full mt-3 origin-top md:hidden z-30 transition-all duration-200 ease-out ${
                isMenuOpen
                  ? "opacity-100 translate-y-0 scale-100"
                  : "pointer-events-none opacity-0 -translate-y-2 scale-[0.98]"
              }`}
            >
              <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-xl ring-1 ring-slate-900/5 backdrop-blur">
                <div className="grid gap-1 text-sm font-medium text-slate-700">
                  {[
                    { href: "#solution", label: "Solution" },
                    { href: "#how", label: "How It Works" },
                    { href: "#features", label: "Features" },
                  ].map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 hover:bg-slate-50 active:scale-[0.99]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>{item.label}</span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  ))}
                </div>

                <div className="my-3 h-px bg-slate-200/70" />

                <div className="grid gap-2 text-sm font-semibold">
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/dashboard/user"
                        className="rounded-xl bg-slate-900 px-4 py-3 text-center text-white transition-all duration-200 hover:bg-slate-800 active:scale-[0.99]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          logout();
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition-all duration-200 hover:bg-slate-50 active:scale-[0.99]"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/signup"
                        className="rounded-xl bg-slate-900 px-4 py-3 text-center text-white transition-all duration-200 hover:bg-slate-800 active:scale-[0.99]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                      <Link
                        href="/login"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-slate-700 transition-all duration-200 hover:bg-slate-50 active:scale-[0.99]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div
            className="fixed inset-0 z-20 bg-slate-900/20 backdrop-blur-sm md:hidden"
            aria-hidden="true"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-sky-200/70 blur-3xl animate-pulse" />
          <div
            className="absolute -right-16 top-32 h-80 w-80 rounded-full bg-teal-200/70 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>
        <div
          className={`relative mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.2fr_0.8fr] md:items-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 animate-in fade-in slide-in-from-left duration-700">
              Campus Queueing, Reimagined
            </div>
            <h1
              className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl animate-in fade-in slide-in-from-left duration-700"
              style={{ animationDelay: "0.1s" }}
            >
              Modern virtual queues for every campus service point.
            </h1>
            <p
              className="max-w-xl text-base text-slate-600 md:text-lg animate-in fade-in slide-in-from-left duration-700"
              style={{ animationDelay: "0.2s" }}
            >
              CampusOR replaces physical lines with a live, mobile-first queue
              experience. Keep students moving, reduce crowding, and make every
              service interaction smoother.
            </p>
            <div
              className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-left duration-700"
              style={{ animationDelay: "0.3s" }}
            >
              <Link
                href={primaryCta}
                className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-sky-700 hover:scale-105 hover:shadow-xl"
              >
                Explore Queues
              </Link>
              <Link
                href={secondaryCta}
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-all duration-300 hover:border-slate-300 hover:bg-slate-100 hover:scale-105 hover:shadow-lg"
              >
                {isAuthenticated ? "Get Started" : "Join CampusOR"}
              </Link>
            </div>
            <div
              className="grid gap-4 sm:grid-cols-3 animate-in fade-in slide-in-from-left duration-700"
              style={{ animationDelay: "0.4s" }}
            >
              {[
                { label: "Live updates", value: "Real-time" },
                { label: "Queue formats", value: "Flexible" },
                { label: "Notifications", value: "Instant" },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {item.label}
                  </p>
                  <p className="text-base font-semibold text-slate-800">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div
            className="relative animate-in fade-in slide-in-from-right duration-700"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <img
                  src="/logo/LOGO-removebg-preview.png"
                  alt="CampusOR"
                  className="h-10 w-auto object-contain"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    CampusOR Live Queue
                  </p>
                  <p className="text-xs text-slate-500">
                    Powered by smart campus operations
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {[
                  {
                    title: "Student Services",
                    wait: "12 min",
                    status: "Queue moving smoothly",
                  },
                  {
                    title: "Health Center",
                    wait: "8 min",
                    status: "Next call in 2 min",
                  },
                  {
                    title: "Cafeteria Pickup",
                    wait: "4 min",
                    status: "Ready for pickup",
                  },
                ].map((queue, index) => (
                  <div
                    key={queue.title}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-x-1"
                    style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                      <span>{queue.title}</span>
                      <span className="text-sky-600">{queue.wait}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {queue.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="absolute -bottom-6 -right-6 hidden rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500 shadow-lg md:block transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-in fade-in slide-in-from-bottom"
              style={{ animationDelay: "1s" }}
            >
              <p className="font-semibold text-slate-800">Queue Insights</p>
              <p>Peak hours predicted ahead of time.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="solution" className="relative bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-14 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              The Problem
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">
              Physical queues waste time and create friction.
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Campuses deal with crowding, confusion, and inefficiency every
              day. Traditional queues simply don’t scale.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                title: "Crowded spaces",
                desc: "Students wait together in tight areas.",
              },
              {
                title: "No visibility",
                desc: "Wait times are unclear or inaccurate.",
              },
              {
                title: "Lost turns",
                desc: "Stepping away means missing your spot.",
              },
              {
                title: "Staff overload",
                desc: "Operators manage chaos manually.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-6"
              >
                <p className="font-semibold text-slate-800">{item.title}</p>
                <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="my-16 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div className="animate-in fade-in slide-in-from-left duration-700">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">
                The Solution
              </p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-900">
                A live, virtual queue built for campuses.
              </h3>
              <p className="mt-4 text-base text-slate-600">
                CampusOR replaces physical lines with real-time visibility,
                notifications, and operator controls — all in one system.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 to-teal-50 p-6 animate-in fade-in slide-in-from-right duration-700 transition-all hover:shadow-xl hover:scale-105">
              <ul className="space-y-4 text-sm text-slate-700">
                {[
                  "Join queues remotely",
                  "Track position in real time",
                  "Get notified before your turn",
                  "Reduce on-site congestion",
                ].map((item, index) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 animate-in fade-in slide-in-from-right"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animationDuration: "500ms",
                    }}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-600 text-xs">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-in fade-in  duration-700">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Key Features
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">
              Built for campus-scale reliability.
            </h2>
          </div>
          <p className="max-w-md text-base text-slate-600">
            Everything you need to run efficient, transparent queues for
            multiple departments in one platform.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureList.map((feature, index) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-sky-300 animate-in fade-in zoom-in"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationDuration: "600ms",
              }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-teal-200">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-900 transition-colors group-hover:text-sky-700">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="relative bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              How CampusOR Works
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">
              A simple flow from join to serve.
            </h2>
            <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto">
              Students and staff can follow the entire journey in just a few
              taps, with constant clarity at every stage.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="group rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-sky-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-teal-600 text-lg font-bold text-white shadow-md transition-all duration-300 group-hover:scale-110">
                  {index + 1}
                </div>
                <p className="mt-5 text-lg font-semibold text-slate-900 transition-colors group-hover:text-sky-700">
                  {step}
                </p>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  {step === "Join Queue" &&
                    "Scan or tap to enter a queue without waiting in line."}
                  {step === "Track Progress" &&
                    "Watch your position update in real time."}
                  {step === "Get Notified" &&
                    "Receive alerts when it is almost your turn."}
                  {step === "Get Served" &&
                    "Arrive at the right moment and get served quickly."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="audience" className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            Who Is It For?
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">
            Built for everyone on campus.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {audienceList.map((audience, index) => (
            <div
              key={audience.title}
              className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/30 px-6 py-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-sky-300"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationDuration: "600ms",
              }}
            >
              <h3 className="text-xl font-bold text-slate-900">
                {audience.title}
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-sky-50 px-8 py-12 shadow-lg md:flex md:items-center md:justify-between transition-all duration-500 hover:shadow-2xl  duration-700">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Ready to modernize your queue experience?
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Launch CampusOR across services and make every visit faster and
              calmer.
            </p>
          </div>
          <Link
            href={primaryCta}
            className="mt-6 inline-flex rounded-full bg-gradient-to-r from-sky-600 to-teal-600 px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:to-teal-700 hover:shadow-sky-500/50 md:mt-0"
          >
            Enter the App →
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 group">
            <img
              src="/logo/LOGO.png"
              alt="CampusOR"
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <div>
              <p className="text-sm font-semibold text-white">CampusOR</p>
              <p className="text-xs text-slate-500">
                Open-source virtual queueing for modern campuses.
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} CampusOR. Open-source and community
            driven.
          </p>
        </div>
      </footer>
    </main>
  );
}
