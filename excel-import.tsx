"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Database } from "lucide-react"
import { parseEmployeesExcel, parseTrainingAssignmentsExcel, parseQMSUpdatesExcel } from "./excel-parser"
import { db, isNeonConfigured } from "./lib/database"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ImportResult {
  success: boolean
  message: string
  count?: number
}

export default function ExcelImport() {
  const [isUploading, setIsUploading] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])
  const [localData, setLocalData] = useState<any>({
    employees: [],
    trainingAssignments: [],
    qmsUpdates: [],
  })

  const handleEmployeesImport = async (file: File) => {
    setIsUploading(true)
    try {
      const employees = await parseEmployeesExcel(file)

      if (!isNeonConfigured) {
        // Store in local state when database is not configured
        setLocalData((prev) => ({
          ...prev,
          employees: [...prev.employees, ...employees],
        }))

        setResults((prev) => [
          ...prev,
          {
            success: true,
            message: `Successfully parsed ${employees.length} employees (stored locally - no database configured)`,
            count: employees.length,
          },
        ])
        return
      }

      // Insert employees into database
      const { data, error } = await db.insertEmployees(
        employees.map((emp) => ({
          email: emp.email,
          first_name: emp.firstName,
          last_name: emp.lastName,
          department: emp.department,
          position: emp.position,
          hire_date: emp.hireDate ? new Date(emp.hireDate).toISOString().split("T")[0] : null,
        })),
      )

      if (error) throw error

      setResults((prev) => [
        ...prev,
        {
          success: true,
          message: `Successfully imported ${employees.length} employees to database`,
          count: employees.length,
        },
      ])
    } catch (error) {
      setResults((prev) => [
        ...prev,
        {
          success: false,
          message: `Failed to import employees: ${error}`,
        },
      ])
    } finally {
      setIsUploading(false)
    }
  }

  const handleTrainingAssignmentsImport = async (file: File) => {
    setIsUploading(true)
    try {
      const assignments = await parseTrainingAssignmentsExcel(file)

      if (!isNeonConfigured) {
        setLocalData((prev) => ({
          ...prev,
          trainingAssignments: [...prev.trainingAssignments, ...assignments],
        }))

        setResults((prev) => [
          ...prev,
          {
            success: true,
            message: `Successfully parsed ${assignments.length} training assignments (stored locally)`,
            count: assignments.length,
          },
        ])
        return
      }

      const { data, error } = await db.insertTrainingAssignments(assignments)

      if (error) throw error

      setResults((prev) => [
        ...prev,
        {
          success: true,
          message: `Successfully imported ${Array.isArray(data) ? data.length : 0} training assignments`,
          count: Array.isArray(data) ? data.length : 0,
        },
      ])
    } catch (error) {
      setResults((prev) => [
        ...prev,
        {
          success: false,
          message: `Failed to import training assignments: ${error}`,
        },
      ])
    } finally {
      setIsUploading(false)
    }
  }

  const handleQMSUpdatesImport = async (file: File) => {
    setIsUploading(true)
    try {
      const qmsUpdates = await parseQMSUpdatesExcel(file)

      if (!isNeonConfigured) {
        setLocalData((prev) => ({
          ...prev,
          qmsUpdates: [...prev.qmsUpdates, ...qmsUpdates],
        }))

        setResults((prev) => [
          ...prev,
          {
            success: true,
            message: `Successfully parsed ${qmsUpdates.length} QMS updates (stored locally)`,
            count: qmsUpdates.length,
          },
        ])
        return
      }

      const { data, error } = await db.insertQMSUpdates(qmsUpdates)

      if (error) throw error

      setResults((prev) => [
        ...prev,
        {
          success: true,
          message: `Successfully imported ${Array.isArray(data) ? data.length : 0} QMS update plans`,
          count: Array.isArray(data) ? data.length : 0,
        },
      ])
    } catch (error) {
      setResults((prev) => [
        ...prev,
        {
          success: false,
          message: `Failed to import QMS updates: ${error}`,
        },
      ])
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    setResults([])

    switch (type) {
      case "employees":
        await handleEmployeesImport(file)
        break
      case "training":
        await handleTrainingAssignmentsImport(file)
        break
      case "qms":
        await handleQMSUpdatesImport(file)
        break
    }
  }

  const downloadLocalData = () => {
    const dataStr = JSON.stringify(localData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "imported-data.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Excel Data Import</h2>
        <p className="text-muted-foreground">Import your existing data from Excel files to get started quickly.</p>
      </div>

      {/* Database Status */}
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          {isNeonConfigured ? (
            <span className="text-green-600">✅ Neon database connected and ready</span>
          ) : (
            <div className="space-y-2">
              <span className="text-amber-600">⚠️ No database configured - data will be stored locally</span>
              <div className="text-sm text-muted-foreground">
                To enable database storage, set up Neon integration or configure DATABASE_URL environment variable.
              </div>
            </div>
          )}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="training">Training Calendar</TabsTrigger>
          <TabsTrigger value="qms">QMS Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Import Employees
              </CardTitle>
              <CardDescription>
                Upload an Excel file with employee data. Expected columns: Email, First Name, Last Name, Department,
                Position, Hire Date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employees-file">Select Excel File</Label>
                  <Input
                    id="employees-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileUpload(e, "employees")}
                    disabled={isUploading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Import Training Calendar
              </CardTitle>
              <CardDescription>
                Upload an Excel file with training assignments. Expected columns: Employee Email, Course Title, Assigned
                Date, Due Date, Priority
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="training-file">Select Excel File</Label>
                  <Input
                    id="training-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileUpload(e, "training")}
                    disabled={isUploading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Import QMS Update Plans
              </CardTitle>
              <CardDescription>
                Upload an Excel file with QMS update calendar. Expected columns: Title, Description, Category, Planned
                Start Date, Planned End Date, Responsible Person Email, Year, Quarter, Priority
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="qms-file">Select Excel File</Label>
                  <Input
                    id="qms-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileUpload(e, "qms")}
                    disabled={isUploading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Local Data Summary */}
      {!isNeonConfigured &&
        (localData.employees.length > 0 ||
          localData.trainingAssignments.length > 0 ||
          localData.qmsUpdates.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Local Data Summary</CardTitle>
              <CardDescription>Data stored locally (no database configured)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>Employees: {localData.employees.length}</div>
                <div>Training Assignments: {localData.trainingAssignments.length}</div>
                <div>QMS Updates: {localData.qmsUpdates.length}</div>
                <Button onClick={downloadLocalData} variant="outline" size="sm">
                  Download as JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Results Display */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}
                >
                  {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span>{result.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2">
              <Upload className="h-4 w-4 animate-pulse" />
              <span>Processing file...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
