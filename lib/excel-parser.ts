import * as XLSX from "xlsx"

export interface ParsedEmployee {
  email: string
  first_name: string
  last_name: string
  department: string
  position: string
  hire_date?: string
}

export interface ParsedTrainingAssignment {
  employeeEmail: string
  courseTitle: string
  assignedDate: string
  dueDate: string
  priority: "low" | "medium" | "high"
  description?: string
  category?: string
  duration?: number
}

export interface ParsedQMSUpdate {
  title: string
  description: string
  category: string
  plannedStartDate: string
  plannedEndDate: string
  responsiblePersonEmail: string
  priority: "low" | "medium" | "high"
  year: number
  quarter?: number
}

export interface ParseResult {
  type: "employees" | "training_assignments" | "qms_updates" | "unknown"
  data: ParsedEmployee[] | ParsedTrainingAssignment[] | ParsedQMSUpdate[]
  errors: string[]
  summary: {
    totalRows: number
    validRows: number
    errorRows: number
  }
}

// Helper function to convert Excel date serial number to JavaScript Date
function excelDateToJSDate(serial: number): Date {
  const utc_days = Math.floor(serial - 25569)
  const utc_value = utc_days * 86400
  const date_info = new Date(utc_value * 1000)
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate())
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date | string | number): string {
  if (typeof date === "number") {
    date = excelDateToJSDate(date)
  }
  if (typeof date === "string") {
    date = new Date(date)
  }
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date.toISOString().split("T")[0]
  }
  return ""
}

// Helper function to clean and validate email
function cleanEmail(email: any): string {
  if (typeof email !== "string") return ""
  return email.toLowerCase().trim()
}

// Helper function to clean text fields
function cleanText(text: any): string {
  if (typeof text !== "string") return String(text || "").trim()
  return text.trim()
}

// Detect file type based on headers
function detectFileType(headers: string[]): "employees" | "training_assignments" | "qms_updates" | "unknown" {
  const normalizedHeaders = headers.map((h) => h.toLowerCase().replace(/[^a-z]/g, ""))

  // Employee headers
  const employeeHeaders = ["email", "firstname", "lastname", "department", "position"]
  const employeeMatch = employeeHeaders.filter((h) =>
    normalizedHeaders.some((nh) => nh.includes(h) || h.includes(nh)),
  ).length

  // Training assignment headers
  const trainingHeaders = ["employeeemail", "coursetitle", "assigneddate", "duedate"]
  const trainingMatch = trainingHeaders.filter((h) =>
    normalizedHeaders.some((nh) => nh.includes(h) || h.includes(nh)),
  ).length

  // QMS update headers
  const qmsHeaders = ["title", "category", "plannedstartdate", "plannedenddate", "responsiblepersonemail"]
  const qmsMatch = qmsHeaders.filter((h) => normalizedHeaders.some((nh) => nh.includes(h) || h.includes(nh))).length

  if (employeeMatch >= 3) return "employees"
  if (trainingMatch >= 3) return "training_assignments"
  if (qmsMatch >= 3) return "qms_updates"

  return "unknown"
}

// Parse employees data
function parseEmployees(data: any[]): ParseResult {
  const employees: ParsedEmployee[] = []
  const errors: string[] = []
  let validRows = 0

  data.forEach((row, index) => {
    try {
      const email = cleanEmail(row.Email || row.email || row["Employee Email"] || row["employee_email"])
      const firstName = cleanText(row["First Name"] || row.first_name || row.firstname || row.FirstName)
      const lastName = cleanText(row["Last Name"] || row.last_name || row.lastname || row.LastName)
      const department = cleanText(row.Department || row.department)
      const position = cleanText(row.Position || row.position || row.title || row.Title)
      const hireDate = row["Hire Date"] || row.hire_date || row.hiredate || row.HireDate

      if (!email || !firstName || !lastName) {
        errors.push(`Row ${index + 2}: Missing required fields (email, first name, or last name)`)
        return
      }

      if (!email.includes("@")) {
        errors.push(`Row ${index + 2}: Invalid email format`)
        return
      }

      employees.push({
        email,
        first_name: firstName,
        last_name: lastName,
        department: department || "General",
        position: position || "Employee",
        hire_date: hireDate ? formatDate(hireDate) : undefined,
      })

      validRows++
    } catch (error) {
      errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  })

  return {
    type: "employees",
    data: employees,
    errors,
    summary: {
      totalRows: data.length,
      validRows,
      errorRows: data.length - validRows,
    },
  }
}

// Parse training assignments data
function parseTrainingAssignments(data: any[]): ParseResult {
  const assignments: ParsedTrainingAssignment[] = []
  const errors: string[] = []
  let validRows = 0

  data.forEach((row, index) => {
    try {
      const employeeEmail = cleanEmail(row["Employee Email"] || row.employee_email || row.employeeemail || row.email)
      const courseTitle = cleanText(row["Course Title"] || row.course_title || row.coursetitle || row.course)
      const assignedDate = row["Assigned Date"] || row.assigned_date || row.assigneddate
      const dueDate = row["Due Date"] || row.due_date || row.duedate
      const priority = cleanText(row.Priority || row.priority || "medium").toLowerCase()
      const description = cleanText(row.Description || row.description || "")
      const category = cleanText(row.Category || row.category || "General")
      const duration = Number.parseInt(String(row.Duration || row.duration || "1"))

      if (!employeeEmail || !courseTitle || !assignedDate || !dueDate) {
        errors.push(`Row ${index + 2}: Missing required fields`)
        return
      }

      if (!employeeEmail.includes("@")) {
        errors.push(`Row ${index + 2}: Invalid employee email format`)
        return
      }

      const validPriorities = ["low", "medium", "high"]
      const finalPriority = validPriorities.includes(priority) ? (priority as "low" | "medium" | "high") : "medium"

      assignments.push({
        employeeEmail,
        courseTitle,
        assignedDate: formatDate(assignedDate),
        dueDate: formatDate(dueDate),
        priority: finalPriority,
        description,
        category,
        duration: isNaN(duration) ? 1 : duration,
      })

      validRows++
    } catch (error) {
      errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  })

  return {
    type: "training_assignments",
    data: assignments,
    errors,
    summary: {
      totalRows: data.length,
      validRows,
      errorRows: data.length - validRows,
    },
  }
}

// Parse QMS updates data
function parseQMSUpdates(data: any[]): ParseResult {
  const updates: ParsedQMSUpdate[] = []
  const errors: string[] = []
  let validRows = 0

  data.forEach((row, index) => {
    try {
      const title = cleanText(row.Title || row.title)
      const description = cleanText(row.Description || row.description || "")
      const category = cleanText(row.Category || row.category)
      const plannedStartDate = row["Planned Start Date"] || row.planned_start_date || row.plannedstartdate
      const plannedEndDate = row["Planned End Date"] || row.planned_end_date || row.plannedenddate
      const responsiblePersonEmail = cleanEmail(
        row["Responsible Person Email"] || row.responsible_person_email || row.responsiblepersonemail,
      )
      const priority = cleanText(row.Priority || row.priority || "medium").toLowerCase()
      const year = Number.parseInt(String(row.Year || row.year || new Date().getFullYear()))
      const quarter = row.Quarter || row.quarter ? Number.parseInt(String(row.Quarter || row.quarter)) : undefined

      if (!title || !category || !plannedStartDate || !plannedEndDate) {
        errors.push(`Row ${index + 2}: Missing required fields`)
        return
      }

      if (responsiblePersonEmail && !responsiblePersonEmail.includes("@")) {
        errors.push(`Row ${index + 2}: Invalid responsible person email format`)
        return
      }

      const validPriorities = ["low", "medium", "high"]
      const finalPriority = validPriorities.includes(priority) ? (priority as "low" | "medium" | "high") : "medium"

      updates.push({
        title,
        description,
        category,
        plannedStartDate: formatDate(plannedStartDate),
        plannedEndDate: formatDate(plannedEndDate),
        responsiblePersonEmail,
        priority: finalPriority,
        year: isNaN(year) ? new Date().getFullYear() : year,
        quarter: quarter && quarter >= 1 && quarter <= 4 ? quarter : undefined,
      })

      validRows++
    } catch (error) {
      errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  })

  return {
    type: "qms_updates",
    data: updates,
    errors,
    summary: {
      totalRows: data.length,
      validRows,
      errorRows: data.length - validRows,
    },
  }
}

// Main parsing function
export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Get the first worksheet
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (jsonData.length < 2) {
          resolve({
            type: "unknown",
            data: [],
            errors: ["File must contain at least a header row and one data row"],
            summary: { totalRows: 0, validRows: 0, errorRows: 0 },
          })
          return
        }

        // Extract headers and data
        const headers = jsonData[0] as string[]
        const dataRows = jsonData
          .slice(1)
          .filter((row) => Array.isArray(row) && row.some((cell) => cell !== null && cell !== undefined && cell !== ""))

        // Convert array format to object format
        const objectData = dataRows.map((row) => {
          const obj: any = {}
          headers.forEach((header, index) => {
            if (header && row[index] !== undefined) {
              obj[header] = row[index]
            }
          })
          return obj
        })

        // Detect file type
        const fileType = detectFileType(headers)

        // Parse based on detected type
        let result: ParseResult
        switch (fileType) {
          case "employees":
            result = parseEmployees(objectData)
            break
          case "training_assignments":
            result = parseTrainingAssignments(objectData)
            break
          case "qms_updates":
            result = parseQMSUpdates(objectData)
            break
          default:
            result = {
              type: "unknown",
              data: [],
              errors: [`Unable to detect file type. Headers found: ${headers.join(", ")}`],
              summary: { totalRows: objectData.length, validRows: 0, errorRows: objectData.length },
            }
        }

        resolve(result)
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}`))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsArrayBuffer(file)
  })
}

// Generate sample Excel templates
export function generateSampleTemplate(type: "employees" | "training_assignments" | "qms_updates"): Uint8Array {
  let data: any[][] = []

  switch (type) {
    case "employees":
      data = [
        ["Email", "First Name", "Last Name", "Department", "Position", "Hire Date"],
        ["john.doe@company.com", "John", "Doe", "Engineering", "Software Engineer", "2023-01-15"],
        ["jane.smith@company.com", "Jane", "Smith", "Marketing", "Marketing Manager", "2022-03-10"],
        ["mike.johnson@company.com", "Mike", "Johnson", "Sales", "Sales Representative", "2023-06-01"],
      ]
      break
    case "training_assignments":
      data = [
        ["Employee Email", "Course Title", "Assigned Date", "Due Date", "Priority", "Category", "Duration"],
        ["john.doe@company.com", "Security Awareness Training", "2024-01-15", "2024-02-15", "high", "Security", 2],
        ["jane.smith@company.com", "Leadership Development", "2024-01-20", "2024-03-20", "medium", "Leadership", 8],
        [
          "mike.johnson@company.com",
          "Customer Service Excellence",
          "2024-02-01",
          "2024-03-01",
          "medium",
          "Customer Service",
          3,
        ],
      ]
      break
    case "qms_updates":
      data = [
        [
          "Title",
          "Description",
          "Category",
          "Planned Start Date",
          "Planned End Date",
          "Responsible Person Email",
          "Priority",
          "Year",
          "Quarter",
        ],
        [
          "Document Control Update",
          "Implement new document management system",
          "System",
          "2025-01-01",
          "2025-03-31",
          "sarah.wilson@company.com",
          "high",
          2025,
          1,
        ],
        [
          "Process Review",
          "Review and update operational processes",
          "Process",
          "2025-04-01",
          "2025-06-30",
          "david.miller@company.com",
          "medium",
          2025,
          2,
        ],
        [
          "Training Program Enhancement",
          "Develop new training modules",
          "Training",
          "2025-07-01",
          "2025-09-30",
          "alex.brown@company.com",
          "medium",
          2025,
          3,
        ],
      ]
      break
  }

  const worksheet = XLSX.utils.aoa_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")

  return XLSX.write(workbook, { type: "array", bookType: "xlsx" })
}
