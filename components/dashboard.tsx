"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, BookOpen, Calendar, AlertTriangle, RefreshCw, Target, Database } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { db, isNeonConfigured } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

interface DashboardData {
  employees: any[]
  trainingAssignments: any[]
  qmsUpdates: any[]
  stats: {
    totalEmployees: number
    totalTrainingAssignments: number
    totalQMSUpdates: number
    overdueTraining: number
    upcomingQMS: number
    completionRate: number
  }
}

interface DashboardProps {
  refreshTrigger?: number
}

export function Dashboard({ refreshTrigger }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (isNeonConfigured) {
        // Load real data from database
        const [employeesResult, trainingResult, qmsResult] = await Promise.all([
          db.getEmployees(),
          db.getTrainingAssignments(),
          db.getQMSUpdates(),
        ])

        if (employeesResult.error || trainingResult.error || qmsResult.error) {
          throw new Error("Failed to load data from database")
        }

        const employees = employeesResult.data || []
        const trainingAssignments = trainingResult.data || []
        const qmsUpdates = qmsResult.data || []

        // Calculate stats
        const now = new Date()
        const overdueTraining = trainingAssignments.filter(
          (assignment) => new Date(assignment.due_date) < now && assignment.status !== "completed",
        ).length

        const upcomingQMS = qmsUpdates.filter(
          (update) =>
            new Date(update.planned_start_date) <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) &&
            update.status !== "completed",
        ).length

        const completedTraining = trainingAssignments.filter((assignment) => assignment.status === "completed").length
        const completionRate =
          trainingAssignments.length > 0 ? Math.round((completedTraining / trainingAssignments.length) * 100) : 0

        setData({
          employees,
          trainingAssignments,
          qmsUpdates,
          stats: {
            totalEmployees: employees.length,
            totalTrainingAssignments: trainingAssignments.length,
            totalQMSUpdates: qmsUpdates.length,
            overdueTraining,
            upcomingQMS,
            completionRate,
          },
        })
      } else {
        // Load sample data when no database is configured
        const sampleData = getSampleData()
        setData(sampleData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data")
      // Fallback to sample data on error
      const sampleData = getSampleData()
      setData(sampleData)
    } finally {
      setIsLoading(false)
    }
  }

  const getSampleData = (): DashboardData => {
    const employees = [
      {
        id: 1,
        email: "john.doe@company.com",
        first_name: "John",
        last_name: "Doe",
        department: "Engineering",
        position: "Software Engineer",
      },
      {
        id: 2,
        email: "jane.smith@company.com",
        first_name: "Jane",
        last_name: "Smith",
        department: "Marketing",
        position: "Marketing Manager",
      },
      {
        id: 3,
        email: "mike.johnson@company.com",
        first_name: "Mike",
        last_name: "Johnson",
        department: "Sales",
        position: "Sales Representative",
      },
      {
        id: 4,
        email: "sarah.wilson@company.com",
        first_name: "Sarah",
        last_name: "Wilson",
        department: "Quality",
        position: "QMS Coordinator",
      },
      {
        id: 5,
        email: "alex.brown@company.com",
        first_name: "Alex",
        last_name: "Brown",
        department: "HR",
        position: "HR Manager",
      },
    ]

    const trainingAssignments = [
      {
        id: 1,
        employee_email: "john.doe@company.com",
        course_title: "Security Awareness Training",
        assigned_date: "2024-01-01",
        due_date: "2024-12-31",
        status: "in_progress",
        priority: "high",
      },
      {
        id: 2,
        employee_email: "jane.smith@company.com",
        course_title: "Data Privacy & GDPR",
        assigned_date: "2024-01-15",
        due_date: "2024-06-15",
        status: "completed",
        priority: "critical",
      },
      {
        id: 3,
        employee_email: "mike.johnson@company.com",
        course_title: "Leadership Development",
        assigned_date: "2024-02-01",
        due_date: "2024-08-01",
        status: "overdue",
        priority: "medium",
      },
      {
        id: 4,
        employee_email: "sarah.wilson@company.com",
        course_title: "Quality Management Systems",
        assigned_date: "2024-01-20",
        due_date: "2024-12-10",
        status: "in_progress",
        priority: "high",
      },
      {
        id: 5,
        employee_email: "alex.brown@company.com",
        course_title: "HR Compliance Training",
        assigned_date: "2024-02-15",
        due_date: "2024-12-12",
        status: "not_started",
        priority: "medium",
      },
    ]

    const qmsUpdates = [
      {
        id: 1,
        title: "Document Control System Update",
        description: "Update document management system",
        category: "system",
        planned_start_date: "2025-01-01",
        planned_end_date: "2025-03-31",
        responsible_person_email: "sarah.wilson@company.com",
        status: "planned",
        priority: "high",
      },
      {
        id: 2,
        title: "Process Mapping Review",
        description: "Review and update process maps",
        category: "process",
        planned_start_date: "2025-04-01",
        planned_end_date: "2025-06-30",
        responsible_person_email: "sarah.wilson@company.com",
        status: "planned",
        priority: "medium",
      },
      {
        id: 3,
        title: "Internal Audit Procedure Revision",
        description: "Revise internal audit procedures",
        category: "document",
        planned_start_date: "2025-07-01",
        planned_end_date: "2025-09-30",
        responsible_person_email: "sarah.wilson@company.com",
        status: "planned",
        priority: "high",
      },
    ]

    return {
      employees,
      trainingAssignments,
      qmsUpdates,
      stats: {
        totalEmployees: employees.length,
        totalTrainingAssignments: trainingAssignments.length,
        totalQMSUpdates: qmsUpdates.length,
        overdueTraining: trainingAssignments.filter((t) => t.status === "overdue").length,
        upcomingQMS: qmsUpdates.filter((q) => q.status === "planned").length,
        completionRate: Math.round(
          (trainingAssignments.filter((t) => t.status === "completed").length / trainingAssignments.length) * 100,
        ),
      },
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [refreshTrigger])

  const handleRefresh = () => {
    loadDashboardData()
    toast({
      title: "Dashboard Refreshed",
      description: "Data has been reloaded from the database",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button onClick={handleRefresh} variant="outline" size="sm" className="ml-2 bg-transparent">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No data available. Please import some data first.</AlertDescription>
      </Alert>
    )
  }

  // Prepare chart data
  const departmentData = data.employees.reduce(
    (acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.entries(departmentData).map(([department, count]) => ({
    department,
    count,
  }))

  const trainingStatusData = data.trainingAssignments.reduce(
    (acc, assignment) => {
      acc[assignment.status] = (acc[assignment.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.entries(trainingStatusData).map(([status, count]) => ({
    name: status.replace("_", " ").toUpperCase(),
    value: count,
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training & QMS Dashboard</h1>
          <p className="text-gray-600">Monitor training progress and quality management updates</p>
        </div>
        <div className="flex items-center gap-2">
          <Alert className="p-2">
            <Database className="h-4 w-4" />
            <AlertDescription className="text-xs">{isNeonConfigured ? "Live Data" : "Sample Data"}</AlertDescription>
          </Alert>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active employees in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalTrainingAssignments}</div>
            <p className="text-xs text-muted-foreground">{data.stats.overdueTraining} overdue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QMS Updates</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalQMSUpdates}</div>
            <p className="text-xs text-muted-foreground">{data.stats.upcomingQMS} upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.completionRate}%</div>
            <Progress value={data.stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Employees by Department</CardTitle>
            <CardDescription>Distribution of employees across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Employees",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Status Distribution</CardTitle>
            <CardDescription>Current status of all training assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Assignments",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="training" className="space-y-4">
        <TabsList>
          <TabsTrigger value="training">Training Assignments</TabsTrigger>
          <TabsTrigger value="qms">QMS Updates</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Recent Training Assignments</CardTitle>
              <CardDescription>Latest training assignments and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.trainingAssignments.slice(0, 10).map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{assignment.course_title}</h4>
                      <p className="text-sm text-gray-600">{assignment.employee_email}</p>
                      <p className="text-xs text-gray-500">Due: {assignment.due_date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          assignment.status === "completed"
                            ? "default"
                            : assignment.status === "overdue"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {assignment.status?.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{assignment.priority}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qms">
          <Card>
            <CardHeader>
              <CardTitle>QMS Updates</CardTitle>
              <CardDescription>Quality management system update plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.qmsUpdates.map((update) => (
                  <div key={update.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{update.title}</h4>
                      <p className="text-sm text-gray-600">{update.description}</p>
                      <p className="text-xs text-gray-500">
                        {update.planned_start_date} - {update.planned_end_date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{update.category}</Badge>
                      <Badge
                        variant={
                          update.priority === "critical"
                            ? "destructive"
                            : update.priority === "high"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {update.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Employees</CardTitle>
              <CardDescription>All employees in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {employee.first_name} {employee.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">{employee.email}</p>
                      <p className="text-xs text-gray-500">{employee.position}</p>
                    </div>
                    <Badge variant="outline">{employee.department}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
