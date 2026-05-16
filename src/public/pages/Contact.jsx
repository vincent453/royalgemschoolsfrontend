import Navbar from "../components/layout/layout/Navbar"
import Section from "../components/layout/layout/Section"
import contactimg from '../../assets/img/contactimg.jpeg'
import ContactInfo from "../components/layout/ui/ContactInfo"
import ContactForm from "../components/layout/ui/ContactForm"
import Footer from "../components/layout/layout/Foooter"
const Contact = () => {
  return (
    <div>
        <Navbar />
        <Section img={contactimg} title="Get In Touch With Us" description="Home/Contact" />
        <ContactInfo />
        <ContactForm />
        <Footer />
        
    </div>
  )
}

export default Contact