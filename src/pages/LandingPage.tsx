import React from 'react';
import { Button } from '../components/ui/button';
import { 
  FileCode, 
  Search, 
  Zap, 
  Shield, 
  Code2, 
  Layers,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Code2 className="w-8 h-8" />
            <span>CodeInsight</span>
          </div>
          <Button onClick={onLogin} variant="outline" className="font-medium">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-in">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Code Analysis</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 animate-in [animation-delay:100ms]">
            Understand Your Codebase <br className="hidden md:block" />
            <span className="text-primary">Instantly.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 animate-in [animation-delay:200ms]">
            Upload your files and get an intelligent AI assistant that knows every line. 
            Analyze, refactor, and query your project with precision.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in [animation-delay:300ms]">
            <Button size="lg" onClick={onLogin} className="px-8 font-semibold text-lg shadow-lg hover:shadow-primary/25 transition-all">
              Get Started for Free
            </Button>
            <Button size="lg" variant="outline" className="px-8 font-semibold text-lg">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Code Intelligence</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to master your codebases without spending hours digging.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FileCode className="w-6 h-6" />}
              title="Bulk File Upload"
              description="Simply upload your code files and let our engine index them for deep reference."
            />
            <FeatureCard 
              icon={<Search className="w-6 h-6" />}
              title="Semantic Search"
              description="Ask questions about your code in plain English. We find exactly what matters."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Instant Insights"
              description="Get refactoring suggestions, bug reports, and explanations in seconds."
            />
            <FeatureCard 
              icon={<Layers className="w-6 h-6" />}
              title="Context-Aware"
              description="Our AI understands relationships between files and classes for full context."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6" />}
              title="Secure Processing"
              description="Your code is indexed privately. Your data belongs to you alone."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6" />}
              title="Modern Tech Stack"
              description="Built on top of Blink's lightning-fast RAG engine for peak performance."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t text-center text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4">
          <p>&copy; 2026 CodeInsight Assistant. Built with Blink SDK.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-8 rounded-2xl border bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all group">
    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">
      {description}
    </p>
  </div>
);

export default LandingPage;
