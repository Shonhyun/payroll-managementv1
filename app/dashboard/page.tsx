"use client"

import { Card } from "@/components/ui/card"
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
import {
  mockEmployees,
  generateTimeRecords,
  generatePayrollRecords,
  calculatePayrollStats,
  calculateAttendanceStats,
} from "@/lib/mock-data"
import { Users, DollarSign, AlertCircle, CheckCircle } from "lucide-react"

const payrollTrendData = [
  { name: "Jan", employees: 120, payroll: 85000 },
  { name: "Feb", employees: 125, payroll: 89000 },
  { name: "Mar", employees: 130, payroll: 92000 },
  { name: "Apr", employees: 128, payroll: 90000 },
  { name: "May", employees: 135, payroll: 95000 },
  { name: "Jun", employees: 140, payroll: 99000 },
]

const departmentDistribution = [
  { name: "IT", value: 3, fill: "var(--chart-1)" },
  { name: "HR", value: 1, fill: "var(--chart-2)" },
  { name: "Finance", value: 1, fill: "var(--chart-3)" },
  { name: "Sales", value: 1, fill: "var(--chart-4)" },
  { name: "Marketing", value: 1, fill: "var(--chart-5)" },
]

export default function DashboardPage() {
  const timeRecords = generateTimeRecords(7) // Last 7 days
  const payrollRecords = generatePayrollRecords()
  const attendanceStats = calculateAttendanceStats(timeRecords)
  const payrollStats = calculatePayrollStats(payrollRecords)

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Welcome back! Here's an overview of your payroll system.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-card p-4 sm:p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Total Employees</div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">{mockEmployees.length}</div>
              <div className="text-xs sm:text-sm text-green-600 mt-1 sm:mt-2">All active</div>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 ml-2">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="bg-card p-4 sm:p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Monthly Payroll</div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">${(payrollStats.total / 1000).toFixed(0)}K</div>
              <div className="text-xs sm:text-sm text-green-600 mt-1 sm:mt-2">Across all employees</div>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 ml-2">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="bg-card p-4 sm:p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Pending Approvals</div>
              <div className="text-2xl sm:text-3xl font-bold text-accent">{payrollStats.pending}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Payroll records</div>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 ml-2">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="bg-card p-4 sm:p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">On-Time Rate</div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {Math.round((attendanceStats.onTime / attendanceStats.total) * 100)}%
              </div>
              <div className="text-xs sm:text-sm text-green-600 mt-1 sm:mt-2">This week</div>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-green-600/10 flex items-center justify-center flex-shrink-0 ml-2">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-card p-4 sm:p-6 border border-border lg:col-span-2">
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">Payroll Trends</h2>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <BarChart data={payrollTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: `1px solid var(--border)`,
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar dataKey="payroll" fill="var(--primary)" name="Payroll ($)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-card p-4 sm:p-6 border border-border">
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">Employees by Department</h2>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <PieChart>
              <Pie
                data={departmentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} (${value})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: `1px solid var(--border)`,
                  borderRadius: "var(--radius)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-card p-3 sm:p-4 border border-border">
          <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">On Time</div>
          <div className="text-xl sm:text-2xl font-bold text-green-600">{attendanceStats.onTime}</div>
          <div className="text-xs text-muted-foreground mt-1">{attendanceStats.total} records</div>
        </Card>
        <Card className="bg-card p-3 sm:p-4 border border-border">
          <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Late</div>
          <div className="text-xl sm:text-2xl font-bold text-orange-600">{attendanceStats.late}</div>
          <div className="text-xs text-muted-foreground mt-1">{attendanceStats.total} records</div>
        </Card>
        <Card className="bg-card p-3 sm:p-4 border border-border">
          <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Absent</div>
          <div className="text-xl sm:text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
          <div className="text-xs text-muted-foreground mt-1">{attendanceStats.total} records</div>
        </Card>
        <Card className="bg-card p-3 sm:p-4 border border-border">
          <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Approved Payroll</div>
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{payrollStats.approved}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {payrollStats.approved} / {payrollRecords.length}
          </div>
        </Card>
      </div>
    </div>
  )
}
