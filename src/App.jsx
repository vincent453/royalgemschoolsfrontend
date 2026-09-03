import { PageLoader } from '../src/public/components/layout/PageLoader';
import AppRoutes from './routes/AppRoutes';
import { HelmetProvider } from "react-helmet-async";
import CookieConsent from "./public/components/ui/CookieConsent";
const App = () => {
  return (
    <HelmetProvider>
      <PageLoader>
        <AppRoutes />
        <CookieConsent />
      </PageLoader>
    </HelmetProvider>
  );
};
 
export default App