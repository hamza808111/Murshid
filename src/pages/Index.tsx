import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import MajorCard from "@/components/MajorCard";
import { 
  Cpu, 
  Heart, 
  TrendingUp, 
  Palette, 
  FlaskConical, 
  Scale,
  GraduationCap,
  Sparkles
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const majors = [
    {
      icon: Cpu,
      title: "Engineering & Technology",
      description: "Build the future with innovation and technical expertise",
      examples: ["Computer Science", "Electrical Engineering", "Mechanical Engineering"]
    },
    {
      icon: Heart,
      title: "Medical & Health Sciences",
      description: "Make a difference in people's lives through healthcare",
      examples: ["Medicine", "Nursing", "Pharmacy", "Physical Therapy"]
    },
    {
      icon: TrendingUp,
      title: "Business & Economics",
      description: "Lead organizations and drive economic growth",
      examples: ["Business Administration", "Finance", "Marketing", "Accounting"]
    },
    {
      icon: Palette,
      title: "Arts & Design",
      description: "Express creativity and shape cultural experiences",
      examples: ["Graphic Design", "Fine Arts", "Architecture", "Media Production"]
    },
    {
      icon: FlaskConical,
      title: "Natural Sciences",
      description: "Explore the fundamental laws of nature and discovery",
      examples: ["Biology", "Chemistry", "Physics", "Environmental Science"]
    },
    {
      icon: Scale,
      title: "Law & Social Sciences",
      description: "Understand society and advocate for justice",
      examples: ["Law", "Psychology", "Sociology", "Political Science"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-visible">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 to-accent/95"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-primary-foreground/90">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Your Future Starts Here</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground leading-[1.25] md:leading-[1.12] pb-4 overflow-visible">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-white to-primary-foreground/80 bg-clip-text text-transparent py-2 leading-[1.2] md:leading-[1.1] pb-[0.3em]">
                College Major
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
              Murshid guides high school students through the journey of discovering their ideal academic path with expert insights and personalized recommendations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg px-8 py-6"
              >
                <GraduationCap className="w-5 h-5 mr-2" />
                Explore Majors
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white/30 text-primary-foreground hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-6"
              >
                Take Assessment
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Discover Your Path
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore diverse fields of study and find the major that aligns with your passions, strengths, and career goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {majors.map((major, index) => (
              <MajorCard key={index} {...major} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground">
              Ready to Shape Your Future?
            </h2>
            <p className="text-xl text-primary-foreground/90">
              Join thousands of students who have found their calling with Murshid's guidance.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg px-8 py-6"
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
