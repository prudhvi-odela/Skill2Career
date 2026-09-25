import React, { useState } from 'react';
import {
  FileText, Sparkles, CheckCircle2, AlertTriangle, ArrowRight,
  TrendingUp, RefreshCw, Briefcase, Zap, Compass, Check, Filter, Building2, MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface JobDescriptionMatcherProps {
  userSkills?: Array<{ skill_name?: string; name?: string; level?: number }>;
  onApplyLearningPlan?: (planTitle: string, missingSkills: string[]) => void;
}

export interface PresetJD {
  id: string;
  company: string;
  role: string;
  branchCategory: string;
  branchCode: string;
  branchEmoji: string;
  location: string;
  salary: string;
  text: string;
  coreRequirements: { name: string; requiredLevel: number; category: string; critical: boolean }[];
}

export const PRESET_JDS: PresetJD[] = [
  // 💻 COMPUTER & IT
  {
    id: 'google-fs',
    company: 'Google',
    role: 'Senior Full Stack Software Engineer',
    branchCategory: 'Computer & IT',
    branchCode: 'CSE',
    branchEmoji: '💻',
    location: 'Mountain View, CA / Remote',
    salary: '$165,000 - $210,000',
    text: `As a Full Stack Engineer at Google, you will architect resilient, high-throughput web applications. 
Requirements:
- 3+ years experience with TypeScript, React, and modern state architecture
- Strong backend engineering with Node.js, Go, or Python
- Deep familiarity with Distributed Systems, REST & gRPC API design
- Experience with Cloud Platforms (GCP/AWS), Docker, and CI/CD pipelines
- Proficiency in Relational & NoSQL database performance tuning (PostgreSQL, Spanner)
- Automated testing (Jest, Playwright) and production observability`,
    coreRequirements: [
      { name: 'TypeScript', requiredLevel: 4, category: 'Core Languages', critical: true },
      { name: 'React', requiredLevel: 4, category: 'Frontend Architecture', critical: true },
      { name: 'Node.js', requiredLevel: 4, category: 'Backend Systems', critical: true },
      { name: 'Distributed Systems', requiredLevel: 3, category: 'Architecture', critical: true },
      { name: 'Cloud Infrastructure', requiredLevel: 3, category: 'DevOps', critical: false },
      { name: 'PostgreSQL', requiredLevel: 3, category: 'Databases', critical: false },
      { name: 'Docker', requiredLevel: 3, category: 'DevOps', critical: false },
      { name: 'Automated Testing', requiredLevel: 3, category: 'Quality Engineering', critical: false },
    ],
  },
  {
    id: 'openai-ml',
    company: 'OpenAI',
    role: 'AI / ML Platform Infrastructure Engineer',
    branchCategory: 'Computer & IT',
    branchCode: 'CSE',
    branchEmoji: '💻',
    location: 'San Francisco, CA',
    salary: '$190,000 - $260,000',
    text: `Build and scale the high-performance computing infrastructure powering next-generation frontier intelligence models.
Requirements:
- Strong foundations in Python, PyTorch, and deep neural network serving
- Distributed model training pipelines and CUDA GPU acceleration
- Experience with Kubernetes orchestration, high-concurrency message queues (Kafka)
- Vector databases (Pinecone, Milvus, Qdrant) and Retrieval-Augmented Generation (RAG)
- Production MLOps monitoring and latency optimization`,
    coreRequirements: [
      { name: 'Python', requiredLevel: 5, category: 'Core Languages', critical: true },
      { name: 'PyTorch', requiredLevel: 4, category: 'Machine Learning', critical: true },
      { name: 'Distributed Systems', requiredLevel: 4, category: 'Architecture', critical: true },
      { name: 'Kubernetes', requiredLevel: 3, category: 'DevOps', critical: true },
      { name: 'Vector Databases', requiredLevel: 3, category: 'AI Architecture', critical: false },
      { name: 'MLOps & CI/CD', requiredLevel: 3, category: 'DevOps', critical: false },
      { name: 'Docker', requiredLevel: 4, category: 'DevOps', critical: false },
    ],
  },
  {
    id: 'stripe-backend',
    company: 'Stripe',
    role: 'Backend Reliability & Payments Engineer',
    branchCategory: 'Computer & IT',
    branchCode: 'CSE',
    branchEmoji: '💻',
    location: 'Seattle, WA / Remote',
    salary: '$155,000 - $195,000',
    text: `Join the Stripe Core Payments infrastructure team. You will write robust, mission-critical code processing billions in transactions daily.
Requirements:
- Mastery of Java, Go, or Python for high-availability distributed microservices
- Uncompromising understanding of database transactions, ACID guarantees, and idempotency
- In-depth SQL database profiling (PostgreSQL/MySQL) and Redis caching layers
- Production reliability engineering, telemetry, rate limiting, and zero-downtime migrations`,
    coreRequirements: [
      { name: 'Go / Java', requiredLevel: 4, category: 'Core Languages', critical: true },
      { name: 'PostgreSQL', requiredLevel: 4, category: 'Databases', critical: true },
      { name: 'Distributed Systems', requiredLevel: 4, category: 'Architecture', critical: true },
      { name: 'API Design', requiredLevel: 4, category: 'Backend Systems', critical: true },
      { name: 'System Reliability', requiredLevel: 3, category: 'Production Ops', critical: false },
      { name: 'Redis', requiredLevel: 3, category: 'Databases', critical: false },
      { name: 'Docker', requiredLevel: 3, category: 'DevOps', critical: false },
    ],
  },

  // ⚡ ELECTRONICS & COMMUNICATION (ECE)
  {
    id: 'qualcomm-vlsi',
    company: 'Qualcomm',
    role: 'Senior VLSI & ASIC Design Engineer',
    branchCategory: 'Electronics & Comm',
    branchCode: 'ECE',
    branchEmoji: '⚡',
    location: 'San Diego, CA / Bengaluru',
    salary: '$145,000 - $190,000',
    text: `Architect next-generation Snapdragon mobile SoCs, modem microarchitectures, and high-frequency digital signal processors.
Requirements:
- RTL synthesis and digital logic design using SystemVerilog and Verilog
- Static Timing Analysis (STA), clock tree synthesis, and timing closure
- Cadence Innovus / Synopsys Design Compiler toolchain mastery
- FPGA prototyping (Xilinx Vivado) and silicon bring-up verification
- Low power design techniques (UPF, clock gating, voltage islands)`,
    coreRequirements: [
      { name: 'SystemVerilog / Verilog', requiredLevel: 5, category: 'Hardware Description', critical: true },
      { name: 'Static Timing Analysis (STA)', requiredLevel: 4, category: 'VLSI Closure', critical: true },
      { name: 'Cadence / Synopsys EDA Tools', requiredLevel: 4, category: 'EDA Toolchain', critical: true },
      { name: 'Digital Logic & Computer Architecture', requiredLevel: 4, category: 'Foundations', critical: true },
      { name: 'FPGA Emulation (Xilinx)', requiredLevel: 3, category: 'Verification', critical: false },
      { name: 'Low Power CMOS Design', requiredLevel: 3, category: 'Physical Design', critical: false },
    ],
  },
  {
    id: 'ti-embedded',
    company: 'Texas Instruments',
    role: 'Embedded Systems & Firmware Engineer',
    branchCategory: 'Electronics & Comm',
    branchCode: 'ECE',
    branchEmoji: '⚡',
    location: 'Dallas, TX / Munich',
    salary: '$130,000 - $170,000',
    text: `Develop bare-metal and real-time operating system (RTOS) firmware for industrial sensors, automotive controllers, and wireless connectivity MCUs.
Requirements:
- Embedded C and modern C++ for ARM Cortex-M microcontrollers
- Real-Time Operating Systems (FreeRTOS, Zephyr) task scheduling and mutexes
- Hardware communication protocols: I2C, SPI, UART, CAN bus, and USB
- Oscilloscope, logic analyzer, and JTAG hardware debugging
- Device driver development, DMA controllers, and interrupt service routines`,
    coreRequirements: [
      { name: 'Embedded C / C++', requiredLevel: 5, category: 'Core Languages', critical: true },
      { name: 'ARM Cortex Architecture', requiredLevel: 4, category: 'Microcontrollers', critical: true },
      { name: 'RTOS (FreeRTOS / Zephyr)', requiredLevel: 4, category: 'Operating Systems', critical: true },
      { name: 'Hardware Protocols (CAN/SPI/I2C)', requiredLevel: 4, category: 'Interfacing', critical: true },
      { name: 'Oscilloscope & JTAG Debugging', requiredLevel: 3, category: 'Lab & Diagnostics', critical: false },
      { name: 'PCB Schematic & Layout Awareness', requiredLevel: 3, category: 'Hardware Design', critical: false },
    ],
  },

  // ⚙️ MECHANICAL ENGINEERING (MECH)
  {
    id: 'tesla-mechanical',
    company: 'Tesla',
    role: 'CAD/CAE Mechanical Vehicle Design Engineer',
    branchCategory: 'Mechanical',
    branchCode: 'MECH',
    branchEmoji: '⚙️',
    location: 'Fremont, CA / Austin, TX',
    salary: '$140,000 - $185,000',
    text: `Design structural cast components, closures, and battery enclosure packs for next-generation electric vehicle platforms.
Requirements:
- 3D parametric solid modeling in SolidWorks, CATIA V5/3DX, or Siemens NX
- Geometric Dimensioning and Tolerancing (GD&T per ASME Y14.5)
- Structural Finite Element Analysis (FEA) for stress, deformation, and fatigue
- Design for Manufacturing (DFM) and Assembly (DFA) in high-pressure die casting and sheet metal
- Materials selection: high-strength aluminum alloys, carbon composites, and ultra-high-strength steel`,
    coreRequirements: [
      { name: 'SolidWorks / CATIA NX', requiredLevel: 5, category: 'CAD Modeling', critical: true },
      { name: 'GD&T (ASME Y14.5)', requiredLevel: 4, category: 'Mechanical Standards', critical: true },
      { name: 'FEA Stress Analysis (ANSYS)', requiredLevel: 4, category: 'Simulation', critical: true },
      { name: 'Mechanics of Materials', requiredLevel: 4, category: 'Engineering Mechanics', critical: true },
      { name: 'DFM & Sheet Metal / Die Casting', requiredLevel: 3, category: 'Manufacturing', critical: false },
      { name: 'Kinematics & Linkage Synthesis', requiredLevel: 3, category: 'Mechanisms', critical: false },
    ],
  },
  {
    id: 'boeing-thermal',
    company: 'Boeing',
    role: 'Thermal Systems & Aerodynamics CFD Engineer',
    branchCategory: 'Mechanical',
    branchCode: 'MECH',
    branchEmoji: '⚙️',
    location: 'Seattle, WA / Chicago, IL',
    salary: '$135,000 - $175,000',
    text: `Analyze aerodynamic heating, internal cooling passages, and propulsion integration for commercial and defense aircraft.
Requirements:
- Computational Fluid Dynamics (CFD) using ANSYS Fluent, Star-CCM+, or OpenFOAM
- Compressible and incompressible boundary layer fluid dynamics
- Conjugate heat transfer, radiative cooling, and thermodynamic cycle analysis
- Mesh generation: structured boundary layer prisms and polyhedral meshing
- Wind tunnel test correlation and flight validation`,
    coreRequirements: [
      { name: 'CFD (ANSYS Fluent / Star-CCM+)', requiredLevel: 5, category: 'Simulation', critical: true },
      { name: 'Thermodynamics & Heat Transfer', requiredLevel: 5, category: 'Thermal Science', critical: true },
      { name: 'Fluid Mechanics & Navier-Stokes', requiredLevel: 4, category: 'Fluid Dynamics', critical: true },
      { name: 'Turbulence Modeling (k-epsilon, SST)', requiredLevel: 3, category: 'Aerodynamics', critical: false },
      { name: 'MATLAB / Python Data Post-Processing', requiredLevel: 3, category: 'Scientific Tools', critical: false },
    ],
  },

  // 🏗️ CIVIL & INFRASTRUCTURE (CIVIL)
  {
    id: 'lt-structural',
    company: 'Larsen & Toubro (L&T)',
    role: 'Senior Structural Design & Seismic Analysis Engineer',
    branchCategory: 'Civil',
    branchCode: 'CIVIL',
    branchEmoji: '🏗️',
    location: 'Mumbai / Dubai / Chennai',
    salary: '$110,000 - $155,000',
    text: `Lead structural analysis, seismic resistance engineering, and high-rise RCC/composite framework design for landmark infrastructure projects.
Requirements:
- Finite element structural modeling with ETABS, STAAD.Pro, and SAFE
- Concrete Design (IS 456, ACI 318, Eurocode 2) and Structural Steel (IS 800, AISC 360)
- Seismic analysis: response spectrum, pushover analysis (IS 1893, ASCE 7)
- Deep foundation engineering (piles, raft foundations, soil-structure interaction)
- Preparation of structural design calculation reports and bar bending schedules (BBS)`,
    coreRequirements: [
      { name: 'ETABS / STAAD.Pro', requiredLevel: 5, category: 'Structural Software', critical: true },
      { name: 'RCC & Structural Steel Design', requiredLevel: 5, category: 'Core Civil', critical: true },
      { name: 'Seismic & Wind Load Analysis', requiredLevel: 4, category: 'Structural Dynamics', critical: true },
      { name: 'Foundation Engineering & Soil Mechanics', requiredLevel: 4, category: 'Geotechnical', critical: true },
      { name: 'AutoCAD / Revit Structures', requiredLevel: 3, category: 'Drafting & BIM', critical: false },
      { name: 'Building Codes (IS/ACI/Eurocode)', requiredLevel: 3, category: 'Standards', critical: false },
    ],
  },
  {
    id: 'aecom-bim',
    company: 'AECOM',
    role: 'BIM & Virtual Construction Infrastructure Specialist',
    branchCategory: 'Civil',
    branchCode: 'CIVIL',
    branchEmoji: '🏗️',
    location: 'New York, NY / London',
    salary: '$120,000 - $160,000',
    text: `Deliver 3D/4D/5D Building Information Modeling (BIM) for mega infrastructure projects including highways, metros, and airports.
Requirements:
- Autodesk Revit, Civil 3D, and Navisworks Manage clash detection
- Coordination across MEP, structural, and architectural federated models
- 4D construction schedule sequencing (Synchro / Navisworks)
- Digital terrain modeling, cut-and-fill volumetrics, and GIS integration
- Adherence to ISO 19650 BIM international execution protocols`,
    coreRequirements: [
      { name: 'Autodesk Revit & Civil 3D', requiredLevel: 5, category: 'BIM Software', critical: true },
      { name: 'Navisworks Clash Detection', requiredLevel: 4, category: 'Coordination', critical: true },
      { name: 'ISO 19650 BIM Standards', requiredLevel: 4, category: 'Industry Protocol', critical: true },
      { name: 'Transportation & Highway Alignment', requiredLevel: 3, category: 'Infrastructure', critical: false },
      { name: '4D Construction Scheduling', requiredLevel: 3, category: 'Project Controls', critical: false },
    ],
  },

  // 🔌 ELECTRICAL & ELECTRONICS (EE)
  {
    id: 'siemens-grid',
    company: 'Siemens Energy',
    role: 'Power Systems & Smart Grid Architect',
    branchCategory: 'Electrical',
    branchCode: 'EE',
    branchEmoji: '🔌',
    location: 'Erlangen, Germany / Orlando, FL',
    salary: '$135,000 - $175,000',
    text: `Engineer high-voltage transmission networks, automated substations, and smart grid control architectures for decarbonized power grids.
Requirements:
- Power system simulations: load flow, short circuit, transient stability using ETAP or PSS/E
- Substation automation protocols: IEC 61850, DNP3, Modbus, and SCADA architectures
- Protective relay setting calculations (differential, distance, overcurrent protection)
- Renewable grid integration (IEEE 1547, FERC grid interconnection standards)
- High Voltage Direct Current (HVDC) and FACTS devices`,
    coreRequirements: [
      { name: 'Power System Analysis (ETAP / PSS/E)', requiredLevel: 5, category: 'Simulation', critical: true },
      { name: 'Protection Relaying & Coordination', requiredLevel: 4, category: 'Power Engineering', critical: true },
      { name: 'IEC 61850 & SCADA Protocols', requiredLevel: 4, category: 'Automation', critical: true },
      { name: 'High Voltage Engineering', requiredLevel: 3, category: 'Power Systems', critical: false },
      { name: 'Renewable Grid Interconnection', requiredLevel: 3, category: 'Green Energy', critical: false },
    ],
  },
  {
    id: 'schneider-drives',
    company: 'Schneider Electric',
    role: 'Power Electronics & Motor Drives Engineer',
    branchCategory: 'Electrical',
    branchCode: 'EE',
    branchEmoji: '🔌',
    location: 'Boston, MA / Grenoble, France',
    salary: '$130,000 - $170,000',
    text: `Design state-of-the-art variable frequency drives (VFD), high-efficiency inverters, and DC-DC power conversion modules.
Requirements:
- Power converter topologies: Buck, Boost, LLC Resonant, and 3-Phase Inverters
- Wide-bandgap semiconductor switches: Silicon Carbide (SiC) and Gallium Nitride (GaN)
- Control algorithms: Field-Oriented Control (FOC) and Space Vector PWM in MATLAB/Simulink
- Thermal management and magnetics design (inductors, high-frequency transformers)
- EMI/EMC compliance and regulatory safety certifications`,
    coreRequirements: [
      { name: 'MATLAB / Simulink / PLECS', requiredLevel: 5, category: 'Control Simulation', critical: true },
      { name: 'Power Converter Topologies', requiredLevel: 5, category: 'Power Electronics', critical: true },
      { name: 'Motor Control (FOC / SVPWM)', requiredLevel: 4, category: 'Drives', critical: true },
      { name: 'SiC & GaN Gate Drive Design', requiredLevel: 4, category: 'Hardware', critical: false },
      { name: 'Magnetics & Thermal Management', requiredLevel: 3, category: 'Design', critical: false },
    ],
  },

  // ⚗️ CHEMICAL ENGINEERING (CHEM)
  {
    id: 'exxon-process',
    company: 'ExxonMobil',
    role: 'Chemical Process & Reaction Kinetics Engineer',
    branchCategory: 'Chemical',
    branchCode: 'CHEM',
    branchEmoji: '⚗️',
    location: 'Houston, TX / Singapore',
    salary: '$140,000 - $180,000',
    text: `Optimize continuous catalytic reactors, crude distillation units, and olefin synthesis loops with rigorous thermodynamic process simulation.
Requirements:
- Rigorous steady-state and dynamic process simulation in Aspen Plus / Aspen HYSYS
- Chemical reaction kinetics: CSTR, PFR, and fluidized bed reactor sizing
- Vapor-Liquid Equilibrium (VLE), multicomponent distillation, and packed column hydraulics
- Piping and Instrumentation Diagram (P&ID) design and HAZOP safety compliance
- Heat exchanger network synthesis and Pinch Technology optimization`,
    coreRequirements: [
      { name: 'Aspen Plus / Aspen HYSYS', requiredLevel: 5, category: 'Process Modeling', critical: true },
      { name: 'Chemical Reaction Engineering', requiredLevel: 5, category: 'Kinetics', critical: true },
      { name: 'Mass Transfer & Distillation', requiredLevel: 4, category: 'Unit Operations', critical: true },
      { name: 'Heat Exchanger Sizing & Pinch Analysis', requiredLevel: 4, category: 'Thermal Systems', critical: false },
      { name: 'P&ID & HAZOP Process Safety', requiredLevel: 4, category: 'Plant Safety', critical: false },
    ],
  },

  // 🧬 BIOTECHNOLOGY & BIOMEDICAL (BIOTECH)
  {
    id: 'illumina-bioinfo',
    company: 'Illumina',
    role: 'Bioinformatics & Computational Genomics Engineer',
    branchCategory: 'Biotechnology',
    branchCode: 'BIOTECH',
    branchEmoji: '🧬',
    location: 'San Diego, CA / Cambridge, UK',
    salary: '$145,000 - $190,000',
    text: `Build ultra-fast genomic pipelines for variant calling, high-throughput sequencing data analysis, and clinical diagnostic interpretation.
Requirements:
- NGS pipeline orchestration: Nextflow, Snakemake, and GATK best practices
- Computational biology scripting: Python (Biopython), R (Bioconductor), and Bash
- Genome alignment algorithms: Burrows-Wheeler Transform (BWA), Bowtie, BLAST
- Statistical genetics, GWAS, and population genomic variant annotation
- Containerized bioinformatics deployment on AWS / Google Cloud Life Sciences`,
    coreRequirements: [
      { name: 'Python (Biopython) & R', requiredLevel: 5, category: 'Genomic Programming', critical: true },
      { name: 'NGS Analysis & GATK Pipeline', requiredLevel: 5, category: 'Genomics', critical: true },
      { name: 'Nextflow / Snakemake', requiredLevel: 4, category: 'Pipeline Tools', critical: true },
      { name: 'Sequence Alignment Algorithms', requiredLevel: 4, category: 'Bioinformatics', critical: true },
      { name: 'Linux CLI & Cloud Computing', requiredLevel: 3, category: 'Infrastructure', critical: false },
    ],
  },
  {
    id: 'medtronic-biomed',
    company: 'Medtronic',
    role: 'Biomedical Device & Biosensors Architect',
    branchCategory: 'Biotechnology',
    branchCode: 'BIOTECH',
    branchEmoji: '🧬',
    location: 'Minneapolis, MN / Galway, Ireland',
    salary: '$135,000 - $175,000',
    text: `Innovate implantable cardiac pacemakers, continuous glucose monitors (CGM), and physiological biosensing telemetry platforms.
Requirements:
- Biosensor transduction mechanisms (electrochemical, optical, piezoelectric)
- Biomedical signal processing (ECG, EEG, PPG filtering and wavelet transforms in MATLAB)
- Biocompatibility standards (ISO 10993) and medical device design controls (ISO 13485 / FDA 510k)
- Microfluidics and sterile biomedical packaging
- Low-power analog front-end (AFE) for physiological electrode interfacing`,
    coreRequirements: [
      { name: 'Biosensor Physics & Transduction', requiredLevel: 5, category: 'Bioinstrumentation', critical: true },
      { name: 'Biomedical Signal Processing (MATLAB)', requiredLevel: 4, category: 'Signal Processing', critical: true },
      { name: 'ISO 13485 / FDA Quality Systems', requiredLevel: 4, category: 'Regulatory Standards', critical: true },
      { name: 'Biomaterials & Biocompatibility', requiredLevel: 3, category: 'Materials', critical: false },
      { name: 'Low Power Analog Front-End', requiredLevel: 3, category: 'Electronics', critical: false },
    ],
  },

  // 🚀 AEROSPACE ENGINEERING (AERO)
  {
    id: 'spacex-propulsion',
    company: 'SpaceX',
    role: 'Rocket Propulsion & Flight Dynamics Engineer',
    branchCategory: 'Aerospace',
    branchCode: 'AERO',
    branchEmoji: '🚀',
    location: 'Hawthorne, CA / Starbase, TX',
    salary: '$150,000 - $200,000',
    text: `Design liquid rocket combustion chambers, turbopump assemblies, and orbital trajectory guidance maneuvers for Starship and Falcon launch vehicles.
Requirements:
- Rocket propulsion thermodynamics: de Laval supersonic nozzles, specific impulse (Isp), and combustion kinetics
- Turbomachinery and cryogenic fluid dynamics (Liquid Methane / LOX)
- Orbital mechanics: Keplerian orbits, Hohmann transfers, and delta-v mission budgets
- Flight dynamics: 6-DOF trajectory simulation and guidance algorithms (GNC)
- High-temperature superalloys and additive manufacturing (Inconel, Niobium)`,
    coreRequirements: [
      { name: 'Rocket Propulsion & Thermodynamics', requiredLevel: 5, category: 'Propulsion', critical: true },
      { name: 'Orbital Mechanics & Delta-V Planning', requiredLevel: 5, category: 'Astrodynamics', critical: true },
      { name: 'Flight Dynamics & 6-DOF Simulation', requiredLevel: 4, category: 'Guidance & Control', critical: true },
      { name: 'Cryogenic Fluid Dynamics & CFD', requiredLevel: 4, category: 'Fluids', critical: false },
      { name: 'High-Temperature Aerospace Materials', requiredLevel: 3, category: 'Materials', critical: false },
    ],
  },

  // 🤖 ROBOTICS & AUTOMATION (ROBOTICS)
  {
    id: 'boston-robotics',
    company: 'Boston Dynamics',
    role: 'Autonomous Mobile Robotics (AMR) & ROS2 Engineer',
    branchCategory: 'Robotics',
    branchCode: 'ROBOTICS',
    branchEmoji: '🤖',
    location: 'Waltham, MA / Remote',
    salary: '$160,000 - $210,000',
    text: `Program quadrupedal and bipedal mobile robots to navigate unstructured real-world environments with centimeter-accurate autonomy.
Requirements:
- Robotics Middleware: ROS2 (Robot Operating System), DDS middleware, C++17/20, and Python
- 2D/3D SLAM (Cartographer, LIO-SAM) and LiDAR point cloud processing (PCL)
- Path planning algorithms: A*, RRT*, Hybrid A*, and Nav2 motion controllers
- Forward & Inverse Kinematics, Denavit-Hartenberg (DH) parameters, and dynamics
- Sensor fusion: Extended Kalman Filters (EKF) combining IMU, wheel odometry, and GPS`,
    coreRequirements: [
      { name: 'ROS2 & C++ Robotics Programming', requiredLevel: 5, category: 'Robotics Software', critical: true },
      { name: 'SLAM & 3D LiDAR Perception', requiredLevel: 5, category: 'Perception', critical: true },
      { name: 'Kinematics & Dynamics (DH Method)', requiredLevel: 4, category: 'Robotic Mechanics', critical: true },
      { name: 'Autonomous Navigation (Nav2 / A*)', requiredLevel: 4, category: 'Planning', critical: true },
      { name: 'Sensor Fusion (Kalman Filtering)', requiredLevel: 3, category: 'State Estimation', critical: false },
    ],
  },

  // 📊 DATA SCIENCE & AI (DS)
  {
    id: 'meta-datascience',
    company: 'Meta',
    role: 'Principal Data Scientist & Generative AI Architect',
    branchCategory: 'Data Science & AI',
    branchCode: 'DS',
    branchEmoji: '📊',
    location: 'Menlo Park, CA / Remote',
    salary: '$180,000 - $240,000',
    text: `Lead generative AI fine-tuning, large-scale recommendation systems, and causal inference experiments powering billions of user sessions.
Requirements:
- Advanced statistical inference, A/B testing methodology, and causal modeling
- Deep learning architectures: Transformers, attention mechanisms, LoRA / QLoRA fine-tuning
- Big Data processing: PySpark, SQL window functions, and distributed feature stores
- Machine learning pipelines with PyTorch, Scikit-Learn, and MLflow
- MLOps model serving on Kubernetes with latency and drift telemetry`,
    coreRequirements: [
      { name: 'Python & PyTorch', requiredLevel: 5, category: 'Machine Learning', critical: true },
      { name: 'Transformer & LLM Architectures', requiredLevel: 4, category: 'Deep Learning', critical: true },
      { name: 'Advanced SQL & Data Wrangling', requiredLevel: 4, category: 'Data Analysis', critical: true },
      { name: 'A/B Testing & Causal Inference', requiredLevel: 4, category: 'Statistics', critical: true },
      { name: 'Distributed Spark Pipelines', requiredLevel: 3, category: 'Big Data', critical: false },
      { name: 'MLOps & Kubernetes Deployment', requiredLevel: 3, category: 'Production Systems', critical: false },
    ],
  },
];

const BRANCH_CATEGORIES = [
  'All Disciplines',
  'Computer & IT',
  'Electronics & Comm',
  'Mechanical',
  'Civil',
  'Electrical',
  'Chemical',
  'Biotechnology',
  'Aerospace',
  'Robotics',
  'Data Science & AI',
];

// Helper to extract skills dynamically from pasted custom text across all engineering branches
function extractSkillsFromCustomText(text: string): { name: string; requiredLevel: number; category: string; critical: boolean }[] {
  const lower = text.toLowerCase();
  const extracted: { name: string; requiredLevel: number; category: string; critical: boolean }[] = [];

  const skillDictionary: Array<{ keyword: string; name: string; category: string; critical: boolean; level: number }> = [
    // Software & CS
    { keyword: 'python', name: 'Python', category: 'Core Languages', critical: true, level: 4 },
    { keyword: 'react', name: 'React', category: 'Frontend', critical: true, level: 4 },
    { keyword: 'typescript', name: 'TypeScript', category: 'Languages', critical: true, level: 4 },
    { keyword: 'node', name: 'Node.js', category: 'Backend', critical: false, level: 3 },
    { keyword: 'docker', name: 'Docker', category: 'DevOps', critical: false, level: 3 },
    { keyword: 'kubernetes', name: 'Kubernetes', category: 'DevOps', critical: false, level: 3 },
    { keyword: 'sql', name: 'SQL Databases', category: 'Databases', critical: true, level: 4 },
    { keyword: 'pytorch', name: 'PyTorch / Deep Learning', category: 'Machine Learning', critical: true, level: 4 },
    // Electronics
    { keyword: 'verilog', name: 'Verilog / SystemVerilog', category: 'VLSI Design', critical: true, level: 5 },
    { keyword: 'embedded c', name: 'Embedded C / C++', category: 'Firmware', critical: true, level: 4 },
    { keyword: 'rtos', name: 'RTOS (FreeRTOS)', category: 'Embedded Systems', critical: true, level: 4 },
    { keyword: 'cadence', name: 'Cadence EDA Tools', category: 'VLSI Design', critical: false, level: 4 },
    { keyword: 'pcb', name: 'PCB Schematic & Layout', category: 'Hardware', critical: false, level: 3 },
    // Mechanical
    { keyword: 'solidworks', name: 'SolidWorks 3D CAD', category: 'CAD Modeling', critical: true, level: 4 },
    { keyword: 'catia', name: 'CATIA Modeling', category: 'CAD Modeling', critical: true, level: 4 },
    { keyword: 'fea', name: 'FEA Stress Analysis (ANSYS)', category: 'Mechanical Simulation', critical: true, level: 4 },
    { keyword: 'ansys', name: 'ANSYS Simulation', category: 'Simulation', critical: true, level: 4 },
    { keyword: 'cfd', name: 'CFD Fluid Simulation', category: 'Fluids & Thermal', critical: true, level: 4 },
    { keyword: 'gd&t', name: 'GD&T (ASME Y14.5)', category: 'Engineering Standards', critical: false, level: 3 },
    // Civil
    { keyword: 'etabs', name: 'ETABS Structural Analysis', category: 'Structural Engineering', critical: true, level: 5 },
    { keyword: 'staad', name: 'STAAD.Pro', category: 'Structural Engineering', critical: true, level: 4 },
    { keyword: 'revit', name: 'Autodesk Revit BIM', category: 'BIM Software', critical: true, level: 4 },
    { keyword: 'concrete', name: 'Reinforced Concrete Design', category: 'Civil Materials', critical: true, level: 4 },
    { keyword: 'geotechnical', name: 'Soil Mechanics & Geotech', category: 'Geotechnical', critical: false, level: 3 },
    // Electrical
    { keyword: 'etap', name: 'ETAP Power System Analysis', category: 'Power Systems', critical: true, level: 4 },
    { keyword: 'matlab', name: 'MATLAB & Simulink', category: 'Control Systems', critical: true, level: 4 },
    { keyword: 'scada', name: 'SCADA & Substation Protocols', category: 'Automation', critical: false, level: 3 },
    { keyword: 'inverter', name: 'Power Converter Topologies', category: 'Power Electronics', critical: true, level: 4 },
    // Chemical
    { keyword: 'aspen', name: 'Aspen Plus / HYSYS Simulation', category: 'Process Modeling', critical: true, level: 5 },
    { keyword: 'kinetics', name: 'Chemical Reaction Engineering', category: 'Reaction Kinetics', critical: true, level: 4 },
    { keyword: 'distillation', name: 'Mass Transfer & Distillation', category: 'Unit Operations', critical: false, level: 3 },
    // Biotech
    { keyword: 'bioinformatics', name: 'Bioinformatics & Computational Biology', category: 'Genomics', critical: true, level: 4 },
    { keyword: 'ngs', name: 'Next-Gen Sequencing (NGS)', category: 'Genomics', critical: true, level: 4 },
    { keyword: 'bioreactor', name: 'Bioprocess & Fermentation', category: 'Bioprocess', critical: false, level: 3 },
    // Aerospace & Robotics
    { keyword: 'ros', name: 'ROS / ROS2 Middleware', category: 'Robotics Software', critical: true, level: 5 },
    { keyword: 'slam', name: 'SLAM & LiDAR Navigation', category: 'Perception', critical: true, level: 4 },
    { keyword: 'propulsion', name: 'Rocket Propulsion & Aerodynamics', category: 'Aerospace Systems', critical: true, level: 4 },
  ];

  skillDictionary.forEach((item) => {
    if (lower.includes(item.keyword)) {
      extracted.push({
        name: item.name,
        requiredLevel: item.level,
        category: item.category,
        critical: item.critical,
      });
    }
  });

  // Default fallback if no known keywords detected in custom text
  if (extracted.length === 0) {
    extracted.push(
      { name: 'Core Branch Technical Foundations', requiredLevel: 4, category: 'Domain Theory', critical: true },
      { name: 'Engineering Problem Solving', requiredLevel: 4, category: 'Applied Engineering', critical: true },
      { name: 'Industry CAD / Analysis Tooling', requiredLevel: 3, category: 'Software & Tools', critical: false },
      { name: 'Quality Verification & Standards', requiredLevel: 3, category: 'Industry Protocols', critical: false }
    );
  }

  return extracted;
}

export const JobDescriptionMatcher: React.FC<JobDescriptionMatcherProps> = ({
  userSkills = [],
  onApplyLearningPlan,
}) => {
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('All Disciplines');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('google-fs');
  const [customText, setCustomText] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [bridgedSuccessfully, setBridgedSuccessfully] = useState<boolean>(false);

  // Filter preset JDs by selected branch category
  const filteredPresets = React.useMemo(() => {
    if (selectedBranchFilter === 'All Disciplines') return PRESET_JDS;
    return PRESET_JDS.filter((p) => p.branchCategory.toLowerCase() === selectedBranchFilter.toLowerCase());
  }, [selectedBranchFilter]);

  const activePreset = PRESET_JDS.find((p) => p.id === selectedPresetId) || filteredPresets[0] || PRESET_JDS[0];

  // Map user skill lookup dictionary
  const userSkillMap = React.useMemo(() => {
    const map = new Map<string, number>();
    userSkills.forEach((s) => {
      const name = (s.skill_name || s.name || '').toLowerCase();
      map.set(name, s.level || 2);
    });
    // Add default fallbacks for demo
    if (map.size === 0) {
      map.set('python', 3);
      map.set('javascript', 4);
      map.set('react', 3);
      map.set('sql', 3);
      map.set('git', 4);
      map.set('docker', 2);
      map.set('matlab', 3);
      map.set('solidworks', 3);
      map.set('verilog', 2);
      map.set('etabs', 2);
    }
    return map;
  }, [userSkills]);

  // Skill comparison computation (preset or custom text)
  const analysis = React.useMemo(() => {
    const reqs = isCustomMode && customText.trim().length > 10
      ? extractSkillsFromCustomText(customText)
      : activePreset.coreRequirements;

    let totalScoreWeight = 0;
    let achievedScoreWeight = 0;

    const matchedList: { name: string; userLevel: number; requiredLevel: number; category: string }[] = [];
    const missingList: { name: string; userLevel: number; requiredLevel: number; category: string; critical: boolean; gap: number }[] = [];

    reqs.forEach((r) => {
      const targetLower = r.name.toLowerCase();
      let userLevel = userSkillMap.get(targetLower);

      if (userLevel === undefined) {
        // Partial matching
        for (const [k, v] of userSkillMap.entries()) {
          if (targetLower.includes(k) || k.includes(targetLower)) {
            userLevel = v;
            break;
          }
        }
      }

      const effectiveUserLevel = userLevel || 0;
      const weight = r.critical ? 1.5 : 1.0;
      totalScoreWeight += r.requiredLevel * weight;
      achievedScoreWeight += Math.min(effectiveUserLevel, r.requiredLevel) * weight;

      if (effectiveUserLevel >= r.requiredLevel) {
        matchedList.push({
          name: r.name,
          userLevel: effectiveUserLevel,
          requiredLevel: r.requiredLevel,
          category: r.category,
        });
      } else {
        missingList.push({
          name: r.name,
          userLevel: effectiveUserLevel,
          requiredLevel: r.requiredLevel,
          category: r.category,
          critical: r.critical,
          gap: r.requiredLevel - effectiveUserLevel,
        });
      }
    });

    const matchPercentage = Math.round((achievedScoreWeight / Math.max(1, totalScoreWeight)) * 100);

    return {
      matchPercentage,
      matchedList,
      missingList,
      criticalGaps: missingList.filter((m) => m.critical),
      moderateGaps: missingList.filter((m) => !m.critical),
      totalRequirementsCount: reqs.length,
    };
  }, [activePreset, userSkillMap, isCustomMode, customText]);

  const handleSimulateAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
      });
    }, 450);
  };

  const handleBridgeAction = () => {
    setBridgedSuccessfully(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    if (onApplyLearningPlan) {
      const planName = isCustomMode
        ? 'Custom Job Description Accelerated Learning Path'
        : `${activePreset.company} ${activePreset.role} Accelerated Path`;
      onApplyLearningPlan(
        planName,
        analysis.missingList.map((m) => m.name)
      );
    }
  };

  return (
    <div className="skillbridge-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              SkillBridge Multi-Discipline Matcher
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Cross-Branch Real Job Description Analyzer</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Compare Competencies Against Real Job Descriptions Across All Branches
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px', marginBottom: 0 }}>
            Explore verified job postings for <strong>CSE, ECE, Mechanical, Civil, Electrical, Chemical, Biotech, Aerospace, Robotics, and Data Science</strong>. Discover matched skills, identify gaps, and generate tailored learning bridges.
          </p>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setIsCustomMode(false)}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: !isCustomMode ? '#ffffff' : 'transparent',
              color: !isCustomMode ? '#0f172a' : '#64748b',
              boxShadow: !isCustomMode ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Curated Industry JDs ({PRESET_JDS.length})
          </button>
          <button
            onClick={() => setIsCustomMode(true)}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: isCustomMode ? '#ffffff' : 'transparent',
              color: isCustomMode ? '#0f172a' : '#64748b',
              boxShadow: isCustomMode ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Custom Job Description
          </button>
        </div>
      </div>

      {/* Preset Selector with Discipline Filter */}
      {!isCustomMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Engineering Discipline Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={13} /> Discipline:
            </span>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', flexWrap: 'wrap' }}>
              {BRANCH_CATEGORIES.map((cat) => {
                const isSelected = selectedBranchFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedBranchFilter(cat);
                      // Auto select first preset of that discipline if available
                      const matching = PRESET_JDS.find((p) => cat === 'All Disciplines' || p.branchCategory.toLowerCase() === cat.toLowerCase());
                      if (matching) setSelectedPresetId(matching.id);
                    }}
                    style={{
                      padding: '5px 11px',
                      borderRadius: '16px',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 700 : 500,
                      border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      background: isSelected ? '#2563eb' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preset Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
            {filteredPresets.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPresetId(preset.id);
                    handleSimulateAnalysis();
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(37,99,235,0.12)' : 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.9rem' }}>{preset.branchEmoji}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                        {preset.company}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>{preset.salary}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px', lineHeight: 1.3 }}>
                    {preset.role}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={11} /> {preset.location.split('/')[0]}
                    </span>
                    <span style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {preset.branchCode}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
            Paste Any Engineering Job Description (Software, Mechanical, Civil, Electrical, Chemical, Biotech, etc.):
          </label>
          <textarea
            rows={4}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Paste raw requirements text from LinkedIn, Indeed, or company careers page (e.g. 'Must have 2+ years of SolidWorks, FEA, GD&T, and thermodynamics experience...' or 'Looking for VLSI engineer with SystemVerilog, STA, and Cadence EDA skills...')"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              💡 Detects competencies across all disciplines including CAD, FEA, CFD, VLSI, Embedded C, ETABS, Aspen, MATLAB, ROS2, and Software!
            </span>
            <button onClick={handleSimulateAnalysis} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.825rem' }}>
              <Sparkles size={14} /> Analyze Text & Extract Gaps
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results View */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'center',
        }}
      >
        {/* Left: Animated Readiness Ring & Insights */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="3.6"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={analysis.matchPercentage >= 75 ? '#10b981' : analysis.matchPercentage >= 50 ? '#3b82f6' : '#f59e0b'}
                strokeWidth="3.6"
                strokeDasharray={`${analysis.matchPercentage}, 100`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.8s ease' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                {analysis.matchPercentage}%
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Match
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Target Readiness Insight
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {analysis.matchPercentage >= 80 ? 'Strong Candidate Fit' : analysis.matchPercentage >= 60 ? 'Competitive with Modest Gaps' : 'Core Deficit Bridging Required'}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#475569', margin: '4px 0 0 0' }}>
              You meet {analysis.matchedList.length} of {analysis.totalRequirementsCount} required competencies for {!isCustomMode ? activePreset.company : 'this target role'}. 
              Addressing {analysis.criticalGaps.length} critical deficits will raise your candidate index to 88%+.
            </p>
          </div>
        </div>

        {/* Right: Quick Stats & Bridge Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>MATCHED SKILLS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{analysis.matchedList.length}</div>
            </div>
            <div style={{ flex: 1, background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>CRITICAL DEFICITS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{analysis.criticalGaps.length}</div>
            </div>
            <div style={{ flex: 1, background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700 }}>MODERATE GAPS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{analysis.moderateGaps.length}</div>
            </div>
          </div>

          <button
            onClick={handleBridgeAction}
            className="btn-primary"
            style={{
              padding: '10px 18px',
              fontSize: '0.875rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: bridgedSuccessfully ? '#059669' : '#1e40af',
              borderColor: bridgedSuccessfully ? '#059669' : '#1e40af',
            }}
          >
            {bridgedSuccessfully ? (
              <>
                <Check size={16} /> Learning Path Generated & Added!
              </>
            ) : (
              <>
                <Zap size={16} /> Bridge These Skills & Generate Roadmap
              </>
            )}
          </button>
        </div>
      </div>

      {/* Matched vs Missing Skill Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Matched Skills */}
        <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircle2 size={18} color="#16a34a" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>
              Verified In Your Profile ({analysis.matchedList.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysis.matchedList.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>No matching skills verified yet.</div>
            ) : (
              analysis.matchedList.map((m) => (
                <div
                  key={m.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#f0fdf4',
                    border: '1px solid #dcfce7',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#14532d' }}>{m.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#15803d', marginLeft: '6px' }}>· {m.category}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
                    Level {m.userLevel} / {m.requiredLevel}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Missing / Gap Skills */}
        <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertTriangle size={18} color="#dc2626" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b' }}>
              Identified Skill Gaps to Bridge ({analysis.missingList.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysis.missingList.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: '#15803d', padding: '8px' }}>
                🎉 Outstanding! You have zero deficits for this target job description.
              </div>
            ) : (
              analysis.missingList.map((m) => (
                <div
                  key={m.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: m.critical ? '#fef2f2' : '#fffbeb',
                    border: m.critical ? '1px solid #fee2e2' : '1px solid #fef3c7',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: m.critical ? '#991b1b' : '#92400e' }}>
                      {m.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '6px' }}>· {m.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                      {m.userLevel > 0 ? `Lvl ${m.userLevel} → ${m.requiredLevel}` : `Need Lvl ${m.requiredLevel}`}
                    </span>
                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        color: m.critical ? '#b91c1c' : '#b45309',
                        background: m.critical ? '#fee2e2' : '#fef3c7',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {m.critical ? 'Critical' : 'Moderate'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionMatcher;
