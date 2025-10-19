import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Assessment = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground">
              Career Assessment
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto">
              Discover your ideal career path through our comprehensive assessment designed to match your interests, skills, and goals with the perfect major.
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            
            {/* Coming Soon Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-2xl p-8 md:p-12 border border-blue-200 dark:border-blue-800">
              <div className="space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Assessment Coming Soon
                </h2>
                
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  We're currently developing a comprehensive assessment tool that will help you discover your ideal career path. Our assessment will analyze your interests, strengths, and goals to provide personalized major recommendations.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <span className="text-sm">Personalized for your unique profile</span>
                  </div>
                </div>
              </div>
            </div>

            {/* What to Expect */}
            <div className="text-center space-y-8">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                What You Can Expect
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <h4 className="text-xl font-semibold text-foreground">Interest Analysis</h4>
                  <p className="text-muted-foreground">
                    Answer questions about your interests and activities to understand what motivates you.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <h4 className="text-xl font-semibold text-foreground">Skills Assessment</h4>
                  <p className="text-muted-foreground">
                    Identify your natural strengths and abilities across different domains.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <h4 className="text-xl font-semibold text-foreground">Career Matching</h4>
                  <p className="text-muted-foreground">
                    Receive personalized major and career recommendations based on your profile.
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Home Button */}
            <div className="pt-8">
              <Link to="/">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Assessment;
