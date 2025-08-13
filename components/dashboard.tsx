"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, BookOpen, Search, Download, TrendingUp, CalendarDays, Target, Clock } from "lucide-react"
import { db, isNeonConfigured } from "../lib/database"

interface Employee {
  id: string
  email: string
  first_name: string
  last_name: string
  department: string
  position: string
  hire_date: string
  is_active: boolean
}

interface TrainingCourse {
  id: string
  title: string
  description: string
  duration_hours: number
  category: string
  is_mandatory: boolean
  expiry_months?: number
}

interface TrainingAssignment {
  id: string
  employee_id: string
  course_id: string
  assigned_date: string
  due_date: string
  status: string
  priority: string
  employee_name?: string
  course_title?: string
}

interface QMSPlan {
  id: string
  title: string
  description: string
  category: string
  planned_start_date: string
  planned_end_date: string
  status: string
  priority: string
  year: number
  quarter: number
  responsible_person?: string
}

const PLANNING_YEARS = [2025, 2026, 2027, 2028]
const QUARTERS = [1, 2, 3, 4]

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [trainingCourses, setTrainingCourses] = useState<TrainingCourse[]>([])
  const [trainingAssignments, setTrainingAssignments] = useState<TrainingAssignment[]>([])
  const [qmsPlans, setQMSPlans] = useState<QMSPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedYear, setSelectedYear] = useState<number>(2025)
  const [selectedQuarter, setSelectedQuarter] = useState<string>("all")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      if (isNeonConfigured) {
        const [employeesResult, coursesResult] = await Promise.all([db.getEmployees(), db.getTrainingCourses()])
        if (employeesResult.data) setEmployees(employeesResult.data)
        if (coursesResult.data) setTrainingCourses(coursesResult.data)
      } else {
        // Generate sample multi-year data for demo
        const sampleData = generateSampleMultiYearData()
        setEmployees(sampleData.employees)
        setTrainingCourses(sampleData.trainingCourses)
        setTrainingAssignments(sampleData.trainingAssignments)
        setQMSPlans(sampleData.qmsPlans)
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateSampleMultiYearData = () => {
    const employees = [
      {
        id: "1",
        email: "john.doe@company.com",
        first_name: "John",
        last_name: "Doe",
        department: "Engineering",
        position: "Software Engineer",
        hire_date: "2021-03-10",
        is_active: true,
      },
      {
        id: "2",
        email: "jane.smith@company.com",
        first_name: "Jane",
        last_name: "Smith",
        department: "Marketing",
        position: "Marketing Specialist",
        hire_date: "2021-06-20",
        is_active: true,
      },
      {
        id: "3",
        email: "mike.johnson@company.com",
        first_name: "Mike",
        last_name: "Johnson",
        department: "Sales",
        position: "Sales Representative",
        hire_date: "2022-01-05",
        is_active: true,
      },
      {
        id: "4",
        email: "sarah.wilson@company.com",
        first_name: "Sarah",
        last_name: "Wilson",
        department: "Quality",
        position: "QMS Coordinator",
        hire_date: "2020-08-12",
        is_active: true,
      },
      {
        id: "5",
        email: "alex.brown@company.com",
        first_name: "Alex",
        last_name: "Brown",
        department: "HR",
        position: "HR Manager",
        hire_date: "2019-05-15",
        is_active: true,
      },
      {
        id: "6",
        email: "lisa.davis@company.com",
        first_name: "Lisa",
        last_name: "Davis",
        department: "Finance",
        position: "Financial Analyst",
        hire_date: "2022-09-01",
        is_active: true,
      },
    ]

    const trainingCourses = [
      {
        id: "1",
        title: "Workplace Safety Training",
        description: "Essential safety protocols",
        duration_hours: 4,
        category: "Safety",
        is_mandatory: true,
        expiry_months: 12,
      },
      {
        id: "2",
        title: "Data Privacy & GDPR",
        description: "Data protection regulations",
        duration_hours: 2,
        category: "Compliance",
        is_mandatory: true,
        expiry_months: 24,
      },
      {
        id: "3",
        title: "Leadership Development",
        description: "Leadership skills",
        duration_hours: 8,
        category: "Professional Development",
        is_mandatory: false,
      },
      {
        id: "4",
        title: "Quality Management Systems",
        description: "ISO 9001 principles",
        duration_hours: 6,
        category: "Quality",
        is_mandatory: true,
        expiry_months: 36,
      },
      {
        id: "5",
        title: "Cybersecurity Awareness",
        description: "Security best practices",
        duration_hours: 3,
        category: "Security",
        is_mandatory: true,
        expiry_months: 12,
      },
      {
        id: "6",
        title: "Project Management",
        description: "PM methodologies",
        duration_hours: 5,
        category: "Professional Development",
        is_mandatory: false,
      },
    ]

    const qmsPlans = []
    const planTemplates = [
      { title: "Document Control System Update", description: "Modernize document management", category: "system" },
      { title: "Process Mapping Review", description: "Review and update process maps", category: "process" },
      { title: "Internal Audit Procedure Revision", description: "Update audit procedures", category: "document" },
      { title: "Risk Management Framework", description: "Implement risk management", category: "system" },
      { title: "Supplier Quality Management", description: "Enhance supplier evaluation", category: "process" },
      { title: "Customer Feedback System", description: "Improve customer feedback collection", category: "system" },
      { title: "Training Management System", description: "Digitize training processes", category: "system" },
      { title: "Corrective Action Process", description: "Streamline corrective actions", category: "process" },
    ]

    let planId = 1
    PLANNING_YEARS.forEach((year) => {
      QUARTERS.forEach((quarter) => {
        const plansThisQuarter = Math.floor(Math.random() * 3) + 1
        for (let i = 0; i < plansThisQuarter; i++) {
          const template = planTemplates[Math.floor(Math.random() * planTemplates.length)]
          const startMonth = (quarter - 1) * 3 + 1
          const endMonth = quarter * 3

          qmsPlans.push({
            id: planId.toString(),
            title: `${template.title} (${year} Q${quarter})`,
            description: template.description,
            category: template.category,
            planned_start_date: `${year}-${startMonth.toString().padStart(2, "0")}-01`,
            planned_end_date: `${year}-${endMonth.toString().padStart(2, "0")}-28`,
            status: year === 2025 ? (quarter <= 2 ? "in_progress" : "planned") : "planned",
            priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
            year,
            quarter,
            responsible_person:
              employees[Math.floor(Math.random() * employees.length)].first_name +
              " " +
              employees[Math.floor(Math.random() * employees.length)].last_name,
          })
          planId++
        }
      })
    })

    const trainingAssignments = []
    let assignmentId = 1
    employees.forEach((employee) => {
      trainingCourses.forEach((course) => {
        if (Math.random() > 0.3) {
          // 70% chance of assignment
          const assignedDate = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
          const dueDate = new Date(assignedDate)
          dueDate.setMonth(dueDate.getMonth() + 2)

          trainingAssignments.push({
            id: assignmentId.toString(),
            employee_id: employee.id,
            course_id: course.id,
            assigned_date: assignedDate.toISOString().split("T")[0],
            due_date: dueDate.toISOString().split("T")[0],
            status: ["assigned", "in_progress", "completed"][Math.floor(Math.random() * 3)],
            priority: course.is_mandatory ? "high" : ["low", "medium"][Math.floor(Math.random() * 2)],
            employee_name: `${employee.first_name} ${employee.last_name}`,
            course_title: course.title,
          })
          assignmentId++
        }
      })
    })

    return { employees, trainingCourses, trainingAssignments, qmsPlans }
  }

  const departments = [...new Set(employees.map((emp) => emp.department))].filter(Boolean)

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = selectedDepartment === "all" || emp.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const filteredQMSPlans = qmsPlans.filter((plan) => {
    const matchesYear = plan.year === selectedYear
    const matchesQuarter = selectedQuarter === "all" || plan.quarter.toString() === selectedQuarter
    return matchesYear && matchesQuarter
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "assigned":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "planned":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getYearlyStats = (year: number) => {
    const yearPlans = qmsPlans.filter((p) => p.year === year)
    return {
      total: yearPlans.length,
      completed: yearPlans.filter((p) => p.status === "completed").length,
      inProgress: yearPlans.filter((p) => p.status === "in_progress").length,
      planned: yearPlans.filter((p) => p.status === "planned").length,
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading 4-year planning dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">4-Year Development Planning Dashboard</h1>
          <p className="text-muted-foreground">Strategic planning for 2025-2028 • Training & QMS Management</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLANNING_YEARS.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Plan
          </Button>
        </div>
      </div>

      {/* 4-Year Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {PLANNING_YEARS.map((year) => {
          const stats = getYearlyStats(year)
          const progress = stats.total > 0 ? ((stats.completed + stats.inProgress) / stats.total) * 100 : 0
          return (
            <Card key={year} className={selectedYear === year ? "ring-2 ring-primary" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  {year}
                  <Badge variant={year === 2025 ? "default" : "outline"}>{year === 2025 ? "Current" : "Future"}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Total: {stats.total}</div>
                    <div>Planned: {stats.planned}</div>
                    <div>Active: {stats.inProgress}</div>
                    <div>Done: {stats.completed}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">{departments.length} departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">4-Year QMS Plans</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qmsPlans.length}</div>
            <p className="text-xs text-muted-foreground">
              {qmsPlans.filter((p) => p.status === "planned").length} planned initiatives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              {trainingCourses.filter((c) => c.is_mandatory).length} mandatory courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingAssignments.length}</div>
            <p className="text-xs text-muted-foreground">
              {trainingAssignments.filter((a) => a.status === "assigned").length} pending completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="timeline">4-Year Timeline</TabsTrigger>
          <TabsTrigger value="qms">QMS Plans</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* 4-Year Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Strategic Planning Timeline (2025-2028)
              </CardTitle>
              <CardDescription>Multi-year QMS improvement roadmap</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {PLANNING_YEARS.map((year) => {
                  const yearPlans = qmsPlans.filter((p) => p.year === year)
                  return (
                    <div key={year} className="border-l-4 border-primary pl-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-semibold">{year}</h3>
                        <Badge variant="outline">{yearPlans.length} initiatives</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {QUARTERS.map((quarter) => {
                          const quarterPlans = yearPlans.filter((p) => p.quarter === quarter)
                          return (
                            <div key={quarter} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">
                                  Q{quarter} {year}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {quarterPlans.length} plans
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                {quarterPlans.slice(0, 3).map((plan) => (
                                  <div key={plan.id} className="text-sm">
                                    <div className="font-medium truncate">{plan.title}</div>
                                    <div className="flex gap-1 mt-1">
                                      <Badge className={getStatusColor(plan.status)} variant="outline">
                                        {plan.status}
                                      </Badge>
                                      <Badge className={getPriorityColor(plan.priority)} variant="outline">
                                        {plan.priority}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                                {quarterPlans.length > 3 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{quarterPlans.length - 3} more...
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QMS Plans Tab */}
        <TabsContent value="qms" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>QMS Plans for {selectedYear}</CardTitle>
                  <CardDescription>Quality Management System improvement initiatives</CardDescription>
                </div>
                <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quarters</SelectItem>
                    {QUARTERS.map((q) => (
                      <SelectItem key={q} value={q.toString()}>
                        Q{q}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredQMSPlans.map((plan) => (
                  <div key={plan.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">{plan.title}</h4>
                      <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{plan.description}</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <Badge variant="outline">{plan.category}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Priority:</span>
                        <Badge className={getPriorityColor(plan.priority)}>{plan.priority}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Quarter:</span>
                        <span>
                          Q{plan.quarter} {plan.year}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Timeline:</span>
                        <span className="text-right">
                          {new Date(plan.planned_start_date).toLocaleDateString()} -{" "}
                          {new Date(plan.planned_end_date).toLocaleDateString()}
                        </span>
                      </div>
                      {plan.responsible_person && (
                        <div className="flex justify-between">
                          <span>Owner:</span>
                          <span>{plan.responsible_person}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Training Courses</CardTitle>
                <CardDescription>Available training programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trainingCourses.map((course) => (
                    <div key={course.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{course.title}</h4>
                        <div className="flex gap-1">
                          <Badge variant="outline">{course.category}</Badge>
                          {course.is_mandatory && <Badge className="bg-red-100 text-red-800">Mandatory</Badge>}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Duration: {course.duration_hours} hours</span>
                        {course.expiry_months && <span>Expires: {course.expiry_months} months</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Assignments</CardTitle>
                <CardDescription>Current assignments and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trainingAssignments.slice(0, 10).map((assignment) => (
                    <div key={assignment.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{assignment.course_title}</h4>
                          <p className="text-sm text-muted-foreground">{assignment.employee_name}</p>
                        </div>
                        <div className="flex gap-1">
                          <Badge className={getStatusColor(assignment.status)}>{assignment.status}</Badge>
                          <Badge className={getPriorityColor(assignment.priority)}>{assignment.priority}</Badge>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>Manage your organization's employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Hire Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          {employee.first_name} {employee.last_name}
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{employee.department}</Badge>
                        </TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>
                          {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={employee.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {employee.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  4-Year QMS Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {PLANNING_YEARS.map((year) => {
                    const stats = getYearlyStats(year)
                    const progress = stats.total > 0 ? ((stats.completed + stats.inProgress) / stats.total) * 100 : 0
                    return (
                      <div key={year}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{year}</span>
                          <span>
                            {stats.total} initiatives ({Math.round(progress)}% progress)
                          </span>
                        </div>
                        <Progress value={progress} className="h-3" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {departments.map((dept) => {
                    const count = employees.filter((emp) => emp.department === dept).length
                    const percentage = (count / employees.length) * 100
                    return (
                      <div key={dept}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{dept}</span>
                          <span>{count} employees</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Strategic Metrics (2025-2028)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{qmsPlans.length}</div>
                  <div className="text-sm text-muted-foreground">Total QMS Initiatives</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {trainingCourses.reduce((sum, c) => sum + c.duration_hours, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Training Hours Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round((qmsPlans.filter((p) => p.status === "completed").length / qmsPlans.length) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Completion</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {employees.filter((e) => e.is_active).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Team Members</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
