import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Users, Clock, Award, Play, Star } from "lucide-react";

export const LearningHubSection = () => {
  const courses = [
    {
      title: "AgriTech Drone Operations",
      instructor: "Dr. Sarah Ochieng",
      students: 1240,
      duration: "6 weeks",
      rating: 4.9,
      price: "$199",
      category: "Technology",
      level: "Intermediate"
    },
    {
      title: "Modern Poultry Farming",
      instructor: "Prof. James Mwangi",
      students: 890,
      duration: "4 weeks", 
      rating: 4.8,
      price: "$149",
      category: "Livestock",
      level: "Beginner"
    },
    {
      title: "Sustainable Organic Farming",
      instructor: "Dr. Fatima Al-Rashid",
      students: 2100,
      duration: "8 weeks",
      rating: 4.9,
      price: "$249",
      category: "Sustainability",
      level: "Advanced"
    }
  ];

  return (
    <section id="learning" className="py-20 bg-gradient-to-b from-background to-earth/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-earth text-earth-foreground">
            🎓 Learning Hub
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Agricultural Education & Certification
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn from agricultural experts, earn certifications, and stay ahead with the latest 
            farming techniques, technology, and best practices.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">5,000+</div>
            <p className="text-muted-foreground">Students Enrolled</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-trust mb-2">200+</div>
            <p className="text-muted-foreground">Expert Instructors</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">150+</div>
            <p className="text-muted-foreground">Courses Available</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-earth mb-2">95%</div>
            <p className="text-muted-foreground">Completion Rate</p>
          </div>
        </div>

        {/* Course Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {["All Courses", "Crop Management", "Livestock", "AgriTech", "Sustainability", "Business"].map((category) => (
            <Button key={category} variant="outline" className="rounded-full">
              {category}
            </Button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {courses.map((course, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="relative bg-gradient-to-br from-primary/10 to-trust/10 h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <Badge className="bg-earth text-earth-foreground">{course.category}</Badge>
                </div>
                <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
                  {course.level}
                </Badge>
              </div>
              
              <CardHeader className="pb-4">
                <CardTitle className="text-xl line-clamp-2">{course.title}</CardTitle>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span>{course.rating}</span>
                  </div>
                  <span className="font-bold text-primary">{course.price}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {course.instructor.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{course.instructor}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students} students</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>

                  <Button className="w-full bg-gradient-to-r from-earth to-primary text-primary-foreground">
                    Enroll Now
                    <GraduationCap className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certification Section */}
        <Card className="bg-gradient-to-r from-trust/10 to-primary/10 border-2 border-trust/20">
          <CardContent className="p-8">
            <div className="text-center">
              <Award className="h-16 w-16 text-accent mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Earn Internationally Recognized Certifications
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Complete courses and receive digital certificates that are recognized by agricultural 
                institutions across Africa and globally. Boost your credibility and career prospects.
              </p>
              <Button size="lg" className="bg-trust text-trust-foreground">
                View Certification Programs
                <Award className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};