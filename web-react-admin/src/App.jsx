import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import AdminApp from './components/AdminApp';

function AppContent() {
  const { session, loading } = useAuth();

  if (loading) return null;

  return session ? <AdminApp /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
