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
import training from '../../../assets/img/training.png'
import CategoryCard from '../ui/CategoryCard'
import SectionHeader from '../ui/SectionHeader'

const categories = [
  { icon: codding,     label: "Coding"                       },
  { icon: python,      label: "Programming"                  },
  { icon: robot,       label: "Robotics"                     },
  { icon: mathematics, label: "Mathematics Challenge"        },
  { icon: graph,       label: "Canva & Design"                },
  { icon: music,       label: "CapCut & Creative Media"       },
  { icon: excel,       label: "Literacy"                      },
  { icon: ches,        label: "Chess Club"                   },
  { icon: training,    label: "Leadership Development"        },
  { icon: event,       label: "After-School Programme"        },
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
        <SectionHeader
          title="Future-Ready Curriculum"
          description="Coding, Programming, and Robotics are integrated alongside Mathematics Challenge, CapCut, Canva, Literacy, and Chess Clubs to build creativity, critical thinking, and practical leadership skills."
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {categories.map((item, index) => (
            <CategoryCard key={index} icon={item.icon} label={item.label} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCategory;