"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { generatePayrollRecords, calculatePayrollStats } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, CheckCircle, Clock } from "lucide-react"
import type { JSX } from "react/jsx-runtime"

export default function PayrollPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("2025-10")
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "approved" | "paid">("all")

  const payrollRecords = useMemo(() => {
    const records = generatePayrollRecords(selectedPeriod)
    return filterStatus === "all" ? records : records.filter((r) => r.status === filterStatus)
  }, [selectedPeriod, filterStatus])

  const stats = calculatePayrollStats(payrollRecords)

  const periods = [
    { value: "2025-10", label: "October 2025" },
    { value: "2025-09", label: "September 2025" },
    { value: "2025-08", label: "August 2025" },
  ]

  // Chart data for payroll trends
  const payrollTrendData = [
    { name: "Jan", salary: 85000, deductions: 15000, net: 70000 },
    { name: "Feb", salary: 89000, deductions: 16000, net: 73000 },
    { name: "Mar", salary: 92000, deductions: 17000, net: 75000 },
    { name: "Apr", salary: 90000, deductions: 16500, net: 73500 },
    { name: "May", salary: 95000, deductions: 17500, net: 77500 },
    { name: "Jun", salary: 99000, deductions: 18000, net: 81000 },
  ]

  // Status distribution
  const statusDistribution = [
    {
      name: "Paid",
      value: generatePayrollRecords(selectedPeriod).filter((r) => r.status === "paid").length,
      fill: "#10b981",
    },
    {
      name: "Approved",
      value: generatePayrollRecords(selectedPeriod).filter((r) => r.status === "approved").length,
      fill: "#3b82f6",
    },
    {
      name: "Draft",
      value: generatePayrollRecords(selectedPeriod).filter((r) => r.status === "draft").length,
      fill: "#f59e0b",
    },
  ]

  const statusColors: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
    draft: {
      bg: "bg-gray-500/10",
      text: "text-gray-700",
      icon: <Clock className="w-4 h-4" />,
    },
    approved: {
      bg: "bg-blue-500/10",
      text: "text-blue-700",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    paid: {
      bg: "bg-green-500/10",
      text: "text-green-700",
      icon: <CheckCircle className="w-4 h-4" />,
    },
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Payroll Computation</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Calculate, process, and manage employee compensation and payroll records.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-card p-4 sm:p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Total Payroll</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">${(stats.total / 1000).toFixed(0)}K</p>
              <p className="text-xs text-green-600 mt-1 sm:mt-2">For {selectedPeriod}</p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-lg sm:text-xl flex-shrink-0 ml-2">
              💰
            </div>
          </div>
        </Card>

        <Card className="bg-card p-4 sm:p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Average Salary</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">${(stats.average / 1000).toFixed(1)}K</p>
              <p className="text-xs text-muted-foreground mt-1 sm:mt-2">Per employee</p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 text-lg sm:text-xl flex-shrink-0 ml-2">
              📊
            </div>
          </div>
        </Card>

        <Card className="bg-card p-4 sm:p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Approved Records</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.approved}</p>
              <p className="text-xs text-muted-foreground mt-1 sm:mt-2">Ready to pay</p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600 text-lg sm:text-xl flex-shrink-0 ml-2">
              ✓
            </div>
          </div>
        </Card>

        <Card className="bg-card p-4 sm:p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Pending Records</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-muted-foreground mt-1 sm:mt-2">Awaiting action</p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-600 text-lg sm:text-xl flex-shrink-0 ml-2">
              !
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-card p-4 sm:p-6 border border-border lg:col-span-2">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">6-Month Payroll Trend</h2>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <BarChart data={payrollTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar dataKey="salary" fill="var(--primary)" name="Salary" />
              <Bar dataKey="deductions" fill="var(--destructive)" name="Deductions" />
              <Bar dataKey="net" fill="var(--accent)" name="Net Pay" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-card p-4 sm:p-6 border border-border">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} (${value})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="bg-card p-4 sm:p-6 border border-border">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Payroll Records</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Showing {payrollRecords.length} of {generatePayrollRecords(selectedPeriod).length} records
              </p>
            </div>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full lg:w-auto">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {periods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Status Filter</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-foreground">Employee</th>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-foreground">Base Salary</th>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-foreground">Overtime</th>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-foreground">Deductions</th>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-foreground">Net Salary</th>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {payrollRecords.length > 0 ? (
                    payrollRecords.map((record, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <p className="text-xs sm:text-sm font-medium text-foreground">{record.employeeName}</p>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-foreground">${(record.baseSalary / 1000).toFixed(1)}K</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-foreground">${(record.overtime / 1000).toFixed(1)}K</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-red-600 font-medium">-${(record.deductions / 1000).toFixed(1)}K</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <p className="text-xs sm:text-sm font-bold text-foreground">${(record.netSalary / 1000).toFixed(1)}K</p>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${statusColors[record.status].bg} ${statusColors[record.status].text}`}
                          >
                            {statusColors[record.status].icon}
                            <span className="hidden sm:inline">{record.status.charAt(0).toUpperCase() + record.status.slice(1)}</span>
                            <span className="sm:hidden">{record.status.charAt(0).toUpperCase()}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-xs sm:text-sm text-muted-foreground">
                        No payroll records found.
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
