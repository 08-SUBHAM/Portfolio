// Editable portfolio content. Facts sourced from subhamghosh.in — do not add unverified claims.
import potcity from '@/assets/portfolio/potcity.png';
import mediguard from '@/assets/portfolio/MediGuard_AI.webp';
import agriboost from '@/assets/portfolio/agriboost.webp';
import door from '@/assets/portfolio/door.webp';
import sea from '@/assets/portfolio/sea.webp';
import jungle from '@/assets/portfolio/jungle.webp';
import car from '@/assets/portfolio/car.jpg';
import house from '@/assets/portfolio/house.webp';
import indoor from '@/assets/portfolio/indoor.webp';
import outside from '@/assets/portfolio/outside.webp';
const R = "https://www.subhamghosh.in";

export const profile = {
  name: "Subham Ghosh",
  role: "Frontend Developer",
  location: "Bengaluru, India",
  email: "sonughosh0810@gmail.com",
  cvUrl: "/resume.pdf",
  resumeUrl: "/resume.pdf",
  intro:
    "Frontend developer building interfaces with care for architecture and visual composition — and exploring 3D environments and game systems on the side.",
  socials: [{ label: "GitHub", href: "https://github.com/08-SUBHAM" }],
};

export const experience = [
  {
    period: "Dec 2025 — Present",
    title: "Frontend & Technical Coordinator",
    org: "MCT",
    mode: "Remote",
    link: { label: "medcaretech.in", href: "https://medcaretech.in/" },
    body: "Plan, design, and coordinate the development team for the medcaretech.in website. Responsible for the frontend architecture, user interface design, and seamless collaboration between design and technical teams to deliver a premium user experience.",
    tags: ["React", "Frontend Architecture", "Team Coordination", "UI/UX Design"],
  },
];

export type Project = {
  id: string;
  index: string;
  title: string;
  kind: string;
  summary: string;
  details: string[];
  stack: string[];
  image: string;
  live?: string;
  code?: string;
};

export const projects: Project[] = [
  {
    id: "potcity",
    index: "01",
    title: "PotCity",
    kind: "Smart City Infrastructure AI",
    summary: "Intelligent urban infrastructure management system using AI-powered road damage detection, geospatial tracking, and autonomous simulation.",
    details: [
      "Integrates an Android edge AI detection application with real-time pothole identification and geospatial mapping.",
      "Engineered a physics-based spatial scanning system to estimate pothole dimensions, prioritize critical fixes, and calculate repair costs.",
      "Built a Unity-based 3D city simulation with autonomous survey and repair vehicle agents using BFS graph navigation.",
      "Full-stack architecture pairing a Node.js and MongoDB backend with real-time operations monitoring.",
    ],
    stack: ["Android", "Unity", "C#", "Node.js", "MongoDB", "AI / Edge CV"],
    image: potcity,
    code: "https://github.com/08-SUBHAM/Potcity",
  },
  {
    id: "mediguard",
    index: "02",
    title: "MediGuard AI",
    kind: "Healthcare AI platform",
    summary: "Predicting chronic kidney disease stages with machine learning.",
    details: [
      "CNN-based CT scan analysis with Grad-CAM explainability.",
      "RNN models for future disease progression detection.",
      "Full-stack app pairing a React interface with a Flask + TensorFlow backend.",
    ],
    stack: ["React", "Flask", "MongoDB", "Python", "TensorFlow"],
    image: mediguard,
    live: "https://ckd-predictor-psi.vercel.app/",
    code: "https://github.com/08-SUBHAM/kidney-disease-prediction-backend",
  },
  {
    id: "agriboost",
    index: "03",
    title: "AgriBoost",
    kind: "Agricultural e-commerce",
    summary: "Connecting farmers directly with consumers.",
    details: [
      "A marketplace that removes intermediaries between growers and buyers.",
      "Built on a MERN-style stack with an Express API.",
    ],
    stack: ["React", "Node.js", "MongoDB", "Express"],
    image: agriboost,
    live: "https://agriboost.onrender.com/",
    code: "https://github.com/08-SUBHAM/Agriboost",
  },
];

export type OtherProject = {
  title: string;
  live: string;
  code: string;
  video?: string;
};

export const otherProjects: OtherProject[] = [
  {
    title: "Rayban Landing Page",
    live: "https://rayban-blond.vercel.app/",
    code: "https://github.com/08-SUBHAM/Rayban",
    video: "https://res.cloudinary.com/dpqgn0bpy/video/upload/v1794481520/rayban.mp4",
  },
  {
    title: "Two Good Co",
    live: "https://two-good-co-alpha-sooty.vercel.app/",
    code: "https://github.com/08-SUBHAM/TwoGoodCO/",
    video: "https://res.cloudinary.com/dpqgn0bpy/video/upload/v1794481520/twogoodco.mp4",
  },
];

export const stack = [
  { group: "Languages", items: ["HTML", "CSS", "JavaScript", "Python", "C"] },
  { group: "Frameworks & Libraries", items: ["React", "Node.js", "Express", "Tailwind"] },
  { group: "Tools & Platforms", items: ["MongoDB", "Git", "GitHub", "AWS", "Blender", "Unreal Engine", "Android Studio"] },
];

export const playground = {
  modeling: {
    title: "3D Modeling",
    body: "Creating detailed environments and assets — a creative outlet that sharpens my sense of spatial design and visual composition.",
    renders: [
      { title: "Door Scene", tool: "Unreal Engine", src: door },
      { title: "Jungle", tool: "Unreal Engine", src: jungle },
      { title: "Sea Scene", tool: "Blender", src: sea },
      { title: "McLaren P1 in Underground Garage", tool: "Blender", src: car },
    ],
  },
  games: {
    title: "Game Development",
    body: "Developing game concepts with a focus on mechanics, functionality and system design — prototyping ideas and implementing core gameplay to test approaches.",
    renders: [
      { title: "House of Hell — Exterior", tool: "Unreal Engine", src: house },
      { title: "House of Hell — Interior", tool: "Unreal Engine", src: indoor },
      { title: "House of Hell — Environment", tool: "Unreal Engine", src: outside },
    ],
  },
};
