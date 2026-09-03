import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Foooter";
import SEO from "../components/layout/SEO";

export default function Safeguarding() {
  return (
    <>
      <SEO title="Child Safeguarding | Royal Gem Schools" description="Royal Gem Schools' commitment to safe, respectful and nurturing learning environments." url="https://www.royalgemschools.com/safeguarding" />
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-36">
        <h1 className="font-jost text-4xl font-bold text-gray-900">Child Safeguarding Statement</h1>
        <div className="mt-8 space-y-6 font-dm-sans text-sm leading-7 text-gray-600">
          <p>Royal Gem Schools is committed to providing safe, respectful and nurturing learning environments in Ikorodu and Abuja.</p>
          <p>We expect every adult working with learners to protect children from abuse, neglect, exploitation, discrimination and avoidable harm. Concerns should be reported promptly to the school leadership through the school office.</p>
          <p>Photography, media and yearbook content involving learners should be collected and shared only with appropriate parent or guardian consent. Access to student records and private school services is restricted to authorised users.</p>
          <p>For safeguarding questions, contact the school office at school.royalgem@gmail.com or +234 906 565 0959.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
