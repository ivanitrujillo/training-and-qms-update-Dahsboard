"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ExcelImport from "../excel-import"
import Dashboard from "../components/dashboard"
import { Upload, BarChart3 } from "lucide-react"

export default function SyntheticV0PageForDeployment() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="import" className="mt-6">
            <ExcelImport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
