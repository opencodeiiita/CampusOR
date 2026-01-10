"use client";
import { useQueueToasts } from "@/app/services/useToast";
import { useState, useEffect } from "react";
import {
  userDashboardMock,
  userNearTurnMock,
  userServedMock,
  userCancelledMock,
  userNoActiveQueueMock,
  sidebarMockData,
} from "./MockData";
import {
  Clock,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Bell,
  Activity,
  TrendingUp,
  Menu,
  X,
  LayoutDashboard,
  CalendarClock,
  History,
  ListChecks,
  Settings,
  LogOut,
} from "lucide-react";

type MockState = "waiting" | "near" | "served" | "cancelled" | "no-queue";

interface UserDashboardData {
  user: {
    userId: string;
    name: string;
  };
  queue: {
    queueId: string;
    name: string;
    location: string;
    status: string;
  };
  token: {
    tokenNumber: string;
    seq: number;
    status: string;
  };
  liveContext: {
    nowServing: string;
    countersActive: number;
  };
  estimate: {
    estimatedWaitMinutes: number;
    usersAhead: number;
  } | null;
  reassurance: {
    message: string;
  };
  lastUpdated: string;
}

interface NoQueueData {
  user: {
    userId: string;
    name: string;
  };
  activeQueue: null;
  message: string;
  actionHint: string;
}

type DashboardData = UserDashboardData | NoQueueData;

interface UserDashboardProps {
  autoRotate?: boolean; // automatic state changing
}

// helper to check if data has active queue
function hasActiveQueue(data: DashboardData): data is UserDashboardData {
  return "queue" in data && data.queue !== null;
}

export default function UserDashboard({
  autoRotate = true,
}: UserDashboardProps = {}) {
  const [currentState, setCurrentState] = useState<MockState>("waiting");
  const [formattedTime, setFormattedTime] = useState<string>("");
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useQueueToasts(currentState);

  const getMockDataForState = (state: MockState): DashboardData => {
    switch (state) {
      case "waiting":
        return userDashboardMock;
      case "near":
        return userNearTurnMock;
      case "served":
        return userServedMock;
      case "cancelled":
        return userCancelledMock;
      case "no-queue":
        return userNoActiveQueueMock;
      default:
        return userDashboardMock;
    }
  };

  const data = getMockDataForState(currentState);

  useEffect(() => {
    if (!autoRotate) return;

    const states: MockState[] = [
      "waiting",
      "near",
      "served",
      "cancelled",
      "no-queue",
    ];
    let currentStateIndex = 0;

    const interval = setInterval(() => {
      currentStateIndex = (currentStateIndex + 1) % states.length;
      setCurrentState(states[currentStateIndex]);
    }, 8000);

    return () => clearInterval(interval);
  }, [autoRotate]);

  useEffect(() => {
    if (hasActiveQueue(data)) {
      setFormattedTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    }
  }, [data]);

  const handleLeaveQueue = () => {
    setCurrentState("cancelled");
    setTimeout(() => {
      setCurrentState("no-queue");
    }, 3000);
  };

  const handleReschedule = () => {
    setIsRescheduleOpen(true);
    setTimeout(() => {
      setIsRescheduleOpen(false);
      alert("Reschedule requested! (Mock action)");
    }, 1500);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting":
        return "Waiting";
      case "near":
        return "Your Turn Soon!";
      case "served":
        return "Served";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  if (!hasActiveQueue(data)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-3">
            {data.message}
          </h2>
          <p className="text-slate-600 mb-6">{data.actionHint}</p>
          <button className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg">
            Browse Queues
          </button>
        </div>
      </div>
    );
  }

  // Type assertion since we've already checked hasActiveQueue
  const activeData = data as UserDashboardData;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Navigation Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative w-64 h-full bg-white border-r border-slate-200 transition-transform duration-300 z-50`}
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">CampusOR</h2>
              <p className="text-xs text-slate-500">Queue Management</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-sky-50 text-sky-600 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-md">
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-all duration-300 hover:scale-105">
            <CalendarClock className="w-5 h-5" />
            <span>My Queues</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-all duration-300 hover:scale-105">
            <History className="w-5 h-5" />
            <span>History</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-all duration-300 hover:scale-105">
            <ListChecks className="w-5 h-5" />
            <span>Available Queues</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-all duration-300 hover:scale-105">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </button>
        </nav>

        {/* User Profile at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-300 hover:scale-105">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-300 hover:scale-105">
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
          <div className="mt-4 flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center text-white font-semibold">
              {activeData.user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {activeData.user.name}
              </p>
              <p className="text-xs text-slate-500">
                {sidebarMockData.userProfile.studentId}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile menu toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg border border-slate-200"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900">
                Overview
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-300 hover:scale-105">
                <Search className="w-5 h-5 text-slate-600" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="text-sm text-slate-500">{formattedTime}</div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 lg:mb-12">
            {/* Token Number Card */}
            <div
              className={`rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 animate-in fade-in zoom-in relative overflow-hidden ${
                currentState === "near"
                  ? "bg-orange-50 border-orange-300"
                  : currentState === "served"
                  ? "bg-green-50 border-green-300"
                  : currentState === "cancelled"
                  ? "bg-red-50 border-red-300"
                  : "bg-sky-50 border-sky-300"
              }`}
            >
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-3">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                  }}
                ></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
                    Your Token
                  </p>
                  <div className="p-2 rounded-lg bg-white/50 backdrop-blur-sm">
                    <Activity className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
                    {activeData.token.tokenNumber}
                  </h3>
                </div>
                <div className="mt-6 sm:mt-8 flex items-center gap-2">
                  <span
                    className={`text-sm sm:text-base font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md ${
                      activeData.token.status === "near"
                        ? "bg-orange-500 text-white"
                        : activeData.token.status === "served"
                        ? "bg-green-500 text-white"
                        : activeData.token.status === "cancelled"
                        ? "bg-red-500 text-white"
                        : "bg-sky-500 text-white"
                    }`}
                  >
                    {getStatusText(activeData.token.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Now Serving Card */}
            <div
              className={`rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 animate-in fade-in zoom-in relative overflow-hidden ${
                currentState === "near"
                  ? "bg-orange-300 border-orange-300"
                  : currentState === "served"
                  ? "bg-green-300 border-green-300"
                  : currentState === "cancelled"
                  ? "bg-red-300 border-red-300"
                  : "bg-sky-300 border-sky-300"
              }`}
            >
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-3">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                  }}
                ></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
                    Now Serving
                  </p>
                  <div className="p-2 rounded-lg bg-white/50 backdrop-blur-sm">
                    <Users className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
                    {activeData.liveContext.nowServing}
                  </h3>
                </div>
                <div className="mt-6 sm:mt-8 flex items-center gap-2">
                  <span className="text-sm sm:text-base font-semibold text-slate-600 bg-white/70 px-3 py-1.5 rounded-lg">
                    {activeData.liveContext.countersActive} counter
                    {activeData.liveContext.countersActive > 1 ? "s" : ""}{" "}
                    active
                  </span>
                </div>
              </div>
            </div>

            {/* Wait Time Card */}
            {activeData.estimate && (
              <div
                className={`rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 animate-in fade-in zoom-in relative overflow-hidden ${
                  currentState === "near"
                    ? "bg-orange-50 border-orange-300"
                    : currentState === "served"
                    ? "bg-green-50 border-green-300"
                    : currentState === "cancelled"
                    ? "bg-red-50 border-red-300"
                    : "bg-sky-50 border-sky-300"
                }`}
              >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)`,
                      backgroundSize: "20px 20px",
                    }}
                  ></div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
                      Est. Wait Time
                    </p>
                    <div className="p-2 rounded-lg bg-white/50 backdrop-blur-sm">
                      <Clock className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
                      {activeData.estimate.estimatedWaitMinutes}
                    </h3>
                    <span className="text-lg sm:text-xl font-bold text-slate-600">
                      min
                    </span>
                  </div>
                  <div className="mt-6 sm:mt-8 flex items-center gap-2">
                    <span className="text-sm sm:text-base font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                      ↓ 5%
                    </span>
                    <span className="text-sm sm:text-base text-slate-500">
                      vs last visit
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Users Ahead Card */}
            {activeData.estimate && (
              <div
                className={`rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 animate-in fade-in zoom-in relative overflow-hidden ${
                  currentState === "near"
                    ? "bg-orange-50 border-orange-300"
                    : currentState === "served"
                    ? "bg-green-50 border-green-300"
                    : currentState === "cancelled"
                    ? "bg-red-50 border-red-300"
                    : "bg-sky-50 border-sky-300"
                }`}
              >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)`,
                      backgroundSize: "20px 20px",
                    }}
                  ></div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
                      People Ahead
                    </p>
                    <div className="p-2 rounded-lg bg-white/50 backdrop-blur-sm">
                      <TrendingUp className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
                      {activeData.estimate.usersAhead}
                    </h3>
                  </div>
                  <div className="mt-6 sm:mt-8 flex items-center gap-2">
                    <span className="text-sm sm:text-base font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                      ↑ 10%
                    </span>
                    <span className="text-sm sm:text-base text-slate-500">
                      from 5 min ago
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="max-w-4xl xl:max-w-5xl mx-auto">
            {/* Current Queue Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 sm:mb-8">
              <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-200">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900">
                  Current Queue
                </h3>
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div>
                    <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-2">
                      {activeData.queue.name}
                    </h4>
                    <div className="flex items-center text-slate-600 gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm sm:text-base text-slate-600">
                        {activeData.queue.location}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${
                      activeData.queue.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {activeData.queue.status === "active" ? "Active" : "Paused"}
                  </span>
                </div>

                {/* Status Message */}
                <div
                  className={`mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl border ${
                    activeData.token.status === "near"
                      ? "bg-orange-50 border-orange-200"
                      : activeData.token.status === "served"
                      ? "bg-green-50 border-green-200"
                      : activeData.token.status === "cancelled"
                      ? "bg-red-50 border-red-200"
                      : "bg-sky-50 border-sky-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div
                      className={`mt-0.5 ${
                        activeData.token.status === "near"
                          ? "text-orange-600"
                          : activeData.token.status === "served"
                          ? "text-green-600"
                          : activeData.token.status === "cancelled"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {activeData.token.status === "near" ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : activeData.token.status === "served" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : activeData.token.status === "cancelled" ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </div>
                    <p
                      className={`text-sm sm:text-base font-semibold ${
                        activeData.token.status === "near"
                          ? "text-orange-800"
                          : activeData.token.status === "served"
                          ? "text-green-800"
                          : activeData.token.status === "cancelled"
                          ? "text-red-800"
                          : "text-sky-800"
                      }`}
                    >
                      {activeData.reassurance.message}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {(activeData.token.status === "waiting" ||
                  activeData.token.status === "near") && (
                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={handleReschedule}
                      disabled={isRescheduleOpen}
                      className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRescheduleOpen ? "Rescheduling..." : "Reschedule"}
                    </button>
                    <button
                      onClick={handleLeaveQueue}
                      className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      Leave Queue
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
