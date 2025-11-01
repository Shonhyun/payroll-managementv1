"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateDTRRecords } from "@/lib/mock-data"
import { Download } from "lucide-react"

export default function DTRPage() {
  const [selectedMonth, setSelectedMonth] = useState("2025-10")
  const [searchEmployee, setSearchEmployee] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "present" | "absent" | "late" | "halfday">("all")

  const dtrRecords = generateDTRRecords(31)
  const currentMonthRecords = dtrRecords.filter((record) => record.date.startsWith(selectedMonth))

  const filteredData = useMemo(() => {
    return currentMonthRecords.filter((record) => {
      const matchesSearch = record.employeeName.toLowerCase().includes(searchEmployee.toLowerCase())
      const matchesStatus = filterStatus === "all" || record.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [currentMonthRecords, searchEmployee, filterStatus])

  const stats = useMemo(() => {
    const statuses = {
      present: currentMonthRecords.filter((r) => r.status === "present").length,
      absent: currentMonthRecords.filter((r) => r.status === "absent").length,
      late: currentMonthRecords.filter((r) => r.status === "late").length,
      halfday: currentMonthRecords.filter((r) => r.status === "halfday").length,
    }
    return {
      ...statuses,
      total: currentMonthRecords.length,
      attendanceRate:
        currentMonthRecords.length > 0
          ? Math.round(((statuses.present + statuses.halfday) / currentMonthRecords.length) * 100)
          : 0,
    }
  }, [currentMonthRecords])

  const months = [
    { value: "2025-10", label: "October 2025" },
    { value: "2025-09", label: "September 2025" },
    { value: "2025-08", label: "August 2025" },
  ]

  const statusColors: Record<string, string> = {
    present: "bg-green-500/10 text-green-700",
    absent: "bg-red-500/10 text-red-700",
    late: "bg-yellow-500/10 text-yellow-700",
    halfday: "bg-blue-500/10 text-blue-700",
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Daily Time Record</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Review and manage daily attendance records for all employees.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="bg-card p-3 sm:p-4 md:p-6 border border-border">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Attendance Rate</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{stats.attendanceRate}%</p>
          <p className="text-xs text-green-600 mt-1 sm:mt-2">Overall for month</p>
        </Card>
        <Card className="bg-card p-3 sm:p-4 md:p-6 border border-border">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Present</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{stats.present}</p>
          <p className="text-xs text-muted-foreground mt-1 sm:mt-2">Records</p>
        </Card>
        <Card className="bg-card p-3 sm:p-4 md:p-6 border border-border">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Absent</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600">{stats.absent}</p>
          <p className="text-xs text-muted-foreground mt-1 sm:mt-2">Records</p>
        </Card>
        <Card className="bg-card p-3 sm:p-4 md:p-6 border border-border">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Late</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600">{stats.late}</p>
          <p className="text-xs text-muted-foreground mt-1 sm:mt-2">Records</p>
        </Card>
        <Card className="bg-card p-3 sm:p-4 md:p-6 border border-border">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Half Day</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{stats.halfday}</p>
          <p className="text-xs text-muted-foreground mt-1 sm:mt-2">Records</p>
        </Card>
      </div>

      <Card className="bg-card border border-border rounded-xl p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Time Records</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Showing {filteredData.length} of {currentMonthRecords.length} records
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full lg:w-auto">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="halfday">Half Day</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-foreground mb-2 block">Search Employee</label>
              <Input
                placeholder="Search by name..."
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-foreground">Employee</th>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-foreground">Department</th>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-foreground">Date</th>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-foreground">Time In</th>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-foreground">Time Out</th>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {filteredData.length > 0 ? (
                    filteredData.map((record, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <p className="text-xs sm:text-sm font-medium text-foreground">{record.employeeName}</p>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-muted-foreground">{record.department}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-muted-foreground">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-foreground">{record.timeIn}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-foreground">{record.timeOut}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${statusColors[record.status]}`}
                          >
                            <span className="hidden sm:inline">{record.status.charAt(0).toUpperCase() + record.status.slice(1)}</span>
                            <span className="sm:hidden">{record.status.charAt(0).toUpperCase()}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-xs sm:text-sm text-muted-foreground">
                        No records found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
