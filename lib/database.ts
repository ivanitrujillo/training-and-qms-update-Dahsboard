import { neon } from "@neondatabase/serverless"

// Check if Neon is configured
export const isNeonConfigured = !!process.env.DATABASE_URL

// Initialize Neon client if configured
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null

export const db = {
  // Employee operations
  async getEmployees() {
    if (!sql) {
      return {
        data: [
          {
            id: "1",
            email: "demo@company.com",
            first_name: "Demo",
            last_name: "User",
            department: "IT",
            position: "Developer",
            hire_date: "2023-01-01",
            created_at: new Date().toISOString(),
          },
        ],
        error: null,
      }
    }

    try {
      const employees = await sql`
        SELECT id, email, first_name, last_name, department, position, hire_date, created_at
        FROM employees
        WHERE is_active = true
        ORDER BY created_at DESC
      `
      return { data: employees, error: null }
    } catch (error) {
      console.error("Error fetching employees:", error)
      return { data: [], error: error instanceof Error ? error.message : "Failed to fetch employees" }
    }
  },

  async insertEmployees(employees: any[]) {
    if (!sql) {
      return { data: employees, error: null }
    }

    try {
      const results = []
      for (const employee of employees) {
        const result = await sql`
          INSERT INTO employees (email, first_name, last_name, department, position, hire_date)
          VALUES (${employee.email}, ${employee.first_name}, ${employee.last_name}, 
                  ${employee.department}, ${employee.position}, ${employee.hire_date})
          ON CONFLICT (email) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            department = EXCLUDED.department,
            position = EXCLUDED.position,
            hire_date = EXCLUDED.hire_date,
            updated_at = NOW()
          RETURNING *
        `
        results.push(result[0])
      }
      return { data: results, error: null }
    } catch (error) {
      console.error("Error inserting employees:", error)
      return { data: [], error: error instanceof Error ? error.message : "Failed to insert employees" }
    }
  },

  // Training course operations
  async getTrainingCourses() {
    if (!sql) {
      return {
        data: [
          {
            id: "1",
            title: "Demo Course",
            description: "Sample training course",
            duration_hours: 2,
            category: "General",
            is_mandatory: true,
            created_at: new Date().toISOString(),
          },
        ],
        error: null,
      }
    }

    try {
      const courses = await sql`
        SELECT * FROM training_courses
        ORDER BY created_at DESC
      `
      return { data: courses, error: null }
    } catch (error) {
      console.error("Error fetching training courses:", error)
      return { data: [], error: error instanceof Error ? error.message : "Failed to fetch training courses" }
    }
  },

  async getTrainingAssignments() {
    if (!sql) {
      return {
        data: [
          {
            id: "1",
            employee_email: "demo@company.com",
            first_name: "Demo",
            last_name: "User",
            course_title: "Demo Course",
            assigned_date: "2024-01-01",
            due_date: "2024-02-01",
            status: "assigned",
            priority: "medium",
            duration_hours: 2,
            created_at: new Date().toISOString(),
          },
        ],
        error: null,
      }
    }

    try {
      const assignments = await sql`
        SELECT ta.*, e.first_name, e.last_name, e.email as employee_email,
               tc.title as course_title, tc.duration_hours
        FROM training_assignments ta
        JOIN employees e ON ta.employee_id = e.id
        JOIN training_courses tc ON ta.course_id = tc.id
        WHERE e.is_active = true
        ORDER BY ta.created_at DESC
      `
      return { data: assignments, error: null }
    } catch (error) {
      console.error("Error fetching training assignments:", error)
      return { data: [], error: error instanceof Error ? error.message : "Failed to fetch training assignments" }
    }
  },

  async insertTrainingAssignments(assignments: any[]) {
    if (!sql) {
      return { data: assignments, error: null }
    }

    try {
      const results = []
      for (const assignment of assignments) {
        // First, find the employee
        const employee = await sql`
          SELECT id FROM employees WHERE email = ${assignment.employeeEmail} AND is_active = true
        `

        if (employee.length === 0) {
          console.warn(`Employee not found: ${assignment.employeeEmail}`)
          continue
        }

        // Find or create the training course
        let course = await sql`
          SELECT id FROM training_courses WHERE title = ${assignment.courseTitle}
        `

        if (course.length === 0) {
          course = await sql`
            INSERT INTO training_courses (title, description, duration_hours, category)
            VALUES (${assignment.courseTitle}, ${assignment.description || ""}, ${assignment.duration || 1}, ${assignment.category || "General"})
            RETURNING id
          `
        }

        // Insert the assignment
        const result = await sql`
          INSERT INTO training_assignments (employee_id, course_id, assigned_date, due_date, status, priority)
          VALUES (${employee[0].id}, ${course[0].id}, ${assignment.assignedDate}, 
                  ${assignment.dueDate}, 'assigned', ${assignment.priority || "medium"})
          ON CONFLICT (employee_id, course_id) DO UPDATE SET
            assigned_date = EXCLUDED.assigned_date,
            due_date = EXCLUDED.due_date,
            priority = EXCLUDED.priority,
            updated_at = NOW()
          RETURNING *
        `
        results.push(result[0])
      }
      return { data: results, error: null }
    } catch (error) {
      console.error("Error inserting training assignments:", error)
      return { data: [], error: error instanceof Error ? error.message : "Failed to insert training assignments" }
    }
  },

  // QMS operations
  async getQMSUpdates() {
    if (!sql) {
      return {
        data: [
          {
            id: "1",
            title: "Demo QMS Update",
            description: "Sample QMS update plan",
            category: "Process Improvement",
            planned_start_date: "2025-01-01",
            planned_end_date: "2025-03-31",
            status: "planned",
            priority: "medium",
            year: 2025,
            quarter: 1,
            progress: 0,
            responsible_person_email: "demo@company.com",
            first_name: "Demo",
            last_name: "User",
            created_at: new Date().toISOString(),
          },
        ],
        error: null,
      }
    }

    try {
      const updates = await sql`
        SELECT qu.*, e.first_name, e.last_name, e.email as responsible_person_email
        FROM qms_updates qu
        LEFT JOIN employees e ON qu.responsible_person_id = e.id
        ORDER BY qu.planned_start_date DESC
      `
      return { data: updates, error: null }
    } catch (error) {
      console.error("Error fetching QMS updates:", error)
      return { data: [], error: error instanceof Error ? error.message : "Failed to fetch QMS updates" }
    }
  },

  async insertQMSUpdates(updates: any[]) {
    if (!sql) {
      return { data: updates, error: null }
    }

    try {
      const results = []
      for (const update of updates) {
        // Find the responsible person
        let responsiblePersonId = null
        if (update.responsiblePersonEmail) {
          const employee = await sql`
            SELECT id FROM employees WHERE email = ${update.responsiblePersonEmail} AND is_active = true
          `
          responsiblePersonId = employee.length > 0 ? employee[0].id : null
        }

        const result = await sql`
          INSERT INTO qms_updates (title, description, category, planned_start_date, planned_end_date, 
                                   responsible_person_id, status, priority, year, quarter)
          VALUES (${update.title}, ${update.description || ""}, ${update.category}, 
                  ${update.plannedStartDate}, ${update.plannedEndDate}, ${responsiblePersonId},
                  'planned', ${update.priority || "medium"}, ${update.year}, ${update.quarter || null})
          RETURNING *
        `
        results.push(result[0])
      }
      return { data: results, error: null }
    } catch (error) {
      console.error("Error inserting QMS updates:", error)
      return { data: [], error: error instanceof Error ? error.message : "Failed to insert QMS updates" }
    }
  },

  // Dashboard statistics
  async getDashboardStats() {
    if (!sql) {
      return {
        data: {
          totalEmployees: 1,
          totalTrainingAssignments: 1,
          completedTraining: 0,
          overdueTraining: 0,
          totalQMSUpdates: 1,
          completedQMS: 0,
          inProgressQMS: 0,
        },
        error: null,
      }
    }

    try {
      const [stats] = await sql`
        SELECT * FROM dashboard_stats
      `

      return {
        data: {
          totalEmployees: Number.parseInt(stats.total_employees),
          totalTrainingAssignments: Number.parseInt(stats.total_training_assignments),
          completedTraining: Number.parseInt(stats.completed_training),
          overdueTraining: Number.parseInt(stats.overdue_training),
          totalQMSUpdates: Number.parseInt(stats.total_qms_updates),
          completedQMS: Number.parseInt(stats.completed_qms),
          inProgressQMS: Number.parseInt(stats.in_progress_qms),
        },
        error: null,
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      return { data: null, error: error instanceof Error ? error.message : "Failed to fetch dashboard stats" }
    }
  },
}
