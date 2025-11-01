// Mock data for all payroll modules - easily replaceable with real API calls later

export interface Employee {
  id: string
  name: string
  email: string
  department: string
  position: string
  salary: number
  status: "active" | "inactive"
  joinDate: string
  avatar: string
}

export interface TimeRecord {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkIn: string
  checkOut: string
  status: "on-time" | "late" | "absent"
  hoursWorked: number
}

export interface DTRRecord {
  id: string
  employeeId: string
  employeeName: string
  department: string
  date: string
  timeIn: string
  timeOut: string
  status: "present" | "absent" | "late" | "halfday"
}

export interface PayrollRecord {
  id: string
  employeeId: string
  employeeName: string
  period: string
  baseSalary: number
  overtime: number
  deductions: number
  netSalary: number
  status: "draft" | "approved" | "paid"
}

// Mock employees data
export const mockEmployees: Employee[] = [
  {
    id: "EMP001",
    name: "John Doe",
    email: "john.doe@company.com",
    department: "IT",
    position: "Senior Developer",
    salary: 75000,
    status: "active",
    joinDate: "2022-01-15",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    id: "EMP002",
    name: "Maria Garcia",
    email: "maria.garcia@company.com",
    department: "HR",
    position: "HR Manager",
    salary: 65000,
    status: "active",
    joinDate: "2021-06-20",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
  },
  {
    id: "EMP003",
    name: "David Wilson",
    email: "david.wilson@company.com",
    department: "Finance",
    position: "Accountant",
    salary: 55000,
    status: "active",
    joinDate: "2021-03-10",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
  },
  {
    id: "EMP004",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    department: "IT",
    position: "UI/UX Designer",
    salary: 60000,
    status: "active",
    joinDate: "2022-05-12",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    id: "EMP005",
    name: "Michael Chen",
    email: "michael.chen@company.com",
    department: "Sales",
    position: "Sales Manager",
    salary: 70000,
    status: "active",
    joinDate: "2020-11-25",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
  },
  {
    id: "EMP006",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    department: "Marketing",
    position: "Marketing Specialist",
    salary: 52000,
    status: "active",
    joinDate: "2023-02-01",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
  },
]

// Generate mock time records
export function generateTimeRecords(days = 30): TimeRecord[] {
  const records: TimeRecord[] = []
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    mockEmployees.forEach((emp) => {
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        // Exclude weekends
        const status = Math.random() > 0.2 ? "on-time" : Math.random() > 0.5 ? "late" : "absent"
        const hoursWorked = status === "absent" ? 0 : Math.random() > 0.1 ? 8 : 4

        records.push({
          id: `TR${emp.id}${date.getTime()}`,
          employeeId: emp.id,
          employeeName: emp.name,
          date: date.toISOString().split("T")[0],
          checkIn:
            "08:" +
            Math.floor(Math.random() * 60)
              .toString()
              .padStart(2, "0"),
          checkOut:
            "17:" +
            Math.floor(Math.random() * 60)
              .toString()
              .padStart(2, "0"),
          status,
          hoursWorked,
        })
      }
    })
  }

  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Generate mock DTR records
export function generateDTRRecords(days = 30): DTRRecord[] {
  const records: DTRRecord[] = []
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    mockEmployees.forEach((emp) => {
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const statuses: Array<"present" | "absent" | "late" | "halfday"> = ["present", "absent", "late", "halfday"]
        const status = statuses[Math.floor(Math.random() * statuses.length)]

        records.push({
          id: `DTR${emp.id}${date.getTime()}`,
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.department,
          date: date.toISOString().split("T")[0],
          timeIn:
            status === "absent"
              ? "-"
              : "08:" +
                Math.floor(Math.random() * 60)
                  .toString()
                  .padStart(2, "0"),
          timeOut:
            status === "absent" || status === "halfday"
              ? "-"
              : "17:" +
                Math.floor(Math.random() * 60)
                  .toString()
                  .padStart(2, "0"),
          status,
        })
      }
    })
  }

  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Generate mock payroll records
export function generatePayrollRecords(period = "2025-10"): PayrollRecord[] {
  return mockEmployees.map((emp) => ({
    id: `PAY${emp.id}${period}`,
    employeeId: emp.id,
    employeeName: emp.name,
    period,
    baseSalary: emp.salary,
    overtime: Math.random() > 0.7 ? Math.floor(Math.random() * 5000) : 0,
    deductions: Math.floor(emp.salary * 0.15),
    netSalary:
      emp.salary + (Math.random() > 0.7 ? Math.floor(Math.random() * 5000) : 0) - Math.floor(emp.salary * 0.15),
    status: Math.random() > 0.3 ? "approved" : "draft",
  }))
}

// Calculate statistics
export function calculatePayrollStats(records: PayrollRecord[]) {
  const total = records.reduce((sum, r) => sum + r.netSalary, 0)
  const average = records.length > 0 ? total / records.length : 0
  const approved = records.filter((r) => r.status === "approved").length

  return { total, average, approved, pending: records.length - approved }
}

export function calculateAttendanceStats(records: TimeRecord[]) {
  const onTime = records.filter((r) => r.status === "on-time").length
  const late = records.filter((r) => r.status === "late").length
  const absent = records.filter((r) => r.status === "absent").length

  return { onTime, late, absent, total: records.length }
}

export function calculateDTRStats(records: DTRRecord[]) {
  const present = records.filter((r) => r.status === "present").length
  const absent = records.filter((r) => r.status === "absent").length
  const late = records.filter((r) => r.status === "late").length
  const halfday = records.filter((r) => r.status === "halfday").length

  return { present, absent, late, halfday, total: records.length }
}
