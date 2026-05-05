import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '../components/parent/Dashboard';

/** Parent shell — bottom-tab navigation wired here in Week 4. */
export function ParentDashboard() {
  return (
    <Routes>
      <Route path="/*" element={<Dashboard />} />
    </Routes>
  );
}
