export type User = {
  id: string;
  name: string;
  avatar: string;
  skills: string[];
  passion: string;
  availability: string;
  interests: string[];
  pulseIndex: number;
};

export type Team = {
  id: string;
  name: string;
  logo: string;
  projectDescription: string;
  openRoles: string[];
  requiredSkills: string[];
  members: User[];
  age: string;
};

export type Hackathon = {
  id: string;
  name:string;
  logo: string;
  startDate: string;
  endDate: string;
  description: string;
  registrationLink: string;
  live: boolean;
};

export const currentUser: User = {
  id: 'user-1',
  name: 'Alex Doe',
  avatar: '1',
  skills: ['React', 'Node.js', 'AI/ML', 'UI/UX Design'],
  passion: 'Building scalable AI applications',
  availability: '15-20 hours/week',
  interests: ['AI', 'Web Dev', 'Mobile'],
  pulseIndex: 88,
};

export const users: User[] = [
  currentUser,
  {
    id: 'user-2',
    name: 'Jane Smith',
    avatar: '2',
    skills: ['Python', 'Data Science', 'TensorFlow'],
    passion: 'Data visualization and storytelling',
    availability: '10 hours/week',
    interests: ['Data Science', 'AI'],
    pulseIndex: 92,
  },
  {
    id: 'user-3',
    name: 'Sam Wilson',
    avatar: '3',
    skills: ['Flutter', 'Firebase', 'Mobile UI'],
    passion: 'Creating beautiful mobile experiences',
    availability: '25 hours/week',
    interests: ['Mobile', 'UI/UX'],
    pulseIndex: 85,
  },
  {
    id: 'user-4',
    name: 'Maria Garcia',
    avatar: '4',
    skills: ['NestJS', 'PostgreSQL', 'Docker', 'DevOps'],
    passion: 'Architecting robust backend systems',
    availability: '20 hours/week',
    interests: ['Backend', 'Cloud'],
    pulseIndex: 95,
  },
];

export const teams: Team[] = [
  {
    id: 'team-1',
    name: 'QuantumLeap',
    logo: '5',
    projectDescription: 'A decentralized learning platform using blockchain to verify educational credentials. We aim to democratize education.',
    openRoles: ['Frontend Developer', 'Solidity Developer'],
    requiredSkills: ['React', 'ethers.js', 'Solidity', 'IPFS'],
    members: [users[1], users[3]],
    age: "2 days, 3 hours old"
  },
  {
    id: 'team-2',
    name: 'EcoTrack',
    logo: '6',
    projectDescription: 'An IoT and AI-powered platform for tracking and optimizing supply chain sustainability, from sourcing to delivery.',
    openRoles: ['Data Scientist', 'Backend Engineer'],
    requiredSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    members: [users[2]],
    age: "5 days, 8 hours old"
  },
  {
    id: 'team-3',
    name: 'NexusBots',
    logo: '7',
    projectDescription: 'Building the next generation of AI-powered chat assistants for customer support and internal tooling.',
    openRoles: ['AI Engineer', 'UX Designer'],
    requiredSkills: ['LLMs', 'Vector DBs', 'UI/UX Design', 'Figma'],
    members: [users[0], users[2], users[3]],
    age: "1 day, 1 hour old"
  },
];

export const hackathons: Hackathon[] = [
  {
    id: 'hack-1',
    name: 'AI for Good Challenge',
    logo: '8',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Use AI to solve some of the world\'s most pressing social and environmental problems.',
    registrationLink: '#',
    live: true,
  },
  {
    id: 'hack-2',
    name: 'DeFi Innovation Sprint',
    logo: '9',
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Build the next-gen decentralized finance applications on Ethereum.',
    registrationLink: '#',
    live: false,
  },
  {
    id: 'hack-3',
    name: 'Campus Life Hack',
    logo: '10',
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'A hackathon focused on improving student life on campus through technology.',
    registrationLink: '#',
    live: true,
  },
];
