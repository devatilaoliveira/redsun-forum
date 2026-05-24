-- RLS policies for public.tales
ALTER TABLE public.tales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tale_read" ON public.tales;
DROP POLICY IF EXISTS "tale_insert_owner" ON public.tales;
DROP POLICY IF EXISTS "tale_update_owner" ON public.tales;
DROP POLICY IF EXISTS "tale_delete_owner" ON public.tales;

-- READ: public OR owner OR participant
CREATE POLICY "tale_read"
ON public.tales
FOR SELECT
USING (
  is_public = true
  OR owner_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.tale_participants tp
    WHERE tp.tale_id = id
      AND tp.participant_id = auth.uid()
  )
);

-- CREATE: owner only
CREATE POLICY "tale_insert_owner"
ON public.tales
FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- UPDATE: owner only
CREATE POLICY "tale_update_owner"
ON public.tales
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- DELETE: owner only
CREATE POLICY "tale_delete_owner"
ON public.tales
FOR DELETE
USING (owner_id = auth.uid());

-- Trigger function: touch tale + location when a post is created
CREATE OR REPLACE FUNCTION public.touch_tale_from_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.locations
  SET last_time_active = now()
  WHERE id = NEW.location;

  UPDATE public.tales
  SET last_time_active = now()
  WHERE id = (
    SELECT l.tale_id
    FROM public.locations l
    WHERE l.id = NEW.location
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS posts_touch_tale ON public.posts;
CREATE TRIGGER posts_touch_tale
AFTER INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.touch_tale_from_post();

-- Trigger function: touch tale when a location is created
CREATE OR REPLACE FUNCTION public.touch_tale_from_location()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.tales
  SET last_time_active = now()
  WHERE id = NEW.tale_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS locations_touch_tale ON public.locations;
CREATE TRIGGER locations_touch_tale
AFTER INSERT ON public.locations
FOR EACH ROW
EXECUTE FUNCTION public.touch_tale_from_location();
