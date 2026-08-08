CREATE INDEX idx_posts_location_created ON public.posts(location, creation_date DESC, id DESC);

DROP INDEX public.idx_posts_location;
