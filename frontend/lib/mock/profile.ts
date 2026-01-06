export type Role = "USER" | "OPERATOR" | "ADMIN";

export const profileMock = {
  name: "Aryan Gupta",
  email: "aryan@campusor.edu",
  role: "OPERATOR" as Role,
  joinedAt: "12 Aug 2024",

  // USER
  collegeEmail: "aryan.btech@campusor.edu",
  activeToken: "A-23",
  recentQueues: [
    { queueName: "Hostel Office", status: "SERVED" },
    { queueName: "Scholarship Desk", status: "CANCELLED" },
  ],

  // OPERATOR
  department: "Admin Office",
  designation: "Queue Operator",
  assignedQueues: ["Hostel Office", "Scholarship Desk"],
  activeQueue: "Hostel Office",

  // ADMIN
  scope: "Campus-wide",
  totalQueuesManaged: 12,
};
