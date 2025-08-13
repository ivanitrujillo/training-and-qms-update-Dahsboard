import * as XLSX from "xlsx"

export interface EmployeeData {
  email: string
  firstName: string
  lastName: string
  department: string
  position: string
  hireDate?: string
}

export interface TrainingAssignmentData {
  employeeEmail: string
  courseTitle: string
  assignedDate: string
  dueDate: string
  priority?: "low" | "medium" | "high" | "critical"
}

export interface QMSUpdateData {
  title: string
  description?: string
  category: string
  plannedStartDate: string
  plannedEndDate: string
  responsiblePersonEmail: string
  year: number
  quarter?: number
  priority?: "low" | "medium" | "high" | "critical"
}

export function parseEmployeesExcel(file: File): Promise<EmployeeData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        const employees: EmployeeData[] = jsonData.map((row: any) => ({
          email: row["Email"] || row["email"] || "",
          firstName: row["First Name"] || row["firstName"] || row["first_name"] || "",
          lastName: row["Last Name"] || row["lastName"] || row["last_name"] || "",
          department: row["Department"] || row["department"] || "",
          position: row["Position"] || row["position"] || "",
          hireDate: row["Hire Date"] || row["hireDate"] || row["hire_date"] || undefined,
        }))

        resolve(employees)
      } catch (error) {
        reject(new Error("Failed to parse Excel file: " + error))
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}

export function parseTrainingAssignmentsExcel(file: File): Promise<TrainingAssignmentData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        const assignments: TrainingAssignmentData[] = jsonData.map((row: any) => ({
          employeeEmail: row["Employee Email"] || row["employeeEmail"] || row["email"] || "",
          courseTitle: row["Course Title"] || row["courseTitle"] || row["course"] || "",
          assignedDate: row["Assigned Date"] || row["assignedDate"] || row["assigned_date"] || "",
          dueDate: row["Due Date"] || row["dueDate"] || row["due_date"] || "",
          priority: (row["Priority"] || row["priority"] || "medium").toLowerCase(),
        }))

        resolve(assignments)
      } catch (error) {
        reject(new Error("Failed to parse training assignments Excel file: " + error))
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}

export function parseQMSUpdatesExcel(file: File): Promise<QMSUpdateData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        const qmsUpdates: QMSUpdateData[] = jsonData.map((row: any) => ({
          title: row["Title"] || row["title"] || "",
          description: row["Description"] || row["description"] || "",
          category: row["Category"] || row["category"] || "process",
          plannedStartDate: row["Planned Start Date"] || row["plannedStartDate"] || row["start_date"] || "",
          plannedEndDate: row["Planned End Date"] || row["plannedEndDate"] || row["end_date"] || "",
          responsiblePersonEmail:
            row["Responsible Person Email"] || row["responsiblePersonEmail"] || row["responsible_email"] || "",
          year: Number.parseInt(row["Year"] || row["year"] || new Date().getFullYear()),
          quarter: row["Quarter"] || row["quarter"] || undefined,
          priority: (row["Priority"] || row["priority"] || "medium").toLowerCase(),
        }))

        resolve(qmsUpdates)
      } catch (error) {
        reject(new Error("Failed to parse QMS updates Excel file: " + error))
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}
