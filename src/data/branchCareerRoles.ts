// Comprehensive Real-World Engineering Career Roles across ALL Disciplines

export interface BranchCareerRole {
  career_id: string;
  career_title: string;
  domain: string;
  category: string;
  branch_codes: string[]; // matching branch codes
  description: string;
  min_exp_years: number;
  avg_salary_usd: number;
  market_demand: 'Extremely High' | 'High' | 'Steady' | 'Explosive Growth';
  key_workflows: string[];
  required_skills: {
    skill_id: string;
    skill_name: string;
    required_level: number;
    importance: number;
    is_core: boolean;
  }[];
}

import { getAllCareerGoals } from './careerGoalsHierarchy';

export const BASE_CAREER_ROLES: BranchCareerRole[] = [
  // ==========================================
  // 💻 COMPUTER & IT (13 Branches)
  // ==========================================
  {
    career_id: 'CR_CSE_01',
    career_title: 'Full-Stack Software Architect',
    domain: 'Enterprise Software Systems',
    category: 'Computer & IT',
    branch_codes: ['CSE', 'IT', 'SE', 'CE', 'CSIT'],
    description: 'Designs, implements, and scales resilient distributed cloud applications, microservices, and reactive web architectures.',
    min_exp_years: 1,
    avg_salary_usd: 115000,
    market_demand: 'Extremely High',
    key_workflows: ['Distributed caching with Redis', 'Container orchestration with Kubernetes', 'REST & GraphQL API design'],
    required_skills: [
      { skill_id: 'SK_DSA', skill_name: 'Data Structures & Algorithms', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_SYS_DES', skill_name: 'System Design & Microservices', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_PYTHON', skill_name: 'Python / Go / Java', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_REACT', skill_name: 'Modern Web Frameworks (React/TypeScript)', required_level: 4, importance: 0.8, is_core: true },
      { skill_id: 'SK_DOCKER', skill_name: 'Docker & CI/CD Pipelines', required_level: 3, importance: 0.75, is_core: false }
    ]
  },
  {
    career_id: 'CR_AIML_01',
    career_title: 'Machine Learning & Deep Learning Specialist',
    domain: 'Artificial Intelligence',
    category: 'Computer & IT',
    branch_codes: ['AIML', 'AIDS', 'DS', 'CSE'],
    description: 'Trains, evaluates, and deploys deep neural networks, transformer architectures, computer vision models, and LLMs into production.',
    min_exp_years: 1,
    avg_salary_usd: 130000,
    market_demand: 'Explosive Growth',
    key_workflows: ['PyTorch tensor model optimization', 'Vector embeddings & RAG retrieval', 'Model quantizing & GPU inference latency tuning'],
    required_skills: [
      { skill_id: 'SK_PYTORCH', skill_name: 'PyTorch & Deep Learning Tensors', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_MATH_ML', skill_name: 'Linear Algebra & Probability', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_LLM_RAG', skill_name: 'LLMs, Transformers & RAG', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_MLOPS', skill_name: 'MLOps & Triton Serving', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_CYBER_01',
    career_title: 'Cybersecurity Threat Hunter & Pentester',
    domain: 'Information Security & Cryptography',
    category: 'Computer & IT',
    branch_codes: ['CYBER', 'IT', 'CSE'],
    description: 'Identifies security vulnerabilities, conducts ethical penetration testing, performs forensic incident analysis, and hardens networks.',
    min_exp_years: 1,
    avg_salary_usd: 120000,
    market_demand: 'Extremely High',
    key_workflows: ['Zero-day vulnerability triage', 'Network packet reverse engineering with Wireshark', 'SOC SIEM monitoring & defensive threat mitigations'],
    required_skills: [
      { skill_id: 'SK_SEC_NET', skill_name: 'Network Protocols & Cryptography', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_PENTEST', skill_name: 'Penetration Testing & Burp Suite', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_LINUX_INT', skill_name: 'Linux Kernel & Memory Security', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_SIEM', skill_name: 'SIEM & Threat Forensics', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_CLOUD_01',
    career_title: 'Cloud Infrastructure & SRE Architect',
    domain: 'Cloud Systems & Reliability',
    category: 'Computer & IT',
    branch_codes: ['CLOUD', 'CSE', 'IT', 'SE'],
    description: 'Architects fault-tolerant multi-region cloud infrastructures, automated Terraform provisioning, and 99.999% reliability pipelines.',
    min_exp_years: 1,
    avg_salary_usd: 125000,
    market_demand: 'Extremely High',
    key_workflows: ['Terraform infrastructure-as-code deployments', 'Kubernetes cluster ingress & mesh routing', 'Prometheus & Grafana latency monitoring'],
    required_skills: [
      { skill_id: 'SK_K8S', skill_name: 'Kubernetes & Service Mesh', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_TF', skill_name: 'Terraform & CloudFormation', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_AWS', skill_name: 'AWS / GCP Solutions Architecture', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_SRE', skill_name: 'SLO/SLA Tracking & Observability', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_BLOCKCHAIN_01',
    career_title: 'Blockchain Core & Smart Contract Protocol Engineer',
    domain: 'Decentralized Systems & Cryptography',
    category: 'Computer & IT',
    branch_codes: ['BLOCKCHAIN', 'CSE'],
    description: 'Constructs decentralized protocols, zero-knowledge proof circuits, Solidity smart contracts, and high-throughput consensus mechanisms.',
    min_exp_years: 1,
    avg_salary_usd: 135000,
    market_demand: 'High',
    key_workflows: ['Gas optimization for EVM contracts', 'Formal verification of smart contracts', 'Consensus engine p2p networking'],
    required_skills: [
      { skill_id: 'SK_SOLIDITY', skill_name: 'Solidity & EVM Architecture', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_CRYPTO_MATH', skill_name: 'Elliptic Curve Cryptography & ZK', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_RUST_CORE', skill_name: 'Rust Systems Programming', required_level: 3, importance: 0.85, is_core: true },
      { skill_id: 'SK_HARDHAT', skill_name: 'Foundry / Hardhat Testing Suites', required_level: 4, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_IOT_01',
    career_title: 'IoT Systems & Edge Computing Architect',
    domain: 'Connected Devices & Edge Cloud',
    category: 'Computer & IT',
    branch_codes: ['IOT', 'CE', 'CSIT', 'EMBEDDED'],
    description: 'Designs end-to-end telemetry pipelines bridging low-power edge sensor gateways, MQTT brokers, and cloud analytics engines.',
    min_exp_years: 0.5,
    avg_salary_usd: 108000,
    market_demand: 'High',
    key_workflows: ['MQTT telemetry streaming under intermittent connectivity', 'BLE & Zigbee mesh network configuration', 'OTA firmware update rollouts'],
    required_skills: [
      { skill_id: 'SK_MQTT', skill_name: 'MQTT, CoAP & IoT Protocols', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_EMBED_C', skill_name: 'Embedded C/C++ on ESP32 & ARM', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_EDGE_AI', skill_name: 'Edge AI & TinyML Inference', required_level: 3, importance: 0.8, is_core: false },
      { skill_id: 'SK_TIMESERIES', skill_name: 'Time-Series DBs (InfluxDB/Kafka)', required_level: 3, importance: 0.8, is_core: false }
    ]
  },

  // ==========================================
  // ⚡ ELECTRICAL & ELECTRONICS (8 Branches)
  // ==========================================
  {
    career_id: 'CR_VLSI_01',
    career_title: 'VLSI Physical Design & ASIC Verification Engineer',
    domain: 'Semiconductors & Integrated Circuits',
    category: 'Electrical & Electronics',
    branch_codes: ['VLSI', 'ECE', 'EE', 'EEE'],
    description: 'Takes digital RTL logic through floorplanning, clock tree synthesis (CTS), place & route, and static timing analysis down to sub-3nm tape-out.',
    min_exp_years: 1,
    avg_salary_usd: 125000,
    market_demand: 'Extremely High',
    key_workflows: ['Static Timing Analysis (STA) with Primetime', 'Clock Tree Synthesis skew minimization', 'Design Rule Check (DRC) clean tapeout'],
    required_skills: [
      { skill_id: 'SK_VERILOG', skill_name: 'SystemVerilog & UVM Verification', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_STA', skill_name: 'Static Timing Analysis (STA) & Slack', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_CADENCE', skill_name: 'Cadence Innovus / Synopsys EDA Tools', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_TCL', skill_name: 'TCL Scripting for EDA Automation', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_EMBED_01',
    career_title: 'Embedded Firmware & RTOS Systems Engineer',
    domain: 'Embedded Systems & Microcontrollers',
    category: 'Electrical & Electronics',
    branch_codes: ['EMBEDDED', 'ECE', 'EEE', 'EIE', 'ICE'],
    description: 'Programs bare-metal microcontrollers and real-time operating systems for automotive ECUs, avionics, medical implants, and industrial robotics.',
    min_exp_years: 0.5,
    avg_salary_usd: 110000,
    market_demand: 'Extremely High',
    key_workflows: ['Deterministic task scheduling in FreeRTOS', 'Bare-metal peripheral driver development (DMA, SPI, CAN)', 'Oscilloscope bus signal debugging'],
    required_skills: [
      { skill_id: 'SK_EMB_C', skill_name: 'Modern Embedded C / C++', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_RTOS', skill_name: 'FreeRTOS / Zephyr Real-Time Kernels', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_BUS_PROTO', skill_name: 'I2C, SPI, UART, CAN Bus Interfaces', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_HARDWARE_DEBUG', skill_name: 'Logic Analyzers & JTAG In-Circuit Debugging', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_POWER_01',
    career_title: 'Power Systems & High-Voltage Grid Engineer',
    domain: 'Electrical Power & Energy Systems',
    category: 'Electrical & Electronics',
    branch_codes: ['EEE', 'ELEC'],
    description: 'Models electrical transmission networks, high-voltage substations, transformer switchgear, power factor compensation, and smart grid automation.',
    min_exp_years: 1,
    avg_salary_usd: 102000,
    market_demand: 'Steady',
    key_workflows: ['Short circuit & load flow analysis in ETAP', 'Substation single-line diagram protection relaying', 'Power quality harmonic distortion mitigation'],
    required_skills: [
      { skill_id: 'SK_ETAP', skill_name: 'ETAP / PowerWorld Load Flow Analysis', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_GRID_PROT', skill_name: 'Protective Relaying & Switchgear Coordination', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_HV_SAFETY', skill_name: 'High-Voltage IEEE/IEC Grid Standards', required_level: 3, importance: 0.85, is_core: true },
      { skill_id: 'SK_MATLAB_SIM', skill_name: 'MATLAB Simscape Power Systems', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_RF_01',
    career_title: 'RF & Microwave Antenna Systems Engineer',
    domain: 'Telecommunications & Radio Frequency',
    category: 'Electrical & Electronics',
    branch_codes: ['ECE', 'EE'],
    description: 'Engineers phased-array antennas, microwave filters, RF front-end amplifiers, and radar transceivers for 5G/6G and satellite communications.',
    min_exp_years: 1,
    avg_salary_usd: 118000,
    market_demand: 'High',
    key_workflows: ['Electromagnetic 3D field simulation in ANSYS HFSS', 'Smith chart impedance matching network design', 'Vector Network Analyzer (VNA) S-parameter tuning'],
    required_skills: [
      { skill_id: 'SK_HFSS', skill_name: 'ANSYS HFSS / CST Microwave Studio', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_EM_THEORY', skill_name: 'Electromagnetic Field Theory & Waveguides', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_SMITH', skill_name: 'Smith Chart Impedance Matching', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_VNA', skill_name: 'Vector Network Analyzers (VNA) Testing', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_ICE_01',
    career_title: 'Industrial Automation & SCADA Control Engineer',
    domain: 'Instrumentation & Process Automation',
    category: 'Electrical & Electronics',
    branch_codes: ['EIE', 'ICE', 'MECHATRONICS'],
    description: 'Designs automated closed-loop process control systems, Programmable Logic Controllers (PLC), SCADA interfaces, and field transmitter calibration.',
    min_exp_years: 0.5,
    avg_salary_usd: 98000,
    market_demand: 'High',
    key_workflows: ['Ladder Logic & Structured Text programming for Siemens/Rockwell PLCs', 'PID loop auto-tuning for flow/temperature control', 'SCADA telemetry visualization and alarm thresholds'],
    required_skills: [
      { skill_id: 'SK_PLC_LADDER', skill_name: 'PLC Ladder Logic & Structured Text (IEC 61131)', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_SCADA', skill_name: 'SCADA, HMI & Ignition Platforms', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_PID_TUNING', skill_name: 'Closed-Loop PID Tuning & Control Theory', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_INSTRUMENT', skill_name: 'Sensors, 4-20mA Transmitters & Fieldbus', required_level: 3, importance: 0.8, is_core: false }
    ]
  },

  // ==========================================
  // ⚙️ MECHANICAL & RELATED (6 Branches)
  // ==========================================
  {
    career_id: 'CR_MECH_01',
    career_title: 'Mechanical Design & CAD/FEA Engineer',
    domain: 'Product Engineering & Machine Elements',
    category: 'Mechanical & Related',
    branch_codes: ['MECH', 'MFG'],
    description: 'Designs precision mechanical components, performs Finite Element Analysis (FEA) structural stress simulation, and establishes GD&T production drawings.',
    min_exp_years: 1,
    avg_salary_usd: 96000,
    market_demand: 'High',
    key_workflows: ['Parametric 3D solid modeling in SolidWorks/Creo', 'Von Mises yield stress & fatigue analysis in ANSYS', 'Geometric Dimensioning and Tolerancing (GD&T) tolerance stacks'],
    required_skills: [
      { skill_id: 'SK_CAD_3D', skill_name: 'SolidWorks / PTC Creo 3D Parametric Modeling', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_FEA_ANSYS', skill_name: 'Finite Element Analysis (FEA) & Stress Simulation', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_GDT', skill_name: 'GD&T (ASME Y14.5) & Tolerance Stack-ups', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_MAT_SELECT', skill_name: 'Material Selection & Heat Treatment Metallurgy', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_ROB_01',
    career_title: 'Robotics Kinematics & Autonomous Systems Engineer',
    domain: 'Robotics & Mechatronics',
    category: 'Mechanical & Related',
    branch_codes: ['ROBOTICS', 'MECHATRONICS', 'AUTOMATION'],
    description: 'Develops forward/inverse kinematics motion planners, trajectory generators, ROS 2 nodes, and sensor fusion algorithms for industrial and mobile robots.',
    min_exp_years: 1,
    avg_salary_usd: 122000,
    market_demand: 'Explosive Growth',
    key_workflows: ['URDF robot modeling & Gazebo dynamic simulation', 'Inverse kinematics calculation using Denavit-Hartenberg (D-H) matrices', 'Extended Kalman Filter sensor fusion for LiDAR SLAM'],
    required_skills: [
      { skill_id: 'SK_ROS2', skill_name: 'ROS 2 (Robot Operating System) & Gazebo', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_KINEMATICS', skill_name: 'Forward/Inverse Kinematics & Dynamics', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_CPP_ROB', skill_name: 'C++ / Python for Real-Time Motion Control', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_SLAM', skill_name: 'LiDAR SLAM & Path Planning (A*, RRT*)', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_AUTO_01',
    career_title: 'Automotive EV Powertrain & Battery Systems Engineer',
    domain: 'Automotive & Mobility Engineering',
    category: 'Mechanical & Related',
    branch_codes: ['AUTO', 'MECH', 'EEE'],
    description: 'Designs electric vehicle battery packs, battery thermal management systems (BTMS), regenerative motor drives, and chassis dynamic controllers.',
    min_exp_years: 1,
    avg_salary_usd: 114000,
    market_demand: 'Extremely High',
    key_workflows: ['Simulink drive cycle power simulation (WLTP/EPA)', 'Lithium-ion cell thermal runaway containment modeling', 'CAN vehicle telemetry diagnostic calibration'],
    required_skills: [
      { skill_id: 'SK_EV_POWERTRAIN', skill_name: 'EV Motor Drives & Inverter Topologies', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_BMS_DESIGN', skill_name: 'Battery Management Systems (BMS) & SOC Estimation', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_THERMAL_CFD', skill_name: 'Battery Thermal Management & Heat Transfer', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_CAN_BUS', skill_name: 'Vehicle CAN / LIN Communication Protocols', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_IND_01',
    career_title: 'Industrial Systems & Supply Chain Optimization Specialist',
    domain: 'Operations Research & Production Engineering',
    category: 'Mechanical & Related',
    branch_codes: ['IND', 'MFG'],
    description: 'Optimizes manufacturing assembly line throughput, minimizes work-in-progress inventory, applies Lean Six Sigma, and designs ergonomically sound facilities.',
    min_exp_years: 0.5,
    avg_salary_usd: 94000,
    market_demand: 'Steady',
    key_workflows: ['Discrete-event manufacturing simulation with AnyLogic/FlexSim', 'Value Stream Mapping (VSM) and waste elimination', 'Statistical Process Control (SPC) Cpk index monitoring'],
    required_skills: [
      { skill_id: 'SK_LEAN_SIX', skill_name: 'Lean Six Sigma (DMAIC) & Kaizen', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_OPERATIONS_RES', skill_name: 'Linear Programming & Simplex Optimization', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_DISCRETE_SIM', skill_name: 'Discrete Event Simulation (FlexSim/Arena)', required_level: 3, importance: 0.85, is_core: true },
      { skill_id: 'SK_SPC', skill_name: 'Statistical Process Control (Minitab)', required_level: 3, importance: 0.8, is_core: false }
    ]
  },

  // ==========================================
  // 🏗️ CIVIL & INFRASTRUCTURE (6 Branches)
  // ==========================================
  {
    career_id: 'CR_STRUCT_01',
    career_title: 'Senior Structural Design & Seismic Analysis Engineer',
    domain: 'Structural Engineering & High-Rises',
    category: 'Civil & Infrastructure',
    branch_codes: ['STRUCTURAL', 'CIVIL'],
    description: 'Calculates gravity and lateral earthquake wind loads, designs reinforced concrete and structural steel frames according to IS 456 / ACI 318 / Eurocode.',
    min_exp_years: 1,
    avg_salary_usd: 104000,
    market_demand: 'High',
    key_workflows: ['3D finite element structural modeling in ETABS / STAAD.Pro', 'Response spectrum dynamic seismic analysis', 'Reinforced concrete beam, column, and shear wall detailing'],
    required_skills: [
      { skill_id: 'SK_ETABS', skill_name: 'ETABS / STAAD.Pro Structural Modeling', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_RC_STEEL', skill_name: 'Reinforced Concrete & Steel Design Codes (IS 456 / ACI)', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_SEISMIC', skill_name: 'Seismic Dynamics & Response Spectra', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_AUTOCAD_DET', skill_name: 'AutoCAD / Revit Rebar Detailing', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_GEOTECH_01',
    career_title: 'Geotechnical & Deep Foundation Specialist',
    domain: 'Soil Mechanics & Underground Infrastructure',
    category: 'Civil & Infrastructure',
    branch_codes: ['GEOTECH', 'CIVIL'],
    description: 'Evaluates soil bearing capacity, designs deep bored pile foundations, analyzes retaining wall earth pressures, and conducts slope stability modeling.',
    min_exp_years: 1,
    avg_salary_usd: 99000,
    market_demand: 'Steady',
    key_workflows: ['Plaxis 2D finite element soil-structure interaction', 'Standard Penetration Test (SPT) log interpretation', 'Groundwater seepage flownet computation'],
    required_skills: [
      { skill_id: 'SK_PLAXIS', skill_name: 'PLAXIS / GeoStudio Geotechnical Modeling', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_SOIL_MECH', skill_name: 'Soil Mechanics, Terzaghi Bearing & Mohr-Coulomb', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_PILE_DESIGN', skill_name: 'Deep Piled Foundations & Retaining Systems', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_SITE_INVEST', skill_name: 'Subsurface Geotechnical Borehole Investigation', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_TRANS_01',
    career_title: 'Transportation & Highway Infrastructure Engineer',
    domain: 'Highway Design & Traffic Systems',
    category: 'Civil & Infrastructure',
    branch_codes: ['TRANS', 'CIVIL', 'SMART_CITIES'],
    description: 'Designs multi-lane highway geometric alignments, horizontal transition spirals, super-elevation transitions, and traffic signal timing models.',
    min_exp_years: 0.5,
    avg_salary_usd: 95000,
    market_demand: 'High',
    key_workflows: ['Civil 3D corridor corridor modeling & cut/fill balancing', 'AASHTO flexible pavement layer thickness sizing', 'VISSIM microscopic traffic flow microsimulation'],
    required_skills: [
      { skill_id: 'SK_CIVIL_3D', skill_name: 'AutoCAD Civil 3D Highway Corridors', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_GEOMETRIC', skill_name: 'AASHTO / IRC Geometric Roadway Alignment', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_PAVEMENT', skill_name: 'Flexible & Rigid Pavement Structural Design', required_level: 3, importance: 0.85, is_core: true },
      { skill_id: 'SK_VISSIM', skill_name: 'VISSIM / Synchro Traffic Flow Simulation', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_ENV_01',
    career_title: 'Environmental & Water Resources Engineer',
    domain: 'Hydrology, Water Supply & Pollution Control',
    category: 'Civil & Infrastructure',
    branch_codes: ['ENV', 'CIVIL'],
    description: 'Models open channel hydraulic flood zones with HEC-RAS, designs municipal biological wastewater treatment plants, and establishes environmental impact reports.',
    min_exp_years: 0.5,
    avg_salary_usd: 93000,
    market_demand: 'High',
    key_workflows: ['HEC-RAS flood plain water surface profile simulation', 'Activated sludge aeration tank stoichiometric sizing', 'Water distribution pipe network modeling with EPANET'],
    required_skills: [
      { skill_id: 'SK_HEC_RAS', skill_name: 'HEC-RAS / HEC-HMS River Hydraulic Modeling', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_WATER_TREAT', skill_name: 'Water & Wastewater Biological Treatment Unit Operations', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_EPANET', skill_name: 'EPANET Pipe Network Hydraulic Simulation', required_level: 3, importance: 0.85, is_core: true },
      { skill_id: 'SK_EIA', skill_name: 'Environmental Impact Assessment (EIA) Regulations', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_CTM_01',
    career_title: 'Construction Project & BIM Technology Manager',
    domain: 'Construction Management & 5D BIM',
    category: 'Civil & Infrastructure',
    branch_codes: ['CTM', 'CIVIL'],
    description: 'Coordinates 4D/5D Building Information Modeling (BIM), clash detection, contractor procurement, and critical path project scheduling using Primavera P6.',
    min_exp_years: 1,
    avg_salary_usd: 106000,
    market_demand: 'Extremely High',
    key_workflows: ['Navisworks multidisciplinary MEP clash detection audits', 'Critical Path Method (CPM) baseline scheduling in Primavera P6', 'Earned Value Management (EVM) cost tracking'],
    required_skills: [
      { skill_id: 'SK_BIM_REVIT', skill_name: 'Autodesk Revit & Navisworks Clash Detection', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_PRIMAVERA', skill_name: 'Primavera P6 / MS Project Schedule Management', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_COST_EST', skill_name: 'Quantity Surveying, BOQ & Cost Estimation', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_CONTRACTS', skill_name: 'FIDIC Contract Administration & Site Safety (OSHA)', required_level: 3, importance: 0.8, is_core: false }
    ]
  },

  // ==========================================
  // 🧪 CHEMICAL & MATERIALS (7 Branches)
  // ==========================================
  {
    career_id: 'CR_CHEM_01',
    career_title: 'Chemical Process Simulation & Plant Design Engineer',
    domain: 'Chemical Process Engineering & Refining',
    category: 'Chemical & Materials',
    branch_codes: ['CHEM', 'PETROCHEM', 'BIOCHEM'],
    description: 'Simulates steady-state and dynamic chemical processes, sizes fractional distillation towers, designs shell-and-tube heat exchangers, and generates P&ID diagrams.',
    min_exp_years: 1,
    avg_salary_usd: 108000,
    market_demand: 'Steady',
    key_workflows: ['Aspen Plus flowsheet mass and energy balance convergence', 'McCabe-Thiele distillation stage optimization', 'HAZOP process safety node reviews'],
    required_skills: [
      { skill_id: 'SK_ASPEN', skill_name: 'Aspen Plus / Aspen HYSYS Process Simulation', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_HEAT_MASS', skill_name: 'Heat & Mass Transfer Unit Operations', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_PID_DIAG', skill_name: 'Piping and Instrumentation Diagrams (P&ID)', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_HAZOP', skill_name: 'HAZOP & Process Safety Engineering', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_PETRO_01',
    career_title: 'Petroleum Reservoir & Subsurface Drilling Specialist',
    domain: 'Upstream Oil & Gas Engineering',
    category: 'Chemical & Materials',
    branch_codes: ['PETRO', 'PETROCHEM'],
    description: 'Calculates hydrocarbon reserves in place using Darcy’s law, simulates multi-phase fluid flow in porous media, and plans directional drilling trajectories.',
    min_exp_years: 1,
    avg_salary_usd: 128000,
    market_demand: 'Steady',
    key_workflows: ['Petrel 3D geological reservoir modeling', 'Well log petrophysical interpretation (gamma ray, resistivity)', 'Drilling hydraulics and blowout preventer (BOP) safety calculations'],
    required_skills: [
      { skill_id: 'SK_PETREL', skill_name: 'Schlumberger Petrel / Eclipse Simulation', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_RESERVOIR', skill_name: 'Reservoir Fluid Dynamics & Darcy Multi-Phase Flow', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_WELL_LOG', skill_name: 'Well Logging & Petrophysical Evaluation', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_DRILLING_HYD', skill_name: 'Drilling Mud Hydraulics & Pressure Control', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_MAT_01',
    career_title: 'Materials Characterization & Metallurgical Scientist',
    domain: 'Materials Science, Alloys & Failure Analysis',
    category: 'Chemical & Materials',
    branch_codes: ['MAT', 'MET', 'POLY'],
    description: 'Investigates microstructural crystal defects using XRD and SEM, establishes thermal phase equilibrium diagrams, and designs advanced lightweight alloys.',
    min_exp_years: 1,
    avg_salary_usd: 101000,
    market_demand: 'High',
    key_workflows: ['Scanning Electron Microscopy (SEM) fractography of fatigue cracks', 'CALPHAD thermodynamic multi-component phase diagram calculations', 'Heat treatment austenitizing and quenching cycle optimization'],
    required_skills: [
      { skill_id: 'SK_SEM_XRD', skill_name: 'X-Ray Diffraction (XRD) & SEM Spectroscopy', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_PHASE_DIAG', skill_name: 'Iron-Carbon & Binary Phase Equilibrium Diagrams', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_FAILURE_ANALYSIS', skill_name: 'Metallurgical Failure Analysis & Corrosion Science', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_HEAT_TREAT', skill_name: 'Alloy Heat Treatments & Quenching Kinetics', required_level: 3, importance: 0.8, is_core: false }
    ]
  },

  // ==========================================
  // ✈️ AEROSPACE & SPECIALIZED (9 Branches)
  // ==========================================
  {
    career_id: 'CR_AERO_01',
    career_title: 'Aerodynamics CFD & Flight Simulation Specialist',
    domain: 'Aerospace & Fluid Dynamics',
    category: 'Aerospace & Specialized',
    branch_codes: ['AERO', 'AERONAUTICAL'],
    description: 'Computes trans-sonic shockwaves, wing lift-to-drag polars, and vortex shedding using ANSYS Fluent, OpenFOAM, and wind tunnel instrumentation.',
    min_exp_years: 1,
    avg_salary_usd: 124000,
    market_demand: 'Extremely High',
    key_workflows: ['Navier-Stokes turbulence modeling (k-omega SST)', 'Airfoil boundary layer separation prediction', 'Supersonic oblique shock angle calculations'],
    required_skills: [
      { skill_id: 'SK_ANSYS_FLUENT', skill_name: 'ANSYS Fluent / OpenFOAM CFD Modeling', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_COMP_FLOW', skill_name: 'Compressible Aerodynamics & Shockwaves', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_AIRFOIL_POLAR', skill_name: 'Airfoil Lift/Drag Polars & Thin Wing Theory', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_WIND_TUNNEL', skill_name: 'Wind Tunnel Data Acquisition & PIV Testing', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_PROP_01',
    career_title: 'Rocket Propulsion & Gas Turbine Systems Engineer',
    domain: 'Aerospace Propulsion & Thermal Systems',
    category: 'Aerospace & Specialized',
    branch_codes: ['AERO', 'AERONAUTICAL'],
    description: 'Designs convergent-divergent de Laval rocket nozzles, combustor injectors, turbopumps, and gas turbine compressor stages using NASA CEA.',
    min_exp_years: 1,
    avg_salary_usd: 128000,
    market_demand: 'Explosive Growth',
    key_workflows: ['NASA CEA chemical equilibrium rocket chamber pressure calculations', 'De Laval supersonic nozzle expansion ratio sizing', 'Regenerative cooling jacket heat flux modeling'],
    required_skills: [
      { skill_id: 'SK_ROCKET_PROP', skill_name: 'Rocket Propulsion & Specific Impulse (Isp) Equations', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_COMBUSTION', skill_name: 'Combustion Thermodynamics & NASA CEA', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_TURBOMACHINE', skill_name: 'Compressor & Turbine Blade Aerodynamics', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_CRYOGENICS', skill_name: 'Cryogenic Propellant Handling (LH2/LOX)', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_MARINE_01',
    career_title: 'Naval Architect & Marine Propulsion Systems Engineer',
    domain: 'Ship Design, Hydrodynamics & Offshore Platforms',
    category: 'Aerospace & Specialized',
    branch_codes: ['MARINE'],
    description: 'Calculates hull hydrostatic buoyancy, intact and damage stability curves, hydrodynamic wave resistance, and marine diesel power plants.',
    min_exp_years: 0.5,
    avg_salary_usd: 104000,
    market_demand: 'Steady',
    key_workflows: ['Maxsurf vessel hull lines modeling & hydrostatic curves', 'Ship resistance and propeller cavitation analysis', 'Classification society compliance (DNV / Lloyd’s Register)'],
    required_skills: [
      { skill_id: 'SK_MAXSURF', skill_name: 'Maxsurf / Rhino Naval Architecture Suite', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_HYDRODYNAMICS', skill_name: 'Hydrostatics, GZ Stability Curves & Wave Resistance', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_PROP_SYS', skill_name: 'Marine Diesel & Gas Turbine Propulsion Plants', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_OFFSHORE_STRUCT', skill_name: 'Offshore Steel Jacket & Mooring Line Dynamics', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_BIOMED_01',
    career_title: 'Biomedical Device & Clinical Implants Engineer',
    domain: 'Medical Devices & Biomechanics',
    category: 'Aerospace & Specialized',
    branch_codes: ['BIOMED', 'BIOTECH'],
    description: 'Designs ISO 13485 compliant medical diagnostic equipment, prosthetic biomechanical limbs, and biocompatible orthopedic titanium implants.',
    min_exp_years: 0.5,
    avg_salary_usd: 106000,
    market_demand: 'High',
    key_workflows: ['Physiological signal processing (ECG, EMG, EEG) filtering', 'Biocompatibility material testing per ISO 10993', 'FDA 510(k) medical regulatory compliance documentation'],
    required_skills: [
      { skill_id: 'SK_BIOSIGNAL', skill_name: 'Physiological Biosignal Processing (MATLAB/Python)', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_BIOMECH', skill_name: 'Musculoskeletal Biomechanics & FEA Implant Loading', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_MED_REG', skill_name: 'FDA 510(k) & ISO 13485 Medical Device Regulations', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_BIOMATERIALS', skill_name: 'Biomaterials & Tissue Scaffolding', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_BIOTECH_01',
    career_title: 'Bioprocess & Computational Genomics Scientist',
    domain: 'Biotechnology & Bioinformatics',
    category: 'Aerospace & Specialized',
    branch_codes: ['BIOTECH', 'BIOCHEM'],
    description: 'Scales industrial microbial bioreactor fermentation, performs Next-Generation Sequencing (NGS) gene alignment, and models metabolic pathways.',
    min_exp_years: 0.5,
    avg_salary_usd: 102000,
    market_demand: 'High',
    key_workflows: ['Bioreactor oxygen transfer coefficient (kLa) scaling', 'Python Biopython DNA sequence alignment and variant calling', 'Monod cell growth kinetics parameter estimation'],
    required_skills: [
      { skill_id: 'SK_BIOINFORMATICS', skill_name: 'Bioinformatics (BLAST, Biopython, Bioconductor)', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_FERMENTATION', skill_name: 'Industrial Fermentation & Bioreactor Scale-up', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_DOWNSTREAM', skill_name: 'Downstream Chromatography & Ultrafiltration', required_level: 3, importance: 0.85, is_core: true },
      { skill_id: 'SK_GENE_REG', skill_name: 'CRISPR Gene Editing & Recombinant DNA', required_level: 3, importance: 0.8, is_core: false }
    ]
  },

  // ==========================================
  // 🌱 EMERGING / INTERDISCIPLINARY (6 Branches)
  // ==========================================
  {
    career_id: 'CR_QUANTUM_01',
    career_title: 'Quantum Algorithm & Error Correction Engineer',
    domain: 'Quantum Computing & Information Theory',
    category: 'Emerging / Interdisciplinary',
    branch_codes: ['QUANTUM'],
    description: 'Programs multi-qubit quantum circuits using Qiskit/Cirq, executes quantum phase estimation, and simulates surface code fault-tolerant lattices.',
    min_exp_years: 1,
    avg_salary_usd: 145000,
    market_demand: 'Explosive Growth',
    key_workflows: ['Quantum circuit depth and gate fidelity optimization', 'VQE (Variational Quantum Eigensolver) molecular energy calculations', 'Bloch sphere state vector manipulation'],
    required_skills: [
      { skill_id: 'SK_QISKIT', skill_name: 'Qiskit / Cirq Quantum SDKs', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_QUANTUM_MATH', skill_name: 'Hilbert Spaces, Dirac Bra-Ket & Unitary Operators', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_ERROR_CORR', skill_name: 'Quantum Error Correction & Surface Codes', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_PENNILANE', skill_name: 'PennyLane Quantum Machine Learning', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_RENEW_01',
    career_title: 'Renewable Microgrid & Solar Storage Architect',
    domain: 'Clean Energy & Grid Integration',
    category: 'Emerging / Interdisciplinary',
    branch_codes: ['RENEWABLE', 'EEE', 'ELEC'],
    description: 'Simulates utility-scale solar photovoltaic yield in PVsyst, sizes battery energy storage systems (BESS), and optimizes LCOE using HOMER Pro.',
    min_exp_years: 0.5,
    avg_salary_usd: 104000,
    market_demand: 'Extremely High',
    key_workflows: ['PVsyst solar 3D shading and yield generation modeling', 'Battery energy storage degradation and dispatch scheduling', 'Levelized Cost of Energy (LCOE) financial model optimization'],
    required_skills: [
      { skill_id: 'SK_PVSYST', skill_name: 'PVsyst / Helioscope Solar Yield Simulation', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_HOMER', skill_name: 'HOMER Pro Hybrid Microgrid Optimization', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_BESS', skill_name: 'Battery Energy Storage Systems (BESS) Sizing', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_GRID_CODE', skill_name: 'Interconnection Standards (IEEE 1547)', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_DEFENSE_01',
    career_title: 'Defense Radar & Guided Weapons Systems Engineer',
    domain: 'Defense Technology & Radar Systems',
    category: 'Emerging / Interdisciplinary',
    branch_codes: ['DEFENSE', 'ECE', 'AERO'],
    description: 'Engineers active electronically scanned array (AESA) radars, target tracking Kalman filters, missile guidance laws (proportional navigation), and electronic countermeasures.',
    min_exp_years: 1,
    avg_salary_usd: 132000,
    market_demand: 'High',
    key_workflows: ['Radar Range Equation & Doppler pulse processing simulation', 'Proportional Navigation (Pro-Nav) missile intercept kinematics', 'Electronic Warfare (EW) jamming resistance algorithms'],
    required_skills: [
      { skill_id: 'SK_RADAR_EQ', skill_name: 'Radar Signal Processing & Doppler Pulse Filtering', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_GUIDANCE', skill_name: 'Guidance, Navigation and Control (GNC) Laws', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_TRACKING_KF', skill_name: 'Kalman Filtering & Multi-Target Tracking', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_MATLAB_SIMULINK', skill_name: 'MATLAB / Simulink Defense System Modeling', required_level: 4, importance: 0.85, is_core: false }
    ]
  },
  {
    career_id: 'CR_DS_01',
    career_title: 'Lead Data Scientist & Quantitative Analyst',
    domain: 'Statistical Data Science & Forecasting',
    category: 'Computer & IT',
    branch_codes: ['DS', 'AIML', 'AIDS', 'CSE', 'CSBS'],
    description: 'Builds predictive statistical models, distributed Spark analytics pipelines, Monte Carlo risk engines, and multivariate time-series forecasting models.',
    min_exp_years: 1,
    avg_salary_usd: 122000,
    market_demand: 'Extremely High',
    key_workflows: ['Large-scale PySpark data wrangling', 'Hypothesis testing & Bayesian statistical modeling', 'Predictive feature engineering & time-series forecasting'],
    required_skills: [
      { skill_id: 'SK_STATS', skill_name: 'Statistical Inference & Hypothesis Testing', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_SPARK', skill_name: 'Apache Spark & Distributed Big Data', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_PANDAS', skill_name: 'Pandas & Scientific Python (NumPy/SciPy)', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_SQL_ADV', skill_name: 'Advanced SQL & Analytical Window Functions', required_level: 4, importance: 0.85, is_core: false }
    ]
  },
  {
    career_id: 'CR_CSBS_01',
    career_title: 'Enterprise Business Systems & Fintech Architect',
    domain: 'Enterprise Systems & Financial Tech',
    category: 'Computer & IT',
    branch_codes: ['CSBS', 'IT', 'CSE', 'CSIT'],
    description: 'Bridges enterprise ERP architectures (SAP/Oracle), financial calculation pipelines, corporate cloud infrastructure, and regulatory digital compliance.',
    min_exp_years: 1,
    avg_salary_usd: 118000,
    market_demand: 'High',
    key_workflows: ['Cloud ERP business process integration', 'Fintech transaction reconciliation & ledger algorithms', 'Enterprise service architecture (SOA/Microservices)'],
    required_skills: [
      { skill_id: 'SK_ERP', skill_name: 'Enterprise Architecture & Cloud ERP Systems', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_FINTECH', skill_name: 'Financial Modeling & Payment Gateway APIs', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_DB_SCALE', skill_name: 'Distributed Database Systems & Transaction ACID', required_level: 4, importance: 0.85, is_core: true },
      { skill_id: 'SK_BPMN', skill_name: 'Business Process Modeling & SLA Governance', required_level: 3, importance: 0.8, is_core: false }
    ]
  },
  {
    career_id: 'CR_MARINE_02',
    career_title: 'Naval Architect & Marine Propulsion Specialist',
    domain: 'Marine Engineering & Naval Architecture',
    category: 'Aerospace & Specialized',
    branch_codes: ['MARINE', 'MECH'],
    description: 'Designs ship hull geometry, computes metacentric intact and damage stability curves, sizes two-stroke marine diesel propulsion plants, and models propeller cavitation.',
    min_exp_years: 1,
    avg_salary_usd: 112000,
    market_demand: 'Steady',
    key_workflows: ['Maxsurf vessel hydrostatic stability curve generation', 'Propeller thrust and wake cavitation analysis', 'Marine auxiliary power and bilge system design'],
    required_skills: [
      { skill_id: 'SK_STABILITY', skill_name: 'Ship Hydrostatics & Metacentric Stability (GZ Curves)', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_MARINE_ENG', skill_name: 'Marine Diesel Engines & Auxiliary Plant Operations', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_HULL_CFD', skill_name: 'Hull Resistance & Propeller Wake Dynamics', required_level: 4, importance: 0.85, is_core: false }
    ]
  },
  {
    career_id: 'CR_MINING_01',
    career_title: 'Mine Geomechanics & Subsurface Excavation Engineer',
    domain: 'Mining & Rock Geomechanics',
    category: 'Aerospace & Specialized',
    branch_codes: ['MINING', 'CIVIL', 'GEOTECH'],
    description: 'Analyzes rock mass ratings (RMR), plans open-pit limits with Lerchs-Grossmann algorithms, designs explosive blast patterns, and models underground mine airflow ventilation.',
    min_exp_years: 1,
    avg_salary_usd: 116000,
    market_demand: 'High',
    key_workflows: ['Rocscience rockbolt support design for underground tunnels', 'Ventsim underground airflow simulation & fan sizing', 'Open-pit bench slope stability factor of safety calculations'],
    required_skills: [
      { skill_id: 'SK_ROCK_MECH', skill_name: 'Rock Mechanics & Hoek-Brown Failure Criteria', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_MINE_PLAN', skill_name: 'Mine Planning & Ultimate Pit Optimization (Surpac)', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_VENT', skill_name: 'Mine Ventilation Network Simulation (Ventsim)', required_level: 3, importance: 0.85, is_core: false }
    ]
  },
  {
    career_id: 'CR_AGRI_01',
    career_title: 'Precision Agricultural Systems & Drone Irrigation Engineer',
    domain: 'Precision Agriculture & Bio-Systems',
    category: 'Aerospace & Specialized',
    branch_codes: ['AGRI', 'MECHATRONICS', 'ENV'],
    description: 'Designs pressurized drip irrigation manifolds (Hazen-Williams), automated tractor guidance RTK-GPS systems, and multispectral drone NDVI vegetation health monitoring.',
    min_exp_years: 0.5,
    avg_salary_usd: 98000,
    market_demand: 'High',
    key_workflows: ['Penman-Monteith crop water demand calculation', 'Pressurized micro-irrigation pipe head loss sizing', 'Multispectral drone imagery NDVI analysis'],
    required_skills: [
      { skill_id: 'SK_IRRIG_HYD', skill_name: 'Irrigation Hydraulics & Drip Network Sizing', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_PRECISION_AG', skill_name: 'Precision Farming, GPS Guidance & Telematics', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_CROPWAT', skill_name: 'FAO CROPWAT Soil Moisture Modeling', required_level: 3, importance: 0.85, is_core: false }
    ]
  },
  {
    career_id: 'CR_FOOD_01',
    career_title: 'Food Process Engineering & Thermal Sterilization Specialist',
    domain: 'Food Processing & Food Safety',
    category: 'Aerospace & Specialized',
    branch_codes: ['FOOD', 'CHEM', 'BIOCHEM'],
    description: 'Calculates thermal death kinetics (D-value, z-value, F0 lethality), designs aseptic filling lines, models non-Newtonian food fluid rheology, and audits HACCP safety standards.',
    min_exp_years: 0.5,
    avg_salary_usd: 96000,
    market_demand: 'Steady',
    key_workflows: ['General Method lethality integration for canned foods', 'Plate heat exchanger pasteurization sizing', 'HACCP critical control point validation'],
    required_skills: [
      { skill_id: 'SK_THERM_LETH', skill_name: 'Thermal Lethality Kinetics (F0 / D / z values)', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_FOOD_RHEO', skill_name: 'Food Rheology & Viscoelastic Emulsions', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_HACCP', skill_name: 'HACCP Safety & Aseptic Packaging Design', required_level: 4, importance: 0.85, is_core: false }
    ]
  },
  {
    career_id: 'CR_TEXTILE_01',
    career_title: 'Technical Textiles & Smart Conductive Fabric Engineer',
    domain: 'Textile Engineering & Nanofibers',
    category: 'Aerospace & Specialized',
    branch_codes: ['TEXTILE', 'MAT', 'POLY'],
    description: 'Engineers high-tenacity synthetic yarns, weaves 3D aerodynamic carbon-fiber preforms, formulates electrospun nanofiber membranes, and integrates conductive e-textile sensors.',
    min_exp_years: 0.5,
    avg_salary_usd: 94000,
    market_demand: 'Steady',
    key_workflows: ['TexGen 3D woven fabric geometric modeling', 'Electrospinning parameters for filtration membranes', 'Peirce fabric tensile crimp and cover calculations'],
    required_skills: [
      { skill_id: 'SK_YARN_MECH', skill_name: 'Yarn Mechanics & Weaving Loom Kinematics', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_TECH_TEXTILES', skill_name: 'Technical Textiles & Fiber Composites', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_SMART_FABRIC', skill_name: 'Wearable Conductive E-Textiles & Nanofibers', required_level: 3, importance: 0.85, is_core: false }
    ]
  },
  {
    career_id: 'CR_SMART_CITY_01',
    career_title: 'Smart City Urban Digital Twin & GIS Architect',
    domain: 'Smart Cities & Municipal Tech',
    category: 'Emerging / Interdisciplinary',
    branch_codes: ['SMART_CITIES', 'CIVIL', 'TRANS', 'ENV'],
    description: 'Constructs city-wide digital twins integrating real-time traffic sensor streams (SUMO), district energy microgrids, GIS spatial pipelines, and automated water leak detection.',
    min_exp_years: 1,
    avg_salary_usd: 114000,
    market_demand: 'Explosive Growth',
    key_workflows: ['QGIS / PostGIS spatial topology analysis', 'SUMO microscopic traffic congestion simulation', 'Municipal IoT telemetry dashboard integration'],
    required_skills: [
      { skill_id: 'SK_GIS_SPATIAL', skill_name: 'GIS Spatial Modeling & PostGIS Vector Geometry', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_DIGITAL_TWIN', skill_name: 'Urban Digital Twin Simulation & City Telemetry', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_URBAN_MOBILITY', skill_name: 'SUMO Microscopic Traffic Simulation', required_level: 3, importance: 0.85, is_core: false }
    ]
  },
  {
    career_id: 'CR_AUTOMATION_01',
    career_title: 'Industrial Robotics & Cyber-Physical Automation Specialist',
    domain: 'Industrial Automation & Robotics',
    category: 'Emerging / Interdisciplinary',
    branch_codes: ['AUTOMATION', 'ROBOTICS', 'MECHATRONICS', 'MFG'],
    description: 'Programs 6-DOF industrial articulated robot arms, configures deterministic EtherCAT fieldbuses, designs machine vision inspection cameras, and deploys cobots.',
    min_exp_years: 1,
    avg_salary_usd: 112000,
    market_demand: 'Extremely High',
    key_workflows: ['RoboDK 6-axis robot trajectory kinematic simulation', 'EtherCAT / Profinet deterministic fieldbus programming', 'OpenCV machine vision automated defect inspection'],
    required_skills: [
      { skill_id: 'SK_ROBOT_KIN', skill_name: 'Industrial Robot Kinematics & RoboDK Workcells', required_level: 4, importance: 0.95, is_core: true },
      { skill_id: 'SK_PLC_BUS', skill_name: 'Siemens TIA Portal & EtherCAT Fieldbuses', required_level: 4, importance: 0.9, is_core: true },
      { skill_id: 'SK_MACHINE_VISION', skill_name: 'OpenCV Industrial Machine Vision Inspection', required_level: 4, importance: 0.85, is_core: false }
    ]
  }
];

// Convert structured career goals to BranchCareerRole format
const STRUCTURED_GOALS_AS_ROLES: BranchCareerRole[] = getAllCareerGoals().map(g => ({
  career_id: g.id,
  career_title: `${g.title} (${g.branch_code})`,
  domain: g.branch_name,
  category: g.category,
  branch_codes: [g.branch_code],
  description: g.description,
  min_exp_years: g.min_exp_years,
  avg_salary_usd: g.avg_salary_usd,
  market_demand: g.market_demand,
  key_workflows: g.roadmap_stages.map(s => `${s.title}: ${s.focus_skills.join(', ')}`),
  required_skills: g.required_skills.map(s => ({
    skill_id: s.skill_id,
    skill_name: s.skill_name,
    required_level: s.required_level,
    importance: s.importance,
    is_core: s.priority === 'Critical'
  }))
}));

export const ALL_CAREER_ROLES: BranchCareerRole[] = [
  ...BASE_CAREER_ROLES,
  ...STRUCTURED_GOALS_AS_ROLES
];

// Helper to get career roles for a branch
export function getCareersForBranch(branchCode: string): BranchCareerRole[] {
  if (!branchCode) return ALL_CAREER_ROLES;
  const clean = branchCode.toUpperCase().trim();
  const directMatches = ALL_CAREER_ROLES.filter(r => 
    r.branch_codes.some(bc => bc.toUpperCase() === clean)
  );
  if (directMatches.length > 0) return directMatches;

  return ALL_CAREER_ROLES;
}
