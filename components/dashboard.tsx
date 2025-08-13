"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload,
  User,
  Database,
  RefreshCw,
} from "lucide-react"
import { ExcelImport } from "./excel-import"
import { EmployeeTrainingView } from "./employee-training-view"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { db, isNeonConfigured } from "../lib/database"
import { useToast } from "@/hooks/use-toast"

// Sample data for demonstration (fallback when no real data)
const sampleEmployees = [
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
    position: "Marketing Specialist",
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

const sampleTrainingAssignments = [
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
    duration_hours: 4,
    is_mandatory: true,
    category: "Safety",
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
    duration_hours: 2,
    is_mandatory: true,
    category: "Compliance",
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
    duration_hours: 8,
    is_mandatory: false,
    category: "Professional Development",
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
    duration_hours: 6,
    is_mandatory: true,
    category: "Quality",
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
    duration_hours: 5,
    is_mandatory: false,
    category: "Professional Development",
  },
]

// Sample QMS data for four years (2025-2028)
const sampleQMSData = [
  // 2025
  {
    id: "1",
    title: "Document Control System Update",
    year: 2025,
    quarter: 1,
    status: "planned",
    category: "system",
    progress: 0,
  },
  {
    id: "2",
    title: "Process Mapping Review",
    year: 2025,
    quarter: 2,
    status: "planned",
    category: "process",
    progress: 0,
  },
  {
    id: "3",
    title: "Internal Audit Procedure Revision",
    year: 2025,
    quarter: 3,
    status: "planned",
    category: "document",
    progress: 0,
  },
  {
    id: "4",
    title: "Risk Management Framework",
    year: 2025,
    quarter: 4,
    status: "planned",
    category: "system",
    progress: 0,
  },

  // 2026
  {
    id: "5",
    title: "Supplier Quality Management",
    year: 2026,
    quarter: 1,
    status: "planned",
    category: "process",
    progress: 0,
  },
  {
    id: "6",
    title: "Customer Feedback System",
    year: 2026,
    quarter: 2,
    status: "planned",
    category: "system",
    progress: 0,
  },
  {
    id: "7",
    title: "Training Management Overhaul",
    year: 2026,
    quarter: 3,
    status: "planned",
    category: "process",
    progress: 0,
  },
  {
    id: "8",
    title: "Compliance Monitoring System",
    year: 2026,
    quarter: 4,
    status: "planned",
    category: "system",
    progress: 0,
  },

  // 2027
  {
    id: "9",
    title: "Digital Transformation Initiative",
    year: 2027,
    quarter: 1,
    status: "planned",
    category: "system",
    progress: 0,
  },
  {
    id: "10",
    title: "Sustainability Integration",
    year: 2027,
    quarter: 2,
    status: "planned",
    category: "process",
    progress: 0,
  },
  {
    id: "11",
    title: "Advanced Analytics Implementation",
    year: 2027,
    quarter: 3,
    status: "planned",
    category: "system",
    progress: 0,
  },
  {
    id: "12",
    title: "Stakeholder Engagement Review",
    year: 2027,
    quarter: 4,
    status: "planned",
    category: "process",
    progress: 0,
  },

  // 2028
  {
    id: "13",
    title: "AI-Powered Quality Insights",
    year: 2028,
    quarter: 1,
    status: "planned",
    category: "system",
    progress: 0,
  },
  {
    id: "14",
    title: "Global Standards Harmonization",
    year: 2028,
    quarter: 2,
    status: "planned",
    category: "process",
    progress: 0,
  },
  {
    id: "15",
    title: "Next-Gen Audit Framework",
    year: 2028,
    quarter: 3,
    status: "planned",
    category: "system",
    progress: 0,
  },
  {
    id: "16",
    title: "Strategic Review & Planning",
    year: 2028,
    quarter: 4,
    status: "planned",
    category: "process",
    progress: 0,
  },
]

interface DashboardProps {
  employees?: any[]
  trainingAssignments?: any[]
  qmsPlans?: any[]
}

export function Dashboard({
  employees: propEmployees = [],
  trainingAssignments: propTrainingAssignments = [],
  qmsPlans: propQmsPlans = [],
}: DashboardProps) {
  const [selectedYear, setSelectedYear] = useState(2025)
  const [selectedQuarter, setSelectedQuarter] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [employees, setEmployees] = useState(propEmployees)
  const [trainingAssignments, setTrainingAssignments] = useState(propTrainingAssignments)
  const [qmsPlans, setQmsPlans] = useState(propQmsPlans)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const { toast } = useToast()

  // Load data from database on component mount
  useEffect(() => {
    loadDataFromDatabase()
  }, [])

  const loadDataFromDatabase = async () => {
    if (!isNeonConfigured) {
      // Use sample data when no database is configured
      setEmployees(sampleEmployees)
      setTrainingAssignments(sampleTrainingAssignments)
      setQmsPlans(sampleQMSData)
      return
    }

    setIsLoading(true)
    try {
      // Load employees
      const { data: employeesData, error: employeesError } = await db.getEmployees()
      if (employeesError) {
        console.error("Error loading employees:", employeesError)
        toast({
          title: "Database Error",
          description: "Failed to load employees from database",
          variant: "destructive",
        })
      } else if (employeesData && employeesData.length > 0) {
        setEmployees(employeesData)
      } else {
        // Use sample data if no real data
        setEmployees(sampleEmployees)
      }

      // Load training courses
      const { data: coursesData, error: coursesError } = await db.getTrainingCourses()
      if (coursesError) {
        console.error("Error loading training courses:", coursesError)
      }

      // For now, use sample training assignments since we don't have a direct query for assignments with employee details
      // In a real implementation, you'd have a proper join query
      setTrainingAssignments(sampleTrainingAssignments)
      setQmsPlans(sampleQMSData)

      setLastRefresh(new Date())

      if (employeesData && employeesData.length > 0) {
        toast({
          title: "Data Loaded",
          description: `Loaded ${employeesData.length} employees from database`,
        })
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Database Error",
        description: "Failed to connect to database. Using sample data.",
        variant: "destructive",
      })
      // Fallback to sample data
      setEmployees(sampleEmployees)
      setTrainingAssignments(sampleTrainingAssignments)
      setQmsPlans(sampleQMSData)
    } finally {
      setIsLoading(false)
    }
  }

  // Use loaded data or fallback to sample data
  const displayEmployees = employees.length > 0 ? employees : sampleEmployees
  const displayTrainingAssignments = trainingAssignments.length > 0 ? trainingAssignments : sampleTrainingAssignments
  const displayQMSPlans = qmsPlans.length > 0 ? qmsPlans : sampleQMSData

  // Calculate statistics
  const totalEmployees = displayEmployees.length
  const totalTrainings = displayTrainingAssignments.length
  const completedTrainings = displayTrainingAssignments.filter((t) => t.status === "completed").length
  const overdueTrainings = displayTrainingAssignments.filter((t) => {
    const today = new Date()
    const dueDate = new Date(t.due_date)
    return dueDate < today && t.status !== "completed"
  }).length

  const completionRate = totalTrainings > 0 ? Math.round((completedTrainings / totalTrainings) * 100) : 0

  // Filter QMS plans by selected year and quarter
  const filteredQMSPlans = displayQMSPlans.filter((plan) => {
    if (plan.year !== selectedYear) return false
    if (selectedQuarter && plan.quarter !== selectedQuarter) return false
    return true
  })

  // Calculate QMS statistics for selected year
  const yearQMSPlans = displayQMSPlans.filter((plan) => plan.year === selectedYear)
  const completedQMS = yearQMSPlans.filter((plan) => plan.status === "completed").length
  const inProgressQMS = yearQMSPlans.filter((plan) => plan.status === "in_progress").length
  const plannedQMS = yearQMSPlans.filter((plan) => plan.status === "planned").length

  // Chart data
  const trainingProgressData = [
    { month: "Jan", completed: 45, assigned: 60 },
    { month: "Feb", completed: 52, assigned: 65 },
    { month: "Mar", completed: 48, assigned: 58 },
    { month: "Apr", completed: 61, assigned: 70 },
    { month: "May", completed: 55, assigned: 62 },
    { month: "Jun", completed: 67, assigned: 75 },
  ]

  const departmentData = [
    { department: "Engineering", employees: 25, trainings: 45 },
    { department: "Marketing", employees: 12, trainings: 28 },
    { department: "Sales", employees: 18, trainings: 32 },
    { department: "Quality", employees: 8, trainings: 24 },
    { department: "HR", employees: 6, trainings: 18 },
  ]

  const statusDistribution = [
    { name: "Completed", value: completedTrainings, color: "#10b981" },
    {
      name: "In Progress",
      value: displayTrainingAssignments.filter((t) => t.status === "in_progress").length,
      color: "#3b82f6",
    },
    {
      name: "Assigned",
      value: displayTrainingAssignments.filter((t) => t.status === "assigned").length,
      color: "#f59e0b",
    },
    { name: "Overdue", value: overdueTrainings, color: "#ef4444" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Training & QMS Dashboard</h1>
              <p className="text-gray-600">Manage employee training and quality management systems</p>
            </div>
            <div className="flex items-center gap-4">
              {isNeonConfigured && (
                <div className="text-sm text-muted-foreground">Last updated: {lastRefresh.toLocaleTimeString()}</div>
              )}
              <Button onClick={loadDataFromDatabase} disabled={isLoading} variant="outline" size="sm">
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Database Status Alert */}
        <Alert className="mb-6">
          <Database className="h-4 w-4" />
          <AlertDescription>
            {isNeonConfigured ? (
              <span className="text-green-600">✅ Database connected - Showing live data from your database</span>
            ) : (
              <div className="space-y-2">
                <span className="text-amber-600">⚠️ No database configured - Showing sample data</span>
                <div className="text-sm text-muted-foreground">
                  Configure DATABASE_URL environment variable to connect to your database and see uploaded data.
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Dashboard</TabsTrigger>
            <TabsTrigger value="employee-training">Employee Training</TabsTrigger>
            <TabsTrigger value="four-year-timeline">Four-Year Timeline</TabsTrigger>
            <TabsTrigger value="import">Import Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalEmployees}</div>
                  <p className="text-xs text-muted-foreground">{isNeonConfigured ? "From database" : "Sample data"}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Training Assignments</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTrainings}</div>
                  <p className="text-xs text-muted-foreground">Total assignments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completionRate}%</div>
                  <Progress value={completionRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Training</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{overdueTrainings}</div>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Training Progress</CardTitle>
                  <CardDescription>Monthly training completion vs assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      completed: { label: "Completed", color: "hsl(var(--chart-1))" },
                      assigned: { label: "Assigned", color: "hsl(var(--chart-2))" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trainingProgressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="completed" stroke="var(--color-completed)" strokeWidth={2} />
                        <Line type="monotone" dataKey="assigned" stroke="var(--color-assigned)" strokeWidth={2} />
                      </LineChart>
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
                      completed: { label: "Completed", color: "#10b981" },
                      inProgress: { label: "In Progress", color: "#3b82f6" },
                      assigned: { label: "Assigned", color: "#f59e0b" },
                      overdue: { label: "Overdue", color: "#ef4444" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Department Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Department Overview</CardTitle>
                <CardDescription>Training assignments by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    employees: { label: "Employees", color: "hsl(var(--chart-1))" },
                    trainings: { label: "Trainings", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="employees" fill="var(--color-employees)" />
                      <Bar dataKey="trainings" fill="var(--color-trainings)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employee-training" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Employee Training Management</h2>
            </div>
            <EmployeeTrainingView employees={displayEmployees} trainingAssignments={displayTrainingAssignments} />
          </TabsContent>

          <TabsContent value="four-year-timeline" className="space-y-6">
            {/* Year Selection */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Four-Year QMS Timeline (2025-2028)</h2>
              <div className="flex gap-2">
                {[2025, 2026, 2027, 2028].map((year) => (
                  <Button
                    key={year}
                    variant={selectedYear === year ? "default" : "outline"}
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quarter Filter */}
            <div className="flex gap-2">
              <Button
                variant={selectedQuarter === null ? "default" : "outline"}
                onClick={() => setSelectedQuarter(null)}
              >
                All Quarters
              </Button>
              {[1, 2, 3, 4].map((quarter) => (
                <Button
                  key={quarter}
                  variant={selectedQuarter === quarter ? "default" : "outline"}
                  onClick={() => setSelectedQuarter(quarter)}
                >
                  Q{quarter}
                </Button>
              ))}
            </div>

            {/* Year Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{yearQMSPlans.length}</div>
                  <p className="text-xs text-muted-foreground">For {selectedYear}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{completedQMS}</div>
                  <p className="text-xs text-muted-foreground">Finished projects</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{inProgressQMS}</div>
                  <p className="text-xs text-muted-foreground">Active projects</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Planned</CardTitle>
                  <Calendar className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-600">{plannedQMS}</div>
                  <p className="text-xs text-muted-foreground">Future projects</p>
                </CardContent>
              </Card>
            </div>

            {/* QMS Plans Grid */}
            <div className="grid gap-4">
              {filteredQMSPlans.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No QMS Plans Found</h3>
                      <p className="text-muted-foreground">
                        No QMS plans found for {selectedYear}
                        {selectedQuarter ? ` Q${selectedQuarter}` : ""}.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredQMSPlans.map((plan) => (
                  <Card key={plan.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{plan.title}</h3>
                            <Badge variant="outline">Q{plan.quarter}</Badge>
                            <Badge
                              variant={
                                plan.status === "completed"
                                  ? "default"
                                  : plan.status === "in_progress"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {plan.status.replace("_", " ")}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Category</p>
                              <p className="font-medium capitalize">{plan.category}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Year</p>
                              <p className="font-medium">{plan.year}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Progress</p>
                              <div className="flex items-center gap-2">
                                <Progress value={plan.progress || 0} className="flex-1" />
                                <span className="text-sm font-medium">{plan.progress || 0}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Upload className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Import Data</h2>
            </div>
            <ExcelImport onDataImported={loadDataFromDatabase} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Dashboard
