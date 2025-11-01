"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, Printer, Calendar } from "lucide-react"

const payrollData = [
  { month: "Jan", salary: 85000, benefits: 12000, taxes: 18000, net: 55000 },
  { month: "Feb", salary: 89000, benefits: 12500, taxes: 19000, net: 57500 },
  { month: "Mar", salary: 92000, benefits: 13000, taxes: 20000, net: 59000 },
  { month: "Apr", salary: 90000, benefits: 12800, taxes: 19500, net: 57700 },
  { month: "May", salary: 95000, benefits: 13500, taxes: 21000, net: 60500 },
  { month: "Jun", salary: 99000, benefits: 14000, taxes: 22000, net: 63000 },
]

const attendanceData = [
  { month: "Jan", present: 2800, absent: 120, late: 180, halfday: 50 },
  { month: "Feb", present: 2850, absent: 95, late: 155, halfday: 60 },
  { month: "Mar", present: 2900, absent: 70, late: 130, halfday: 45 },
  { month: "Apr", present: 2880, absent: 85, late: 145, halfday: 55 },
  { month: "May", present: 2920, absent: 60, late: 120, halfday: 40 },
  { month: "Jun", present: 2950, absent: 50, late: 100, halfday: 35 },
]

const complianceItems = [
  { name: "Tax Filings", status: "completed", date: "2024-10-30", progress: 100 },
  { name: "Social Security Contributions", status: "completed", date: "2024-10-28", progress: 100 },
  { name: "Health Insurance Updates", status: "in-progress", date: "Due 2024-11-15", progress: 75 },
  { name: "Labor Law Compliance", status: "completed", date: "2024-10-25", progress: 100 },
  { name: "Benefit Plan Reviews", status: "pending", date: "Due 2024-11-20", progress: 0 },
  { name: "Audit Preparation", status: "in-progress", date: "Due 2024-12-01", progress: 60 },
]

const departmentPayroll = [
  { name: "IT", value: 95000, fill: "#3b82f6" },
  { name: "HR", value: 45000, fill: "#10b981" },
  { name: "Finance", value: 65000, fill: "#f59e0b" },
  { name: "Sales", value: 85000, fill: "#ef4444" },
  { name: "Marketing", value: 52000, fill: "#8b5cf6" },
]

export default function ReportsPage() {
  const [reportType, setReportType] = useState<"payroll" | "attendance" | "compliance" | "departmental">("payroll")
  const [dateRange, setDateRange] = useState("last-6-months")

  const totals = useMemo(() => {
    return {
      totalSalary: payrollData.reduce((sum, d) => sum + d.salary, 0),
      totalBenefits: payrollData.reduce((sum, d) => sum + d.benefits, 0),
      totalTaxes: payrollData.reduce((sum, d) => sum + d.taxes, 0),
      totalNet: payrollData.reduce((sum, d) => sum + d.net, 0),
      avgAttendance: Math.round(
        payrollData.length > 0
          ? (attendanceData.reduce((sum, d) => sum + d.present / (d.present + d.absent + d.late + d.halfday), 0) /
              attendanceData.length) *
              100
          : 0,
      ),
      totalDepartmentPayroll: departmentPayroll.reduce((sum, d) => sum + d.value, 0),
    }
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Reports</h1>
        <p className="text-muted-foreground">
          Generate and view comprehensive payroll, attendance, and compliance reports.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
        <Button
          variant={reportType === "payroll" ? "default" : "outline"}
          onClick={() => setReportType("payroll")}
          className="text-sm"
        >
          Payroll Report
        </Button>
        <Button
          variant={reportType === "attendance" ? "default" : "outline"}
          onClick={() => setReportType("attendance")}
          className="text-sm"
        >
          Attendance Report
        </Button>
        <Button
          variant={reportType === "departmental" ? "default" : "outline"}
          onClick={() => setReportType("departmental")}
          className="text-sm"
        >
          Departmental Report
        </Button>
        <Button
          variant={reportType === "compliance" ? "default" : "outline"}
          onClick={() => setReportType("compliance")}
          className="text-sm"
        >
          Compliance Report
        </Button>
      </div>

      {reportType === "payroll" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card p-6 border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Salary</p>
              <p className="text-3xl font-bold text-primary">${(totals.totalSalary / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground mt-2">6-month total</p>
            </Card>
            <Card className="bg-card p-6 border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Benefits</p>
              <p className="text-3xl font-bold text-green-600">${(totals.totalBenefits / 1000).toFixed(1)}K</p>
              <p className="text-xs text-muted-foreground mt-2">Benefits paid</p>
            </Card>
            <Card className="bg-card p-6 border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Taxes</p>
              <p className="text-3xl font-bold text-red-600">${(totals.totalTaxes / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground mt-2">Taxes deducted</p>
            </Card>
            <Card className="bg-card p-6 border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Net Payroll</p>
              <p className="text-3xl font-bold text-blue-600">${(totals.totalNet / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground mt-2">Total paid</p>
            </Card>
          </div>

          <Card className="bg-card p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Payroll Trends - 6 Months</h2>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={payrollData}>
                <defs>
                  <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="salary"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSalary)"
                  name="Salary"
                />
                <Line type="monotone" dataKey="net" stroke="var(--accent)" strokeWidth={2} name="Net Pay" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="bg-card p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Salary Components Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={payrollData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Bar dataKey="salary" stackId="a" fill="var(--primary)" name="Salary" />
                <Bar dataKey="benefits" stackId="a" fill="var(--accent)" name="Benefits" />
                <Bar dataKey="taxes" stackId="a" fill="var(--destructive)" name="Taxes" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {reportType === "attendance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card p-6 border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Avg Attendance Rate</p>
              <p className="text-3xl font-bold text-green-600">{totals.avgAttendance}%</p>
              <p className="text-xs text-muted-foreground mt-2">6-month average</p>
            </Card>
            <Card className="bg-card p-6 border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Present</p>
              <p className="text-3xl font-bold text-primary">{attendanceData.reduce((sum, d) => sum + d.present, 0)}</p>
              <p className="text-xs text-muted-foreground mt-2">Days recorded</p>
            </Card>
            <Card className="bg-card p-6 border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Absences</p>
              <p className="text-3xl font-bold text-red-600">{attendanceData.reduce((sum, d) => sum + d.absent, 0)}</p>
              <p className="text-xs text-muted-foreground mt-2">Recorded</p>
            </Card>
          </div>

          <Card className="bg-card p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Attendance Patterns - 6 Months</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Bar dataKey="present" fill="var(--primary)" name="Present" />
                <Bar dataKey="late" fill="var(--accent)" name="Late" />
                <Bar dataKey="absent" fill="var(--destructive)" name="Absent" />
                <Bar dataKey="halfday" fill="#6b7280" name="Half Day" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {reportType === "departmental" && (
        <div className="space-y-6">
          <Card className="bg-card p-6 border border-border">
            <p className="text-sm font-medium text-muted-foreground mb-2">Total Department Payroll</p>
            <p className="text-3xl font-bold text-primary">${(totals.totalDepartmentPayroll / 1000).toFixed(0)}K</p>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card p-6 border border-border">
              <h2 className="text-lg font-bold text-foreground mb-4">Payroll by Department</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentPayroll}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${(value / 1000).toFixed(0)}K`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentPayroll.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number) => `$${(value / 1000).toFixed(1)}K`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="bg-card p-6 border border-border">
              <h2 className="text-lg font-bold text-foreground mb-4">Department Details</h2>
              <div className="space-y-3">
                {departmentPayroll.map((dept, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.fill }}></div>
                      <span className="font-medium text-foreground">{dept.name}</span>
                    </div>
                    <span className="font-bold text-foreground">${(dept.value / 1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {reportType === "compliance" && (
        <div className="space-y-6">
          <Card className="bg-card p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Compliance Checklist</h2>
            <div className="space-y-3">
              {complianceItems.map((item, idx) => (
                <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : item.status === "in-progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status === "completed"
                        ? "✓ Completed"
                        : item.status === "in-progress"
                          ? "In Progress"
                          : "Pending"}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-accent h-full transition-all"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{item.progress}% complete</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <Card className="bg-card p-6 border border-border">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="w-4 h-4" />
            Download Report
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Printer className="w-4 h-4" />
            Print Report
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Calendar className="w-4 h-4" />
            Schedule Export
          </Button>
        </div>
      </Card>
    </div>
  )
}
