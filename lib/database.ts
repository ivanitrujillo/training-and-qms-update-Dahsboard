import { neon } from "@neondatabase/serverless"

// Check if Neon is configured
export const isNeonConfigured = typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.length > 0

// Create Neon client or mock client
export const sql = isNeonConfigured ? neon(process.env.DATABASE_URL!) : null

// Mock database functions for when no database is configured
const mockDatabase = {
  employees: [] as any[],
  training_courses: [] as any[],
  training_assignments: [] as any[],
  qms_update_plans: [] as any[],
}

// Database operations
export const db = {
  // Employee operations
  async getEmployees() {
    if (!sql) return { data: mockDatabase.employees, error: null }

    try {
      const result = await sql`SELECT * FROM employees ORDER BY created_at DESC`
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error }
    }
  },

  async insertEmployees(employees: any[]) {
    if (!sql) {
      mockDatabase.employees.push(...employees)
      return { data: employees, error: null }
    }

    try {
      const values = employees
        .map(
          (emp) =>
            `('${emp.email}', '${emp.first_name}', '${emp.last_name}', '${emp.department}', '${emp.position}', ${emp.hire_date ? `'${emp.hire_date}'` : "NULL"})`,
        )
        .join(", ")

      const result = await sql`
        INSERT INTO employees (email, first_name, last_name, department, position, hire_date)
        VALUES ${sql.unsafe(values)}
        ON CONFLICT (email) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          department = EXCLUDED.department,
          position = EXCLUDED.position,
          hire_date = EXCLUDED.hire_date,
          updated_at = NOW()
        RETURNING *
      `
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error }
    }
  },

  // Training course operations
  async getTrainingCourses() {
    if (!sql) return { data: mockDatabase.training_courses, error: null }

    try {
      const result = await sql`SELECT * FROM training_courses ORDER BY title`
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error }
    }
  },

  // Training assignment operations
  async insertTrainingAssignments(assignments: any[]) {
    if (!sql) {
      mockDatabase.training_assignments.push(...assignments)
      return { data: assignments, error: null }
    }

    try {
      // First get employee and course mappings
      const employees = await sql`SELECT id, email FROM employees`
      const courses = await sql`SELECT id, title FROM training_courses`

      const employeeMap = new Map(employees.map((emp: any) => [emp.email, emp.id]))
      const courseMap = new Map(courses.map((course: any) => [course.title, course.id]))

      const validAssignments = assignments
        .filter((assignment) => employeeMap.has(assignment.employeeEmail) && courseMap.has(assignment.courseTitle))
        .map((assignment) => ({
          employee_id: employeeMap.get(assignment.employeeEmail),
          course_id: courseMap.get(assignment.courseTitle),
          assigned_date: assignment.assignedDate,
          due_date: assignment.dueDate,
          priority: assignment.priority || "medium",
          status: "assigned",
        }))

      if (validAssignments.length === 0) {
        return { data: [], error: "No valid assignments found" }
      }

      const values = validAssignments
        .map(
          (assignment) =>
            `('${assignment.employee_id}', '${assignment.course_id}', '${assignment.assigned_date}', '${assignment.due_date}', '${assignment.priority}', '${assignment.status}')`,
        )
        .join(", ")

      const result = await sql`
        INSERT INTO training_assignments (employee_id, course_id, assigned_date, due_date, priority, status)
        VALUES ${sql.unsafe(values)}
        ON CONFLICT (employee_id, course_id, assigned_date) DO UPDATE SET
          due_date = EXCLUDED.due_date,
          priority = EXCLUDED.priority,
          updated_at = NOW()
        RETURNING *
      `
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error }
    }
  },

  // QMS operations
  async insertQMSUpdates(updates: any[]) {
    if (!sql) {
      mockDatabase.qms_update_plans.push(...updates)
      return { data: updates, error: null }
    }

    try {
      // Get employee mappings
      const employees = await sql`SELECT id, email FROM employees`
      const employeeMap = new Map(employees.map((emp: any) => [emp.email, emp.id]))

      const validUpdates = updates
        .filter((update) => employeeMap.has(update.responsiblePersonEmail))
        .map((update) => ({
          title: update.title,
          description: update.description || "",
          category: update.category,
          planned_start_date: update.plannedStartDate,
          planned_end_date: update.plannedEndDate,
          responsible_person_id: employeeMap.get(update.responsiblePersonEmail),
          year: update.year,
          quarter: update.quarter,
          priority: update.priority || "medium",
          status: "planned",
        }))

      if (validUpdates.length === 0) {
        return { data: [], error: "No valid QMS updates found" }
      }

      const values = validUpdates
        .map(
          (update) =>
            `('${update.title}', '${update.description}', '${update.category}', '${update.planned_start_date}', '${update.planned_end_date}', '${update.responsible_person_id}', ${update.year}, ${update.quarter || "NULL"}, '${update.priority}', '${update.status}')`,
        )
        .join(", ")

      const result = await sql`
        INSERT INTO qms_update_plans (title, description, category, planned_start_date, planned_end_date, responsible_person_id, year, quarter, priority, status)
        VALUES ${sql.unsafe(values)}
        RETURNING *
      `
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error }
    }
  },
}
