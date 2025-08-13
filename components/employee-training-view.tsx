"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Filter, Mail, Calendar, Clock, AlertTriangle, CheckCircle, User, BookOpen, Send } from "lucide-react"
import { sendTrainingReminder, sendBulkTrainingReminders } from "../actions/email-actions"
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
  duration_hours?: number
  is_mandatory?: boolean
  category?: string
}

interface EmployeeTrainingViewProps {
  employees: Employee[]
  trainingAssignments: TrainingAssignment[]
}

export function EmployeeTrainingView({ employees, trainingAssignments }: EmployeeTrainingViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([])
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const { toast } = useToast()

  // Get unique departments
  const departments = useMemo(() => {
    const depts = [...new Set(employees.map((emp) => emp.department))]
    return depts.sort()
  }, [employees])

  // Filter and search training assignments
  const filteredAssignments = useMemo(() => {
    return trainingAssignments.filter((assignment) => {
      const employee = employees.find((emp) => emp.id === assignment.employee_id)
      if (!employee) return false

      const matchesSearch =
        employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.course_title.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || assignment.status === statusFilter
      const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
      const matchesPriority = priorityFilter === "all" || assignment.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesDepartment && matchesPriority
    })
  }, [trainingAssignments, employees, searchTerm, statusFilter, departmentFilter, priorityFilter])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredAssignments.length
    const completed = filteredAssignments.filter((a) => a.status === "completed").length
    const inProgress = filteredAssignments.filter((a) => a.status === "in_progress").length
    const assigned = filteredAssignments.filter((a) => a.status === "assigned").length
    const overdue = filteredAssignments.filter((a) => {
      const today = new Date()
      const dueDate = new Date(a.due_date)
      return dueDate < today && a.status !== "completed"
    }).length

    return { total, completed, inProgress, assigned, overdue }
  }, [filteredAssignments])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "assigned":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const isOverdue = (dueDate: string, status: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    return due < today && status !== "completed"
  }

  const handleSendReminder = async (assignment: TrainingAssignment) => {
    const employee = employees.find((emp) => emp.id === assignment.employee_id)
    if (!employee) return

    setIsSendingEmail(true)
    try {
      const result = await sendTrainingReminder({
        employeeName: `${employee.first_name} ${employee.last_name}`,
        employeeEmail: employee.email,
        courseTitle: assignment.course_title,
        dueDate: assignment.due_date,
        priority: assignment.priority,
      })

      if (result.success) {
        toast({
          title: "Reminder Sent",
          description: `Training reminder sent to ${employee.first_name} ${employee.last_name}`,
        })
      } else {
        toast({
          title: "Failed to Send",
          description: result.error || "Failed to send reminder",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleBulkReminders = async () => {
    if (selectedAssignments.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select training assignments to send reminders for",
        variant: "destructive",
      })
      return
    }

    setIsSendingEmail(true)
    try {
      const reminders = selectedAssignments
        .map((assignmentId) => {
          const assignment = trainingAssignments.find((a) => a.id === assignmentId)
          const employee = employees.find((emp) => emp.id === assignment?.employee_id)

          if (!assignment || !employee) return null

          return {
            employeeName: `${employee.first_name} ${employee.last_name}`,
            employeeEmail: employee.email,
            courseTitle: assignment.course_title,
            dueDate: assignment.due_date,
            priority: assignment.priority,
          }
        })
        .filter(Boolean) as any[]

      const result = await sendBulkTrainingReminders(reminders)

      if (result.success) {
        toast({
          title: "Reminders Sent",
          description: `Sent ${reminders.length} training reminders`,
        })
        setSelectedAssignments([])
      } else {
        toast({
          title: "Failed to Send",
          description: result.error || "Failed to send bulk reminders",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send bulk reminders",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const toggleAssignmentSelection = (assignmentId: string) => {
    setSelectedAssignments((prev) =>
      prev.includes(assignmentId) ? prev.filter((id) => id !== assignmentId) : [...prev, assignmentId],
    )
  }

  const toggleSelectAll = () => {
    if (selectedAssignments.length === filteredAssignments.length) {
      setSelectedAssignments([])
    } else {
      setSelectedAssignments(filteredAssignments.map((a) => a.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.assigned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search employees or courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

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

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleBulkReminders}
              disabled={selectedAssignments.length === 0 || isSendingEmail}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Reminders ({selectedAssignments.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Training Assignments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Training Assignments</CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {filteredAssignments.length} of {trainingAssignments.length} assignments
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>No training assignments found matching your filters.</AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedAssignments.length === filteredAssignments.length}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => {
                    const employee = employees.find((emp) => emp.id === assignment.employee_id)
                    if (!employee) return null

                    const overdue = isOverdue(assignment.due_date, assignment.status)

                    return (
                      <TableRow key={assignment.id} className={overdue ? "bg-red-50" : ""}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedAssignments.includes(assignment.id)}
                            onChange={() => toggleAssignmentSelection(assignment.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {employee.first_name} {employee.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">{employee.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{assignment.course_title}</div>
                            {assignment.category && (
                              <div className="text-sm text-muted-foreground">{assignment.category}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(assignment.status)}>
                            {assignment.status.replace("_", " ")}
                          </Badge>
                          {overdue && <Badge className="ml-1 bg-red-100 text-red-800">Overdue</Badge>}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(assignment.priority)}>{assignment.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(assignment.due_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendReminder(assignment)}
                            disabled={isSendingEmail}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Remind
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
