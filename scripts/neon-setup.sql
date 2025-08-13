-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  position VARCHAR(100),
  manager_id UUID REFERENCES employees(id),
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training_courses table
CREATE TABLE IF NOT EXISTS training_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_url VARCHAR(500),
  duration_hours INTEGER,
  category VARCHAR(100),
  is_mandatory BOOLEAN DEFAULT false,
  expiry_months INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training_assignments table
CREATE TABLE IF NOT EXISTS training_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL,
  due_date DATE NOT NULL,
  assigned_by UUID REFERENCES employees(id),
  status VARCHAR(50) DEFAULT 'assigned',
  priority VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, course_id, assigned_date)
);

-- Create qms_update_plans table
CREATE TABLE IF NOT EXISTS qms_update_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  status VARCHAR(50) DEFAULT 'planned',
  priority VARCHAR(20) DEFAULT 'medium',
  responsible_person_id UUID REFERENCES employees(id),
  year INTEGER NOT NULL,
  quarter INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO employees (email, first_name, last_name, department, position, hire_date) VALUES
('admin@company.com', 'Admin', 'User', 'HR', 'HR Manager', '2020-01-15'),
('john.doe@company.com', 'John', 'Doe', 'Engineering', 'Software Engineer', '2021-03-10'),
('jane.smith@company.com', 'Jane', 'Smith', 'Marketing', 'Marketing Specialist', '2021-06-20'),
('sarah.wilson@company.com', 'Sarah', 'Wilson', 'Quality', 'QMS Coordinator', '2020-08-12')
ON CONFLICT (email) DO NOTHING;

INSERT INTO training_courses (title, description, duration_hours, category, is_mandatory, expiry_months) VALUES
('Workplace Safety Training', 'Essential safety protocols and procedures', 4, 'Safety', true, 12),
('Data Privacy & GDPR', 'Understanding data protection regulations', 2, 'Compliance', true, 24),
('Quality Management Systems', 'ISO 9001 principles and implementation', 6, 'Quality', true, 36)
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_training_assignments_employee ON training_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_status ON training_assignments(status);
