"use server"

import { Resend } from "resend"

// Check if Resend is configured
const isResendConfigured = typeof process.env.RESEND_API_KEY === "string" && process.env.RESEND_API_KEY.length > 0

// Initialize Resend client
const resend = isResendConfigured ? new Resend(process.env.RESEND_API_KEY) : null

interface TrainingReminderData {
  employeeEmail: string
  employeeName: string
  courseTitle: string
  dueDate: string
  customMessage?: string
}

interface BulkReminderData {
  assignments: TrainingReminderData[]
  customMessage?: string
}

export async function sendTrainingReminder(data: TrainingReminderData) {
  try {
    if (!isResendConfigured || !resend) {
      // Demo mode - log to console
      console.log("📧 DEMO EMAIL - Training Reminder")
      console.log("To:", data.employeeEmail)
      console.log("Subject: Training Reminder -", data.courseTitle)
      console.log(
        "Message:",
        data.customMessage ||
          `Hi ${data.employeeName}, please complete your training: ${data.courseTitle} by ${new Date(data.dueDate).toLocaleDateString()}`,
      )
      console.log("---")

      return {
        success: true,
        message: "Email sent successfully (demo mode - check console for details)",
      }
    }

    // Real email sending
    const emailSubject = `Training Reminder: ${data.courseTitle}`
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Training Reminder</h2>
        
        <p>Hi ${data.employeeName},</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Course Details</h3>
          <p><strong>Course:</strong> ${data.courseTitle}</p>
          <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
        </div>
        
        ${
          data.customMessage
            ? `
          <div style="margin: 20px 0;">
            <h4>Additional Message:</h4>
            <p style="white-space: pre-line;">${data.customMessage}</p>
          </div>
        `
            : ""
        }
        
        <p>Please complete this training by the due date. If you have any questions, please don't hesitate to reach out.</p>
        
        <p>Best regards,<br>Training Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
        <p style="font-size: 12px; color: #6c757d;">
          This is an automated reminder from your training management system.
        </p>
      </div>
    `

    const result = await resend.emails.send({
      from: "Training Team <training@yourdomain.com>",
      to: [data.employeeEmail],
      subject: emailSubject,
      html: emailHtml,
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    return {
      success: true,
      message: "Training reminder sent successfully",
      emailId: result.data?.id,
    }
  } catch (error) {
    console.error("Email sending error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    }
  }
}

export async function sendBulkTrainingReminders(data: BulkReminderData) {
  try {
    if (!isResendConfigured || !resend) {
      // Demo mode - log to console
      console.log("📧 DEMO BULK EMAILS - Training Reminders")
      console.log(`Sending to ${data.assignments.length} employees:`)
      data.assignments.forEach((assignment, index) => {
        console.log(`${index + 1}. ${assignment.employeeName} (${assignment.employeeEmail})`)
        console.log(`   Course: ${assignment.courseTitle}`)
        console.log(`   Due: ${new Date(assignment.dueDate).toLocaleDateString()}`)
      })
      console.log("Custom Message:", data.customMessage || "Default reminder message")
      console.log("---")

      return {
        success: true,
        message: `Bulk emails sent successfully to ${data.assignments.length} employees (demo mode - check console for details)`,
      }
    }

    // Real bulk email sending
    const emailPromises = data.assignments.map(async (assignment) => {
      const emailSubject = `Training Reminder: ${assignment.courseTitle}`
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Training Reminder</h2>
          
          <p>Hi ${assignment.employeeName},</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">Course Details</h3>
            <p><strong>Course:</strong> ${assignment.courseTitle}</p>
            <p><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>
          </div>
          
          ${
            data.customMessage
              ? `
            <div style="margin: 20px 0;">
              <h4>Additional Message:</h4>
              <p style="white-space: pre-line;">${data.customMessage}</p>
            </div>
          `
              : ""
          }
          
          <p>Please complete this training by the due date. If you have any questions, please don't hesitate to reach out.</p>
          
          <p>Best regards,<br>Training Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
          <p style="font-size: 12px; color: #6c757d;">
            This is an automated reminder from your training management system.
          </p>
        </div>
      `

      return resend.emails.send({
        from: "Training Team <training@yourdomain.com>",
        to: [assignment.employeeEmail],
        subject: emailSubject,
        html: emailHtml,
      })
    })

    const results = await Promise.allSettled(emailPromises)
    const successful = results.filter((result) => result.status === "fulfilled").length
    const failed = results.filter((result) => result.status === "rejected").length

    if (failed > 0) {
      console.error(`${failed} emails failed to send`)
    }

    return {
      success: successful > 0,
      message: `Sent ${successful} emails successfully${failed > 0 ? `, ${failed} failed` : ""}`,
      details: {
        successful,
        failed,
        total: data.assignments.length,
      },
    }
  } catch (error) {
    console.error("Bulk email sending error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send bulk emails",
    }
  }
}
