-- Sprint 12 Step 4: enable Supabase Realtime for notifications

ALTER TABLE public.notifications REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
