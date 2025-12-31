// queueLoadMock.ts (Recommended - Line or Area chart)
export const queueLoadMock = [
  { time: "09:00", activeTokens: 12 },
  { time: "10:00", activeTokens: 28 },
  { time: "11:00", activeTokens: 45 },
  { time: "12:00", activeTokens: 38 },
  { time: "13:00", activeTokens: 22 },
  { time: "14:00", activeTokens: 30 },
  { time: "15:00", activeTokens: 41 },
  { time: "16:00", activeTokens: 35 },
];


// tokensServedMock.ts (Recommended - bar or column chart)
export const tokensServedPerHourMock = [
  { hour: "09–10", served: 18 },
  { hour: "10–11", served: 32 },
  { hour: "11–12", served: 40 },
  { hour: "12–13", served: 27 },
  { hour: "13–14", served: 15 },
  { hour: "14–15", served: 29 },
  { hour: "15–16", served: 36 },
];


// avgWaitTimeMock.ts (Recommended - Horizontal bar chart or ranked visuals)
export const avgWaitTimePerQueueMock = [
  { queue: "Admin Office", avgWaitMinutes: 18 },
  { queue: "Clinic", avgWaitMinutes: 32 },
  { queue: "Hostel Office", avgWaitMinutes: 14 },
  { queue: "Cafeteria", avgWaitMinutes: 9 },
  { queue: "Library Desk", avgWaitMinutes: 6 },
];

// tokenStatusMock.ts (Recommended - Pie or donut chart)
export const tokenStatusDistributionMock = [
  { status: "Waiting", count: 42 },
  { status: "Served", count: 128 },
  { status: "Skipped", count: 9 },
  { status: "Cancelled", count: 6 },
];

