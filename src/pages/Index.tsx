import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MajorCard from "@/components/MajorCard";
import { 
  Cpu, 
  Heart, 
  TrendingUp, 
  Palette, 
  FlaskConical, 
  Scale,
  GraduationCap,
  Sparkles,
  Search,
  Building2
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useState } from "react";
import ProfileSection from "@/components/ProfileSection";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

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

  const universities = [
    {
      icon: Building2,
      title: "King Saud University",
      description: "Leading research university in Riyadh",
      examples: ["Engineering", "Medicine", "Sciences", "Humanities"]
    },
    {
      icon: Building2,
      title: "King Abdulaziz University",
      description: "Premier institution in Jeddah",
      examples: ["Engineering", "Medicine", "Business", "Marine Sciences"]
    },
    {
      icon: Building2,
      title: "King Fahd University of Petroleum & Minerals",
      description: "Top-ranked engineering and technology university",
      examples: ["Petroleum Engineering", "Chemical Engineering", "Computer Science"]
    },
    {
      icon: Building2,
      title: "Imam Abdulrahman Bin Faisal University",
      description: "Comprehensive university in Dammam",
      examples: ["Medicine", "Engineering", "Architecture", "Business"]
    },
    {
      icon: Building2,
      title: "King Khalid University",
      description: "Growing university in Abha",
      examples: ["Medicine", "Engineering", "Education", "Sciences"]
    },
    {
      icon: Building2,
      title: "Umm Al-Qura University",
      description: "Historic university in Makkah",
      examples: ["Islamic Studies", "Engineering", "Medicine", "Social Sciences"]
    }
  ];

  const filteredMajors = majors.filter(major =>
    major.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    major.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    major.examples.some(ex => ex.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUniversities = universities.filter(university =>
    university.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    university.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    university.examples.some(ex => ex.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Profile Section - Only show for registered users */}
      {user && user.id !== "guest" && <ProfileSection />}
      
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
                className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-primary backdrop-blur-sm text-lg px-8 py-6 transition-all duration-300"
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
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Discover Your Path
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Explore diverse fields of study and find the major that aligns with your passions, strengths, and career goals.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search majors or universities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg border-border/50 focus:border-primary"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="majors" className="max-w-7xl mx-auto">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-blue-100 dark:bg-blue-950 p-1">
              <TabsTrigger 
                value="majors" 
                className="text-base data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Majors
              </TabsTrigger>
              <TabsTrigger 
                value="universities" 
                className="text-base data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Universities
              </TabsTrigger>
            </TabsList>

            <TabsContent value="majors" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMajors.length > 0 ? (
                  filteredMajors.map((major, index) => (
                    <MajorCard key={index} {...major} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground text-lg">No majors found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="universities" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUniversities.length > 0 ? (
                  filteredUniversities.map((university, index) => (
                    <MajorCard key={index} {...university} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground text-lg">No universities found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
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
