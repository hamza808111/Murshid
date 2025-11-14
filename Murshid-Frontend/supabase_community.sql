-- Community feature: posts and comments with scope and role-based rules

-- Posts table
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  kind text not null check (kind in ('post','question')),
  scope text not null check (scope in ('global','university','major')),
  university_id uuid null references universities(id) on delete set null,
  major_id uuid null references majors(id) on delete set null,
  title text null,
  content text not null,
  created_at timestamp with time zone not null default now()
);

alter table posts enable row level security;

-- Comments table
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone not null default now()
);

alter table comments enable row level security;

-- Read policies (public)
drop policy if exists "Anyone can read posts" on posts;
create policy "Anyone can read posts" on posts for select using (true);

drop policy if exists "Anyone can read comments" on comments;
create policy "Anyone can read comments" on comments for select using (true);

-- Insert posts policies
-- Students: can create questions (any scope)
drop policy if exists "Students can create questions" on posts;
create policy "Students can create questions" on posts for insert
  with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'Student')
    and kind = 'question'
    and author_id = auth.uid()
  );

-- Specialists: can create posts; if scoped to university, must match their university_id
drop policy if exists "Specialists can create posts globally" on posts;
create policy "Specialists can create posts globally" on posts for insert
  with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'Specialist')
    and kind = 'post'
    and author_id = auth.uid()
    and (
      scope = 'global' or
      (scope = 'university' and university_id is not null and university_id = (select university_id from profiles where id = auth.uid())) or
      scope = 'major' -- allow major for now; further restriction can be added when specialist_major_id is available
    )
  );

-- Insert comments: Only specialists; if post is university-scoped, must match their university
drop policy if exists "Specialists can comment" on comments;
create policy "Specialists can comment" on comments for insert
  with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'Specialist')
    and author_id = auth.uid()
    and (
      -- Allow commenting on global and major for now
      exists (select 1 from posts po where po.id = post_id and po.scope in ('global','major'))
      or
      -- University scoped must match specialist university
      exists (
        select 1 from posts po
        join profiles sp on sp.id = auth.uid()
        where po.id = post_id and po.scope = 'university' and po.university_id = sp.university_id
      )
    )
  );

-- Optional: update/delete policies so authors can manage their content
drop policy if exists "Authors can update own posts" on posts;
create policy "Authors can update own posts" on posts for update using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists "Authors can delete own posts" on posts;
create policy "Authors can delete own posts" on posts for delete using (author_id = auth.uid());

drop policy if exists "Authors can update own comments" on comments;
create policy "Authors can update own comments" on comments for update using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists "Authors can delete own comments" on comments;
create policy "Authors can delete own comments" on comments for delete using (author_id = auth.uid());

-- Triggers to auto-fill author_id with auth.uid() when not provided
create or replace function public.set_default_author_id()
returns trigger
security definer
as $$
begin
  if NEW.author_id is null then
    NEW.author_id := auth.uid();
  end if;
  return NEW;
end;
$$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'posts_set_author_id') then
    create trigger posts_set_author_id before insert on posts
    for each row execute function public.set_default_author_id();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'comments_set_author_id') then
    create trigger comments_set_author_id before insert on comments
    for each row execute function public.set_default_author_id();
  end if;
end $$;

-- ==============================
-- Tag join tables (multi-tagging)
-- ==============================
create table if not exists posts_universities (
  post_id uuid not null references posts(id) on delete cascade,
  university_id uuid not null references universities(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  primary key (post_id, university_id)
);

create table if not exists posts_majors (
  post_id uuid not null references posts(id) on delete cascade,
  major_id uuid not null references majors(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  primary key (post_id, major_id)
);

alter table posts_universities enable row level security;
alter table posts_majors enable row level security;

-- Read policies
drop policy if exists "Anyone can read posts_universities" on posts_universities;
create policy "Anyone can read posts_universities" on posts_universities for select using (true);

drop policy if exists "Anyone can read posts_majors" on posts_majors;
create policy "Anyone can read posts_majors" on posts_majors for select using (true);

-- Insert policies for tags
-- Only authors can tag their own post.
-- Students can tag any university/major. Specialists can only tag their own university in posts_universities.
drop policy if exists "Authors can tag universities (restricted for specialists)" on posts_universities;
create policy "Authors can tag universities (restricted for specialists)" on posts_universities for insert
  with check (
    exists (
      select 1
      from posts p
      join profiles pr on pr.id = auth.uid()
      where p.id = posts_universities.post_id and p.author_id = auth.uid()
        and (
          pr.role = 'Student'
          or (pr.role = 'Specialist' and posts_universities.university_id = pr.university_id)
        )
    )
  );

drop policy if exists "Authors can tag majors" on posts_majors;
create policy "Authors can tag majors" on posts_majors for insert
  with check (
    exists (
      select 1 from posts p where p.id = post_id and p.author_id = auth.uid()
    )
  );
-- Ensure pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;
