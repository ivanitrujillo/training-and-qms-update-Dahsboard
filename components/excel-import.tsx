"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
  Database,
  Users,
  BookOpen,
  Calendar,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { parseEmployeesExcel, parseTrainingAssignmentsExcel, parseQMSUpdatesExcel } from "../excel-parser"
import { db, isNeonConfigured } from "../lib/database"

interface ParsedData {
  employees: any[]
  trainingAssignments: any[]
  qmsPlans: any[]
}

interface ImportResult {
  success: boolean
  message: string
  count?: number
  data?: any[]
}

interface ExcelImportProps {
  onDataImported?: () => void
}

export function ExcelImport({ onDataImported }: ExcelImportProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [importResults, setImportResults] = useState<ImportResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const excelFiles = files.filter((file) => file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))

    if (excelFiles.length > 0) {
      processFiles(excelFiles)
    } else {
      setError("Please upload Excel files (.xlsx or .xls)")
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      processFiles(files)
    }
  }, [])

  const processFiles = async (files: File[]) => {
    setIsProcessing(true)
    setError(null)
    setProgress(0)
    setImportResults([])

    try {
      const results: ImportResult[] = []
      let employees: any[] = []
      let trainingAssignments: any[] = []
      let qmsPlans: any[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileName = file.name.toLowerCase()

        setProgress(((i + 1) / files.length) * 50) // First 50% for parsing

        try {
          if (fileName.includes("employee") || fileName.includes("staff") || fileName.includes("personnel")) {
            const parsed = await parseEmployeesExcel(file)
            employees = [...employees, ...parsed]
            results.push({
              success: true,
              message: `Parsed ${parsed.length} employees from ${file.name}`,
              count: parsed.length,
              data: parsed,
            })
          } else if (fileName.includes("training") || fileName.includes("course") || fileName.includes("assignment")) {
            const parsed = await parseTrainingAssignmentsExcel(file)
            trainingAssignments = [...trainingAssignments, ...parsed]
            results.push({
              success: true,
              message: `Parsed ${parsed.length} training assignments from ${file.name}`,
              count: parsed.length,
              data: parsed,
            })
          } else if (fileName.includes("qms") || fileName.includes("quality") || fileName.includes("plan")) {
            const parsed = await parseQMSUpdatesExcel(file)
            qmsPlans = [...qmsPlans, ...parsed]
            results.push({
              success: true,
              message: `Parsed ${parsed.length} QMS plans from ${file.name}`,
              count: parsed.length,
              data: parsed,
            })
          } else {
            // Try to auto-detect based on content
            try {
              const employeesTest = await parseEmployeesExcel(file)
              if (employeesTest.length > 0) {
                employees = [...employees, ...employeesTest]
                results.push({
                  success: true,
                  message: `Auto-detected and parsed ${employeesTest.length} employees from ${file.name}`,
                  count: employeesTest.length,
                  data: employeesTest,
                })
              }
            } catch {
              results.push({
                success: false,
                message: `Could not determine file type for ${file.name}. Please rename the file to include 'employee', 'training', or 'qms' in the filename.`,
              })
            }
          }
        } catch (fileError) {
          results.push({
            success: false,
            message: `Failed to parse ${file.name}: ${fileError}`,
          })
        }
      }

      setProgress(75) // 75% after parsing

      // Store parsed data
      const newParsedData = { employees, trainingAssignments, qmsPlans }
      setParsedData(newParsedData)
      setImportResults(results)

      // If database is configured, save to database
      if (isNeonConfigured) {
        await saveToDatabase(newParsedData, results)
      }

      setProgress(100)

      const totalParsed = employees.length + trainingAssignments.length + qmsPlans.length
      toast({
        title: "Import Completed",
        description: `Successfully processed ${files.length} files and parsed ${totalParsed} records.`,
      })

      // Notify parent component to refresh data
      if (onDataImported) {
        onDataImported()
      }
    } catch (err) {
      setError("Failed to process files. Please check the format and try again.")
      console.error("Import error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const saveToDatabase = async (data: ParsedData, results: ImportResult[]) => {
    try {
      // Save employees
      if (data.employees.length > 0) {
        const { data: savedEmployees, error: empError } = await db.insertEmployees(
          data.employees.map((emp) => ({
            email: emp.email,
            first_name: emp.firstName,
            last_name: emp.lastName,
            department: emp.department,
            position: emp.position,
            hire_date: emp.hireDate ? new Date(emp.hireDate).toISOString().split("T")[0] : null,
          })),
        )

        if (empError) {
          results.push({
            success: false,
            message: `Database error saving employees: ${empError}`,
          })
        } else {
          results.push({
            success: true,
            message: `Saved ${data.employees.length} employees to database`,
          })
        }
      }

      // Save training assignments
      if (data.trainingAssignments.length > 0) {
        const { data: savedTraining, error: trainError } = await db.insertTrainingAssignments(data.trainingAssignments)

        if (trainError) {
          results.push({
            success: false,
            message: `Database error saving training assignments: ${trainError}`,
          })
        } else {
          results.push({
            success: true,
            message: `Saved ${Array.isArray(savedTraining) ? savedTraining.length : 0} training assignments to database`,
          })
        }
      }

      // Save QMS plans
      if (data.qmsPlans.length > 0) {
        const { data: savedQMS, error: qmsError } = await db.insertQMSUpdates(data.qmsPlans)

        if (qmsError) {
          results.push({
            success: false,
            message: `Database error saving QMS plans: ${qmsError}`,
          })
        } else {
          results.push({
            success: true,
            message: `Saved ${Array.isArray(savedQMS) ? savedQMS.length : 0} QMS plans to database`,
          })
        }
      }
    } catch (dbError) {
      results.push({
        success: false,
        message: `Database connection error: ${dbError}`,
      })
    }
  }

  const downloadTemplate = (type: string) => {
    let csvContent = ""
    let filename = ""

    switch (type) {
      case "employees":
        csvContent = "Email,First Name,Last Name,Department,Position,Hire Date\n"
        csvContent += "john.doe@company.com,John,Doe,Engineering,Software Engineer,2023-01-15\n"
        csvContent += "jane.smith@company.com,Jane,Smith,Marketing,Marketing Manager,2023-02-01\n"
        csvContent += "mike.johnson@company.com,Mike,Johnson,Sales,Sales Representative,2023-03-10\n"
        filename = "employee_template.csv"
        break

      case "training":
        csvContent = "Employee Email,Course Title,Assigned Date,Due Date,Priority\n"
        csvContent += "john.doe@company.com,Security Awareness Training,2024-01-01,2024-12-31,high\n"
        csvContent += "jane.smith@company.com,Data Privacy & GDPR,2024-01-15,2024-06-15,critical\n"
        csvContent += "mike.johnson@company.com,Leadership Development,2024-02-01,2024-08-01,medium\n"
        filename = "training_template.csv"
        break

      case "qms":
        csvContent =
          "Title,Description,Category,Planned Start Date,Planned End Date,Responsible Person Email,Year,Quarter,Priority\n"
        csvContent +=
          "Document Control Update,Update document control procedures,process,2025-01-01,2025-03-31,john.doe@company.com,2025,1,high\n"
        csvContent +=
          "Risk Assessment Review,Annual risk assessment review,system,2025-04-01,2025-06-30,jane.smith@company.com,2025,2,medium\n"
        csvContent +=
          "Training Program Overhaul,Redesign training programs,process,2025-07-01,2025-09-30,mike.johnson@company.com,2025,3,high\n"
        filename = "qms_template.csv"
        break
    }

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Template Downloaded",
      description: `${type} template has been downloaded as ${filename}`,
    })
  }

  const downloadSampleData = () => {
    const sampleData = {
      employees: [
        {
          email: "john.doe@company.com",
          firstName: "John",
          lastName: "Doe",
          department: "Engineering",
          position: "Senior Developer",
          hireDate: "2023-01-15",
        },
        {
          email: "jane.smith@company.com",
          firstName: "Jane",
          lastName: "Smith",
          department: "Marketing",
          position: "Marketing Manager",
          hireDate: "2023-02-01",
        },
      ],
      trainingAssignments: [
        {
          employeeEmail: "john.doe@company.com",
          courseTitle: "Security Awareness Training",
          assignedDate: "2024-01-01",
          dueDate: "2024-12-31",
          priority: "high",
        },
      ],
      qmsPlans: [
        {
          title: "Process Improvement Initiative",
          description: "Improve key business processes",
          category: "process",
          plannedStartDate: "2025-01-01",
          plannedEndDate: "2025-03-31",
          responsiblePersonEmail: "john.doe@company.com",
          year: 2025,
          quarter: 1,
          priority: "high",
        },
      ],
    }

    const dataStr = JSON.stringify(sampleData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "sample-data.json"
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Sample Data Downloaded",
      description: "Sample data has been downloaded as sample-data.json",
    })
  }

  return (
    <div className="space-y-6">
      {/* Database Status */}
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          {isNeonConfigured ? (
            <span className="text-green-600">✅ Database connected - Data will be saved automatically</span>
          ) : (
            <div className="space-y-2">
              <span className="text-amber-600">⚠️ No database configured - Data will be stored locally only</span>
              <div className="text-sm text-muted-foreground">
                To enable database storage, configure your DATABASE_URL environment variable.
              </div>
            </div>
          )}
        </AlertDescription>
      </Alert>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Excel Data
          </CardTitle>
          <CardDescription>
            Upload Excel files containing employee data, training assignments, and QMS plans. Files are auto-detected
            based on filename or content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Drag and drop Excel files here</h3>
            <p className="text-muted-foreground mb-4">
              Supports .xlsx and .xls files. Multiple files can be uploaded at once.
            </p>
            <div className="space-y-2">
              <input
                type="file"
                multiple
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Select Files
                </label>
              </Button>
              <p className="text-xs text-muted-foreground">
                Tip: Name your files with "employee", "training", or "qms" for automatic detection
              </p>
            </div>
          </div>

          {isProcessing && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Processing files...</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Template Downloads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Templates & Samples
          </CardTitle>
          <CardDescription>Download templates and sample data to get started quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Excel Templates</TabsTrigger>
              <TabsTrigger value="samples">Sample Data</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate("employees")}
                  className="flex items-center gap-2 h-auto p-4"
                >
                  <Users className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Employee Template</div>
                    <div className="text-xs text-muted-foreground">CSV format with sample data</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate("training")}
                  className="flex items-center gap-2 h-auto p-4"
                >
                  <BookOpen className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Training Template</div>
                    <div className="text-xs text-muted-foreground">CSV format with sample data</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate("qms")}
                  className="flex items-center gap-2 h-auto p-4"
                >
                  <Calendar className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">QMS Template</div>
                    <div className="text-xs text-muted-foreground">CSV format with sample data</div>
                  </div>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="samples" className="space-y-4">
              <div className="text-center">
                <Button onClick={downloadSampleData} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Complete Sample Dataset
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  JSON format with employees, training assignments, and QMS plans
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Import Results */}
      {importResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Import Results
            </CardTitle>
            <CardDescription>Results from processing your uploaded files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {importResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                      {result.message}
                    </p>
                    {result.count && <p className="text-sm text-muted-foreground">{result.count} records processed</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parsed Data Summary */}
      {parsedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Summary
            </CardTitle>
            <CardDescription>
              {isNeonConfigured
                ? "Data has been saved to the database"
                : "Data is stored locally (no database configured)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{parsedData.employees.length}</div>
                <div className="text-sm text-muted-foreground">Employees</div>
                <Badge variant="secondary" className="mt-2">
                  {isNeonConfigured ? "Saved to DB" : "Local Storage"}
                </Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{parsedData.trainingAssignments.length}</div>
                <div className="text-sm text-muted-foreground">Training Assignments</div>
                <Badge variant="secondary" className="mt-2">
                  {isNeonConfigured ? "Saved to DB" : "Local Storage"}
                </Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{parsedData.qmsPlans.length}</div>
                <div className="text-sm text-muted-foreground">QMS Plans</div>
                <Badge variant="secondary" className="mt-2">
                  {isNeonConfigured ? "Saved to DB" : "Local Storage"}
                </Badge>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => {
                  setParsedData(null)
                  setImportResults([])
                  setError(null)
                }}
                variant="outline"
              >
                Import More Files
              </Button>
              {!isNeonConfigured && (
                <Button onClick={downloadSampleData} variant="outline">
                  Download as JSON
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ExcelImport
