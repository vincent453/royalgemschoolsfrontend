import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'

const contactCards = [
  {
    icon: <FaMapMarkerAlt />,
    title: "Our Location",
    lines: [
      "Main address: 15, Royal Gem Avenue, Ayonnusi Estate, off Sagamu Road, Ikorudu, Lagos State",
      "Annex: 6, Main Street, Suncity Estate, Galadimawa Distict, Abuja, 15, Royal Gem Avenue, Ayok",
    ],
    bg: "bg-rose-50",
    iconBg: "bg-rose-100 text-rose-400",
    href: null,
  },
  {
    icon: <FaPhone />,
    title: "Telephone",
    lines: [
      "+234 906 565 0959",
      "+234 703 719 9498",
      "+234 803 409 1055",
    ],
    bg: "bg-[#eef0ff]",
    iconBg: "bg-[#dde0ff] text-[#525fe1]",
    href: "tel:+2348000000000",
  },
  {
    icon: <FaEnvelope />,
    title: "Send Email",
    lines: [
      "school.royalgem@gmail.com",
    ],
    bg: "bg-teal-50",
    iconBg: "bg-teal-100 text-teal-500",
    href: "mailto:school.royalgem@gmail.com",
  },
]

const ContactInfoCard = ({ icon, title, lines, bg, iconBg, href }) => (
  <div
    className={`${bg} flex flex-col items-center justify-center text-center
                gap-4 sm:gap-5 py-8 px-5 sm:px-8 w-full rounded-2xl`}
  >
    {/* Icon */}
    <div
      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-xl sm:text-2xl ${iconBg}`}
    >
      {icon}
    </div>

    {/* Title */}
    <h3 className="font-jost font-bold text-[#1a1a4b] text-lg sm:text-xl">
      {title}
    </h3>

    {/* Lines */}
    <div className="flex flex-col gap-1">
      {lines.map((line, i) =>
        href ? (
          <a
            key={i}
            href={href}
            className="font-dm-sans text-gray-500 text-sm sm:text-base break-words hover:text-[#A033A0] transition-colors duration-300"
          >
            {line}
          </a>
        ) : (
          <p
            key={i}
            className="font-dm-sans text-gray-500 text-sm sm:text-base"
          >
            {line}
          </p>
        )
      )}
    </div>
  </div>
)

const ContactInfo = () => {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                 gap-6 px-4 sm:px-8 md:px-12 lg:px-[7rem]
                 mt-12 sm:mt-16 w-full"
    >
      {contactCards.map((card, index) => (
        <ContactInfoCard key={index} {...card} />
      ))}
    </div>
  )
}

export default ContactInfo