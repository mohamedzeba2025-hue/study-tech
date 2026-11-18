-- STUDY TECH — Supabase initial schema
-- Run this file in Supabase Dashboard > SQL Editor.
-- Safe to re-run: tables, indexes, triggers and policies are created idempotently.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  category text not null default 'Général',
  is_published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  content text not null default '',
  position integer not null default 1 check (position > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, position)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists lessons_course_position_idx on public.lessons(course_id, position);
create index if not exists enrollments_user_idx on public.enrollments(user_id);
create index if not exists progress_user_idx on public.lesson_progress(user_id);

-- Create a student profile automatically after each successful signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Prevent users from changing their own role through the public API.
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role then
    raise exception 'Changing account role is not allowed';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
before update on public.profiles
for each row execute procedure public.prevent_profile_role_change();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

-- Profiles: users can read and update their own non-role fields.
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
for select to authenticated using (id = (select auth.uid()) or public.is_admin());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
for update to authenticated using (id = (select auth.uid()) or public.is_admin())
with check (id = (select auth.uid()) or public.is_admin());

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Courses: visitors can see published courses; admins manage all courses.
drop policy if exists "Public read published courses" on public.courses;
create policy "Public read published courses" on public.courses
for select to anon, authenticated using (is_published or public.is_admin());

drop policy if exists "Admins manage courses" on public.courses;
create policy "Admins manage courses" on public.courses
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Lessons: only published lessons in published courses are public.
drop policy if exists "Public read published lessons" on public.lessons;
create policy "Public read published lessons" on public.lessons
for select to anon, authenticated
using (
  public.is_admin()
  or (
    is_published
    and exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.is_published
    )
  )
);

drop policy if exists "Admins manage lessons" on public.lessons;
create policy "Admins manage lessons" on public.lessons
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Enrollments and progress belong to the signed-in student.
drop policy if exists "Users read own enrollments" on public.enrollments;
create policy "Users read own enrollments" on public.enrollments
for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Users enroll themselves" on public.enrollments;
create policy "Users enroll themselves" on public.enrollments
for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "Admins manage enrollments" on public.enrollments;
create policy "Admins manage enrollments" on public.enrollments
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users manage own progress" on public.lesson_progress;
create policy "Users manage own progress" on public.lesson_progress
for all to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Admins read progress" on public.lesson_progress;
create policy "Admins read progress" on public.lesson_progress
for select to authenticated using (public.is_admin());

-- Assign the first administrator manually in the SQL Editor after signing up:
-- update public.profiles set role = 'admin' where id = (
--   select id from auth.users where email = 'YOUR_EMAIL'
-- );
