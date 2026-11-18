-- STUDY TECH database foundation
-- Run this file in the Supabase SQL Editor on a new project.
-- All learner-facing data is protected by PostgreSQL Row Level Security.

begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  preferred_language text not null default 'fr'
    check (preferred_language in ('fr', 'en')),
  role text not null default 'student'
    check (role in ('student', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_fr text not null,
  title_en text not null,
  description_fr text not null default '',
  description_en text not null default '',
  category text not null,
  cover_image_url text,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title_fr text not null,
  title_en text not null,
  content_fr text not null default '',
  content_en text not null default '',
  position integer not null check (position > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, position)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);

create index if not exists courses_published_idx on public.courses (is_published);
create index if not exists lessons_course_position_idx on public.lessons (course_id, position);
create index if not exists enrollments_student_idx on public.enrollments (student_id);
create index if not exists progress_student_idx on public.lesson_progress (student_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists lessons_set_updated_at on public.lessons;
create trigger lessons_set_updated_at before update on public.lessons
for each row execute function public.set_updated_at();

-- Create a profile automatically when Supabase Auth creates a user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.raw_user_meta_data ->> 'preferred_language' in ('fr', 'en')
      then new.raw_user_meta_data ->> 'preferred_language'
      else 'fr'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- A normal authenticated user must never promote their own account to admin.
create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role then
    raise exception 'Profile role changes are restricted to trusted administrators';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_role_escalation on public.profiles;
create trigger prevent_profile_role_escalation
before update on public.profiles
for each row execute function public.prevent_profile_role_escalation();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

-- Profiles: each learner can read and update only their own profile.
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update to authenticated
using (id = (select auth.uid()) or public.is_admin())
with check (id = (select auth.uid()) or public.is_admin());

-- Courses: published courses are public; administrators manage all courses.
drop policy if exists "Published courses are visible" on public.courses;
create policy "Published courses are visible"
on public.courses for select
using (is_published = true or public.is_admin());

drop policy if exists "Administrators manage courses" on public.courses;
create policy "Administrators manage courses"
on public.courses for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Lessons: visible only when published and their course is published, unless admin.
drop policy if exists "Published lessons are visible" on public.lessons;
create policy "Published lessons are visible"
on public.lessons for select
using (
  public.is_admin()
  or (
    is_published = true
    and exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.is_published = true
    )
  )
);

drop policy if exists "Administrators manage lessons" on public.lessons;
create policy "Administrators manage lessons"
on public.lessons for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Enrollments: learners may enroll themselves in published courses for free.
drop policy if exists "Students read own enrollments" on public.enrollments;
create policy "Students read own enrollments"
on public.enrollments for select to authenticated
using (student_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Students enroll themselves" on public.enrollments;
create policy "Students enroll themselves"
on public.enrollments for insert to authenticated
with check (
  student_id = (select auth.uid())
  and exists (
    select 1 from public.courses c
    where c.id = enrollments.course_id and c.is_published = true
  )
);

drop policy if exists "Administrators manage enrollments" on public.enrollments;
create policy "Administrators manage enrollments"
on public.enrollments for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Learners can manage only their own progress for lessons in courses they joined.
drop policy if exists "Students read own progress" on public.lesson_progress;
create policy "Students read own progress"
on public.lesson_progress for select to authenticated
using (student_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Students record own progress" on public.lesson_progress;
create policy "Students record own progress"
on public.lesson_progress for insert to authenticated
with check (
  student_id = (select auth.uid())
  and exists (
    select 1
    from public.lessons l
    join public.enrollments e on e.course_id = l.course_id
    where l.id = lesson_progress.lesson_id
      and e.student_id = (select auth.uid())
  )
);

drop policy if exists "Students remove own progress" on public.lesson_progress;
create policy "Students remove own progress"
on public.lesson_progress for delete to authenticated
using (student_id = (select auth.uid()) or public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.courses, public.lessons to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, delete on public.enrollments to authenticated;
grant select, insert, delete on public.lesson_progress to authenticated;
grant execute on function public.is_admin() to authenticated;

commit;
