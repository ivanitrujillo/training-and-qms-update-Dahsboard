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
  Download,
  CheckCircle,
  AlertTriangle,
  Users,
  BookOpen,
  Calendar,
  Loader2,
  Database,
} from "lucide-react"
import { parseExcelFile } from "@/lib/excel-parser"
import { db, isNeonConfigured } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

interface ImportResult {
  type: string
  success: boolean
  count: number
  errors: string[]
}

interface ExcelImportProps {
  onDataImported?: () => void
}

export function ExcelImport({ onDataImported }: ExcelImportProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [importResults, setImportResults] = useState<ImportResult[]>([])
  const [activeTab, setActiveTab] = useState("upload")
  const [isDragActive, setIsDragActive] = useState(false)
  const { toast } = useToast()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragActive(false)

      const files = Array.from(e.dataTransfer.files)
      const excelFiles = files.filter(
        (file) => file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".csv"),
      )

      if (excelFiles.length > 0) {
        await processFiles(excelFiles)
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload Excel files (.xlsx, .xls) or CSV files (.csv)",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await processFiles(files)
    }
  }, [])

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    setImportResults([])

    try {
      const results: ImportResult[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(((i + 1) / files.length) * 100)

        try {
          // Parse the Excel file
          const parsedData = await parseExcelFile(file)

          if (parsedData.employees && parsedData.employees.length > 0) {
            // Import employees
            if (isNeonConfigured) {
              const { data, error } = await db.insertEmployees(parsedData.employees)
              results.push({
                type: "Employees",
                success: !error,
                count: parsedData.employees.length,
                errors: error ? [error.toString()] : [],
              })
            } else {
              results.push({
                type: "Employees",
                success: true,
                count: parsedData.employees.length,
                errors: ["Database not configured - data processed but not saved"],
              })
            }
          }

          if (parsedData.trainingAssignments && parsedData.trainingAssignments.length > 0) {
            // Import training assignments
            if (isNeonConfigured) {
              const { data, error } = await db.insertTrainingAssignments(parsedData.trainingAssignments)
              results.push({
                type: "Training Assignments",
                success: !error,
                count: parsedData.trainingAssignments.length,
                errors: error ? [error.toString()] : [],
              })
            } else {
              results.push({
                type: "Training Assignments",
                success: true,
                count: parsedData.trainingAssignments.length,
                errors: ["Database not configured - data processed but not saved"],
              })
            }
          }

          if (parsedData.qmsUpdates && parsedData.qmsUpdates.length > 0) {
            // Import QMS updates
            if (isNeonConfigured) {
              const { data, error } = await db.insertQMSUpdates(parsedData.qmsUpdates)
              results.push({
                type: "QMS Updates",
                success: !error,
                count: parsedData.qmsUpdates.length,
                errors: error ? [error.toString()] : [],
              })
            } else {
              results.push({
                type: "QMS Updates",
                success: true,
                count: parsedData.qmsUpdates.length,
                errors: ["Database not configured - data processed but not saved"],
              })
            }
          }

          if (
            (!parsedData.employees || parsedData.employees.length === 0) &&
            (!parsedData.trainingAssignments || parsedData.trainingAssignments.length === 0) &&
            (!parsedData.qmsUpdates || parsedData.qmsUpdates.length === 0)
          ) {
            results.push({
              type: file.name,
              success: false,
              count: 0,
              errors: ["No valid data found in file. Please check the format and column headers."],
            })
          }
        } catch (fileError) {
          results.push({
            type: file.name,
            success: false,
            count: 0,
            errors: [fileError instanceof Error ? fileError.message : "Failed to process file"],
          })
        }
      }

      setImportResults(results)

      // Show success/error toast
      const successfulImports = results.filter((r) => r.success)
      const failedImports = results.filter((r) => !r.success)

      if (successfulImports.length > 0) {
        const totalRecords = successfulImports.reduce((sum, r) => sum + r.count, 0)
        toast({
          title: "Import Successful",
          description: `Successfully processed ${totalRecords} records across ${successfulImports.length} data types`,
        })

        // Trigger dashboard refresh
        if (onDataImported) {
          onDataImported()
        }

        setActiveTab("results")
      }

      if (failedImports.length > 0) {
        toast({
          title: "Import Issues",
          description: `${failedImports.length} imports had issues. Check the results for details.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const downloadTemplate = (type: string) => {
    let csvContent = ""
    let filename = ""

    switch (type) {
      case "employees":
        csvContent = `email,first_name,last_name,department,position,hire_date
john.doe@company.com,John,Doe,Engineering,Software Engineer,2023-01-15
jane.smith@company.com,Jane,Smith,Marketing,Marketing Specialist,2023-02-01
mike.johnson@company.com,Mike,Johnson,Sales,Sales Representative,2023-01-20
sarah.wilson@company.com,Sarah,Wilson,Quality,QMS Coordinator,2023-03-01
alex.brown@company.com,Alex,Brown,HR,HR Manager,2023-01-10`
        filename = "employees_template.csv"
        break

      case "training":
        csvContent = `employeeEmail,courseTitle,assignedDate,dueDate,priority
john.doe@company.com,Workplace Safety Training,2024-01-15,2024-12-20,high
jane.smith@company.com,Data Privacy & GDPR,2024-01-10,2024-12-15,critical
mike.johnson@company.com,Leadership Development,2024-02-01,2024-12-25,medium
sarah.wilson@company.com,Quality Management Systems,2024-01-20,2024-12-10,high
alex.brown@company.com,HR Compliance Training,2024-02-15,2024-12-12,medium`
        filename = "training_assignments_template.csv"
        break

      case "qms":
        csvContent = `title,description,category,plannedStartDate,plannedEndDate,responsiblePersonEmail,year,quarter,priority
Document Control System Update,Update document management system,system,2025-01-01,2025-03-31,sarah.wilson@company.com,2025,1,high
Process Mapping Review,Review and update process maps,process,2025-04-01,2025-06-30,sarah.wilson@company.com,2025,2,medium
Internal Audit Procedure Revision,Revise internal audit procedures,document,2025-07-01,2025-09-30,sarah.wilson@company.com,2025,3,high
Risk Management Framework,Implement risk management framework,system,2025-10-01,2025-12-31,sarah.wilson@company.com,2025,4,critical`
        filename = "qms_updates_template.csv"
        break

      default:
        return
    }

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Template Downloaded",
      description: `${filename} has been downloaded to your computer`,
    })
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="templates">Download Templates</TabsTrigger>
          <TabsTrigger value="results">Import Results</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Database Status */}
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              {isNeonConfigured ? (
                <span className="text-green-600">✅ Database connected - Uploaded data will be saved</span>
              ) : (
                <span className="text-amber-600">
                  ⚠️ No database configured - Data will be processed but not permanently saved
                </span>
              )}
            </AlertDescription>
          </Alert>

          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Excel Files
              </CardTitle>
              <CardDescription>
                Drag and drop Excel files (.xlsx, .xls) or CSV files to import employee data, training assignments, and
                QMS updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600 font-medium">Drop the files here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 font-medium mb-2">
                      Drag & drop Excel files here, or click to select files
                    </p>
                    <p className="text-sm text-gray-500">Supports .xlsx, .xls, and .csv files</p>
                    <Button asChild className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Select Files
                      </label>
                    </Button>
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Processing files...</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supported Formats */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Data Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-medium">Employees</h3>
                    <p className="text-sm text-gray-500">Employee information and details</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <BookOpen className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-medium">Training Assignments</h3>
                    <p className="text-sm text-gray-500">Training courses and assignments</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Calendar className="h-8 w-8 text-purple-500" />
                  <div>
                    <h3 className="font-medium">QMS Updates</h3>
                    <p className="text-sm text-gray-500">Quality management system plans</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Download Templates</CardTitle>
              <CardDescription>
                Download CSV templates with sample data to ensure proper formatting for your imports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Employees
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Template for importing employee information including names, emails, departments, and positions.
                    </p>
                    <Button onClick={() => downloadTemplate("employees")} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-green-500" />
                      Training Assignments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Template for importing training assignments with courses, due dates, and priorities.
                    </p>
                    <Button onClick={() => downloadTemplate("training")} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      QMS Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Template for importing quality management system update plans and schedules.
                    </p>
                    <Button onClick={() => downloadTemplate("qms")} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Import Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">📋 Column Headers</h4>
                <p className="text-sm text-gray-600">
                  Make sure your Excel/CSV files have the exact column headers as shown in the templates. The system
                  auto-detects data types based on column names.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">📧 Email Matching</h4>
                <p className="text-sm text-gray-600">
                  Training assignments and QMS updates are linked to employees by email address. Make sure employee
                  emails exist before importing assignments.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">📅 Date Format</h4>
                <p className="text-sm text-gray-600">
                  Use YYYY-MM-DD format for dates (e.g., 2024-12-25). Excel date formats are also supported.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">🔄 Multiple Files</h4>
                <p className="text-sm text-gray-600">
                  You can upload multiple files at once. The system will process each file and combine the results.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {importResults.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Import Results</h3>
                  <p className="text-gray-600">Upload some files to see import results here.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {importResults.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        {result.type}
                      </CardTitle>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {result.success ? (
                      <p className="text-green-600">
                        Successfully processed {result.count} {result.type.toLowerCase()} records
                        {result.errors.length > 0 && (
                          <span className="text-amber-600 block mt-1">Note: {result.errors[0]}</span>
                        )}
                      </p>
                    ) : (
                      <div>
                        <p className="text-red-600 mb-2">Import failed:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {result.errors.map((error, errorIndex) => (
                            <li key={errorIndex} className="text-sm text-red-600">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
