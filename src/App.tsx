import { useAuth } from './hooks/use-auth';
import { blink } from './lib/blink';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import { Spinner } from './components/ui/spinner';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  const handleLogin = () => {
    blink.auth.login(window.location.origin);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return <Dashboard user={user} />;
}

export default App;
