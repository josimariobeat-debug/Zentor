import { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import AppLayout from "@/components/layout/AppLayout";
import MeusApps from "@/pages/MeusApps";
import LojaApps from "@/pages/LojaApps";
import Tutoriais from "@/pages/Tutoriais";
import Feedback from "@/pages/Feedback";
import Assinaturas from "@/pages/Assinaturas";
import Perfil from "@/pages/Perfil";
import StoriesVideosApp from "@/pages/StoriesVideosApp";
import AdicionarStory from "@/pages/AdicionarStory";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

function App() {
  useEffect(() => { document.title = "Zentor"; }, []);
  return (
    <div className="App">
      <BrowserRouter>
        <Toaster position="bottom-right" richColors closeButton />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<AppLayout />}>
            <Route index element={<MeusApps />} />
            <Route path="loja" element={<LojaApps />} />
            <Route path="tutoriais" element={<Tutoriais />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="assinaturas" element={<Assinaturas />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="app/:appId" element={<StoriesVideosApp />} />
            <Route path="app/:appId/story/:storyId" element={<AdicionarStory />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
