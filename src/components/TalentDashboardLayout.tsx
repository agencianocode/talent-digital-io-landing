import { Outlet } from 'react-router-dom';
import TalentTopNavigation from './TalentTopNavigation';

const TalentDashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TalentTopNavigation />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default TalentDashboardLayout;
