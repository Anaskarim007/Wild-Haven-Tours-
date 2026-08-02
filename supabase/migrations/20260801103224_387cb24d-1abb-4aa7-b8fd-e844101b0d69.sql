CREATE POLICY "Location images are viewable by everyone"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'location-images');

CREATE POLICY "Admins can upload location images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'location-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update location images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'location-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'location-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete location images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'location-images' AND public.has_role(auth.uid(), 'admin'));