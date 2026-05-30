import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";

// Interfaces for our mock DB
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  marketplaceLink?: string; // If present, use Flow B
}

interface GlobalSettings {
  whatsappNumber: string;
  instagramUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  primaryColor: string;
  fontHeading: string;
  fontBody: string;
}

// Supabase Initialization
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = SUPABASE_URL && SUPABASE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

// In-memory Database (Fallback)
let products: Product[] = [
  {
    id: "p1",
    title: "Minimalist Ceramic Vase",
    description: "An elegant, hand-crafted ceramic vase for your perfect modern living space. Features a warm matte finish that perfectly accentuates fresh or dried arrangements.",
    price: 3499,
    category: "Decor",
    images: ["https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "p2",
    title: "Brushed Gold Desk Lamp",
    description: "Illuminate your study with this luxury brushed gold desk lamp. A sturdy marble base combined with sleek mid-century modern lines.",
    price: 8999,
    category: "Lighting",
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800"],
    marketplaceLink: "https://amazon.com", // Example Flow B product
  },
  {
    id: "p3",
    title: "Linen Throw Pillow",
    description: "Soft, breathable, and luxurious. Bring subtle texture and warmth to your sofa with organic European linen.",
    price: 2499,
    category: "Textiles",
    images: ["https://images.unsplash.com/photo-1584282869502-86105f639343?auto=format&fit=crop&q=80&w=800"],
  }
];

let globalSettings: GlobalSettings = {
  whatsappNumber: "1234567890",
  instagramUrl: "https://instagram.com/luxenirmal",
  heroTitle: "Elevate Your <br/><span className='text-lux-beige italic'>Everyday Space</span>",
  heroSubtitle: "Discover our curated collection of luxury home essentials, designed for the modern minimalist.",
  heroImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000",
  primaryColor: "#C5A059",
  fontHeading: "Playfair Display",
  fontBody: "Inter"
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- API Routes ---
  
  // Public routes
  app.get("/api/products", async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error("Supabase error:", error);
        return res.status(500).json({ message: "Database error" });
      }
      return res.json(data);
    }
    res.json(products);
  });

  app.get("/api/settings", async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('global_settings').select('*').eq('id', 1).single();
      if (error && error.code !== 'PGRST116') { // PGRST116 means zero rows
        console.error("Supabase error:", error);
        return res.status(500).json({ message: "Database error" });
      }
      if (data) {
        return res.json(data);
      }
      return res.json(globalSettings);
    }
    res.json(globalSettings);
  });

  // Admin Auth Middleware
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "993443";
  const ADMIN_TOKEN_SECRET = crypto.randomBytes(32).toString('hex'); // Ephemeral token secret for simple auth

  app.post("/api/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      // In a real app, use JWT. For this simple app, we'll set a basic signed cookie 
      // or just a simple value we encrypt. We'll just use a simple cookie with a known secret value for this ephemeral session.
      res.cookie("admin_token", "authenticated", { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Invalid password" });
    }
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie("admin_token");
    res.json({ success: true });
  });

  // Middleware to protect admin routes
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.cookies.admin_token === "authenticated") {
      next();
    } else {
      res.status(401).json({ success: false, message: "Unauthorized" });
    }
  };

  app.get("/api/admin/check", requireAdmin, (req, res) => {
    res.json({ success: true });
  });

  // Protected Admin Routes
  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('products').insert([req.body]).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    const newProduct: Product = {
      id: crypto.randomUUID(),
      ...req.body
    };
    products.push(newProduct);
    res.json(newProduct);
  });

  app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('products').update(req.body).eq('id', req.params.id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    const index = products.findIndex(p => p.id === req.params.id);
    if (index >= 0) {
      products[index] = { ...products[index], ...req.body, id: req.params.id };
      res.json(products[index]);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', req.params.id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
    products = products.filter(p => p.id !== req.params.id);
    res.json({ success: true });
  });

  app.put("/api/admin/settings", requireAdmin, async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('global_settings').upsert({ id: 1, ...req.body }).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    globalSettings = { ...globalSettings, ...req.body };
    res.json(globalSettings);
  });


  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express 4
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
