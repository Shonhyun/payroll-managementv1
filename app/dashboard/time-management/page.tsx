"use client"

import { useState } from "react"

export default function TimeManagementPage() {
  const [selectedFilter, setSelectedFilter] = useState("all")

  const teamData = [
    { name: "John Doe", hours: "8.5h", status: "On Time", department: "Engineering" },
    { name: "Jane Smith", hours: "7.2h", status: "Late Check-in", department: "HR" },
    { name: "Mike Johnson", hours: "8h", status: "On Time", department: "Engineering" },
    { name: "Sarah Williams", hours: "8.5h", status: "On Time", department: "Sales" },
  ]

  const filteredData =
    selectedFilter === "all"
      ? teamData
      : teamData.filter((member) =>
          selectedFilter === "late" ? member.status === "Late Check-in" : member.status === "On Time",
        )

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Time Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Track and manage employee work hours and schedules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Team Hours Today</h2>
            <div className="flex gap-2 flex-wrap w-full sm:w-auto">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border border-border text-foreground hover:bg-muted/30"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter("on-time")}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === "on-time"
                    ? "bg-green-600 text-white"
                    : "bg-background border border-border text-foreground hover:bg-muted/30"
                }`}
              >
                On Time
              </button>
              <button
                onClick={() => setSelectedFilter("late")}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === "late"
                    ? "bg-yellow-600 text-white"
                    : "bg-background border border-border text-foreground hover:bg-muted/30"
                }`}
              >
                Late
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredData.map((member, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.department}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-primary">{member.hours}</p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      member.status === "On Time"
                        ? "bg-green-500/10 text-green-700"
                        : "bg-yellow-500/10 text-yellow-700"
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 h-fit">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Overview</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 bg-blue-500/10 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Average Hours</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">8.1h</p>
            </div>
            <div className="p-3 sm:p-4 bg-green-500/10 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">On Time Today</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">3/4</p>
            </div>
            <div className="p-3 sm:p-4 bg-yellow-500/10 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Late Check-ins</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">1/4</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
