import sectionimg2 from '../../../assets/img/section-2.jpg'
import event from '../../../assets/img/event-list.png'
import excel from '../../../assets/img/excel.png'
import music from '../../../assets/img/music.png'
import codding from '../../../assets/img/programming.png'
import python from '../../../assets/img/python.png'
import robot from '../../../assets/img/robot.png'
import mathematics from '../../../assets/img/mathematics.png'
import ches from '../../../assets/img/strategy.png'
import graph from '../../../assets/img/graphic-design.png'
import CategoryCard from '../ui/CategoryCard'
import SectionHeader from '../ui/SectionHeader'
import training from '../../../assets/img/training.png'

const categories = [
  { icon: graph,       label: "Graphic Design Course"        },
  { icon: event,       label: "After School Program"         },
  { icon: mathematics, label: "Mathematics Improvement Plan" },
  { icon: excel,       label: "Microsoft Excel Training"     },
  { icon: robot,       label: "Robotics Workshop"            },
  { icon: codding,     label: "Coding Bootcamp"              },
  { icon: python,      label: "Python Programming"           },
  { icon: music,       label: "Music Classes"                },
  { icon: ches,        label: "Chess Club"                   },
  { icon: training,    label: "Training"                     },
];

const PopularCategory = () => {
  return (
    <section
      className="w-full py-12 sm:py-16 md:py-20 mt-10 sm:mt-16 md:mt-20 px-4 sm:px-8 md:px-12 lg:px-20"
      style={{
        backgroundImage: `url(${sectionimg2})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:gap-10">

        {/* Header */}
        <SectionHeader
          title="Our Services"
          description="We provide engaging programs that support students academically, creatively, and socially. These activities help learners develop important skills, explore their interests, and grow into confident, capable individuals."
        />

        {/* Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 justify-items-center">
          {categories.map((item, index) => (
            <CategoryCard key={index} icon={item.icon} label={item.label} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default PopularCategory;