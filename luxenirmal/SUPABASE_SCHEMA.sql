-- Run this SQL in your Supabase SQL Editor to create the necessary tables.

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  "marketplaceLink" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE global_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  "whatsappNumber" TEXT NOT NULL,
  "instagramUrl" TEXT NOT NULL,
  "heroTitle" TEXT NOT NULL DEFAULT 'Elevate Your Everyday Space',
  "heroSubtitle" TEXT NOT NULL DEFAULT 'Discover our curated collection of luxury home essentials, designed for the modern minimalist.',
  "heroImage" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000',
  "primaryColor" TEXT NOT NULL DEFAULT '#C5A059',
  "fontHeading" TEXT NOT NULL DEFAULT 'Playfair Display',
  "fontBody" TEXT NOT NULL DEFAULT 'Inter'
);

-- Insert initial settings
INSERT INTO global_settings (id, "whatsappNumber", "instagramUrl", "heroTitle", "heroSubtitle", "heroImage", "primaryColor", "fontHeading", "fontBody")
VALUES (91, '8340217626', 'https://instagram.com/51rajasahil', 'Elevate Your Everyday Space', 'Discover our curated collection of luxury home essentials, designed for the modern minimalist.', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000', '#C5A059', 'Playfair Display', 'Inter')
ON CONFLICT (id) DO NOTHING;

-- Optionally, insert mock products
INSERT INTO products (title, description, price, category, images, "marketplaceLink")
VALUES 
('Minimalist Ceramic Vase', 'An elegant, hand-crafted ceramic vase for your perfect modern living space. Features a warm matte finish that perfectly accentuates fresh or dried arrangements.', 3499, 'Decor', ARRAY['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&q=80&w=800'], NULL),
('Brushed Gold Desk Lamp', 'Illuminate your study with this luxury brushed gold desk lamp. A sturdy marble base combined with sleek mid-century modern lines.', 8999, 'Lighting', ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800'], 'https://amazon.com'),
('Linen Throw Pillow', 'Soft, breathable, and luxurious. Bring subtle texture and warmth to your sofa with organic European linen.', 2499, 'Textiles', ARRAY['https://images.unsplash.com/photo-1584282869502-86105f639343?auto=format&fit=crop&q=80&w=800'], NULL);

-- Required for Supabase standard access
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

-- If you are using the service_role key to bypass RLS, this is fine.
-- If using the anon key without a user session, add public read/write access:
CREATE POLICY "Public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access to settings" ON global_settings FOR SELECT USING (true);
-- Write access policies using the same approach for admin routes
-- For safety, relying on server.ts to make requests via service role key is recommended,
-- OR just make them public for this simple example:
CREATE POLICY "Public all access to products" ON products FOR ALL USING (true);
CREATE POLICY "Public all access to settings" ON global_settings FOR ALL USING (true);
