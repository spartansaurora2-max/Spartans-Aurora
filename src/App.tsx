/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Roster from "./pages/Roster";
import Media from "./pages/Media";
import Archive from "./pages/Archive";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/media" element={<Media />} />
            <Route path="/archive" element={<Archive />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}
