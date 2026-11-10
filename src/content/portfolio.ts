// Editable portfolio content. Facts sourced from subhamghosh.in — do not add unverified claims.
import mediguard from '@/assets/portfolio/MediGuard_AI.webp.asset.json';
import agriboost from '@/assets/portfolio/agriboost.webp.asset.json';
import door from '@/assets/portfolio/door.webp.asset.json';
import sea from '@/assets/portfolio/sea.webp.asset.json';
import jungle from '@/assets/portfolio/jungle.webp.asset.json';
import house from '@/assets/portfolio/house.webp.asset.json';
import indoor from '@/assets/portfolio/indoor.webp.asset.json';
import outside from '@/assets/portfolio/outside.webp.asset.json';
const R = "https://www.subhamghosh.in";

export const profile = {
  name: "Subham Ghosh",
  role: "Frontend Developer",
  location: "Bengaluru, India",
  email: "sonughosh0810@gmail.com",
  cvUrl: `${R}/cv.html`,
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
    id: "mediguard",
    index: "01",
    title: "MediGuard AI",
    kind: "Healthcare AI platform",
    summary: "Predicting chronic kidney disease stages with machine learning.",
    details: [
      "CNN-based CT scan analysis with Grad-CAM explainability.",
      "RNN models for future disease progression detection.",
      "Full-stack app pairing a React interface with a Flask + TensorFlow backend.",
    ],
    stack: ["React", "Flask", "MongoDB", "Python", "TensorFlow"],
    image: mediguard.url,
    live: "https://ckd-predictor-psi.vercel.app/",
    code: "https://github.com/08-SUBHAM/kidney-disease-prediction-backend",
  },
  {
    id: "agriboost",
    index: "02",
    title: "AgriBoost",
    kind: "Agricultural e-commerce",
    summary: "Connecting farmers directly with consumers.",
    details: [
      "A marketplace that removes intermediaries between growers and buyers.",
      "Built on a MERN-style stack with an Express API.",
    ],
    stack: ["React", "Node.js", "MongoDB", "Express"],
    image: agriboost.url,
    live: "https://agriboost.onrender.com/",
    code: "https://github.com/08-SUBHAM/Agriboost",
  },
];

export const otherProjects = [
  { title: "Rayban Landing Page", live: "https://rayban-blond.vercel.app/", code: "https://github.com/08-SUBHAM/Rayban" },
  { title: "Two Good Co", live: "https://two-good-co-alpha-sooty.vercel.app/", code: "https://github.com/08-SUBHAM/TwoGoodCO/" },
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
      { title: "Door Scene", tool: "Unreal Engine", src: door.url },
      { title: "Sea Scene", tool: "Blender", src: sea.url },
      { title: "Jungle", tool: "Unreal Engine", src: jungle.url },
    ],
  },
  games: {
    title: "Game Development",
    body: "Developing game concepts with a focus on mechanics, functionality and system design — prototyping ideas and implementing core gameplay to test approaches.",
    renders: [
      { title: "House of Hell — Exterior", tool: "Unreal Engine", src: house.url },
      { title: "House of Hell — Interior", tool: "Unreal Engine", src: indoor.url },
      { title: "House of Hell — Environment", tool: "Unreal Engine", src: outside.url },
    ],
  },
};
