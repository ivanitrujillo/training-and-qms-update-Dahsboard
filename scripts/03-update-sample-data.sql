-- Add more sample training courses
INSERT INTO training_courses (title, description, course_url, duration_hours, category, is_mandatory, expiry_months) VALUES
('Cybersecurity Awareness', 'Essential cybersecurity practices and threat awareness', 'https://training.company.com/cybersecurity', 3, 'Security', true, 12),
('Customer Service Excellence', 'Delivering exceptional customer experiences', 'https://training.company.com/customer-service', 4, 'Professional Development', false, null),
('Emergency Response Procedures', 'Emergency evacuation and response protocols', 'https://training.company.com/emergency', 2, 'Safety', true, 24),
('Diversity and Inclusion', 'Building inclusive workplace culture', 'https://training.company.com/diversity', 3, 'HR', true, 36),
('Time Management Skills', 'Effective time management and productivity techniques', 'https://training.company.com/time-management', 2, 'Professional Development', false, null);

-- Add sample training assignments
INSERT INTO training_assignments (employee_id, course_id, assigned_date, due_date, status, priority) 
SELECT 
    e.id,
    c.id,
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '30 days',
    'assigned',
    'high'
FROM employees e
CROSS JOIN training_courses c
WHERE e.email IN ('john.doe@company.com', 'jane.smith@company.com')
AND c.title IN ('Workplace Safety Training', 'Data Privacy & GDPR')
LIMIT 10;

-- Add some completed training records
INSERT INTO training_completions (assignment_id, employee_id, course_id, completion_date, score, notes)
SELECT 
    ta.id,
    ta.employee_id,
    ta.course_id,
    CURRENT_DATE - INTERVAL '10 days',
    95.5,
    'Completed successfully with excellent score'
FROM training_assignments ta
LIMIT 3;

-- Update some assignments to completed status
UPDATE training_assignments 
SET status = 'completed'
WHERE id IN (
    SELECT assignment_id FROM training_completions
);

-- Add more QMS tasks for existing plans
INSERT INTO qms_tasks (qms_plan_id, title, description, assigned_to, due_date, status, progress_percentage)
SELECT 
    qup.id,
    'Review current documentation',
    'Analyze existing documentation for gaps and improvements',
    e.id,
    qup.planned_start_date + INTERVAL '15 days',
    'in_progress',
    25
FROM qms_update_plans qup
CROSS JOIN employees e
WHERE e.email = 'sarah.wilson@company.com'
AND qup.year = 2025
LIMIT 5;

-- Add sample notifications
INSERT INTO notifications (recipient_id, type, title, message, related_type, is_read)
SELECT 
    e.id,
    'training_reminder',
    'Training Due Soon',
    'Your ' || tc.title || ' training is due in 7 days.',
    'training_assignment',
    false
FROM employees e
JOIN training_assignments ta ON e.id = ta.employee_id
JOIN training_courses tc ON ta.course_id = tc.id
WHERE ta.status = 'assigned'
AND ta.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
LIMIT 5;
