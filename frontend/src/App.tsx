import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Drones } from './pages/Drones';
import { Orders } from './pages/Orders';
import { Operators } from './pages/Operators';
import { Flights } from './pages/Flights';
import { Maintenance } from './pages/Maintenance';
import { Triggers } from './pages/Triggers';
import { SqlReference } from './pages/SqlReference';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/drones" element={<Drones />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/operators" element={<Operators />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/triggers" element={<Triggers />} />
          <Route path="/sql" element={<SqlReference />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <h1 className="font-syne text-6xl font-bold text-cyan-500 mb-4">404</h1>
              <p className="text-slate-400 font-mono mb-8">Page not found</p>
              <Navigate to="/" replace />
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
