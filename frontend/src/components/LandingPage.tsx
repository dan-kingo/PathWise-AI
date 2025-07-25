import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Button from './ui/Button';
import { 
  Sparkles, 
  Target, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Star,
  ArrowRight,
  Play,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Github} from 'lucide-react';
import ContactForm from './ContactForm';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const features = [
    {
      icon: <Sparkles className="w-8 h-8 text-purple-600" />,
      title: "AI-Powered Career Planning",
      description: "Get personalized career roadmaps generated by advanced AI based on your goals and current skills."
    },
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "Skill Gap Analysis",
      description: "Identify exactly what skills you need to develop to reach your dream job with detailed analysis."
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Profile Review",
      description: "Receive AI based review & feedback on your resume, LinkedIn profile, and Github to enhance your job applications."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
      title: "Progress Tracking",
      description: "Stay on track with your personalized learning path. Track your progress, milestones, and achievements in real-time."
    }
  ];

  const testimonials = [
    {
      name: "Sosna Dagne ",
      role: "Frontend Developer",
      company: "Askuala Link",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      quote: "Job Ready AI Coach helped me transition from marketing to tech in just 6 months. The personalized roadmap was exactly what I needed."
    },
    {
      name: "Fikir Tesfaye",
      role: "Data Scientist",
      company: "Google",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      quote: "The skill gap analysis was incredibly accurate. It showed me exactly what I was missing and how to get there."
    },
    {
      name: "Emily Rodriguez",
      role: "UX Designer",
      company: "Meta",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      quote: "I love how the AI creates a step-by-step plan. It made my career transition feel manageable and achievable."
    }
  ];

  const stats = [
    { number: "1000+", label: "Career Paths Generated" },
    { number: "85%", label: "Success Rate" },
    { number: "10+", label: "Career Fields" },
    { number: "4.9/5", label: "User Rating" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">PathWise AI</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-gray-900 transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-gray-600 hover:text-gray-900 transition-colors">
                Testimonials
              </button>
              <button onClick={() => scrollToSection('about')} className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-600 hover:text-gray-900 transition-colors">
                Contact
              </button>
              <Button onClick={handleGetStarted} size="sm">
                {isAuthenticated ? 'Dashboard' : 'Get Started'}
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-4">
                <button onClick={() => scrollToSection('features')} className="text-left text-gray-600 hover:text-gray-900">
                  Features
                </button>
                <button onClick={() => scrollToSection('how-it-works')} className="text-left text-gray-600 hover:text-gray-900">
                  How It Works
                </button>
                <button onClick={() => scrollToSection('testimonials')} className="text-left text-gray-600 hover:text-gray-900">
                  Testimonials
                </button>
                <button onClick={() => scrollToSection('about')} className="text-left text-gray-600 hover:text-gray-900">
                  About
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-left text-gray-600 hover:text-gray-900">
                  Contact
                </button>
                <Button onClick={handleGetStarted} size="sm" className="w-fit">
                  {isAuthenticated ? 'Dashboard' : 'Get Started'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with top padding for fixed nav */}
      <section className="relative bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-20 lg:py-32 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your AI-Powered
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Career Coach</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Get personalized career roadmaps, skill gap analysis, profile review and step-by-step guidance to land your dream job. Powered by advanced AI technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleGetStarted} size="lg" className="text-lg px-8 py-4">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Career Goal</h3>
                      <p className="text-gray-600">Senior Frontend Developer</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Your Learning Path</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">React Fundamentals</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">TypeScript Mastery</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Advanced Patterns</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides comprehensive career guidance tailored to your unique goals and background.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-100 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just 3 simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Complete Your Profile",
                description: "Tell us about your background, skills, and career goals to get personalized recommendations."
              },
              {
                step: "2",
                title: "Get AI Analysis",
                description: "Our AI analyzes your profile and generates a customized learning roadmap with skill gap analysis."
              },
              {
                step: "3",
                title: "Follow Your Path",
                description: "Execute your personalized plan with curated resources, milestones, and progress tracking."
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              See how others have transformed their careers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                About PathWise AI
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
               At PathWise AI, we believe everyone deserves a clear, confident path to their dream career. Our AI-powered platform blends advanced technology with real-world industry insight to deliver personalized, actionable career guidance.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Whether you're refining your LinkedIn or GitHub profile, planning your future career path, or preparing your resume, PathWise AI is your smart guide to getting job-ready and staying ahead.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">50+</h3>
                  <p className="text-gray-600">Career Fields</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">1000+</h3>
                  <p className="text-gray-600">Success Stories</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2"
                alt="Team collaboration"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600">
              Have questions? We'd love to hear from you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <Mail className="w-6 h-6 text-purple-600 mr-4" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">pathwiseai@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-6 h-6 text-purple-600 mr-4" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">+251 989-842-352</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-purple-600 mr-4" />
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">Addis Abeba, Ethiopia</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-medium text-gray-900 mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="https://linkedin.com/in/daniel_dejen_worku" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-purple-100 transition-colors">
                    <Linkedin className="w-5 h-5 text-gray-600" />
                  </a>
                  <a href="https://twitter.com/@Dani_Mad23" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-purple-100 transition-colors">
                    <Twitter className="w-5 h-5 text-gray-600" />
                  </a>
                  <a href="https://github.com/dan-kingo" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-purple-100 transition-colors">
                    <Github className="w-5 h-5 text-gray-600" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Send us a message</h3>
            <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of professionals who have successfully advanced their careers with our AI-powered guidance.
          </p>
          <Button 
            onClick={handleGetStarted}
            variant="secondary" 
            size="lg" 
            className="text-lg px-8 py-4 bg-white text-purple-600 hover:bg-gray-100"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-lg font-bold">Job Ready AI Coach</span>
              </div>
              <p className="text-gray-400">
                Your AI-powered career coach for professional success.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#contact" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Job Ready AI Coach. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;