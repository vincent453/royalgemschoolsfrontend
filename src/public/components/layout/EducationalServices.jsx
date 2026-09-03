import { FaChalkboardTeacher, FaCalculator, FaSchool, FaHandsHelping } from "react-icons/fa";
import SectionHeader from "../ui/SectionHeader";

const services = [
  {
    icon: <FaChalkboardTeacher />,
    title: "Teacher Training & Development",
    text: "Practical programmes covering lesson note writing, classroom management, constructive feedback, pedagogy, and classroom innovation.",
    color: "bg-rose-50 text-rose-500",
  },
  {
    icon: <FaCalculator />,
    title: "Mathematical Literacy",
    text: "Specialised support that simplifies mathematics and provides practical tools for teaching abstract concepts to young learners.",
    color: "bg-blue-50 text-blue-500",
  },
  {
    icon: <FaSchool />,
    title: "School Establishment Consultancy",
    text: "Guidance for school founders covering vision, structure, staffing, curriculum design, recruitment, and staff development planning.",
    color: "bg-emerald-50 text-emerald-500",
  },
  {
    icon: <FaHandsHelping />,
    title: "Free Training Initiatives",
    text: "Through the Royal Gem Mathematical Foundation, free teacher training has reached public and underserved private schools across several states and Abuja.",
    color: "bg-amber-50 text-amber-500",
  },
];

export default function EducationalServices() {
  return (
    <section className="bg-[#fdf8ff] px-6 py-16 md:px-14">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title="Royal Gem Educational Services"
          description="Transforming education, empowering teachers, and inspiring learners through bespoke, needs-led educational development."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <article key={service.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${service.color}`}>
                {service.icon}
              </div>
              <h3 className="font-jost text-lg font-bold text-gray-800">{service.title}</h3>
              <p className="mt-3 font-dm-sans text-sm leading-6 text-gray-500">{service.text}</p>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-3xl text-center font-dm-sans text-base leading-7 text-gray-500">
          Founded in 2010 by Dr. Oluwatoyin Ariyo-Ojeme, Royal Gem Educational Services has supported schools across Ondo, Lagos, Ogun, Plateau, and Abuja with personalised programmes rooted in real classroom experience.
        </p>
      </div>
    </section>
  );
}
