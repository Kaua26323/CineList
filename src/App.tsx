import { BrowserRouter, Routes, Route } from "react-router";
import { toast } from "sonner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              Render the home page{" "}
              <button onClick={() => toast("This is working!")}>Active</button>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
