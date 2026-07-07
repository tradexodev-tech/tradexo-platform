-- Sprint 12 Step 5: allow users to delete own notifications

CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

GRANT DELETE ON public.notifications TO authenticated;
