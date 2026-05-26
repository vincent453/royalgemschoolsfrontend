import { FaStar } from 'react-icons/fa'
import quote from '../../../assets/img/quote.png'

const ReviewCard = ({
  review,
  name,
  company,
  avatar,
  rating = 5,
}) => {
  return (
    <div className="bg-white rounded-[7px] w-full max-w-[516px] mx-auto shadow-sm border border-gray-100 p-5 sm:p-8 flex flex-col gap-4 sm:gap-5">

      {/* Quote Icon */}
      <img src={quote} className='block w-[40px] sm:w-[60px]' />

      {/* Star Rating */}
      <div className="flex flex-row items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <FaStar
            key={i}
            className={`text-[18px] sm:text-[22px] md:text-[26px] ${i < rating ? 'text-[#FFB400]' : 'text-gray-200'}`}
          />
        ))}
      </div>

      {/* Review Text */}
      <p className="font-dm-sans text-gray-600 font-medium text-[15px] sm:text-[17px] md:text-[20px] pr-0 sm:pr-4 text-left leading-relaxed">
        {review}
      </p>

      {/* Reviewer Info */}
      <div className="flex items-center gap-3 bg-gray-50 rounded-sm px-3 sm:px-4 py-4 sm:py-5">
        <img
          src={avatar}
          alt={name}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
        />
        <div>
          <h4 className="font-jost font-bold text-gray-900 text-xs sm:text-sm">{name}</h4>
          <p className="font-dm-sans text-gray-400 text-[11px] sm:text-xs mt-0.5">{company}</p>
        </div>
      </div>

    </div>
  )
}

export default ReviewCard