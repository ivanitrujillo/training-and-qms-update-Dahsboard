import { NextResponse } from "next/server"
import { db, isNeonConfigured } from "@/lib/database"

export async function GET() {
  try {
    console.log("Testing database connection...")
    console.log("Neon configured:", isNeonConfigured)
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL)

    // Test database connection and fetch sample data
    const [employees, courses, assignments, qmsUpdates, stats] = await Promise.all([
      db.getEmployees(),
      db.getTrainingCourses(),
      db.getTrainingAssignments(),
      db.getQMSUpdates(),
      db.getDashboardStats(),
    ])

    console.log("Database queries completed")
    console.log("Employees:", employees.data?.length || 0)
    console.log("Courses:", courses.data?.length || 0)
    console.log("Assignments:", assignments.data?.length || 0)
    console.log("QMS Updates:", qmsUpdates.data?.length || 0)

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      neonConfigured: isNeonConfigured,
      data: {
        employees: employees.data?.length || 0,
        courses: courses.data?.length || 0,
        assignments: assignments.data?.length || 0,
        qmsUpdates: qmsUpdates.data?.length || 0,
        stats: stats.data,
      },
      sampleData: {
        firstEmployee: employees.data?.[0] || null,
        firstCourse: courses.data?.[0] || null,
        firstAssignment: assignments.data?.[0] || null,
        firstQMSUpdate: qmsUpdates.data?.[0] || null,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        neonConfigured: isNeonConfigured,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
