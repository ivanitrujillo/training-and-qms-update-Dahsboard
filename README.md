# Personal Development Bot - Training & QMS Dashboard

A comprehensive training management and quality management system (QMS) dashboard built with Next.js, featuring Excel import, email notifications, and database integration.

## 🚀 Features

- **📊 Interactive Dashboard** - Real-time analytics and visualizations
- **👥 Employee Management** - Complete employee directory with training tracking
- **📚 Training Management** - Assignment tracking, progress monitoring, and email reminders
- **📋 QMS Planning** - 4-year strategic planning with quarterly breakdown
- **📤 Excel Import** - Drag & drop Excel file processing with auto-detection
- **📧 Email Notifications** - Individual and bulk training reminders
- **🗄️ Database Integration** - Supports Neon, PostgreSQL, and local storage
- **📱 Responsive Design** - Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Recharts for visualizations
- **Database**: Neon PostgreSQL (optional), with fallback to local storage
- **Email**: Resend API for email notifications
- **File Processing**: XLSX library for Excel parsing
- **Deployment**: Vercel

## 🚀 Quick Start

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/personal-development-bot)

### 2. Environment Variables (Optional)

Add these environment variables in Vercel dashboard for full functionality:

\`\`\`env
# Database (Optional - uses sample data if not configured)
DATABASE_URL=postgresql://username:password@host:port/database

# Email Service (Optional - uses demo mode if not configured)
RESEND_API_KEY=re_your_resend_api_key

# Site URL (Auto-configured by Vercel)
NEXT_PUBLIC_SITE_URL=https://your-app-name.vercel.app
\`\`\`

### 3. Local Development

\`\`\`bash
# Clone the repository
git clone https://github.com/your-username/personal-development-bot
cd personal-development-bot

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

## 📋 Usage

### 1. Import Data
- Go to the "Import Data" tab
- Download templates or use the drag & drop area
- Upload Excel files with employee, training, or QMS data
- Files are auto-detected based on filename or content

### 2. View Dashboard
- Monitor training completion rates and overdue assignments
- View department-wise analytics and progress charts
- Track QMS plans across multiple years

### 3. Manage Training
- Filter employees and training assignments
- Send individual or bulk email reminders
- Track completion status and priorities

### 4. QMS Planning
- View 4-year strategic timeline (2025-2028)
- Filter by year and quarter
- Track progress on quality initiatives

## 🗄️ Database Setup (Optional)

### Neon Database (Recommended)
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add as `DATABASE_URL` environment variable
5. Database tables are created automatically

### Local PostgreSQL
1. Install PostgreSQL locally
2. Create new database
3. Set `DATABASE_URL` environment variable
4. Run the provided SQL scripts

## 📧 Email Configuration (Optional)

### Resend API
1. Create account at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Add as `RESEND_API_KEY` environment variable
4. System automatically switches to live email sending

## 📁 File Structure

\`\`\`
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard.tsx     # Main dashboard
│   ├── excel-import.tsx  # File import functionality
│   └── employee-training-view.tsx
├── lib/                  # Utility libraries
│   └── database.ts       # Database operations
├── actions/              # Server actions
│   └── email-actions.ts  # Email functionality
├── scripts/              # Database scripts
└── excel-parser.ts       # Excel file processing
\`\`\`

## 🎯 Key Features

### Excel Import
- **Auto-Detection**: Files detected by name or content
- **Multiple Formats**: Supports .xlsx and .xls files
- **Batch Processing**: Upload multiple files at once
- **Error Handling**: Detailed error messages and recovery
- **Templates**: Download CSV templates with sample data

### Email System
- **Demo Mode**: Works without configuration (logs to console)
- **Live Mode**: Real emails via Resend API
- **Bulk Operations**: Send to multiple employees
- **Custom Messages**: Personalized email content
- **HTML Templates**: Professional email formatting

### Database Integration
- **Flexible**: Works with or without database
- **Auto-Migration**: Tables created automatically
- **Sample Data**: Fallback data when no database
- **Real-time**: Live data updates and refresh

## 🔧 Customization

### Adding New Data Types
1. Create parser function in `excel-parser.ts`
2. Add database operations in `lib/database.ts`
3. Update import component in `components/excel-import.tsx`
4. Add visualization in dashboard

### Email Templates
- Modify templates in `actions/email-actions.ts`
- Add new email types and triggers
- Customize HTML styling and content

### Dashboard Widgets
- Add new charts in `components/dashboard.tsx`
- Create custom visualizations with Recharts
- Add filtering and interactive features

## 📊 Sample Data

The application includes comprehensive sample data:
- **10 Employees** across different departments
- **Multiple Training Assignments** with various statuses
- **16 QMS Plans** spanning 2025-2028
- **Realistic Due Dates** for testing overdue detection

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms
- **Netlify**: Configure build settings
- **Railway**: Add environment variables
- **Self-hosted**: Use Docker or PM2

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Open GitHub issue for bugs or feature requests
- **Email**: Contact support for deployment help

---

Built with ❤️ using Next.js, shadcn/ui, and modern web technologies.
