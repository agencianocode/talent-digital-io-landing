import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const UserSelector = () => {
  const navigate = useNavigate();
  const { switchUserType, isAuthenticated } = useSupabaseAuth();

  const handleSelectBusinessType = async () => {
    if (isAuthenticated) {
      // If user is logged in, switch their role
      await switchUserType('freemium_business');
      navigate('/business-dashboard');
    } else {
      // If not authenticated, go to business registration
      navigate('/register-business');
    }
  };

  const handleSelectTalentType = async () => {
    if (isAuthenticated) {
      // If user is logged in, switch their role
      await switchUserType('freemium_talent');
      navigate('/talent-dashboard');
    } else {
      // If not authenticated, go to talent registration
      navigate('/register-talent');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Business Card */}
          <div 
            className="p-12 rounded-2xl cursor-pointer transition-all duration-200 group border border-gray-200 shadow-md hover:shadow-lg"
            onClick={handleSelectBusinessType}
            style={{ 
              backgroundColor: '#ffffff',
              background: '#ffffff'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            <div className="text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Busco Talento
              </h2>
              <p className="text-sm text-gray-600">
                Para mi negocio o empresa
              </p>
            </div>
          </div>

          {/* Talent Card */}
          <div 
            className="p-12 rounded-2xl cursor-pointer transition-all duration-200 group border border-gray-200 shadow-md hover:shadow-lg"
            onClick={handleSelectTalentType}
            style={{ 
              backgroundColor: '#ffffff',
              background: '#ffffff'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            <div className="text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Busco Trabajo
              </h2>
              <p className="text-sm text-gray-600">
                Soy un profesional digital
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSelector;