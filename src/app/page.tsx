
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Code, Bot, Users, Trophy, Languages, Lock, Timer, Palette } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/logo';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '@/components/theme-toggle';

const features = [
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Smart Team Matching',
    description: 'Our AI matches you with the perfect team based on skills, passion, and availability.',
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'AI Mentor Chatbot',
    description: 'Get guidance, ask questions, and receive team suggestions from your personal AI mentor.',
  },
  {
    icon: <Languages className="h-8 w-8 text-primary" />,
    title: 'Multilingual Chat',
    description: 'Communicate seamlessly with real-time translation in your team chats.',
  },
  {
    icon: <Lock className="h-8 w-8 text-primary" />,
    title: 'Secure Auth',
    description: 'Robust and secure authentication to keep your account safe.',
  },
  {
    icon: <Timer className="h-8 w-8 text-primary" />,
    title: 'Trackers & Timers',
    description: 'Stay on top of deadlines with integrated hackathon trackers and countdowns.',
  },
  {
    icon: <Palette className="h-8 w-8 text-primary" />,
    title: 'Dark/Light Mode',
    description: 'Switch between themes for your preferred viewing experience.',
  },
];

const hackathons = [
  { name: 'AI for Good Challenge', description: 'Solve real-world problems' },
  { name: 'DeFi Innovation Sprint', description: 'Shape the future of finance' },
  { name: 'Campus Life+ Hack', description: 'Improve student life with tech' },
  { name: 'GameDev Gauntlet', description: 'Create the next indie hit' },
  { name: 'Sustainable Tech Jam', description: 'Code for a greener planet' },
];


export default function LandingPage() {
  const { theme } = useTheme();

  const FADE_UP_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-body text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Logo />
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-2">
              <ThemeToggle />
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
        <section className="relative h-[80vh] w-full overflow-hidden">
           <div className="absolute inset-0 z-0 bg-grid-pattern"></div>
           <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-background"></div>
          
          <motion.div 
            initial="hidden"
            animate="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
            className="container relative z-20 flex h-full flex-col items-center justify-center text-center">
            <motion.h1 
              variants={FADE_UP_ANIMATION_VARIANTS}
              className="text-5xl font-bold font-headline tracking-tight md:text-7xl">
              Where Innovation Finds Its <span className="text-primary">Team.</span>
            </motion.h1>
            <motion.p 
              variants={FADE_UP_ANIMATION_VARIANTS}
              className="mt-6 max-w-2xl text-lg text-muted-foreground">
              AI-powered campus hub for team formation, hackathons, and collaboration.
            </motion.p>
            <motion.div 
              variants={FADE_UP_ANIMATION_VARIANTS}
              className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">🚀 Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/teams">🎯 Explore Teams</Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>
        
        <section className="container py-24 sm:py-32">
          <motion.div
            initial="hidden"
            whileInView="show"
            variants={FADE_UP_ANIMATION_VARIANTS}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold font-headline tracking-tight sm:text-4xl">The Ultimate Collaboration Hub</h2>
            <p className="mt-4 text-lg text-muted-foreground">Everything you need to build amazing projects and win.</p>
          </motion.div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: (i) => ({
                        opacity: 1,
                        y: 0,
                        transition: { delay: i * 0.1, type: 'spring' },
                    }),
                }}
              >
                <Card className="h-full transform-gpu border-transparent [background:padding-box_border-box] before:absolute before:left-0 before:top-0 before:h-full before:w-full before:bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.2),transparent_40%)] before:opacity-0 before:transition-opacity hover:before:opacity-100">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold font-headline">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-24 sm:py-32 bg-secondary">
          <div className="container">
            <motion.div
              initial="hidden"
              whileInView="show"
              variants={FADE_UP_ANIMATION_VARIANTS}
              viewport={{ once: true }}
              className="mx-auto max-w-2xl text-center"
            >
              <h2 className="text-3xl font-bold font-headline tracking-tight sm:text-4xl">Upcoming Hackathons</h2>
              <p className="mt-4 text-lg text-muted-foreground">The next big challenge is just around the corner.</p>
            </motion.div>

            <div className="relative mt-12 flex overflow-x-hidden text-primary">
              <motion.div 
                className="flex animate-marquee whitespace-nowrap py-4"
                initial={{x:0}}
                animate={{x: '-100%'}}
                transition={{duration: 20, repeat: Infinity, ease: 'linear'}}
                >
                {hackathons.map((p, i) => (
                  <div key={i} className="mx-4 w-72 flex-shrink-0">
                    <Card className="bg-background">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold font-headline">{p.name}</h3>
                        <p className="mt-1 text-muted-foreground">{p.description}</p>
                        <Button className="mt-4 w-full" asChild><Link href="/hackathons">Join Now</Link></Button>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </motion.div>
               <motion.div 
                className="absolute top-0 flex animate-marquee2 whitespace-nowrap py-4"
                initial={{x:'100%'}}
                animate={{x: '0%'}}
                transition={{duration: 20, repeat: Infinity, ease: 'linear'}}
                >
                {hackathons.map((p, i) => (
                  <div key={i} className="mx-4 w-72 flex-shrink-0">
                    <Card className="bg-background">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold font-headline">{p.name}</h3>
                        <p className="mt-1 text-muted-foreground">{p.description}</p>
                        <Button className="mt-4 w-full" asChild><Link href="/hackathons">Join Now</Link></Button>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section className="container py-24 sm:py-32">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <motion.div
                initial="hidden"
                whileInView="show"
                variants={FADE_UP_ANIMATION_VARIANTS}
                viewport={{ once: true }}
            >
                <h2 className="text-3xl font-bold font-headline tracking-tight sm:text-4xl">Meet Your AI Mentor</h2>
                <p className="mt-4 text-lg text-muted-foreground">Stuck? Need a co-pilot? Your AI mentor is here to help you find teams, answer questions, and keep your project on track.</p>
                <Button className="mt-6" size="lg" asChild><Link href="/ai-mentor">Chat Now</Link></Button>
            </motion.div>
            <motion.div 
                className="relative flex h-60 items-center justify-center rounded-xl border-2 border-dashed border-primary/50 bg-primary/10 p-8"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                viewport={{ once: true }}
            >
                <Bot className="h-16 w-16 text-primary" />
                 <motion.div 
                    className="absolute -top-4 -right-4 rounded-full bg-background p-3 shadow-lg"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.4}}
                    viewport={{ once: true }}
                 >
                    <p className="text-primary">"Need a team? I can help!"</p>
                 </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Logo />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Empowering Innovation Together.
            </p>
          </div>
          <p className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Pulse Point. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
