import { useState } from 'react';
import { ChevronDown, Download, MessageCircle, CheckCircle, Zap, Brain, Shield, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "Voice-First AI",
      description: "Talk naturally with Giorgio using advanced speech recognition and multiple TTS engines",
      icon: MessageCircle,
      screenshot: "/screenshot/home.png"
    },
    {
      title: "Smart Todo Lists",
      description: "Organize your life with AI-powered task management that learns your patterns",
      icon: CheckCircle,
      screenshot: "/screenshot/todolist.png"
    },
    {
      title: "Personal Memory",
      description: "Giorgio remembers what matters to you with secure, private vector memory storage",
      icon: Brain,
      screenshot: "/screenshot/profile.png"
    },
    {
      title: "Your Data, Your Control",
      description: "Complete isolation - your data stays on your device with personal database storage",
      icon: Shield,
      screenshot: "/screenshot/menu.png"
    }
  ];

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Zap className="w-4 h-4 mr-2" />
              AI Assistant for Mobile
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Meet Giorgio
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Your personal AI assistant that learns, remembers, and helps you organize your life. 
              Built for mobile with advanced voice interaction and secure personal storage.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-blue-500/25"
              >
                <Download className="w-5 h-5 mr-2" />
                Download for iOS
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10 px-8 py-6 text-lg rounded-full"
              >
                <Download className="w-5 h-5 mr-2" />
                Download for Android
              </Button>
            </div>
            
            <div className="mt-12">
              <button 
                onClick={scrollToFeatures}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ChevronDown className="w-8 h-8 animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the future of AI assistance with cutting-edge technology designed for your mobile life
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <feature.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-lg">
                    {feature.description}
                  </CardDescription>
                  
                  <div className="mt-4 relative">
                    <div className="bg-slate-900 rounded-lg p-2 border border-slate-700">
                      <img 
                        src={feature.screenshot} 
                        alt={feature.title}
                        className="w-full h-48 object-cover rounded"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Deep Dive */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Built for Privacy & Performance
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  Isolated Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Your personal MongoDB instance ensures complete data isolation. 
                  No shared databases, no data mining - your information stays yours.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  Vector Memory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Advanced Qdrant vector database creates semantic memories of your preferences, 
                  habits, and important information for truly personalized assistance.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                  Native Mobile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Built with Capacitor for true native iOS and Android apps. 
                  Optimized for mobile with voice-first interaction design.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Voice Engine Showcase */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Multiple Voice Options
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Google Gemini</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Natural, conversational AI voices with multiple language support
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">ElevenLabs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Ultra-realistic voices with emotional depth and custom voice cloning
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Native TTS</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Device-native voices for offline capability and maximum privacy
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Download Giorgio today and transform how you interact with AI on your mobile device
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-blue-500/25"
            >
              <Download className="w-5 h-5 mr-2" />
              Get Giorgio Now
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full"
            >
              Try Web Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="container mx-auto text-center">
          <p className="text-gray-400">
            © 2024 Giorgio AI. Built with privacy-first architecture.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
