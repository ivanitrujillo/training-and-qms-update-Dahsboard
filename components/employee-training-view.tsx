"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, BookOpen, Search, Filter, Mail, Calendar, AlertTriangle, CheckCircle, Clock, User } from "lucide-react"
import { db, isNeonConfigured } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

interface Employee {
  id: string
  email: string
  first_name: string
  last_name: string
  department: string
  position: string
}

interface TrainingAssignment {
  id: string
  employee_id: string
  course_title: string
  assigned_date: string
  due_date: string
  status: string
  priority: string
  employee_email: string
  employee_name: string
}

interface EmployeeTrainingViewProps {
  employees?: Employee[]
  trainingAssignments?: TrainingAssignment[]
}

export function EmployeeTrainingView({
  employees: propEmployees = [],
  trainingAssignments: propTrainingAssignments = [],
}: EmployeeTrainingViewProps) {
  const [employees, setEmployees] = useState<Employee[]>(propEmployees)
  const [trainingAssignments, setTrainingAssignments] = useState<TrainingAssignment[]>(propTrainingAssignments)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Sample data for when no database is configured
  const sampleEmployees: Employee[] = [
    {
      id: "1",
      email: "john.doe@company.com",
      first_name: "John",
      last_name: "Doe",
      department: "Engineering",
      position: "Software Engineer",
    },
    {
      id: "2",
      email: "jane.smith@company.com",
      first_name: "Jane",
      last_name: "Smith",
      department: "Marketing",
      position: "Marketing Manager",
    },
    {
      id: "3",
      email: "mike.johnson@company.com",
      first_name: "Mike",
      last_name: "Johnson",
      department: "Sales",
      position: "Sales Representative",
    },
    {
      id: "4",
      email: "sarah.wilson@company.com",
      first_name: "Sarah",
      last_name: "Wilson",
      department: "Quality",
      position: "QMS Coordinator",
    },
    {
      id: "5",
      email: "alex.brown@company.com",
      first_name: "Alex",
      last_name: "Brown",
      department: "HR",
      position: "HR Manager",
    },
  ]

  const sampleTrainingAssignments: TrainingAssignment[] = [
    {
      id: "1",
      employee_id: "1",
      course_title: "Workplace Safety Training",
      assigned_date: "2024-01-15",
      due_date: "2024-12-20",
      status: "assigned",
      priority: "high",
      employee_email: "john.doe@company.com",
      employee_name: "John Doe",
    },
    {
      id: "2",
      employee_id: "2",
      course_title: "Data Privacy & GDPR",
      assigned_date: "2024-01-10",
      due_date: "2024-12-15",
      status: "in_progress",
      priority: "critical",
      employee_email: "jane.smith@company.com",
      employee_name: "Jane Smith",
    },
    {
      id: "3",
      employee_id: "3",
      course_title: "Leadership Development",
      assigned_date: "2024-02-01",
      due_date: "2024-12-25",
      status: "assigned",
      priority: "medium",
      employee_email: "mike.johnson@company.com",
      employee_name: "Mike Johnson",
    },
    {
      id: "4",
      employee_id: "4",
      course_title: "Quality Management Systems",
      assigned_date: "2024-01-20",
      due_date: "2024-12-10",
      status: "completed",
      priority: "high",
      employee_email: "sarah.wilson@company.com",
      employee_name: "Sarah Wilson",
    },
    {
      id: "5",
      employee_id: "1",
      course_title: "Project Management Fundamentals",
      assigned_date: "2024-02-15",
      due_date: "2024-12-12",
      status: "overdue",
      priority: "medium",
      employee_email: "john.doe@company.com",
      employee_name: "John Doe",
    },
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!isNeonConfigured) {
      setEmployees(sampleEmployees)
      setTrainingAssignments(sampleTrainingAssignments)
      return
    }

    setIsLoading(true)
    try {
      const [employeesResult, assignmentsResult] = await Promise.all([db.getEmployees(), db.getTrainingAssignments()])

      if (employeesResult.data) {
        setEmployees(employeesResult.data)
      }

      if (assignmentsResult.data) {
        setTrainingAssignments(assignmentsResult.data)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error Loading Data",
        description: "Failed to load employee and training data. Using sample data.",
        variant: "destructive",
      })
      // Fallback to sample data
      setEmployees(sampleEmployees)
      setTrainingAssignments(sampleTrainingAssignments)
    } finally {
      setIsLoading(false)
    }
  }

  // Use loaded data or fallback to sample data
  const displayEmployees = employees.length > 0 ? employees : sampleEmployees
  const displayTrainingAssignments = trainingAssignments.length > 0 ? trainingAssignments : sampleTrainingAssignments

  // Filter employees based on search and department
  const filteredEmployees = displayEmployees.filter((employee) => {
    const matchesSearch =
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter

    return matchesSearch && matchesDepartment
  })

  // Filter training assignments
  const filteredTrainingAssignments = displayTrainingAssignments.filter((assignment) => {
    const matchesSearch =
      assignment.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.employee_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.employee_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Get unique departments
  const departments = Array.from(new Set(displayEmployees.map((emp) => emp.department)))

  // Get training assignments for a specific employee
  const getEmployeeTrainingAssignments = (employeeId: string) => {
    return displayTrainingAssignments.filter((assignment) => assignment.employee_id === employeeId)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in_progress":
        return "secondary"
      case "overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive"
      case "high":
        return "default"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee training data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Training Management</h2>
          <p className="text-gray-600">Manage employee training assignments and track progress</p>
        </div>
        <Alert className="w-auto">
          <User className="h-4 w-4" />
          <AlertDescription className="text-xs">{isNeonConfigured ? "Live Data" : "Sample Data"}</AlertDescription>
        </Alert>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees or courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Training Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employees ({filteredEmployees.length})
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Training Assignments ({filteredTrainingAssignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <div className="grid gap-4">
            {filteredEmployees.map((employee) => {
              const employeeAssignments = getEmployeeTrainingAssignments(employee.id)
              const completedCount = employeeAssignments.filter((a) => a.status === "completed").length
              const overdueCount = employeeAssignments.filter((a) => a.status === "overdue").length
              const inProgressCount = employeeAssignments.filter((a) => a.status === "in_progress").length

              return (
                <Card key={employee.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {employee.first_name} {employee.last_name}
                            </h3>
                            <p className="text-gray-600">{employee.position}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{employee.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Department</p>
                            <Badge variant="outline">{employee.department}</Badge>
                          </div>
                        </div>

                        {/* Training Summary */}
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Training Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{employeeAssignments.length}</div>
                              <div className="text-xs text-gray-500">Total</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                              <div className="text-xs text-gray-500">Completed</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-500">{inProgressCount}</div>
                              <div className="text-xs text-gray-500">In Progress</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
                              <div className="text-xs text-gray-500">Overdue</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Send Reminder
                        </Button>
                      </div>
                    </div>

                    {/* Recent Training Assignments */}
                    {employeeAssignments.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium mb-3">Recent Training Assignments</h4>
                        <div className="space-y-2">
                          {employeeAssignments.slice(0, 3).map((assignment) => (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div className="flex items-center gap-2">
                                {getStatusIcon(assignment.status)}
                                <span className="text-sm font-medium">{assignment.course_title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={getStatusBadgeVariant(assignment.status)} className="text-xs">
                                  {assignment.status.replace("_", " ").toUpperCase()}
                                </Badge>
                                <span className="text-xs text-gray-500">Due: {assignment.due_date}</span>
                              </div>
                            </div>
                          ))}
                          {employeeAssignments.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{employeeAssignments.length - 3} more assignments
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="grid gap-4">
            {filteredTrainingAssignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{assignment.course_title}</h3>
                          <p className="text-gray-600">{assignment.employee_name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Employee Email</p>
                          <p className="font-medium">{assignment.employee_email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Assigned Date</p>
                          <p className="font-medium">{assignment.assigned_date}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Due Date</p>
                          <p className="font-medium">{assignment.due_date}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(assignment.status)}
                        <Badge variant={getStatusBadgeVariant(assignment.status)}>
                          {assignment.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <Badge variant={getPriorityBadgeVariant(assignment.priority)}>
                        {assignment.priority.toUpperCase()}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
