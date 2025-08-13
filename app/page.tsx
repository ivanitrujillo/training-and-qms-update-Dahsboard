"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dashboard } from "@/components/dashboard"
import { ExcelImport } from "@/components/excel-import"
import { EmployeeTrainingView } from "@/components/employee-training-view"

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleDataImported = () => {
    // Trigger dashboard refresh when data is imported
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="training">Training View</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Dashboard refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="import">
          <ExcelImport onDataImported={handleDataImported} />
        </TabsContent>

        <TabsContent value="training">
          <EmployeeTrainingView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
