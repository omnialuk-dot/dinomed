-- If your dispense table doesn't have these columns, run:
alter table dispense add column if not exists pubblicata boolean default false;
alter table dispense add column if not exists created_at timestamptz default now();
