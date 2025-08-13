# Training & QMS Dashboard

A comprehensive training management and quality management system (QMS) dashboard built with Next.js, featuring Excel import functionality, email notifications, and database integration.

## 🚀 Features

### 📊 Dashboard
- **Real-time Statistics** - Employee count, training completion rates, overdue assignments
- **Interactive Charts** - Training progress, status distribution, department overview
- **Four-Year QMS Timeline** - Strategic planning view for 2025-2028
- **Responsive Design** - Works on desktop, tablet, and mobile

### 📤 Excel Import System
- **Drag & Drop Upload** - Easy file upload with progress tracking
- **Multiple File Types** - Support for .xlsx, .xls, and .csv files
- **Auto-Detection** - Automatically detects employees, training assignments, and QMS data
- **Template Downloads** - Pre-formatted templates with sample data
- **Error Handling** - Detailed error reporting and validation

### 📧 Email Notifications
- **Individual Reminders** - Send training reminders to specific employees
- **Bulk Notifications** - Send reminders to multiple employees at once
- **Demo Mode** - Test functionality without email service
- **Custom Templates** - Professional email templates with branding

### 🗄️ Database Integration
- **Neon PostgreSQL** - Cloud database with automatic scaling
- **Sample Data Fallback** - Works without database configuration
- **Real-time Updates** - Dashboard refreshes after data imports
- **Data Validation** - Ensures data integrity and relationships

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Charts**: Recharts
- **Database**: Neon PostgreSQL
- **Email**: Resend API
- **File Processing**: SheetJS (xlsx)
- **Deployment**: Vercel

## 🚀 Quick Start

### 1. Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the deploy button above
2. Connect your GitHub account
3. Deploy automatically
4. Your app will be available at `https://your-app-name.vercel.app`

### 2. Local Development

\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd training-qms-dashboard

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
\`\`\`

## ⚙️ Configuration

### Environment Variables (Optional)

Create a `.env.local` file in the root directory:

\`\`\`env
# Database (Optional - uses sample data if not set)
DATABASE_URL=postgresql://username:password@host:port/database

# Email Service (Optional - uses demo mode if not set)
RESEND_API_KEY=re_your_resend_api_key

# Site URL (for email links)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
\`\`\`

### Database Setup (Optional)

1. **Create Neon Account**: Go to [neon.tech](https://neon.tech) and create a free account
2. **Create Database**: Create a new PostgreSQL database
3. **Get Connection String**: Copy the connection string from Neon dashboard
4. **Set Environment Variable**: Add `DATABASE_URL` to your environment variables
5. **Run Setup Scripts**: The app will automatically create tables on first run

### Email Setup (Optional)

1. **Create Resend Account**: Go to [resend.com](https://resend.com) and create a free account
2. **Get API Key**: Generate an API key from the Resend dashboard
3. **Set Environment Variable**: Add `RESEND_API_KEY` to your environment variables
4. **Configure Domain**: Set up your sending domain in Resend (optional)

## 📁 Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard.tsx     # Main dashboard
│   ├── excel-import.tsx  # File import functionality
│   └── employee-training-view.tsx # Training management
├── lib/                  # Utility libraries
│   ├── database.ts       # Database operations
│   └── excel-parser.ts   # Excel file parsing
├── actions/              # Server actions
│   └── email-actions.ts  # Email functionality
└── scripts/              # Database scripts
    ├── 01-create-tables.sql
    └── 02-seed-sample-data.sql
\`\`\`

## 📊 Data Import

### Supported File Types
- **Excel Files**: .xlsx, .xls
- **CSV Files**: .csv
- **Multiple Files**: Upload multiple files at once

### Data Types
1. **Employees**: Basic employee information
2. **Training Assignments**: Course assignments with due dates
3. **QMS Updates**: Quality management system plans

### Template Downloads
The app provides CSV templates with sample data for each data type. Download these templates to ensure proper formatting.

## 🎯 Usage

### 1. Dashboard Overview
- View key metrics and statistics
- Monitor training completion rates
- Track overdue assignments
- Analyze department performance

### 2. Employee Training Management
- View all training assignments
- Filter by status, department, priority
- Send individual or bulk reminders
- Track completion progress

### 3. Four-Year QMS Timeline
- Plan QMS updates for 2025-2028
- Filter by year and quarter
- Track project status and progress
- Manage strategic initiatives

### 4. Data Import
- Upload Excel/CSV files
- Download templates with sample data
- View import results and errors
- Automatic dashboard refresh

## 🔧 Customization

### Branding
- Update colors in `tailwind.config.ts`
- Modify email templates in `actions/email-actions.ts`
- Change app title in `app/layout.tsx`

### Data Schema
- Modify database schema in `scripts/01-create-tables.sql`
- Update parsing logic in `lib/excel-parser.ts`
- Adjust UI components as needed

### Email Templates
- Customize email content in `actions/email-actions.ts`
- Add company branding and logos
- Modify sender information

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Ensure database is accessible
   - Verify credentials

2. **Email Not Sending**
   - Check RESEND_API_KEY is valid
   - Verify domain configuration
   - Check email addresses are valid

3. **File Import Errors**
   - Use provided templates
   - Check column headers match exactly
   - Ensure date formats are correct

4. **Build Errors**
   - Run `npm install` to update dependencies
   - Check TypeScript errors
   - Verify all imports are correct

### Getting Help

1. Check the browser console for errors
2. Review the import results tab for detailed error messages
3. Ensure all environment variables are set correctly
4. Try using sample data first to verify functionality

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.
