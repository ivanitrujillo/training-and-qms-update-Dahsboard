-- Complete Neon Database Setup for Training & QMS Dashboard
-- This script creates all tables, indexes, views, and sample data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS training_assignments CASCADE;
DROP TABLE IF EXISTS qms_updates CASCADE;
DROP TABLE IF EXISTS training_courses CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP VIEW IF EXISTS dashboard_stats CASCADE;

-- Create employees table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training courses table
CREATE TABLE training_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_hours INTEGER DEFAULT 1,
    category VARCHAR(100) DEFAULT 'General',
    is_mandatory BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training assignments table
CREATE TABLE training_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    course_id UUID REFERENCES training_courses(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL,
    due_date DATE NOT NULL,
    completion_date DATE,
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, course_id)
);

-- Create QMS updates table
CREATE TABLE qms_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    planned_start_date DATE NOT NULL,
    planned_end_date DATE NOT NULL,
    actual_start_date DATE,
    actual_end_date DATE,
    responsible_person_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'delayed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    year INTEGER NOT NULL,
    quarter INTEGER CHECK (quarter IN (1, 2, 3, 4)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_active ON employees(is_active);
CREATE INDEX idx_training_assignments_employee ON training_assignments(employee_id);
CREATE INDEX idx_training_assignments_course ON training_assignments(course_id);
CREATE INDEX idx_training_assignments_status ON training_assignments(status);
CREATE INDEX idx_training_assignments_due_date ON training_assignments(due_date);
CREATE INDEX idx_qms_updates_responsible ON qms_updates(responsible_person_id);
CREATE INDEX idx_qms_updates_status ON qms_updates(status);
CREATE INDEX idx_qms_updates_year_quarter ON qms_updates(year, quarter);

-- Create dashboard statistics view
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM employees WHERE is_active = true) as total_employees,
    (SELECT COUNT(*) FROM training_assignments ta JOIN employees e ON ta.employee_id = e.id WHERE e.is_active = true) as total_training_assignments,
    (SELECT COUNT(*) FROM training_assignments ta JOIN employees e ON ta.employee_id = e.id WHERE e.is_active = true AND ta.status = 'completed') as completed_training,
    (SELECT COUNT(*) FROM training_assignments ta JOIN employees e ON ta.employee_id = e.id WHERE e.is_active = true AND ta.due_date < CURRENT_DATE AND ta.status != 'completed') as overdue_training,
    (SELECT COUNT(*) FROM qms_updates) as total_qms_updates,
    (SELECT COUNT(*) FROM qms_updates WHERE status = 'completed') as completed_qms,
    (SELECT COUNT(*) FROM qms_updates WHERE status = 'in_progress') as in_progress_qms;

-- Insert sample employees
INSERT INTO employees (email, first_name, last_name, department, position, hire_date) VALUES
('john.doe@company.com', 'John', 'Doe', 'Engineering', 'Software Engineer', '2023-01-15'),
('jane.smith@company.com', 'Jane', 'Smith', 'Marketing', 'Marketing Manager', '2022-03-10'),
('mike.johnson@company.com', 'Mike', 'Johnson', 'Sales', 'Sales Representative', '2023-06-01'),
('sarah.wilson@company.com', 'Sarah', 'Wilson', 'Quality', 'QMS Coordinator', '2021-09-20'),
('alex.brown@company.com', 'Alex', 'Brown', 'HR', 'HR Manager', '2022-11-05'),
('emily.davis@company.com', 'Emily', 'Davis', 'Finance', 'Financial Analyst', '2023-02-28'),
('david.miller@company.com', 'David', 'Miller', 'Operations', 'Operations Manager', '2021-12-15'),
('lisa.garcia@company.com', 'Lisa', 'Garcia', 'Engineering', 'Senior Developer', '2022-08-22'),
('tom.anderson@company.com', 'Tom', 'Anderson', 'Sales', 'Sales Manager', '2021-05-10'),
('maria.rodriguez@company.com', 'Maria', 'Rodriguez', 'Quality', 'Quality Analyst', '2023-04-18');

-- Insert sample training courses
INSERT INTO training_courses (title, description, duration_hours, category, is_mandatory) VALUES
('Security Awareness Training', 'Comprehensive cybersecurity awareness training covering phishing, password security, and data protection', 2, 'Security', true),
('Data Privacy & GDPR', 'Understanding GDPR requirements and data privacy best practices', 3, 'Compliance', true),
('Leadership Development', 'Essential leadership skills for managers and team leads', 8, 'Leadership', false),
('Quality Management Systems', 'ISO 9001 principles and quality management practices', 6, 'Quality', true),
('HR Compliance Training', 'Employment law, workplace harassment, and HR policies', 4, 'HR', true),
('Project Management Fundamentals', 'Basic project management methodologies and tools', 5, 'Management', false),
('Customer Service Excellence', 'Advanced customer service techniques and communication skills', 3, 'Customer Service', false),
('Health & Safety Training', 'Workplace safety protocols and emergency procedures', 2, 'Safety', true),
('Financial Planning & Analysis', 'Budget planning, financial analysis, and reporting', 4, 'Finance', false),
('Technical Writing Skills', 'Professional documentation and communication standards', 2, 'Communication', false);

-- Insert sample training assignments
INSERT INTO training_assignments (employee_id, course_id, assigned_date, due_date, status, priority, progress) 
SELECT 
    e.id,
    c.id,
    CASE 
        WHEN random() < 0.3 THEN CURRENT_DATE - INTERVAL '30 days'
        WHEN random() < 0.6 THEN CURRENT_DATE - INTERVAL '15 days'
        ELSE CURRENT_DATE - INTERVAL '5 days'
    END as assigned_date,
    CASE 
        WHEN random() < 0.2 THEN CURRENT_DATE - INTERVAL '5 days'  -- Overdue
        WHEN random() < 0.5 THEN CURRENT_DATE + INTERVAL '30 days' -- Due soon
        ELSE CURRENT_DATE + INTERVAL '60 days' -- Future
    END as due_date,
    CASE 
        WHEN random() < 0.3 THEN 'completed'
        WHEN random() < 0.6 THEN 'in_progress'
        WHEN random() < 0.8 THEN 'assigned'
        ELSE 'overdue'
    END as status,
    CASE 
        WHEN random() < 0.1 THEN 'critical'
        WHEN random() < 0.3 THEN 'high'
        WHEN random() < 0.7 THEN 'medium'
        ELSE 'low'
    END as priority,
    CASE 
        WHEN random() < 0.3 THEN 100
        WHEN random() < 0.6 THEN FLOOR(random() * 80 + 20)::INTEGER
        ELSE FLOOR(random() * 30)::INTEGER
    END as progress
FROM employees e
CROSS JOIN training_courses c
WHERE random() < 0.4  -- Only assign ~40% of possible combinations
LIMIT 25;

-- Update completion dates for completed assignments
UPDATE training_assignments 
SET completion_date = assigned_date + INTERVAL '7 days'
WHERE status = 'completed';

-- Insert sample QMS updates for 2025-2028
INSERT INTO qms_updates (title, description, category, planned_start_date, planned_end_date, responsible_person_id, status, priority, year, quarter, progress) VALUES
-- 2025 Q1
('Document Control System Update', 'Implement new document management system with version control and automated workflows', 'System', '2025-01-01', '2025-03-31', (SELECT id FROM employees WHERE email = 'sarah.wilson@company.com'), 'planned', 'high', 2025, 1, 0),
('Employee Training Matrix Review', 'Review and update training requirements matrix for all positions', 'Process', '2025-01-15', '2025-03-15', (SELECT id FROM employees WHERE email = 'alex.brown@company.com'), 'planned', 'medium', 2025, 1, 0),
('Internal Audit Schedule Planning', 'Plan internal audit schedule for 2025 and assign audit teams', 'Planning', '2025-02-01', '2025-02-28', (SELECT id FROM employees WHERE email = 'maria.rodriguez@company.com'), 'planned', 'high', 2025, 1, 0),
('Risk Assessment Update', 'Conduct comprehensive risk assessment and update risk register', 'Assessment', '2025-03-01', '2025-03-31', (SELECT id FROM employees WHERE email = 'sarah.wilson@company.com'), 'planned', 'critical', 2025, 1, 0),

-- 2025 Q2
('Process Mapping Review', 'Review and update all process maps with current workflows', 'Process', '2025-04-01', '2025-06-30', (SELECT id FROM employees WHERE email = 'david.miller@company.com'), 'planned', 'medium', 2025, 2, 0),
('Supplier Quality Assessment', 'Evaluate supplier quality management systems and update approved vendor list', 'Assessment', '2025-04-15', '2025-06-15', (SELECT id FROM employees WHERE email = 'maria.rodriguez@company.com'), 'planned', 'high', 2025, 2, 0),
('Customer Satisfaction Survey', 'Conduct annual customer satisfaction survey and analyze results', 'Survey', '2025-05-01', '2025-06-30', (SELECT id FROM employees WHERE email = 'tom.anderson@company.com'), 'planned', 'medium', 2025, 2, 0),
('Corrective Action System Enhancement', 'Improve CAPA system with automated tracking and notifications', 'System', '2025-06-01', '2025-06-30', (SELECT id FROM employees WHERE email = 'sarah.wilson@company.com'), 'planned', 'high', 2025, 2, 0),

-- 2025 Q3
('Internal Audit Procedure Revision', 'Update internal audit procedures based on ISO 19011:2018', 'Document', '2025-07-01', '2025-09-30', (SELECT id FROM employees WHERE email = 'maria.rodriguez@company.com'), 'planned', 'high', 2025, 3, 0),
('Management Review Process Update', 'Streamline management review process and improve data collection', 'Process', '2025-07-15', '2025-09-15', (SELECT id FROM employees WHERE email = 'sarah.wilson@company.com'), 'planned', 'medium', 2025, 3, 0),
('Quality Objectives Review', 'Review and update quality objectives for 2026', 'Planning', '2025-08-01', '2025-09-30', (SELECT id FROM employees WHERE email = 'sarah.wilson@company.com'), 'planned', 'high', 2025, 3, 0),
('Training Effectiveness Evaluation', 'Evaluate effectiveness of training programs and update curricula', 'Assessment', '2025-09-01', '2025-09-30', (SELECT id FROM employees WHERE email = 'alex.brown@company.com'), 'planned', 'medium', 2025, 3, 0),

-- 2025 Q4
('ISO 9001 Certification Renewal', 'Prepare for ISO 9001 certification renewal audit', 'Certification', '2025-10-01', '2025-12-31', (SELECT id FROM employees WHERE email = 'sarah.wilson@company.com'), 'planned', 'critical', 2025, 4, 0),
('Quality Manual Update', 'Update quality manual to reflect current processes and procedures', 'Document', '2025-10-15', '2025-12-15', (SELECT id FROM employees WHERE email = 'sarah.wilson@company.com'), 'planned', 'high', 2025, 4, 0),
('Performance Metrics Dashboard', 'Implement real-time quality performance metrics dashboard', 'System', '2025-11-01', '2025-12-31', (SELECT id FROM employees WHERE email = 'lisa.garcia@company.com'), 'planned', 'medium', 2025, 4, 0),
('Year-End Quality Review', 'Conduct comprehensive quality system review for 2025', 'Review', '2025-12-01', '2025-12-31', (SELECT id FROM employees WHERE email = 'sarah.wilson@company.com'), 'planned', 'high', 2025, 4, 0);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_courses_updated_at BEFORE UPDATE ON training_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_assignments_updated_at BEFORE UPDATE ON training_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_qms_updates_updated_at BEFORE UPDATE ON qms_updates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update training assignment status based on due date
CREATE OR REPLACE FUNCTION update_training_status()
RETURNS void AS $$
BEGIN
    UPDATE training_assignments 
    SET status = 'overdue'
    WHERE due_date < CURRENT_DATE 
    AND status NOT IN ('completed', 'overdue');
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO neondb_owner;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO neondb_owner;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO neondb_owner;

-- Verify setup with sample queries
SELECT 'Setup completed successfully!' as message;
SELECT 'Total employees: ' || COUNT(*) as employees FROM employees;
SELECT 'Total courses: ' || COUNT(*) as courses FROM training_courses;
SELECT 'Total assignments: ' || COUNT(*) as assignments FROM training_assignments;
SELECT 'Total QMS updates: ' || COUNT(*) as qms_updates FROM qms_updates;
SELECT * FROM dashboard_stats;
