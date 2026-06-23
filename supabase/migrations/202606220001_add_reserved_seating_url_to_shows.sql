alter table public.shows
add column if not exists reserved_seating_url text;

update public.shows
set reserved_seating_url = 'https://stageflow.cumberlandmountainmusic.com/available-seats'
where slug = 'august-15-2026'
  and (reserved_seating_url is null or reserved_seating_url = '');
