# Neon PostgreSQL Database Setup Guide

## Step-by-Step Connection Setup

### 1. Your Connection Details
- **Host**: `ep-aged-fog-a2elc5xk-pooler.eu-central-1.aws.neon.tech`
- **Database**: `neondb`
- **User**: `neondb_owner`
- **Password**: `npg_TXG5mlnAHr2y`
- **Region**: EU Central (Frankfurt)

### 2. Environment Variable Format
Convert your psql connection string to the standard format:

\`\`\`env
DATABASE_URL=postgresql://neondb_owner:npg_TXG5mlnAHr2y@ep-aged-fog-a2elc5xk-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
\`\`\`

### 3. Setup Steps

#### Step 1: Add to Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_TXG5mlnAHr2y@ep-aged-fog-a2elc5xk-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require`
   - **Environment**: Production, Preview, Development

#### Step 2: Run Database Setup Script
1. Go to your Neon Console: https://console.neon.tech
2. Select your project
3. Go to SQL Editor
4. Copy and paste the entire content from `scripts/neon-complete-setup.sql`
5. Click "Run" to execute the script

#### Step 3: Verify Connection
After deployment, visit: `https://your-app.vercel.app/api/test-db`

Expected response:
\`\`\`json
{
  "success": true,
  "message": "Database connection successful",
  "data": {
    "employees": 10,
    "courses": 10,
    "assignments": 25,
    "qmsUpdates": 16,
    "stats": {
      "totalEmployees": 10,
      "totalTrainingAssignments": 25,
      "completedTraining": 12,
      "overdueTraining": 1,
      "totalQMSUpdates": 16,
      "completedQMS": 0,
      "inProgressQMS": 0
    }
  }
}
\`\`\`

### 4. What Gets Created

#### Tables:
- **employees** (10 sample employees)
- **training_courses** (10 courses)
- **training_assignments** (25+ assignments)
- **qms_updates** (16 QMS plans for 2025)

#### Features:
- Proper relationships and constraints
- Performance indexes
- Auto-updating timestamps
- Dashboard statistics view
- Sample data for testing

### 5. Sample Data Includes:

#### Employees:
- John Doe (Engineering)
- Jane Smith (HR)
- Mike Johnson (Sales)
- Sarah Wilson (Quality)
- And 6 more...

#### Training Courses:
- Workplace Safety Training
- GDPR Compliance
- Leadership Development
- Quality Management Systems
- And 6 more...

#### QMS Updates:
- ISO 9001:2015 Certification Renewal
- Document Control System Upgrade
- Risk Management Framework Update
- And 13 more planned for 2025...

### 6. Troubleshooting

#### Connection Issues:
- Ensure DATABASE_URL is exactly as shown above
- Check that your Neon database is not sleeping
- Verify the connection string has no extra spaces

#### Script Execution Issues:
- Run the script in parts if it fails
- Check Neon console for error messages
- Ensure you have write permissions

#### Verification Issues:
- Wait 1-2 minutes after adding environment variables
- Redeploy your Vercel app if needed
- Check Vercel function logs for errors

### 7. Free Tier Limits:
- **Storage**: 0.5GB (plenty for this app)
- **Compute**: 1 vCPU, 256MB RAM
- **Connections**: 100 concurrent
- **Automatic sleep**: After 5 minutes of inactivity

Your database will automatically wake up when accessed!
