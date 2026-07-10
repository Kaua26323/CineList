import { BrowserRouter, Routes, Route } from "react-router";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Render the home page </div>} />
      </Routes>
    </BrowserRouter>
  );
}
