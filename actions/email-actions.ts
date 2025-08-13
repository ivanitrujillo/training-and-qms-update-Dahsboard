"use server"

import { Resend } from "resend"

// Check if Resend is configured
const isResendConfigured = typeof process.env.RESEND_API_KEY === "string" && process.env.RESEND_API_KEY.length > 0

// Initialize Resend only if API key is available
const resend = isResendConfigured ? new Resend(process.env.RESEND_API_KEY) : null

interface TrainingReminderData {
  employeeName: string
  employeeEmail: string
  courseTitle: string
  dueDate: string
  priority: string
}

export async function sendTrainingReminder(data: TrainingReminderData) {
  try {
    // Demo mode - just simulate sending
    if (!resend) {
      console.log("📧 DEMO MODE - Training reminder would be sent:")
      console.log(`To: ${data.employeeEmail}`)
      console.log(`Subject: Training Reminder: ${data.courseTitle}`)
      console.log(`Employee: ${data.employeeName}`)
      console.log(`Due Date: ${data.dueDate}`)
      console.log(`Priority: ${data.priority}`)

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return {
        success: true,
        message: `Demo: Training reminder sent to ${data.employeeName}`,
        mode: "demo",
      }
    }

    // Real email sending
    const { data: emailData, error } = await resend.emails.send({
      from: "Training System <training@yourdomain.com>",
      to: [data.employeeEmail],
      subject: `Training Reminder: ${data.courseTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Training Reminder</h2>
          
          <p>Dear ${data.employeeName},</p>
          
          <p>This is a reminder that you have a training assignment that requires your attention:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${data.courseTitle}</h3>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="color: ${getPriorityColor(data.priority)};">${data.priority.toUpperCase()}</span></p>
          </div>
          
          <p>Please complete this training by the due date to maintain compliance.</p>
          
          <p>If you have any questions or need assistance, please contact your supervisor or the training department.</p>
          
          <p>Best regards,<br>Training Management System</p>
        </div>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return {
        success: false,
        error: error.message || "Failed to send email",
        mode: "live",
      }
    }

    return {
      success: true,
      message: `Training reminder sent to ${data.employeeName}`,
      emailId: emailData?.id,
      mode: "live",
    }
  } catch (error) {
    console.error("Email sending error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      mode: isResendConfigured ? "live" : "demo",
    }
  }
}

export async function sendBulkTrainingReminders(reminders: TrainingReminderData[]) {
  try {
    if (!resend) {
      // Demo mode
      console.log(`📧 DEMO MODE - ${reminders.length} training reminders would be sent:`)
      reminders.forEach((reminder, index) => {
        console.log(`${index + 1}. ${reminder.employeeName} (${reminder.employeeEmail}) - ${reminder.courseTitle}`)
      })

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      return {
        success: true,
        message: `Demo: ${reminders.length} training reminders sent`,
        mode: "demo",
      }
    }

    // Real bulk email sending
    const emailPromises = reminders.map((reminder) =>
      resend.emails.send({
        from: "Training System <training@yourdomain.com>",
        to: [reminder.employeeEmail],
        subject: `Training Reminder: ${reminder.courseTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Training Reminder</h2>
            
            <p>Dear ${reminder.employeeName},</p>
            
            <p>This is a reminder that you have a training assignment that requires your attention:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">${reminder.courseTitle}</h3>
              <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(reminder.dueDate).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="color: ${getPriorityColor(reminder.priority)};">${reminder.priority.toUpperCase()}</span></p>
            </div>
            
            <p>Please complete this training by the due date to maintain compliance.</p>
            
            <p>If you have any questions or need assistance, please contact your supervisor or the training department.</p>
            
            <p>Best regards,<br>Training Management System</p>
          </div>
        `,
      }),
    )

    const results = await Promise.allSettled(emailPromises)

    const successful = results.filter((result) => result.status === "fulfilled").length
    const failed = results.filter((result) => result.status === "rejected").length

    if (failed > 0) {
      console.error(`${failed} emails failed to send`)
    }

    return {
      success: successful > 0,
      message: `${successful} training reminders sent successfully${failed > 0 ? `, ${failed} failed` : ""}`,
      successful,
      failed,
      mode: "live",
    }
  } catch (error) {
    console.error("Bulk email sending error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      mode: isResendConfigured ? "live" : "demo",
    }
  }
}

function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case "critical":
      return "#dc2626"
    case "high":
      return "#ea580c"
    case "medium":
      return "#ca8a04"
    case "low":
      return "#16a34a"
    default:
      return "#6b7280"
  }
}
