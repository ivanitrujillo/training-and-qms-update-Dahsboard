-- Insert sample employees
INSERT INTO employees (email, first_name, last_name, department, position, hire_date) VALUES
('admin@company.com', 'Admin', 'User', 'HR', 'HR Manager', '2020-01-15'),
('john.doe@company.com', 'John', 'Doe', 'Engineering', 'Software Engineer', '2021-03-10'),
('jane.smith@company.com', 'Jane', 'Smith', 'Marketing', 'Marketing Specialist', '2021-06-20'),
('mike.johnson@company.com', 'Mike', 'Johnson', 'Sales', 'Sales Representative', '2022-01-05'),
('sarah.wilson@company.com', 'Sarah', 'Wilson', 'Quality', 'QMS Coordinator', '2020-08-12');

-- Insert sample training courses
INSERT INTO training_courses (title, description, course_url, duration_hours, category, is_mandatory, expiry_months) VALUES
('Workplace Safety Training', 'Essential safety protocols and procedures', 'https://training.company.com/safety', 4, 'Safety', true, 12),
('Data Privacy & GDPR', 'Understanding data protection regulations', 'https://training.company.com/gdpr', 2, 'Compliance', true, 24),
('Leadership Development', 'Building effective leadership skills', 'https://training.company.com/leadership', 8, 'Professional Development', false, null),
('Quality Management Systems', 'ISO 9001 principles and implementation', 'https://training.company.com/qms', 6, 'Quality', true, 36),
('Project Management Fundamentals', 'Basic project management methodologies', 'https://training.company.com/pm', 5, 'Professional Development', false, null);

-- Insert sample QMS update plans for 2025-2028
INSERT INTO qms_update_plans (title, description, category, planned_start_date, planned_end_date, status, year, quarter, responsible_person_id) VALUES
('Document Control System Update', 'Modernize document management processes', 'system', '2025-01-15', '2025-03-31', 'planned', 2025, 1, (SELECT id FROM employees WHERE email = 'sarah.wilson@company.com')),
('Process Mapping Review', 'Review and update all process maps', 'process', '2025-04-01', '2025-06-30', 'planned', 2025, 2, (SELECT id FROM employees WHERE email = 'sarah.wilson@company.com')),
('Internal Audit Procedure Revision', 'Update internal audit procedures', 'document', '2025-07-01', '2025-09-30', 'planned', 2025, 3, (SELECT id FROM employees WHERE email = 'sarah.wilson@company.com')),
('Risk Management Framework', 'Implement comprehensive risk management', 'system', '2025-10-01', '2025-12-31', 'planned', 2025, 4, (SELECT id FROM employees WHERE email = 'sarah.wilson@company.com')),
('Supplier Quality Management', 'Enhance supplier evaluation processes', 'process', '2026-01-15', '2026-03-31', 'planned', 2026, 1, (SELECT id FROM employees WHERE email = 'sarah.wilson@company.com'));
