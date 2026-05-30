import 'dotenv/config'; 
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = SUPABASE_URL && SUPABASE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

// DEBUG LINE: Isse logs mein pata chalega ki Supabase connect hua ya nahi
console.log("DEBUG: Supabase initialized:", !!supabase);

const app = express();

app.use(express.json());
app.use(cookieParser());

// API Route: Products
app.get("/api/products", async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.log("DEBUG: Supabase fetch error:", error);
      return res.json([]);
    }
    return res.json(data || []);
  }
  return res.json([]);
});

// Admin Auth
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "993443";

app.post("/api/login", (req, res) => {
  const { password } = req.body;
  
  if (password && password.toString().trim() === ADMIN_PASSWORD.trim()) {
    res.cookie("admin_token", "authenticated", { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    return res.json({ success: true });
  }
  
  res.status(401).json({ success: false, message: "Invalid password" });
});

// Admin Auth Check
app.get("/api/admin/check", (req, res) => {
  if (req.cookies.admin_token === "authenticated") {
    return res.json({ success: true });
  }
  res.status(401).json({ success: false });
});

// Catch all for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

export default app;
