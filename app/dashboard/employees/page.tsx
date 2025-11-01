"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { mockEmployees } from "@/lib/mock-data"
import { Mail, Calendar, Briefcase, Building2, Search, Download } from "lucide-react"

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDept, setFilterDept] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

  const filteredEmployees = useMemo(() => {
    return mockEmployees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDept = filterDept === "all" || emp.department === filterDept
      const matchesStatus = filterStatus === "all" || emp.status === filterStatus

      return matchesSearch && matchesDept && matchesStatus
    })
  }, [searchTerm, filterDept, filterStatus])

  const departments = ["all", ...new Set(mockEmployees.map((e) => e.department))]
  const activeCount = mockEmployees.filter((e) => e.status === "active").length
  const inactiveCount = mockEmployees.filter((e) => e.status === "inactive").length

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getAvatarColor = (name: string) => {
    const colors = ["bg-blue-600", "bg-purple-600", "bg-pink-600", "bg-green-600", "bg-yellow-600", "bg-red-600"]
    return colors[name.charCodeAt(0) % colors.length]
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Employees</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage and view all employee records in your organization.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-card p-4 sm:p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Total Employees</div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">{mockEmployees.length}</div>
              <div className="text-xs text-green-600 mt-1 sm:mt-2">{activeCount} active</div>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center text-lg sm:text-xl flex-shrink-0 ml-2">👥</div>
          </div>
        </Card>

        <Card className="bg-card p-4 sm:p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Departments</div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {new Set(mockEmployees.map((e) => e.department)).size}
              </div>
              <div className="text-xs text-muted-foreground mt-1 sm:mt-2">Divisions</div>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-blue-600/10 flex items-center justify-center text-lg sm:text-xl flex-shrink-0 ml-2">🏢</div>
          </div>
        </Card>

        <Card className="bg-card p-4 sm:p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Active Employees</div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{activeCount}</div>
              <div className="text-xs text-muted-foreground mt-1 sm:mt-2">Currently employed</div>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-green-600/10 flex items-center justify-center text-lg sm:text-xl flex-shrink-0 ml-2">✓</div>
          </div>
        </Card>

        <Card className="bg-card p-4 sm:p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">Inactive Employees</div>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{inactiveCount}</div>
              <div className="text-xs text-muted-foreground mt-1 sm:mt-2">Not active</div>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-yellow-600/10 flex items-center justify-center text-lg sm:text-xl flex-shrink-0 ml-2">⊘</div>
          </div>
        </Card>
      </div>

      <Card className="bg-card p-4 sm:p-6 border border-border">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Employee Directory</h2>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-input border-border text-foreground pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Department</label>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "all" ? "All Departments" : dept}
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="bg-card border border-border p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full ${getAvatarColor(employee.name)} flex items-center justify-center text-white font-bold`}
                  >
                    {getInitials(employee.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    employee.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {employee.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${employee.email}`} className="hover:text-primary">
                    {employee.email}
                  </a>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="w-4 h-4" />
                  {employee.position}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  {employee.department}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(employee.joinDate).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex gap-2">
                <Button variant="outline" className="flex-1 text-xs bg-transparent">
                  View Details
                </Button>
                <Button variant="outline" className="flex-1 text-xs bg-transparent">
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card p-12 border border-border text-center">
          <p className="text-muted-foreground">No employees found matching your search criteria.</p>
        </Card>
      )}
    </div>
  )
}
