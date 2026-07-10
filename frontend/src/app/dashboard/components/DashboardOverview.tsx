import { motion } from "framer-motion";

interface DashboardOverviewProps {
  userFirstName: string;
  totalEmails: number;
  highPriorityCount: number;
  upcomingDeadlinesCount: number;
}

export function DashboardOverview({
  userFirstName,
  totalEmails,
  highPriorityCount,
  upcomingDeadlinesCount,
}: DashboardOverviewProps) {
  const stats = [
    {
      label: "Total Emails",
      value: totalEmails,
      text: "text-white",
    },
    {
      label: "Active Deadlines",
      value: upcomingDeadlinesCount,
      text: "text-amber-400",
    },
    {
      label: "High Priority",
      value: highPriorityCount,
      text: "text-rose-400",
    },
    {
      label: "Synced",
      value: "Just now",
      text: "text-blue-400",
      isString: true,
    },
  ];

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 overflow-y-auto custom-scrollbar p-10 z-10 flex flex-col items-center justify-center min-h-full"
    >
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mx-auto">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-sm text-gray-400">Workspace Active</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
          Welcome back, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500">
            {userFirstName}
          </span>
        </h1>

        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          You have{" "}
          <span className="text-rose-400 font-semibold">
            {highPriorityCount} urgent
          </span>{" "}
          updates and{" "}
          <span className="text-amber-400 font-semibold">
            {upcomingDeadlinesCount} deadlines
          </span>{" "}
          approaching.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
          {stats.map((s, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
            >
              <div className={`text-3xl font-bold mb-2 ${s.text}`}>
                {s.value}
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
