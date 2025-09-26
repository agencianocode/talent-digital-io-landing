import { Outlet } from 'react-router-dom';
import TalentTopNavigation from './TalentTopNavigation';

const TalentDashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TalentTopNavigation />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default TalentDashboardLayout;
