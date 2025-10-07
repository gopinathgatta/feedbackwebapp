WITH new_user AS (
    INSERT INTO auth.user (email, password_hash, role)
    VALUES (
        'admin1@example.com',
        crypt('AdminPass123', gen_salt('bf')),
        'admin'
    )
    RETURNING user_id
)
INSERT INTO public.admins (user_id, admin_name, department, level)
SELECT user_id, 'senthil', 'Hostel Affairs', 'warden'
FROM new_user;
