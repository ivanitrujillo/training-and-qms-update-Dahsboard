"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Search, Filter, Mail, Clock, CheckCircle, AlertTriangle, Calendar, Send, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sendTrainingReminder, sendBulkTrainingReminders } from "../actions/email-actions"

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
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([])
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [bulkEmailDialogOpen, setBulkEmailDialogOpen] = useState(false)
  const [emailMessage, setEmailMessage] = useState("")
  const [currentAssignment, setCurrentAssignment] = useState<TrainingAssignment | null>(null)
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  // Filter assignments based on search and filters
  const filteredAssignments = trainingAssignments.filter((assignment) => {
    const matchesSearch =
      assignment.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.employee_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.course_title?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEmployee = selectedEmployee === "all" || assignment.employee_id === selectedEmployee
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter

    return matchesSearch && matchesEmployee && matchesStatus
  })

  // Calculate employee statistics
  const getEmployeeStats = (employeeId: string) => {
    const employeeAssignments = trainingAssignments.filter((a) => a.employee_id === employeeId)
    const completed = employeeAssignments.filter((a) => a.status === "completed").length
    const total = employeeAssignments.length
    const overdue = employeeAssignments.filter((a) => {
      const dueDate = new Date(a.due_date)
      const today = new Date()
      return dueDate < today && a.status !== "completed"
    }).length

    return { completed, total, overdue, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }

  // Get status badge variant and label
  const getStatusInfo = (assignment: TrainingAssignment) => {
    const dueDate = new Date(assignment.due_date)
    const today = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (assignment.status === "completed") {
      return { variant: "default" as const, label: "Completed", icon: CheckCircle, color: "text-green-600" }
    } else if (dueDate < today) {
      return { variant: "destructive" as const, label: "Overdue", icon: AlertTriangle, color: "text-red-600" }
    } else if (daysUntilDue <= 7) {
      return { variant: "secondary" as const, label: "Due Soon", icon: Clock, color: "text-orange-600" }
    } else if (assignment.status === "in_progress") {
      return { variant: "secondary" as const, label: "In Progress", icon: Clock, color: "text-blue-600" }
    } else {
      return { variant: "outline" as const, label: "Assigned", icon: Calendar, color: "text-gray-600" }
    }
  }

  // Handle individual email
  const handleSendEmail = async (assignment: TrainingAssignment) => {
    setCurrentAssignment(assignment)
    setEmailMessage(`Hi ${assignment.employee_name?.split(" ")[0] || "there"},

This is a friendly reminder about your upcoming training:

Course: ${assignment.course_title}
Due Date: ${new Date(assignment.due_date).toLocaleDateString()}
Priority: ${assignment.priority}

Please complete this training by the due date. If you have any questions, please don't hesitate to reach out.

Best regards,
Training Team`)
    setEmailDialogOpen(true)
  }

  // Handle bulk email
  const handleBulkEmail = () => {
    if (selectedAssignments.length === 0) {
      toast({
        title: "No Assignments Selected",
        description: "Please select at least one training assignment to send reminders.",
        variant: "destructive",
      })
      return
    }

    setEmailMessage(`Hi there,

This is a reminder about your pending training assignments. Please review and complete the following:

${selectedAssignments
  .map((id) => {
    const assignment = trainingAssignments.find((a) => a.id === id)
    return assignment ? `• ${assignment.course_title} (Due: ${new Date(assignment.due_date).toLocaleDateString()})` : ""
  })
  .filter(Boolean)
  .join("\n")}

Please complete these trainings by their respective due dates. If you have any questions, please don't hesitate to reach out.

Best regards,
Training Team`)
    setBulkEmailDialogOpen(true)
  }

  // Send individual email
  const sendIndividualEmail = async () => {
    if (!currentAssignment) return

    setIsSending(true)
    try {
      const result = await sendTrainingReminder({
        employeeEmail: currentAssignment.employee_email,
        employeeName: currentAssignment.employee_name || "Employee",
        courseTitle: currentAssignment.course_title,
        dueDate: currentAssignment.due_date,
        customMessage: emailMessage,
      })

      if (result.success) {
        toast({
          title: "Email Sent",
          description: `Training reminder sent to ${currentAssignment.employee_name}`,
        })
        setEmailDialogOpen(false)
        setCurrentAssignment(null)
        setEmailMessage("")
      } else {
        throw new Error(result.error || "Failed to send email")
      }
    } catch (error) {
      toast({
        title: "Email Failed",
        description: `Failed to send email: ${error}`,
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Send bulk emails
  const sendBulkEmails = async () => {
    setIsSending(true)
    try {
      const assignments = selectedAssignments
        .map((id) => trainingAssignments.find((a) => a.id === id))
        .filter(Boolean) as TrainingAssignment[]

      const result = await sendBulkTrainingReminders({
        assignments: assignments.map((a) => ({
          employeeEmail: a.employee_email,
          employeeName: a.employee_name || "Employee",
          courseTitle: a.course_title,
          dueDate: a.due_date,
        })),
        customMessage: emailMessage,
      })

      if (result.success) {
        toast({
          title: "Bulk Emails Sent",
          description: `Training reminders sent to ${assignments.length} employees`,
        })
        setBulkEmailDialogOpen(false)
        setSelectedAssignments([])
        setEmailMessage("")
      } else {
        throw new Error(result.error || "Failed to send bulk emails")
      }
    } catch (error) {
      toast({
        title: "Bulk Email Failed",
        description: `Failed to send bulk emails: ${error}`,
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Handle assignment selection
  const handleAssignmentSelect = (assignmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAssignments([...selectedAssignments, assignmentId])
    } else {
      setSelectedAssignments(selectedAssignments.filter((id) => id !== assignmentId))
    }
  }

  // Select all filtered assignments
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssignments(filteredAssignments.map((a) => a.id))
    } else {
      setSelectedAssignments([])
    }
  }

  return (
    <div className="space-y-6">
      {/* Employee Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {employees.slice(0, 4).map((employee) => {
          const stats = getEmployeeStats(employee.id)
          return (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {employee.first_name} {employee.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">{employee.department}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion Rate</span>
                    <span className="font-medium">{stats.completionRate}%</span>
                  </div>
                  <Progress value={stats.completionRate} className="h-2" />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {stats.completed}/{stats.total} completed
                    </span>
                    {stats.overdue > 0 && <span className="text-red-600">{stats.overdue} overdue</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Training Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee name, email, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
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
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedAssignments.length > 0 && (
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{selectedAssignments.length} assignments selected</span>
            <Button onClick={handleBulkEmail} size="sm" className="ml-4">
              <Mail className="h-4 w-4 mr-2" />
              Send Bulk Reminders
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Training Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Training Assignments ({filteredAssignments.length})</span>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedAssignments.length === filteredAssignments.length && filteredAssignments.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Training Assignments Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedEmployee !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "No training assignments have been uploaded yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => {
                const statusInfo = getStatusInfo(assignment)
                const StatusIcon = statusInfo.icon

                return (
                  <div key={assignment.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedAssignments.includes(assignment.id)}
                        onCheckedChange={(checked) => handleAssignmentSelect(assignment.id, checked as boolean)}
                      />

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{assignment.course_title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {assignment.employee_name} • {assignment.employee_email}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`capitalize ${
                                assignment.priority === "critical"
                                  ? "border-red-500 text-red-700"
                                  : assignment.priority === "high"
                                    ? "border-orange-500 text-orange-700"
                                    : assignment.priority === "medium"
                                      ? "border-yellow-500 text-yellow-700"
                                      : "border-green-500 text-green-700"
                              }`}
                            >
                              {assignment.priority}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Assigned:</span>
                            <p className="font-medium">{new Date(assignment.assigned_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Due Date:</span>
                            <p className="font-medium">{new Date(assignment.due_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Department:</span>
                            <p className="font-medium">
                              {employees.find((e) => e.id === assignment.employee_id)?.department || "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Category:</span>
                            <p className="font-medium">{assignment.category || "General"}</p>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleSendEmail(assignment)}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Send Reminder
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Training Reminder</DialogTitle>
            <DialogDescription>
              Send a personalized reminder to {currentAssignment?.employee_name} about their training assignment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email Message</label>
              <Textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={8}
                className="mt-1"
                placeholder="Enter your custom message..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={sendIndividualEmail} disabled={isSending}>
                {isSending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Email Dialog */}
      <Dialog open={bulkEmailDialogOpen} onOpenChange={setBulkEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Bulk Training Reminders</DialogTitle>
            <DialogDescription>
              Send reminders to {selectedAssignments.length} selected employees about their training assignments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email Message</label>
              <Textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={8}
                className="mt-1"
                placeholder="Enter your custom message..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBulkEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={sendBulkEmails} disabled={isSending}>
                {isSending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send {selectedAssignments.length} Emails
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
