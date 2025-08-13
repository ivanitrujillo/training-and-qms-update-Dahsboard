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
  expiry_months INTEGER, -- How many months before recertification needed
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
  status VARCHAR(50) DEFAULT 'assigned', -- assigned, in_progress, completed, overdue
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, course_id, assigned_date)
);

-- Create training_completions table
CREATE TABLE IF NOT EXISTS training_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES training_assignments(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  score DECIMAL(5,2), -- Percentage score if applicable
  certificate_url VARCHAR(500),
  certificate_expiry_date DATE,
  verified_by UUID REFERENCES employees(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create qms_update_plans table
CREATE TABLE IF NOT EXISTS qms_update_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- process, document, system, etc.
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, completed, delayed, cancelled
  priority VARCHAR(20) DEFAULT 'medium',
  responsible_person_id UUID REFERENCES employees(id),
  year INTEGER NOT NULL,
  quarter INTEGER, -- 1, 2, 3, 4
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create qms_tasks table
CREATE TABLE IF NOT EXISTS qms_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qms_plan_id UUID NOT NULL REFERENCES qms_update_plans(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES employees(id),
  due_date DATE,
  completion_date DATE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, blocked
  progress_percentage INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- training_reminder, training_overdue, qms_reminder, certificate_expiry
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- Can reference training_assignments, qms_tasks, etc.
  related_type VARCHAR(50), -- training_assignment, qms_task, etc.
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_training_assignments_employee ON training_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_status ON training_assignments(status);
CREATE INDEX IF NOT EXISTS idx_training_assignments_due_date ON training_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_training_completions_employee ON training_completions(employee_id);
CREATE INDEX IF NOT EXISTS idx_qms_update_plans_year ON qms_update_plans(year);
CREATE INDEX IF NOT EXISTS idx_qms_update_plans_status ON qms_update_plans(status);
CREATE INDEX IF NOT EXISTS idx_qms_tasks_assigned_to ON qms_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
