-- ============================================================
-- MARKWISE — QUIZ MAKER — SUPABASE SCHEMA
-- Run this entire file in Supabase SQL Editor (one paste)
-- ============================================================

-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);


-- 2. QUIZZES
-- ============================================================
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz default now()
);

alter table public.quizzes enable row level security;

create policy "Quizzes are viewable by everyone"
  on public.quizzes for select using (true);

create policy "Users can create their own quizzes"
  on public.quizzes for insert with check (auth.uid() = creator_id);

create policy "Users can update their own quizzes"
  on public.quizzes for update using (auth.uid() = creator_id);

create policy "Users can delete their own quizzes"
  on public.quizzes for delete using (auth.uid() = creator_id);

create index quizzes_created_at_idx on public.quizzes(created_at desc);


-- 3. QUESTIONS
-- ============================================================
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  position integer not null default 0
);

alter table public.questions enable row level security;

create policy "Questions are viewable by everyone"
  on public.questions for select using (true);

create policy "Quiz owners can insert questions"
  on public.questions for insert with check (
    auth.uid() in (select creator_id from public.quizzes where quizzes.id = quiz_id)
  );

create policy "Quiz owners can update questions"
  on public.questions for update using (
    auth.uid() in (select creator_id from public.quizzes where quizzes.id = quiz_id)
  );

create policy "Quiz owners can delete questions"
  on public.questions for delete using (
    auth.uid() in (select creator_id from public.quizzes where quizzes.id = quiz_id)
  );

create index questions_quiz_id_idx on public.questions(quiz_id);


-- 4. OPTIONS (multiple-choice options per question)
-- ============================================================
create table public.options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  position integer not null default 0
);

alter table public.options enable row level security;

create policy "Options are viewable by everyone"
  on public.options for select using (true);

create policy "Quiz owners can insert options"
  on public.options for insert with check (
    auth.uid() in (
      select q.creator_id from public.quizzes q
      join public.questions qs on qs.quiz_id = q.id
      where qs.id = question_id
    )
  );

create policy "Quiz owners can update options"
  on public.options for update using (
    auth.uid() in (
      select q.creator_id from public.quizzes q
      join public.questions qs on qs.quiz_id = q.id
      where qs.id = question_id
    )
  );

create policy "Quiz owners can delete options"
  on public.options for delete using (
    auth.uid() in (
      select q.creator_id from public.quizzes q
      join public.questions qs on qs.quiz_id = q.id
      where qs.id = question_id
    )
  );

create index options_question_id_idx on public.options(question_id);


-- 5. ATTEMPTS (a user taking a quiz)
-- ============================================================
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null default 0,
  total_questions integer not null default 0,
  created_at timestamptz default now()
);

alter table public.attempts enable row level security;

create policy "Users can view their own attempts"
  on public.attempts for select using (auth.uid() = user_id);

create policy "Users can insert their own attempts"
  on public.attempts for insert with check (auth.uid() = user_id);

create index attempts_user_id_idx on public.attempts(user_id);
create index attempts_quiz_id_idx on public.attempts(quiz_id);


-- 6. ATTEMPT ANSWERS (records what the user picked, for the review screen)
-- ============================================================
create table public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_option_id uuid references public.options(id) on delete set null,
  is_correct boolean not null default false
);

alter table public.attempt_answers enable row level security;

create policy "Users can view their own attempt answers"
  on public.attempt_answers for select using (
    auth.uid() in (select user_id from public.attempts where attempts.id = attempt_id)
  );

create policy "Users can insert their own attempt answers"
  on public.attempt_answers for insert with check (
    auth.uid() in (select user_id from public.attempts where attempts.id = attempt_id)
  );

-- ============================================================
-- DONE. After running, go to Authentication > Providers and
-- make sure Email provider is enabled (it is by default).
-- ============================================================
