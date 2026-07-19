-- Six demo profiles for Connecto: three male and three female users.
-- Safe to run more than once: matching profiles are never inserted again.
-- Run add_phone_number_to_users.sql before this seed.

with demo_users (
  name,
  phone_number,
  age,
  gender,
  country,
  state,
  city,
  call_rate,
  is_active,
  is_id_verified,
  is_voice_verified
) as (
  values
    ('Aarav Sharma', '+919100000001', 24, 'male',   'India', 'Maharashtra', 'Mumbai',    12.00, true, true,  true),
    ('Kabir Mehta',  '+919100000002', 27, 'male',   'India', 'Karnataka',   'Bengaluru', 15.00, true, true,  true),
    ('Arjun Verma',  '+919100000003', 22, 'male',   'India', 'Delhi',       'New Delhi', 10.00, true, false, true),
    ('Ananya Iyer',  '+919100000004', 23, 'female', 'India', 'Tamil Nadu',  'Chennai',   14.00, true, true,  true),
    ('Meera Kapoor', '+919100000005', 26, 'female', 'India', 'Telangana',   'Hyderabad', 18.00, true, true,  true),
    ('Riya Patel',   '+919100000006', 25, 'female', 'India', 'Gujarat',     'Ahmedabad', 16.00, true, true,  false)
)
insert into public.users (
  name,
  phone_number,
  age,
  gender,
  country,
  state,
  city,
  call_rate,
  is_active,
  is_id_verified,
  is_voice_verified,
  is_online,
  average_rating,
  created_at
)
select
  demo.name,
  demo.phone_number,
  demo.age,
  demo.gender,
  demo.country,
  demo.state,
  demo.city,
  demo.call_rate,
  demo.is_active,
  demo.is_id_verified,
  demo.is_voice_verified,
  false,
  0,
  now()
from demo_users as demo
where not exists (
  select 1
  from public.users as existing
  where lower(existing.name) = lower(demo.name)
    or existing.phone_number = demo.phone_number
);

select
  name,
  phone_number,
  age,
  gender,
  city,
  is_active
from public.users
where name in (
  'Aarav Sharma',
  'Kabir Mehta',
  'Arjun Verma',
  'Ananya Iyer',
  'Meera Kapoor',
  'Riya Patel'
)
order by gender, name;
