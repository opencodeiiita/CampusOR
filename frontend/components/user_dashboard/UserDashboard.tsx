"use client";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-blue-500";
      case "near":
        return "bg-orange-500";
      case "served":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <Clock className="w-6 h-6" />;
      case "near":
        return <AlertCircle className="w-6 h-6" />;
      case "served":
        return <CheckCircle className="w-6 h-6" />;
      case "cancelled":
        return <XCircle className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
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
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            {data.message}
          </h2>
          <p className="text-slate-600 mb-6">{data.actionHint}</p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
            Browse Queues
          </button>
        </div>
      </div>
    );
  }

  // Type assertion since we've already checked hasActiveQueue
  const activeData = data as UserDashboardData;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative w-64 h-full bg-white border-r border-gray-200 transition-transform duration-300 z-50`}
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">CampusOR</h2>
              <p className="text-xs text-gray-500">Queue Management</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium">
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">
            <CalendarClock className="w-5 h-5" />
            <span>My Queues</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">
            <History className="w-5 h-5" />
            <span>History</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">
            <ListChecks className="w-5 h-5" />
            <span>Available Queues</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </button>
        </nav>

        {/* User Profile at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
          <div className="mt-4 flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {activeData.user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {activeData.user.name}
              </p>
              <p className="text-xs text-gray-500">
                {sidebarMockData.userProfile.studentId}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile menu toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg border border-gray-200"
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
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="text-sm text-gray-500">{formattedTime}</div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Token Number Card */}
            <div
              className={`rounded-xl p-6 border border-gray-200 ${
                currentState === "near"
                  ? "bg-orange-50"
                  : currentState === "served"
                  ? "bg-green-50"
                  : currentState === "cancelled"
                  ? "bg-red-50"
                  : "bg-blue-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Your Token</p>
                <Activity className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900">
                  {activeData.token.tokenNumber}
                </h3>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <span
                  className={`text-sm font-semibold px-4 py-1 rounded-full ${
                    activeData.token.status === "near"
                      ? "bg-orange-100 text-orange-700"
                      : activeData.token.status === "served"
                      ? "bg-green-100 text-green-700"
                      : activeData.token.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {getStatusText(activeData.token.status)}
                </span>
              </div>
            </div>

            {/* Now Serving Card */}
            <div
              className={`rounded-xl p-6 border border-gray-200 ${
                currentState === "near"
                  ? "bg-orange-50"
                  : currentState === "served"
                  ? "bg-green-50"
                  : currentState === "cancelled"
                  ? "bg-red-50"
                  : "bg-blue-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Now Serving</p>
                <Users className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900">
                  {activeData.liveContext.nowServing}
                </h3>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                <span>
                  {activeData.liveContext.countersActive} counter
                  {activeData.liveContext.countersActive > 1 ? "s" : ""} active
                </span>
              </div>
            </div>

            {/* Wait Time Card */}
            {activeData.estimate && (
              <div
                className={`rounded-xl p-6 border border-gray-200 ${
                  currentState === "near"
                    ? "bg-orange-50"
                    : currentState === "served"
                    ? "bg-green-50"
                    : currentState === "cancelled"
                    ? "bg-red-50"
                    : "bg-blue-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-medium">
                    Est. Wait Time
                  </p>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {activeData.estimate.estimatedWaitMinutes}
                  </h3>
                  <span className="text-lg text-gray-500">min</span>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <span className="text-green-600">↓ 5%</span>
                  <span className="text-gray-500">vs last visit</span>
                </div>
              </div>
            )}

            {/* Users Ahead Card */}
            {activeData.estimate && (
              <div
                className={`rounded-xl p-6 border border-gray-200 ${
                  currentState === "near"
                    ? "bg-orange-50"
                    : currentState === "served"
                    ? "bg-green-50"
                    : currentState === "cancelled"
                    ? "bg-red-50"
                    : "bg-blue-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-medium">
                    People Ahead
                  </p>
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {activeData.estimate.usersAhead}
                  </h3>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <span className="text-red-600">↑ 10%</span>
                  <span className="text-gray-500">from 5 min ago</span>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="max-w-3xl py-7 ">
            {/* Current Queue Card */}
            <div className="bg-white rounded-xl border  border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Current Queue
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {activeData.queue.name}
                    </h4>
                    <div className="flex items-center text-gray-600 gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">
                        {activeData.queue.location}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                  className={`mt-6 p-4 rounded-lg ${
                    activeData.token.status === "near"
                      ? "bg-orange-50 border border-orange-200"
                      : activeData.token.status === "served"
                      ? "bg-green-50 border border-green-200"
                      : activeData.token.status === "cancelled"
                      ? "bg-red-50 border border-red-200"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
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
                      className={`text-sm font-medium ${
                        activeData.token.status === "near"
                          ? "text-orange-800"
                          : activeData.token.status === "served"
                          ? "text-green-800"
                          : activeData.token.status === "cancelled"
                          ? "text-red-800"
                          : "text-blue-800"
                      }`}
                    >
                      {activeData.reassurance.message}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {(activeData.token.status === "waiting" ||
                  activeData.token.status === "near") && (
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={handleReschedule}
                      disabled={isRescheduleOpen}
                      className="flex-1 py-3 px-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {isRescheduleOpen ? "Rescheduling..." : "Reschedule"}
                    </button>
                    <button
                      onClick={handleLeaveQueue}
                      className="flex-1 py-3 px-4 bg-white border-2 border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
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
