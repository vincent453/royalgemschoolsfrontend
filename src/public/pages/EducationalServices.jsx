import Navbar from "../components/layout/Navbar";
import Section from "../components/layout/Section";
import EducationalServicesSection from "../components/layout/EducationalServices";
import Footer from "../components/layout/Foooter";
import SEO from "../components/layout/SEO";
import servicesImage from "../../assets/img/blog2.jpeg";

export default function EducationalServices() {
  return (
    <>
      <SEO
        title="Royal Gem Educational Services"
        description="Royal Gem Educational Services provides bespoke teacher training, mathematical literacy programmes, school establishment consultancy, and free training initiatives."
        keywords="Royal Gem Educational Services, teacher training Nigeria, mathematical literacy, school consultancy"
        url="https://royalgemschool.com/educational-services"
      />
      <div className="overflow-x-hidden">
        <Navbar />
        <Section img={servicesImage} title="Royal Gem Educational Services" description="Home / Educational Services" />
        <EducationalServicesSection />
        <Footer />
      </div>
    </>
  );
}
