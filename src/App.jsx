import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Segments from './pages/Segments';
import Campaigns from './pages/Campaigns';
import NewCampaign from './pages/NewCampaign';
import CampaignDetail from './pages/CampaignDetail';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/"                  element={<Dashboard />} />
            <Route path="/customers"         element={<Customers />} />
            <Route path="/segments"          element={<Segments />} />
            <Route path="/campaigns"         element={<Campaigns />} />
            <Route path="/campaigns/new"     element={<NewCampaign />} />
            <Route path="/campaigns/:id"     element={<CampaignDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
