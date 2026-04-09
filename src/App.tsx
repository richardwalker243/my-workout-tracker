import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ExerciseProgressPage } from "@/pages/ExerciseProgressPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { RoutineFormPage } from "@/pages/RoutineFormPage";
import { RoutinesPage } from "@/pages/RoutinesPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { WorkoutPage } from "@/pages/WorkoutPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/workout" replace />} />
        <Route path="routines" element={<RoutinesPage />} />
        <Route path="routines/new" element={<RoutineFormPage />} />
        <Route path="routines/:id" element={<RoutineFormPage />} />
        <Route path="workout" element={<WorkoutPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="exercises" element={<ExerciseProgressPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
