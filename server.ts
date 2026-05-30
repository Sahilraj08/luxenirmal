import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";

// Interfaces
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  marketplaceLink?: string;
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

let products: Product[] = [
  {
    id: "p1",
    title: "Minimalist Ceramic Vase",
    description: "An elegant, hand-crafted ceramic vase for your perfect modern living space.",
    price: 3499,
    category: "Decor",
    images: ["https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&q=80&w=800"],
  }
];

let globalSettings: GlobalSettings = {
  whatsappNumber: "1234567890",
  instagramUrl: "https://instagram.com/luxenirmal",
  heroTitle: "Elevate Your <br/><span className='text-lux-beige italic'>Everyday Space</span>",
  heroSubtitle: "Discover our curated collection of luxury home essentials.",
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

  // API Routes
  app.get("/api/products", async (req, res) => {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*');
      if (error) return res.status(500).json({ message: "Database error" });
      return res.json(data);
    }
    res.json(products);
  });

  // Admin Auth with Trim Fix
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "993443";

  app.post("/api/login", (req, res) => {
    const { password } = req.body;
    // Password trim check added here
    if (password && password.trim() === ADMIN_PASSWORD.trim()) {
      res.cookie("admin_token", "authenticated", { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production' 
      });
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Invalid password" });
    }
  });

  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.cookies.admin_token === "authenticated") {
      next();
    } else {
      res.status(401).json({ success: false, message: "Unauthorized" });
    }
  };

  // Admin Routes remain same
  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    // ... logic remains same as before
    res.json({ success: true });
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
