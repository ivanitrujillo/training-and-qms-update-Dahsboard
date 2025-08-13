-- Complete Neon Database Setup for Personal Development Bot
-- This script creates all necessary tables and sample data

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS training_assignments CASCADE;
DROP TABLE IF EXISTS training_courses CASCADE;
DROP TABLE IF EXISTS qms_plans CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- Create employees table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training_courses table
CREATE TABLE training_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_hours INTEGER DEFAULT 0,
    category VARCHAR(100),
    is_mandatory BOOLEAN DEFAULT false,
    expiry_months INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training_assignments table
CREATE TABLE training_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    course_id UUID REFERENCES training_courses(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL,
    due_date DATE NOT NULL,
    completion_date DATE,
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create QMS plans table
CREATE TABLE qms_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    year INTEGER NOT NULL,
    quarter INTEGER CHECK (quarter IN (1, 2, 3, 4)),
    responsible_person VARCHAR(255),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    budget DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_training_assignments_employee ON training_assignments(employee_id);
CREATE INDEX idx_training_assignments_course ON training_assignments(course_id);
CREATE INDEX idx_training_assignments_status ON training_assignments(status);
CREATE INDEX idx_training_assignments_due_date ON training_assignments(due_date);
CREATE INDEX idx_qms_plans_year_quarter ON qms_plans(year, quarter);
CREATE INDEX idx_qms_plans_status ON qms_plans(status);

-- Insert sample employees
INSERT INTO employees (email, first_name, last_name, department, position, hire_date) VALUES
('john.doe@company.com', 'John', 'Doe', 'Engineering', 'Software Engineer', '2021-03-10'),
('jane.smith@company.com', 'Jane', 'Smith', 'Marketing', 'Marketing Specialist', '2021-06-20'),
('mike.johnson@company.com', 'Mike', 'Johnson', 'Sales', 'Sales Representative', '2022-01-05'),
('sarah.wilson@company.com', 'Sarah', 'Wilson', 'Quality', 'QMS Coordinator', '2020-08-12'),
('alex.brown@company.com', 'Alex', 'Brown', 'HR', 'HR Manager', '2019-05-15'),
('lisa.davis@company.com', 'Lisa', 'Davis', 'Finance', 'Financial Analyst', '2022-09-01'),
('david.miller@company.com', 'David', 'Miller', 'Engineering', 'Senior Developer', '2020-02-15'),
('emma.garcia@company.com', 'Emma', 'Garcia', 'Marketing', 'Content Manager', '2021-11-08'),
('ryan.taylor@company.com', 'Ryan', 'Taylor', 'Sales', 'Sales Manager', '2019-07-22'),
('sophia.anderson@company.com', 'Sophia', 'Anderson', 'Quality', 'Quality Analyst', '2022-04-18');

-- Insert sample training courses
INSERT INTO training_courses (title, description, duration_hours, category, is_mandatory, expiry_months) VALUES
('Workplace Safety Training', 'Essential safety protocols and procedures', 4, 'Safety', true, 12),
('Data Privacy & GDPR', 'Data protection regulations and compliance', 2, 'Compliance', true, 24),
('Leadership Development', 'Leadership skills and management techniques', 8, 'Professional Development', false, null),
('Quality Management Systems', 'ISO 9001 principles and implementation', 6, 'Quality', true, 36),
('Cybersecurity Awareness', 'Security best practices and threat prevention', 3, 'Security', true, 12),
('Project Management Fundamentals', 'PM methodologies and tools', 5, 'Professional Development', false, null),
('Customer Service Excellence', 'Customer interaction and satisfaction', 4, 'Customer Service', false, 24),
('Financial Compliance', 'Financial regulations and reporting', 3, 'Compliance', true, 12),
('Communication Skills', 'Effective communication techniques', 2, 'Professional Development', false, null),
('Emergency Response Procedures', 'Emergency protocols and first aid', 3, 'Safety', true, 12);

-- Insert sample training assignments
WITH employee_course_assignments AS (
    SELECT 
        e.id as employee_id,
        c.id as course_id,
        c.title,
        c.is_mandatory,
        CASE 
            WHEN c.is_mandatory THEN 'high'
            ELSE (ARRAY['low', 'medium', 'high'])[floor(random() * 3 + 1)]
        END as priority,
        (ARRAY['assigned', 'in_progress', 'completed'])[floor(random() * 3 + 1)] as status
    FROM employees e
    CROSS JOIN training_courses c
    WHERE random() > 0.3  -- 70% chance of assignment
)
INSERT INTO training_assignments (employee_id, course_id, assigned_date, due_date, status, priority, completion_date)
SELECT 
    employee_id,
    course_id,
    CURRENT_DATE - INTERVAL '30 days' + (random() * 60)::int * INTERVAL '1 day' as assigned_date,
    CURRENT_DATE + INTERVAL '30 days' + (random() * 90)::int * INTERVAL '1 day' as due_date,
    status,
    priority,
    CASE 
        WHEN status = 'completed' THEN CURRENT_DATE - (random() * 30)::int * INTERVAL '1 day'
        ELSE NULL
    END as completion_date
FROM employee_course_assignments;

-- Insert sample QMS plans for 2025-2028
INSERT INTO qms_plans (title, description, category, planned_start_date, planned_end_date, status, priority, year, quarter, responsible_person, progress) VALUES
-- 2025 Plans
('Document Control System Update', 'Modernize document management system with digital workflows', 'system', '2025-01-15', '2025-03-31', 'planned', 'high', 2025, 1, 'Sarah Wilson', 0),
('Process Mapping Review', 'Review and update all process maps for accuracy', 'process', '2025-04-01', '2025-06-30', 'planned', 'medium', 2025, 2, 'Sophia Anderson', 0),
('Internal Audit Procedure Revision', 'Update internal audit procedures and checklists', 'document', '2025-07-01', '2025-09-30', 'planned', 'high', 2025, 3, 'Sarah Wilson', 0),
('Risk Management Framework', 'Implement comprehensive risk management system', 'system', '2025-10-01', '2025-12-31', 'planned', 'critical', 2025, 4, 'Alex Brown', 0),

-- 2026 Plans
('Supplier Quality Management', 'Enhance supplier evaluation and monitoring processes', 'process', '2026-01-15', '2026-03-31', 'planned', 'high', 2026, 1, 'Sophia Anderson', 0),
('Customer Feedback System', 'Implement automated customer feedback collection', 'system', '2026-04-01', '2026-06-30', 'planned', 'medium', 2026, 2, 'Emma Garcia', 0),
('Training Management Overhaul', 'Digitize and streamline training processes', 'process', '2026-07-01', '2026-09-30', 'planned', 'high', 2026, 3, 'Alex Brown', 0),
('Compliance Monitoring System', 'Automated compliance tracking and reporting', 'system', '2026-10-01', '2026-12-31', 'planned', 'critical', 2026, 4, 'Sarah Wilson', 0),

-- 2027 Plans
('Digital Transformation Initiative', 'Complete digital transformation of QMS processes', 'system', '2027-01-15', '2027-03-31', 'planned', 'critical', 2027, 1, 'David Miller', 0),
('Sustainability Integration', 'Integrate sustainability metrics into QMS', 'process', '2027-04-01', '2027-06-30', 'planned', 'high', 2027, 2, 'Sarah Wilson', 0),
('Advanced Analytics Implementation', 'Implement predictive analytics for quality metrics', 'system', '2027-07-01', '2027-09-30', 'planned', 'high', 2027, 3, 'Lisa Davis', 0),
('Stakeholder Engagement Review', 'Review and enhance stakeholder engagement processes', 'process', '2027-10-01', '2027-12-31', 'planned', 'medium', 2027, 4, 'Emma Garcia', 0),

-- 2028 Plans
('AI-Powered Quality Insights', 'Implement AI for quality trend analysis and predictions', 'system', '2028-01-15', '2028-03-31', 'planned', 'critical', 2028, 1, 'David Miller', 0),
('Global Standards Harmonization', 'Align with international quality standards', 'process', '2028-04-01', '2028-06-30', 'planned', 'high', 2028, 2, 'Sarah Wilson', 0),
('Next-Gen Audit Framework', 'Implement continuous auditing with real-time monitoring', 'system', '2028-07-01', '2028-09-30', 'planned', 'high', 2028, 3, 'Sophia Anderson', 0),
('Strategic Review & Planning', 'Comprehensive review and next 4-year planning', 'process', '2028-10-01', '2028-12-31', 'planned', 'critical', 2028, 4, 'Alex Brown', 0);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_courses_updated_at BEFORE UPDATE ON training_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_assignments_updated_at BEFORE UPDATE ON training_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_qms_plans_updated_at BEFORE UPDATE ON qms_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for easier data access
CREATE VIEW employee_training_summary AS
SELECT 
    e.id,
    e.first_name,
    e.last_name,
    e.email,
    e.department,
    COUNT(ta.id) as total_assignments,
    COUNT(CASE WHEN ta.status = 'completed' THEN 1 END) as completed_assignments,
    COUNT(CASE WHEN ta.status = 'overdue' OR (ta.due_date < CURRENT_DATE AND ta.status != 'completed') THEN 1 END) as overdue_assignments,
    COUNT(CASE WHEN ta.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' AND ta.status != 'completed' THEN 1 END) as due_soon_assignments
FROM employees e
LEFT JOIN training_assignments ta ON e.id = ta.employee_id
GROUP BY e.id, e.first_name, e.last_name, e.email, e.department;

CREATE VIEW qms_yearly_summary AS
SELECT 
    year,
    COUNT(*) as total_plans,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_plans,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_plans,
    COUNT(CASE WHEN status = 'planned' THEN 1 END) as planned_plans,
    AVG(progress) as average_progress
FROM qms_plans
GROUP BY year
ORDER BY year;

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- Display summary of created data
SELECT 'Database setup completed successfully!' as message;
SELECT 'Employees created: ' || COUNT(*) as summary FROM employees;
SELECT 'Training courses created: ' || COUNT(*) as summary FROM training_courses;
SELECT 'Training assignments created: ' || COUNT(*) as summary FROM training_assignments;
SELECT 'QMS plans created: ' || COUNT(*) as summary FROM qms_plans;
