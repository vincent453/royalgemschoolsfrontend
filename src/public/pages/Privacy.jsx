import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Foooter";
import SEO from "../components/layout/SEO";

export default function Privacy() {
  return (
    <>
      <SEO title="Privacy Policy | Royal Gem Schools" description="Privacy information for Royal Gem Schools website visitors, families and applicants." url="https://www.royalgemschools.com/privacy" />
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-36">
        <h1 className="font-jost text-4xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-7 text-gray-600">Royal Gem Schools respects the privacy of students, parents, staff, applicants and website visitors.</p>
        <div className="mt-10 space-y-8 font-dm-sans text-sm leading-7 text-gray-600">
          <section><h2 className="font-jost text-2xl font-bold text-gray-800">Information we collect</h2><p className="mt-2">We may receive contact details, application information, portal credentials and messages that families choose to provide to the school.</p></section>
          <section><h2 className="font-jost text-2xl font-bold text-gray-800">How we use information</h2><p className="mt-2">Information is used to respond to enquiries, process admissions, provide school services, maintain secure portals and communicate with families.</p></section>
          <section><h2 className="font-jost text-2xl font-bold text-gray-800">Children's information</h2><p className="mt-2">Student information is handled only for legitimate educational and administrative purposes. Public photographs and yearbook content should be published only with appropriate parent or guardian consent.</p></section>
          <section><h2 className="font-jost text-2xl font-bold text-gray-800">Contact</h2><p className="mt-2">For privacy questions, contact school.royalgem@gmail.com or call +234 906 565 0959.</p></section>
        </div>
      </main>
      <Footer />
    </>
  );
}
