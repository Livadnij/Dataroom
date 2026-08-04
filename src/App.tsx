import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { DataroomsPage } from "@/app/DataroomsPage";
import { DataroomPage } from "@/app/DataroomPage";

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DataroomsPage />} />
        <Route path="/dataroom/:dataroomId" element={<DataroomPage />} />
        <Route
          path="/dataroom/:dataroomId/:folderId"
          element={<DataroomPage />}
        />
      </Routes>
    </AppShell>
  );
}

export default App;
