/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Admin } from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
        <Route path="/admin-portal" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
