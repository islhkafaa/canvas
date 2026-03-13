import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CanvasPage } from "./pages/CanvasPage";
import { HomePage } from "./pages/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<CanvasPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
