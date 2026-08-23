/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InvitePage from './components/InvitePage';
import AdminDashboard from './components/AdminDashboard';
import CheckIn from './components/CheckIn';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InvitePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/checkin" element={<CheckIn />} />
      </Routes>
    </Router>
  );
}
