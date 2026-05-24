-- RLS policies for public.posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_read" ON public.posts;
DROP POLICY IF EXISTS "post_insert_author_member" ON public.posts;
DROP POLICY IF EXISTS "post_update_author" ON public.posts;
DROP POLICY IF EXISTS "post_delete_tale_owner" ON public.posts;

-- READ: public tales OR author OR participant
CREATE POLICY "post_read"
ON public.posts
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.locations l
    JOIN public.tales t ON t.id = l.tale_id
    WHERE l.id = posts.location
      AND (
        t.is_public = true
        OR posts.author = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.tale_participants tp
          WHERE tp.tale_id = t.id
            AND tp.participant_id = auth.uid()
        )
      )
  )
);

-- CREATE: author AND must belong to tale
CREATE POLICY "post_insert_author_member"
ON public.posts
FOR INSERT
WITH CHECK (
  posts.author = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.locations l
    JOIN public.tales t ON t.id = l.tale_id
    JOIN public.tale_participants tp
      ON tp.tale_id = t.id
     AND tp.participant_id = auth.uid()
    WHERE l.id = posts.location
  )
);

-- UPDATE: author only
CREATE POLICY "post_update_author"
ON public.posts
FOR UPDATE
USING (posts.author = auth.uid())
WITH CHECK (posts.author = auth.uid());

-- DELETE: tale owner only
CREATE POLICY "post_delete_tale_owner"
ON public.posts
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.locations l
    JOIN public.tales t ON t.id = l.tale_id
    WHERE l.id = posts.location
      AND t.owner_id = auth.uid()
  )
);
