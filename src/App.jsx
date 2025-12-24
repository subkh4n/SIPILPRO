import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Absensi from './pages/Absensi';
import Belanja from './pages/Belanja';
import Hutang from './pages/Hutang';
import Proyek from './pages/Proyek';

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/absensi" element={<Absensi />} />
            <Route path="/belanja" element={<Belanja />} />
            <Route path="/hutang" element={<Hutang />} />
            <Route path="/proyek" element={<Proyek />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
