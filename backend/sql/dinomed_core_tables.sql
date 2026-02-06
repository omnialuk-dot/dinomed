-- Run once in Supabase SQL editor
create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text,
  google_sub text unique,
  username text,
  picture text,
  created_at timestamptz default now()
);

create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  materia text,
  score int,
  totale int,
  created_at timestamptz default now()
);