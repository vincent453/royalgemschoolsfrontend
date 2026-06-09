import { FaTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa'

const TeacherCard = ({
  image,
  name,
  subject,
  twitterUrl  = "#",
  facebookUrl = "#",
  linkedinUrl = "#",
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden group
                    w-full
                    sm:max-w-[260px]
                    md:max-w-[280px]
                    mx-auto">

      {/* Image + Social */}
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full
                     h-[220px]
                     sm:h-[260px]
                     md:h-[280px]
                     object-cover object-top"
        />

        {/* Social icons — slide in from left on hover */}
        <div className="absolute top-6 left-0 flex flex-col gap-2
                        -translate-x-full group-hover:translate-x-0
                        transition-transform duration-500 ease-in-out">
          {[
            { href: twitterUrl,  Icon: FaTwitter    },
            { href: facebookUrl, Icon: FaFacebookF  },
            { href: linkedinUrl, Icon: FaLinkedinIn },
          ].map(({ href, Icon }, i) => (
            <a
              key={i}
              href={href}
              onClick={e => e.stopPropagation()}
              className="w-8 h-8 sm:w-9 sm:h-9
                         bg-[#f056f0] hover:bg-[#525fe1] text-white
                         flex items-center justify-center
                         transition-colors duration-300"
            >
              <Icon className="text-xs sm:text-sm" />
            </a>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="px-4 sm:px-5 py-3 sm:py-4">
        <h3 className="font-jost font-bold text-gray-900
                       text-base sm:text-lg
                       leading-tight truncate">
          {name}
        </h3>
        <p className="font-dm-sans text-gray-400
                      text-xs sm:text-sm
                      mt-0.5 truncate">
          {subject}
        </p>
      </div>
    </div>
  )
}

export default TeacherCard