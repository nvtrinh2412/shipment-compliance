import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import IngestData from './pages/IngestData';
import ShipmentDetails from './pages/ShipmentDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="ingest" element={<IngestData />} />
          <Route path="shipments/:id" element={<ShipmentDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
