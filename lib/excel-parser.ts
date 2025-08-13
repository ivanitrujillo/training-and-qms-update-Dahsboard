import * as XLSX from "xlsx"

export interface EmployeeData {
  email: string
  first_name: string
  last_name: string
  department: string
  position: string
  hire_date?: string
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

export interface ParsedExcelData {
  employees?: EmployeeData[]
  trainingAssignments?: TrainingAssignmentData[]
  qmsUpdates?: QMSUpdateData[]
}

export async function parseExcelFile(file: File): Promise<ParsedExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
          reject(new Error("No data found in the file"))
          return
        }

        const result: ParsedExcelData = {}

        // Check first row to determine data type
        const firstRow = jsonData[0] as any
        const headers = Object.keys(firstRow).map((h) => h.toLowerCase())

        // Detect employees data
        if (
          headers.includes("email") &&
          (headers.includes("first_name") || headers.includes("firstname") || headers.includes("first name"))
        ) {
          result.employees = jsonData.map((row: any) => ({
            email: row.email || row.Email || "",
            first_name: row.first_name || row.firstName || row["First Name"] || row.firstname || "",
            last_name: row.last_name || row.lastName || row["Last Name"] || row.lastname || "",
            department: row.department || row.Department || "",
            position: row.position || row.Position || "",
            hire_date: row.hire_date || row.hireDate || row["Hire Date"] || row.hire_date || null,
          }))
        }
        // Detect training assignments
        else if (
          headers.includes("employeeemail") ||
          headers.includes("employee_email") ||
          (headers.includes("email") && headers.includes("coursetitle"))
        ) {
          result.trainingAssignments = jsonData.map((row: any) => ({
            employeeEmail: row.employeeEmail || row.employee_email || row["Employee Email"] || row.email || "",
            courseTitle: row.courseTitle || row.course_title || row["Course Title"] || row.course || "",
            assignedDate: row.assignedDate || row.assigned_date || row["Assigned Date"] || "",
            dueDate: row.dueDate || row.due_date || row["Due Date"] || "",
            priority: (row.priority || row.Priority || "medium").toLowerCase(),
          }))
        }
        // Detect QMS updates
        else if (
          headers.includes("title") &&
          (headers.includes("plannedstartdate") || headers.includes("planned_start_date"))
        ) {
          result.qmsUpdates = jsonData.map((row: any) => ({
            title: row.title || row.Title || "",
            description: row.description || row.Description || "",
            category: row.category || row.Category || "process",
            plannedStartDate: row.plannedStartDate || row.planned_start_date || row["Planned Start Date"] || "",
            plannedEndDate: row.plannedEndDate || row.planned_end_date || row["Planned End Date"] || "",
            responsiblePersonEmail:
              row.responsiblePersonEmail || row.responsible_person_email || row["Responsible Person Email"] || "",
            year: Number.parseInt(row.year || row.Year || new Date().getFullYear()),
            quarter: row.quarter || row.Quarter || null,
            priority: (row.priority || row.Priority || "medium").toLowerCase(),
          }))
        } else {
          reject(new Error("Could not determine data type. Please ensure your file has the correct column headers."))
          return
        }

        resolve(result)
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`))
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
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
          first_name: row["First Name"] || row["firstName"] || row["first_name"] || "",
          last_name: row["Last Name"] || row["lastName"] || row["last_name"] || "",
          department: row["Department"] || row["department"] || "",
          position: row["Position"] || row["position"] || "",
          hire_date: row["Hire Date"] || row["hireDate"] || row["hire_date"] || undefined,
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
