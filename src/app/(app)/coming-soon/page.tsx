
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Rocket, Lightbulb, TrendingUp, Target, Mail } from 'lucide-react';

const features = [
  {
    title: 'Team Matchmaking AI',
    description: 'Connects like-minded students automatically.',
    status: 'In Progress',
    icon: <Rocket className="h-8 w-8 text-primary" />,
    color: 'hsl(var(--primary))',
  },
  {
    title: 'Idea Incubator',
    description: 'Submit ideas and get instant feedback.',
    status: 'Under Testing',
    icon: <Lightbulb className="h-8 w-8 text-yellow-400" />,
    color: 'hsl(var(--chart-4))',
  },
  {
    title: 'Campus Buzz',
    description: 'Trending discussions and opportunities.',
    status: 'Launching Soon',
    icon: <TrendingUp className="h-8 w-8 text-green-400" />,
    color: 'hsl(var(--chart-2))',
  },
  {
    title: 'Skill Tracker',
    description: 'Monitor and showcase your project skills.',
    status: 'In Progress',
    icon: <Target className="h-8 w-8 text-red-400" />,
    color: 'hsl(var(--destructive))',
  },
];

const timelineSteps = [
  { name: 'Phase 1: Core Platform', status: 'completed' },
  { name: 'Phase 2: AI Integration', status: 'completed' },
  { name: 'Phase 3: Community Tools', status: 'active' },
  { name: 'Phase 4: Open API', status: 'upcoming' },
];

export default function ComingSoonPage() {
  const FADE_UP_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' } },
  };

  return (
    <div className="container mx-auto p-4 md:p-8 text-foreground">
      <motion.div
        className="text-center mb-12"
        initial="hidden"
        animate="show"
        variants={FADE_UP_ANIMATION_VARIANTS}
      >
        <h1 className="text-5xl font-bold font-headline tracking-tight">
          🚀 Coming Soon on <span className="text-primary">PulsePoint</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We're constantly innovating to bring you the best collaboration tools. Here's a sneak peek at what's next.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: {
                opacity: 1,
                y: 0,
                transition: { delay: index * 0.1, type: 'spring' },
              },
            }}
            whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }}
          >
            <Card className="h-full border-l-4" style={{ borderLeftColor: feature.color }}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  {feature.icon}
                  <CardTitle>{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <Badge 
                  className="font-semibold" 
                  style={{
                    backgroundColor: `${feature.color}33`,
                    color: feature.color,
                    borderColor: feature.color,
                  }}
                >
                  {feature.status}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mb-16"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={FADE_UP_ANIMATION_VARIANTS}
      >
        <h2 className="text-3xl font-bold text-center mb-8">Development Roadmap</h2>
        <div className="relative w-full max-w-3xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary rounded-full -translate-y-1/2">
                <div className="h-full bg-primary rounded-full" style={{ width: '66%' }}></div>
            </div>
            <div className="relative flex justify-between">
            {timelineSteps.map((step, index) => (
                <div key={step.name} className="flex flex-col items-center">
                    <div className={`h-4 w-4 rounded-full border-2 ${step.status === 'completed' ? 'bg-primary border-primary' : step.status === 'active' ? 'bg-primary ring-4 ring-primary/30 border-primary' : 'bg-secondary border-muted'}`}></div>
                    <p className="mt-3 text-sm font-medium">{step.name}</p>
                    <p className="text-xs text-muted-foreground">{step.status}</p>
                </div>
            ))}
            </div>
        </div>
      </motion.div>

      <motion.div
        className="text-center"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={FADE_UP_ANIMATION_VARIANTS}
      >
        <h2 className="text-2xl font-bold">Want to stay updated?</h2>
        <p className="text-muted-foreground mt-2">Get notified as soon as these features drop.</p>
        <Button size="lg" className="mt-6">
          <Mail className="mr-2" /> Notify Me
        </Button>
      </motion.div>
    </div>
  );
}
