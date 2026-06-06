import { PageLoader } from '../src/public/components/layout/PageLoader';
import AppRoutes from './routes/AppRoutes';
import { HelmetProvider } from "react-helmet-async";
const App = () => {
  return (
    <HelmetProvider>
      <PageLoader>
        <AppRoutes />
      </PageLoader>
    </HelmetProvider>
  );
};
 
export default App