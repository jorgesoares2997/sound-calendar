alter table public.members
add column if not exists access_level text not null default 'basic';

-- Atualiza Jorge e Laís para seus devidos níveis
update public.members
set access_level = 'admin'
where name = 'Jorge Soares';

update public.members
set access_level = 'senior'
where name = 'Laís Vitória';
