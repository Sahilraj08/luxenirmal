import 'dotenv/config'; 
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = SUPABASE_URL && SUPABASE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API Route: Products
  app.get("/api/products", async (req, res) => {
    if (supabase) {
      const { data } = await supabase.from('products').select('*');
      return res.json(data || []);
    }
    res.json([]);
  });

  // Admin Auth: Logging enabled for debugging
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "993443";

  app.post("/api/login", (req, res) => {
    const { password } = req.body;
    
    // DEBUGGING LOGS (Check these in Vercel Dashboard -> Logs)
    console.log("DEBUG: Login attempt received.");
    console.log("DEBUG: Provided password length:", password?.length);
    console.log("DEBUG: Expected password length:", ADMIN_PASSWORD.trim().length);

    if (password && password.toString().trim() === ADMIN_PASSWORD.trim()) {
      res.cookie("admin_token", "authenticated", { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      console.log("DEBUG: Login successful.");
      return res.json({ success: true });
    }
    
    console.log("DEBUG: Login failed. Incorrect password.");
    res.status(401).json({ success: false, message: "Invalid password" });
  });

  // Middleware: Auth check
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.cookies.admin_token === "authenticated") {
      next();
    } else {
      res.status(401).json({ success: false, message: "Unauthorized" });
    }
  };

  // Protected Admin Route Example
  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    res.json({ success: true, message: "Product added" });
  });

  // Vite/Production Middleware
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
