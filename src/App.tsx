/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const InvitePage = lazy(() => import('./components/InvitePage'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const CheckIn = lazy(() => import('./components/CheckIn'));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<InvitePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/checkin" element={<CheckIn />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
