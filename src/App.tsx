import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RulesPage } from './pages/RulesPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ConversionPage } from './pages/ConversionPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/conversion" element={<ConversionPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/" element={<Navigate to="/rules" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App