import BlogCard from "../ui/BlogCard"
import SectionHeader from "../ui/SectionHeader"
import blog1 from '../../../assets/img/excursion.jpeg'
import blog2 from '../../../assets/img/blog2.jpeg'
import blog3 from '../../../assets/img/video.jpeg'
const posts = [
  {
    image:    blog1,
    date:     "May 19, 2026",
    category: "Exploration",
    title:    "Excursion Trip at Royal Gem Schools",
    href:     "/blog/mobile-painting",
  },
  {
    image:    blog2,
    date:     "May 19, 2026",
    category: "Education",
    title:    "Kindly Encourage you to Consistently Monitor both the academic progress and character development of your children",
    href:     "/blog/mobile-sculpting",
  },
    {   
    image:    blog3,
    date:     "May 19, 2026",
    category: "Graduation Ceremony",  
    title:    "How Mobile Technology is Revolutionizing Painting and Sculpting",
    href:     "/blog/technology-in-art",
  } 

]
const Blog = () => {
  return (
    <div className="mt-[5rem] px-[0rem] py:px-[5rem] md:px-[5rem]">
        <SectionHeader title="Latest Blog & news" description="Discover the latest insights, tips, and stories from our educational community. Our blog features articles on a wide range of topics, including teaching strategies, student success stories, educational trends, and much more." />
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 md:px-14 py-12">
    {posts.map((post, index) => (
      <BlogCard key={index} categoryColor="text-[#A033A0]" {...post} />
    ))}
  </div>
        </div>
    </div>
  )
}

export default Blog