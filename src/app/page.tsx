import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Code, Bot, Users, Trophy, Languages } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/logo';

const projects = [
  { name: 'Project Fusion', description: 'AI-Powered Climate Change Modeler' },
  { name: 'QuantumLeap', description: 'Decentralized Learning Platform' },
  { name: 'EcoTrack', description: 'Supply Chain Sustainability Tracker' },
  { name: 'HealthChain', description: 'Blockchain for Medical Records' },
  { name: 'CitySim', description: 'Urban Development Simulation Tool' },
  { name: 'Artify', description: 'AI-Generated Art Marketplace' },
];

const features = [
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Smart Team Formation',
    description: 'Our AI matches you with the perfect team based on skills, passion, and availability.',
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'AI Mentor',
    description: 'Get guidance, ask questions, and receive team suggestions from your personal AI mentor.',
  },
  {
    icon: <Trophy className="h-8 w-8 text-primary" />,
    title: 'Hackathon Hub',
    description: 'Discover, track, and compete in the latest hackathons happening on campus and online.',
  },
  {
    icon: <Languages className="h-8 w-8 text-primary" />,
    title: 'Real-Time Collaboration',
    description: 'Chat with your team in real-time with automatic translation and content moderation.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Logo />
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative h-[80vh] w-full">
          <div className="absolute inset-0 bg-grid-red-500/[0.1] bg-grid-slate-900/[0.2]"></div>
          <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center">
            <h1 className="animate-fade-in-up text-5xl font-bold tracking-tight md:text-7xl">
              Build The Future, <span className="text-primary">Together</span>
            </h1>
            <p className="mt-6 max-w-2xl animate-fade-in-up text-lg text-muted-foreground [animation-delay:0.2s]">
              Nexus Teams is your AI-powered hub for finding teammates, joining projects, and conquering hackathons on campus.
            </p>
            <div className="mt-8 flex animate-fade-in-up gap-4 [animation-delay:0.4s]">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="relative w-full py-12">
          <div className="relative flex overflow-x-hidden text-primary">
            <div className="animate-marquee whitespace-nowrap py-4">
              {projects.map((p, i) => (
                <span key={i} className="mx-4 text-2xl font-semibold">{p.name}</span>
              ))}
            </div>
            <div className="absolute top-0 animate-marquee2 whitespace-nowrap py-4">
              {projects.map((p, i) => (
                <span key={i} className="mx-4 text-2xl font-semibold">{p.name}</span>
              ))}
            </div>
          </div>
        </section>
        
        <section className="container py-24 sm:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">The Ultimate Collaboration Hub</h2>
            <p className="mt-4 text-lg text-muted-foreground">Everything you need to build amazing projects and win.</p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/20 hover:shadow-lg">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

      </main>

      <footer className="border-t py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Logo />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built by students, for students.
            </p>
          </div>
          <p className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Nexus Teams. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Add keyframes for animations to globals.css if not already there
const keyframes = `
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}

.bg-grid-slate-900\\[\\/0\\.2\\] {
  background-image: linear-gradient(white 1px, transparent 1px), linear-gradient(to right, white 1px, transparent 1px);
  background-size: 40px 40px;
}
.dark .bg-grid-red-500\\[\\/0\\.1\\] {
    background-image: linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: 0.1;
}

`;
// Note: Keyframes and custom bg-grid are usually in globals.css, but placed here for clarity.
// The marquee animation is defined in the updated globals.css.
