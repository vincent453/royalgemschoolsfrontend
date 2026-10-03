import { FaQuoteLeft } from 'react-icons/fa'
import logo from '../../../assets/img/logo.png'

const FounderProfile = ({
  image,
  name = "Dr. Oluwatoyin Ariyo-Ojeme",
  title = "Visioneer, Royal Gem Schools & Royal Gem Educational Services",
  school = "Educator | Researcher | Data Analyst | Institution Builder",
  tagline = "Nurturing to Flourish",
  quote = "Education is not just about academics — it is about building character, instilling values, and equipping every child to become a true Gem in society.",
  experience = "30+",
  students = "26",
  years = "2005",
  profession = "Research, Test and Measurement | Machine Learning | Artificial Intelligence"
}) => {
  return (
    <section className="py-16 px-6 md:px-14 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-0.5 bg-[#f056f0]" />
          <span className="font-dm-sans text-[#f056f0] font-semibold text-sm uppercase tracking-widest">
            Meet the Founder
          </span>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-14">

          {/* Left — image */}
          <div className="w-full lg:w-2/5 flex justify-center">
            <div className="relative">

              {/* Decorative background blob */}
              <div className="absolute -inset-4 bg-[#f056f0]/10 rounded-[40%_60%_60%_40%/40%_40%_60%_60%] -z-10" />

              {/* Photo */}
              <img
                src={image}
                alt={name}
                className="w-72 h-80 md:w-80 md:h-96 object-cover object-top rounded-[30%_70%_70%_30%/30%_30%_70%_70%] shadow-xl"
              />

              {/* Logo badge */}
              <div className="absolute -bottom-5 -right-5 bg-white rounded-full shadow-lg p-2 border-2 border-[#f056f0]/20">
                <img src={logo} alt="Royal Gem Logo" className="w-14 h-14 object-contain" />
              </div>

            </div>
          </div>

          {/* Right — content */}
          <div className="w-full lg:w-3/5 flex flex-col gap-6">

            {/* Name + title */}
            <div>
              <h2 className="font-jost font-bold text-3xl md:text-4xl text-gray-900">
                {name}
              </h2>
           
              <p className="font-dm-sans text-[#525fe1] font-semibold mt-1">{title}</p>
              <p className="font-dm-sans text-gray-400 text-sm">{school}</p>
                 <p className="font-dm-sans text-gray-400 text-sm">{profession}</p>
            </div>

            {/* Quote */}
            <div className="relative bg-[#f0f1ff] rounded-2xl px-6 py-5">
              <FaQuoteLeft className="text-[#f056f0] text-2xl mb-3 opacity-60" />
              <p className="font-dm-sans text-gray-700 text-base md:text-lg leading-relaxed italic">
                {quote}
              </p>
            </div>

            {/* Bio */}
            <p className="font-dm-sans text-gray-500 text-base leading-relaxed">
              Dr. Oluwatoyin Ariyo-Ojeme, formerly known as Oluwatoyin Obadare-Akpata, began her education career in 1991 as a Grade Three Teacher. She holds Distinctions in Mathematics and Integrated Science from the College of Education, Ikere-Ekiti, a Second Class Upper degree in Mathematics/Education from the University of Nigeria, Nsukka, and Master's and Ph.D. degrees from the University of Lagos, specialising in Research, Test and Measurement. She is also a trained Data Analyst with applied knowledge of Machine Learning and Artificial Intelligence.
              <br /><br />
              Her academic work has taken her to seminars and conferences at the University of Maryland, Harvard University, the University of Kansas, and Cambridge. Through Royal Gem Schools and Royal Gem Educational Services, she continues to strengthen mathematical learning, teacher practice, and institution building.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-2">
              {[
                { value: experience, label: "Years in Education" },
                { value: students,   label: "Years Teaching Nursery/Primary" },
                { value: years,      label: "School Founded"   },
              ].map(({ value, label }, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center bg-gray-50
                             border border-gray-100 rounded-2xl py-4 px-2 text-center"
                >
                  <span className="font-jost font-bold text-2xl text-[#f056f0]">{value}</span>
                  <span className="font-dm-sans text-gray-400 text-xs mt-1">{label}</span>
                </div>
              ))}
            </div>

            {/* Tagline */}
            <p className="font-dm-sans text-sm text-gray-400 italic">
              ....{tagline}
            </p>

          </div>
        </div>
      </div>
    </section>
  )
}

export default FounderProfile