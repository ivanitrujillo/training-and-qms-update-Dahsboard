"use server"

import { Resend } from "resend"

// Initialize Resend (will be null if API key not provided)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface EmailData {
  to: string
  subject: string
  html: string
}

interface TrainingReminderData {
  employeeName: string
  employeeEmail: string
  courseTitle: string
  dueDate: string
  priority: string
}

interface QMSNotificationData {
  responsiblePersonName: string
  responsiblePersonEmail: string
  title: string
  category: string
  plannedStartDate: string
  plannedEndDate: string
  priority: string
}

// Generate training reminder email HTML
function generateTrainingReminderHTML(data: TrainingReminderData): string {
  const priorityColor =
    {
      low: "#10B981",
      medium: "#F59E0B",
      high: "#EF4444",
      critical: "#DC2626",
    }[data.priority] || "#6B7280"

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Training Reminder</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Training Reminder</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Personal Development Dashboard</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hello ${data.employeeName},</p>
        
        <p style="font-size: 16px; margin-bottom: 25px;">
          This is a reminder that you have a training assignment that requires your attention.
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px 0; color: #2d3748; font-size: 20px;">Training Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Course:</td>
              <td style="padding: 8px 0; color: #2d3748;">${data.courseTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Due Date:</td>
              <td style="padding: 8px 0; color: #2d3748;">${new Date(data.dueDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Priority:</td>
              <td style="padding: 8px 0;">
                <span style="background: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                  ${data.priority}
                </span>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://your-app.vercel.app"}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
            View Training Dashboard
          </a>
        </div>
        
        <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #6b7280;">
          <p style="margin: 0;">
            <strong>Need help?</strong> Contact your training coordinator or HR department.
          </p>
          <p style="margin: 10px 0 0 0;">
            This is an automated reminder from the Personal Development Dashboard.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate QMS notification email HTML
function generateQMSNotificationHTML(data: QMSNotificationData): string {
  const priorityColor =
    {
      low: "#10B981",
      medium: "#F59E0B",
      high: "#EF4444",
      critical: "#DC2626",
    }[data.priority] || "#6B7280"

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>QMS Update Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">QMS Update Notification</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Quality Management System</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hello ${data.responsiblePersonName},</p>
        
        <p style="font-size: 16px; margin-bottom: 25px;">
          You have been assigned as the responsible person for a new QMS update plan.
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px 0; color: #2d3748; font-size: 20px;">QMS Update Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Title:</td>
              <td style="padding: 8px 0; color: #2d3748;">${data.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Category:</td>
              <td style="padding: 8px 0; color: #2d3748;">${data.category}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Start Date:</td>
              <td style="padding: 8px 0; color: #2d3748;">${new Date(data.plannedStartDate).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">End Date:</td>
              <td style="padding: 8px 0; color: #2d3748;">${new Date(data.plannedEndDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Priority:</td>
              <td style="padding: 8px 0;">
                <span style="background: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                  ${data.priority}
                </span>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://your-app.vercel.app"}" 
             style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
            View QMS Dashboard
          </a>
        </div>
        
        <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #6b7280;">
          <p style="margin: 0;">
            <strong>Questions?</strong> Contact the Quality Management team for assistance.
          </p>
          <p style="margin: 10px 0 0 0;">
            This is an automated notification from the QMS Dashboard.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Send email function
async function sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
  // If Resend is not configured, simulate sending (demo mode)
  if (!resend) {
    console.log("📧 Demo Mode - Email would be sent to:", emailData.to)
    console.log("📧 Subject:", emailData.subject)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { success: true }
  }

  try {
    const result = await resend.emails.send({
      from: "Training System <noreply@yourdomain.com>",
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    })

    console.log("✅ Email sent successfully:", result.data?.id)
    return { success: true }
  } catch (error) {
    console.error("❌ Email sending failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Send training reminder email
export async function sendTrainingReminder(data: TrainingReminderData) {
  const emailData: EmailData = {
    to: data.employeeEmail,
    subject: `Training Reminder: ${data.courseTitle}`,
    html: generateTrainingReminderHTML(data),
  }

  return await sendEmail(emailData)
}

// Send QMS notification email
export async function sendQMSNotification(data: QMSNotificationData) {
  const emailData: EmailData = {
    to: data.responsiblePersonEmail,
    subject: `QMS Assignment: ${data.title}`,
    html: generateQMSNotificationHTML(data),
  }

  return await sendEmail(emailData)
}

// Send bulk training reminders
export async function sendBulkTrainingReminders(reminders: TrainingReminderData[]) {
  const results = []

  for (const reminder of reminders) {
    const result = await sendTrainingReminder(reminder)
    results.push({
      email: reminder.employeeEmail,
      course: reminder.courseTitle,
      success: result.success,
      error: result.error,
    })

    // Add small delay between emails to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return results
}

// Test email functionality
export async function testEmailSystem(testEmail: string) {
  const testData: TrainingReminderData = {
    employeeName: "Test User",
    employeeEmail: testEmail,
    courseTitle: "Email System Test",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    priority: "medium",
  }

  return await sendTrainingReminder(testData)
}
