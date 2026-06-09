import { FiArrowUpRight } from 'react-icons/fi'
import { FiX } from 'react-icons/fi'

const BlogCard = ({
  image,
  date,
  category,
  categoryColor = "text-[#525fe1]",
  title,
  content,
  href = "#",
  onDelete,
}) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 overflow-hidden group w-full max-w-[340px]">

      {/* Image */}
      <div className="overflow-hidden h-[300px] relative">
        <img
          src={image || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {onDelete && (
          <button
            onClick={onDelete}
            className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 border border-red-200 text-red-500 rounded-full w-8 h-8 flex items-center justify-center transition-colors z-10 cursor-pointer"
            title="Remove post"
          >
            <FiX className="text-sm" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4">

        {/* Date + Category */}
        <div className="flex items-center gap-2 font-dm-sans text-sm text-gray-400">
          <span>{date}</span>
          <span>|</span>
          <span className={`font-semibold text-[17px] font-jost ${categoryColor}`}>{category}</span>
        </div>

        {/* Title */}
        <h3 className="font-jost font-bold text-[#702b70] text-lg leading-snug line-clamp-2">
          {title}
        </h3>
        <p className='font-dmsan text-[#702b70] text-sm leading-snug line-clamp-2'>
          {content}
        </p>

        {/* Read More Button */}
        <a
          href={href || '#'}
          className="inline-flex items-center gap-2 bg-[#f056f0] hover:bg-[#525fe1]
                     text-white font-jost font-semibold text-sm
                     px-5 py-5 w-fit transition-colors duration-300"
        >
          Read More
          <FiArrowUpRight className="text-base" />
        </a>

      </div>
    </div>
  )
}

export default BlogCard