import { FaTrophy, FaUserGraduate, FaChalkboardTeacher, FaStar, FaBookOpen, FaAward } from 'react-icons/fa'
import homebg from '../../../assets/img/home-bg.jpg'

const achievements = [
  {
    icon: <FaTrophy />,
    value: "2005",
    label: "Royal Gem Founded",
    description: "Royal Gem Nursery/Primary School was established in Ikorodu, Lagos State.",
    color: "bg-yellow-50 text-yellow-500",
    border: "border-yellow-100",
  },
  {
    icon: <FaUserGraduate />,
    value: "2021",
    label: "Abuja School Established",
    description: "Royal Gem Mathematical Schools expanded the vision to Abuja.",
    color: "bg-purple-50 text-[#f056f0]",
    border: "border-purple-100",
  },
  {
    icon: <FaChalkboardTeacher />,
    value: "2025",
    label: "Examination Accreditation",
    description: "The Abuja school received full accreditation as a Basic Education Certificate Examination Centre.",
    color: "bg-blue-50 text-[#525fe1]",
    border: "border-blue-100",
  },
  {
    icon: <FaStar />,
    value: "20",
    label: "Years Celebrated",
    description: "The Royal Gem community celebrated two decades of educational impact in August 2025.",
    color: "bg-orange-50 text-orange-400",
    border: "border-orange-100",
  },
  {
    icon: <FaBookOpen />,
    value: "4",
    label: "Educational Service Areas",
    description: "Teacher development, mathematical literacy, school consultancy, and free training initiatives.",
    color: "bg-green-50 text-green-500",
    border: "border-green-100",
  },
  {
    icon: <FaAward />,
    value: "1991",
    label: "Founder Began Teaching",
    description: "Dr. Ariyo-Ojeme began her purpose-driven career as a Grade Three Teacher.",
    color: "bg-pink-50 text-pink-500",
    border: "border-pink-100",
  },
]

const AchievementCard = ({ icon, value, label, description, color, border }) => (
  <div className={`bg-white rounded-2xl border ${border} shadow-sm hover:shadow-md
                   transition-shadow duration-300 p-6 flex flex-col gap-4 w-full group`}>
    {/* Icon */}
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>

    {/* Value + Label */}
    <div>
      <h3 className="font-jost font-bold text-4xl text-gray-900">{value}</h3>
      <p className="font-jost font-semibold text-gray-700 mt-1">{label}</p>
    </div>

    {/* Divider */}
    <div className="w-10 h-0.5 bg-[#f056f0] group-hover:w-full transition-all duration-500" />

    {/* Description */}
    <p className="font-dm-sans text-gray-400 text-sm leading-relaxed">{description}</p>
  </div>
)

const Achievements = () => {
  return (
    <section className="py-16 px-10 md:px-[7rem] relative w-full min-h-[500px] bg-cover bg-center flex items-center justify-evenly overflow-hidden pt-24" style={{ backgroundImage: `url(${homebg})` }}>
      <div className="max-w-7xl mx-auto flex flex-col gap-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-0.5 bg-[#f056f0]" />
              <span className="font-dm-sans text-[#f056f0] font-semibold text-sm uppercase tracking-widest">
                Our Achievements
              </span>
            </div>
            <h2 className="font-jost font-bold text-3xl md:text-4xl text-gray-900">
              What We Have <br className="hidden md:block" />
              <span className="text-[#f056f0]">Accomplished</span>
            </h2>
          </div>
          <p className="font-dm-sans text-gray-500 text-base max-w-sm leading-relaxed">
            A track record of excellence, growth, and impact — built over 20 years of dedicated service to education.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((item, index) => (
            <AchievementCard key={index} {...item} />
          ))}
        </div>

      </div>
    </section>
  )
}

export default Achievements