-- ============================================================
-- JOB BOARD — SUPABASE SCHEMA
-- Run this entire file in Supabase SQL Editor (one paste)
-- ============================================================

-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null check (role in ('employer', 'candidate')),
  company_name text,          -- employer only
  company_website text,       -- employer only
  headline text,               -- candidate only, e.g. "Frontend Developer"
  bio text,
  resume_url text,             -- candidate only, link to storage object
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);


-- 2. JOBS
-- ============================================================
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  company_name text not null,
  location text not null,
  job_type text not null check (job_type in ('Full-time', 'Part-time', 'Contract', 'Internship', 'Remote')),
  salary_min integer,
  salary_max integer,
  description text not null,
  requirements text,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz default now()
);

alter table public.jobs enable row level security;

create policy "Jobs are viewable by everyone"
  on public.jobs for select using (true);

create policy "Employers can insert their own jobs"
  on public.jobs for insert with check (auth.uid() = employer_id);

create policy "Employers can update their own jobs"
  on public.jobs for update using (auth.uid() = employer_id);

create policy "Employers can delete their own jobs"
  on public.jobs for delete using (auth.uid() = employer_id);

create index jobs_status_idx on public.jobs(status);
create index jobs_created_at_idx on public.jobs(created_at desc);


-- 3. APPLICATIONS
-- ============================================================
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  cover_note text,
  resume_url text,
  status text not null default 'submitted' check (status in ('submitted', 'reviewed', 'shortlisted', 'rejected', 'hired')),
  created_at timestamptz default now(),
  unique (job_id, candidate_id)
);

alter table public.applications enable row level security;

create policy "Candidates can view their own applications"
  on public.applications for select using (auth.uid() = candidate_id);

create policy "Employers can view applications to their jobs"
  on public.applications for select using (
    auth.uid() in (select employer_id from public.jobs where jobs.id = job_id)
  );

create policy "Candidates can apply"
  on public.applications for insert with check (auth.uid() = candidate_id);

create policy "Employers can update application status"
  on public.applications for update using (
    auth.uid() in (select employer_id from public.jobs where jobs.id = job_id)
  );


-- 4. NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info', 'success', 'warning')),
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update using (auth.uid() = user_id);

create policy "Authenticated users can insert notifications"
  on public.notifications for insert with check (true);


-- 5. TRIGGER: auto-create notification + handle new application
-- ============================================================
create or replace function public.handle_new_application()
returns trigger as $$
declare
  v_employer_id uuid;
  v_job_title text;
  v_candidate_name text;
begin
  select employer_id, title into v_employer_id, v_job_title
  from public.jobs where id = new.job_id;

  select full_name into v_candidate_name
  from public.profiles where id = new.candidate_id;

  insert into public.notifications (user_id, title, message, type)
  values (
    v_employer_id,
    'New application received',
    coalesce(v_candidate_name, 'A candidate') || ' applied for ' || v_job_title,
    'info'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_application_created
  after insert on public.applications
  for each row execute function public.handle_new_application();


-- 6. TRIGGER: notify candidate when application status changes
-- ============================================================
create or replace function public.handle_application_status_change()
returns trigger as $$
declare
  v_job_title text;
begin
  if new.status <> old.status then
    select title into v_job_title from public.jobs where id = new.job_id;

    insert into public.notifications (user_id, title, message, type)
    values (
      new.candidate_id,
      'Application update',
      'Your application for ' || v_job_title || ' is now: ' || new.status,
      case when new.status in ('shortlisted', 'hired') then 'success'
           when new.status = 'rejected' then 'warning'
           else 'info' end
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_application_status_change
  after update on public.applications
  for each row execute function public.handle_application_status_change();


-- 7. STORAGE BUCKET for resumes
-- ============================================================
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

create policy "Resumes are publicly accessible"
  on storage.objects for select using (bucket_id = 'resumes');

create policy "Authenticated users can upload resumes"
  on storage.objects for insert with check (
    bucket_id = 'resumes' and auth.role() = 'authenticated'
  );

create policy "Users can update their own resumes"
  on storage.objects for update using (
    bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- DONE. After running, go to Authentication > Providers and
-- make sure Email provider is enabled (it is by default).
-- ============================================================
