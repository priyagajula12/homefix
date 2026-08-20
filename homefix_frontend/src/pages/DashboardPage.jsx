import CustomerDashboard from './CustomerDashboard';
import ProviderDashboard from './ProviderDashboard';

const DashboardPage = () => {
  // We saved this in localStorage during login!
  const isProvider = localStorage.getItem('is_provider') === 'true';

  // If they are a provider, show the Provider workspace
  if (isProvider) {
    return <ProviderDashboard />;
  }

  // Otherwise, show the lovely new Customer Dashboard
  return <CustomerDashboard />;
};

export default DashboardPage;