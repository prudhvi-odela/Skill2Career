// Branch -> Career Goal -> Required Skills Knowledge Base for Skill2Career
// Strictly structured according to official Engineering Branches and their respective Career Goals

export interface CareerGoalDefinition {
  id: string;
  title: string;
  branch_code: string;
  branch_name: string;
  category: string;
  mainly_learn: string[];
  description: string;
  market_demand: 'Extremely High' | 'High' | 'Steady' | 'Explosive Growth';
  avg_salary_usd: number;
  min_exp_years: number;
  required_skills: {
    skill_id: string;
    skill_name: string;
    required_level: number; // 1 to 5 scale
    default_student_level: number; // realistic baseline (e.g. 2.1, 4.2, 3.5, 2.8, 1.5)
    importance: number; // 0 to 1
    priority: 'Critical' | 'High' | 'Medium';
    estimated_hours: number;
    subject_category: 'Core Subject' | 'Applied Engineering' | 'Tooling & Systems';
    recommended_learning: string;
  }[];
  roadmap_stages: {
    stage: number;
    title: string;
    focus_skills: string[];
    main_subjects: string[];
    deliverable: string;
    recommended_topics: string[];
  }[];
}

export interface BranchGoalEntry {
  branch_name: string;
  category: string;
  goals: {
    title: string;
    mainly_learn: string[];
    salary: number;
    demand: 'Extremely High' | 'High' | 'Steady' | 'Explosive Growth';
    exp: number;
  }[];
}

// -------------------------------------------------------------
// CURATED MASTER HIERARCHY OF 64 ENGINEERING BRANCHES & EXACT CAREER GOALS
// -------------------------------------------------------------

export const CAREER_GOALS_DATA: Record<string, BranchGoalEntry> = {
  // ==========================================
  // 💻 COMPUTER & IT (13 Branches)
  // ==========================================
  CSE: {
    branch_name: 'Computer Science and Engineering (CSE)',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Software Engineer',
        mainly_learn: ['Data Structures & Algorithms', 'Object-Oriented Programming', 'Java / Python / C++', 'Git', 'DBMS & SQL', 'Operating Systems', 'Computer Networks', 'System Design'],
        salary: 115000,
        demand: 'Extremely High',
        exp: 0
      },
      {
        title: 'Full-Stack Developer',
        mainly_learn: ['HTML & CSS', 'JavaScript & TypeScript', 'React', 'Node.js & Express', 'SQL & NoSQL', 'REST & GraphQL APIs', 'Git & CI/CD', 'Cloud Deployment'],
        salary: 112000,
        demand: 'Extremely High',
        exp: 0
      },
      {
        title: 'Backend Developer',
        mainly_learn: ['Python / Java / Go', 'API Design & Microservices', 'Relational Databases & SQL', 'NoSQL & Redis Caching', 'Authentication & OAuth', 'System Design & Scalability', 'Docker'],
        salary: 118000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'System Engineer',
        mainly_learn: ['Operating Systems Architecture', 'Linux Kernel & Administration', 'Networking Protocols', 'Cloud Infrastructure', 'Scripting (Bash/Python)', 'System Troubleshooting', 'Distributed Systems'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Application Developer',
        mainly_learn: ['Application Architecture', 'Java / Kotlin / Swift', 'Mobile & Desktop Frameworks', 'REST APIs', 'Local DB Storage (SQLite)', 'UI/UX State Management', 'App Store Deployment'],
        salary: 106000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  IT: {
    branch_name: 'Information Technology (IT)',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Software Developer',
        mainly_learn: ['Programming Foundations', 'Data Structures & Algorithms', 'OOP Principles', 'DBMS & SQL', 'Git Version Control', 'API Integration', 'Software Testing'],
        salary: 105000,
        demand: 'Extremely High',
        exp: 0
      },
      {
        title: 'IT Consultant',
        mainly_learn: ['Enterprise Architecture', 'Databases & SQL', 'Cloud Platforms (AWS/Azure)', 'Enterprise Networking', 'Business Analysis', 'ITIL Framework', 'Client Communication'],
        salary: 102000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'System Administrator',
        mainly_learn: ['Linux Administration', 'Windows Server & Active Directory', 'Network Configuration', 'Shell Scripting', 'Virtualization (VMware/KVM)', 'IT Security Hardening', 'Backup & Disaster Recovery'],
        salary: 98000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'IT Analyst',
        mainly_learn: ['SQL Querying', 'Business Systems Analysis', 'Excel & Power BI', 'Data Visualization', 'Python Scripting', 'System Requirements Gathering'],
        salary: 96000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Network Administrator',
        mainly_learn: ['TCP/IP & Routing Protocols', 'Cisco / Juniper Switch Config', 'Firewalls & VPNs', 'DNS / DHCP / VLANs', 'Wireshark Packet Analysis', 'Network Monitoring (SNMP)'],
        salary: 100000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  AIML: {
    branch_name: 'Artificial Intelligence & Machine Learning (AI/ML)',
    category: 'Computer & IT',
    goals: [
      {
        title: 'AI Engineer',
        mainly_learn: ['Python', 'Deep Learning & Neural Networks', 'PyTorch / TensorFlow', 'Natural Language Processing (NLP)', 'Computer Vision', 'Generative AI & LLMs', 'MLOps & Model Serving'],
        salary: 135000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'ML Engineer',
        mainly_learn: ['Python & C++', 'Algorithms & Linear Algebra', 'Scikit-Learn & PyTorch', 'Feature Engineering', 'Model Deployment (Triton/FastAPI)', 'MLOps & CI/CD Pipelines', 'Model Quantization'],
        salary: 132000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'AI Researcher',
        mainly_learn: ['Mathematical Optimization', 'Probability & Statistics', 'Deep Learning Architectures', 'Reinforcement Learning', 'Transformer Mechanisms', 'Research Paper Publishing', 'PyTorch Research Prototyping'],
        salary: 142000,
        demand: 'High',
        exp: 2
      },
      {
        title: 'Applied Scientist',
        mainly_learn: ['Statistical Inference', 'Machine Learning Models', 'Experimental Design & A/B Testing', 'Large-Scale Computing', 'Python / C++', 'Algorithmic Problem Solving'],
        salary: 138000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Deep Learning Engineer',
        mainly_learn: ['Convolutional Neural Networks (CNNs)', 'Transformers & Self-Attention', 'PyTorch Tensor Computing', 'GPU Acceleration (CUDA)', 'Diffusion Models', 'Distributed Model Training'],
        salary: 136000,
        demand: 'Explosive Growth',
        exp: 1
      }
    ]
  },
  AIDS: {
    branch_name: 'Artificial Intelligence & Data Science (AI & DS)',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Data Scientist',
        mainly_learn: ['Python & Pandas', 'Applied Statistics & Probability', 'SQL & Data Warehousing', 'Machine Learning Algorithms', 'Data Visualization (Seaborn/Plotly)', 'Feature Engineering', 'Business Storytelling'],
        salary: 125000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'ML Engineer',
        mainly_learn: ['Python & DSA', 'Statistical Modeling', 'Machine Learning Pipelines', 'PyTorch / Scikit-Learn', 'Containerization & Docker', 'Model Deployment & APIs'],
        salary: 130000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'Data Analyst',
        mainly_learn: ['SQL & Analytical Queries', 'Excel Advanced Modeling', 'Power BI & Tableau', 'Python Data Cleansing', 'Descriptive Statistics', 'Dashboard Design'],
        salary: 95000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'AI Engineer',
        mainly_learn: ['Python', 'Deep Learning Models', 'NLP & Computer Vision', 'HuggingFace & Transformers', 'Vector Databases & RAG', 'API Deployment'],
        salary: 128000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'Applied Data Scientist',
        mainly_learn: ['Advanced Statistical Modeling', 'Predictive Analytics', 'A/B Testing & Causal Inference', 'Big Data (Spark/Databricks)', 'Business Metric Optimization'],
        salary: 127000,
        demand: 'Extremely High',
        exp: 1
      }
    ]
  },
  DS: {
    branch_name: 'Data Science',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Data Scientist',
        mainly_learn: ['Python & Scipy', 'Statistical Inference & Hypothesis Testing', 'Machine Learning', 'Data Wrangling', 'Predictive Modeling', 'Data Visualization'],
        salary: 126000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Data Analyst',
        mainly_learn: ['Advanced SQL', 'Power BI & Tableau', 'Excel Pivot & Analytics', 'Python & Pandas', 'Business Intelligence Reporting', 'Exploratory Data Analysis'],
        salary: 96000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Data Engineer',
        mainly_learn: ['Python & SQL', 'Apache Spark & PySpark', 'Data Pipeline Orchestration (Airflow)', 'Data Warehouses (Snowflake/BigQuery)', 'ETL / ELT Architecture', 'Distributed Systems'],
        salary: 128000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Business Intelligence Analyst',
        mainly_learn: ['SQL & Window Functions', 'Data Modeling (Star/Snowflake Schema)', 'Tableau / Power BI DAX', 'KPI Metrics Definition', 'Executive Dashboards'],
        salary: 98000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Machine Learning Engineer',
        mainly_learn: ['Python & DSA', 'Supervised & Unsupervised ML', 'Model Evaluation & Tuning', 'Scikit-Learn & XGBoost', 'ML Model Packaging & REST APIs'],
        salary: 130000,
        demand: 'Explosive Growth',
        exp: 1
      }
    ]
  },
  CYBER: {
    branch_name: 'Cyber Security',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Cybersecurity Engineer',
        mainly_learn: ['Network Security Architecture', 'Linux Security & Hardening', 'Cryptography & Public Key Infrastructure', 'Firewalls & IDS/IPS', 'Python Scripting', 'Cloud Security'],
        salary: 124000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Security Analyst',
        mainly_learn: ['SIEM Tools (Splunk / QRadar)', 'Threat Detection & Log Analysis', 'Incident Response Playbooks', 'Vulnerability Management', 'Security Compliance Frameworks (NIST/ISO 27001)'],
        salary: 105000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Ethical Hacker',
        mainly_learn: ['Penetration Testing Methodology', 'Kali Linux & Metasploit', 'Web App Security (OWASP Top 10)', 'Burp Suite & Nmap', 'Privilege Escalation', 'Python Exploit Development'],
        salary: 120000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'SOC Analyst',
        mainly_learn: ['Security Operations Center Workflows', 'SIEM Alert Triage', 'Packet Analysis with Wireshark', 'Endpoint Detection & Response (EDR)', 'Threat Intelligence'],
        salary: 98000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Penetration Tester',
        mainly_learn: ['Network & Infrastructure Pentesting', 'Active Directory Exploitation', 'Web & Mobile App Testing', 'Reverse Engineering Basics', 'Vulnerability Reporting & Remediation'],
        salary: 122000,
        demand: 'Extremely High',
        exp: 1
      }
    ]
  },
  IOT: {
    branch_name: 'Internet of Things (IoT)',
    category: 'Computer & IT',
    goals: [
      {
        title: 'IoT Engineer',
        mainly_learn: ['C/C++ & Microcontrollers (ESP32/STM32)', 'Python', 'Sensors & Actuator Interfacing', 'IoT Protocols (MQTT, CoAP, HTTP)', 'Wireless Tech (BLE, Zigbee, LoRaWAN)', 'Cloud IoT Platforms (AWS IoT)'],
        salary: 114000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'IoT Developer',
        mainly_learn: ['Embedded C/C++', 'Python Scripting', 'REST & MQTT APIs', 'Edge Gateway Software', 'Time-Series Databases (InfluxDB)', 'IoT Dashboards (Node-RED)'],
        salary: 112000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Embedded Engineer',
        mainly_learn: ['Bare-metal C Programming', 'Real-Time Operating Systems (FreeRTOS)', 'Hardware Bus Protocols (I2C, SPI, UART)', 'Microcontroller Architecture', 'Oscilloscope Bus Debugging'],
        salary: 116000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'IoT Solutions Architect',
        mainly_learn: ['End-to-End IoT Architecture', 'Edge Computing & Gateway Design', 'Cloud Scalability & Ingestion Pipelines', 'IoT Security & Device Provisioning', 'Distributed Telemetry Systems'],
        salary: 136000,
        demand: 'Extremely High',
        exp: 2
      },
      {
        title: 'IoT Security Engineer',
        mainly_learn: ['Hardware Security Modules (HSM)', 'Secure Boot & OTA Firmware Updates', 'Cryptographic Key Storage on Microcontrollers', 'Network Segmentation & TLS for IoT', 'Firmware Reverse Engineering'],
        salary: 126000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  CSBS: {
    branch_name: 'Computer Science & Business Systems (CSBS)',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Software Engineer',
        mainly_learn: ['Data Structures & Algorithms', 'Object-Oriented Programming (Java/C++)', 'DBMS & SQL', 'Enterprise Web Development', 'Git Version Control', 'REST APIs'],
        salary: 112000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Business Analyst',
        mainly_learn: ['Requirements Gathering & Functional Specs', 'SQL & Data Querying', 'Business Process Modeling (BPMN)', 'Excel Financial Modeling', 'Agile Product Management', 'Stakeholder Communication'],
        salary: 104000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Product Analyst',
        mainly_learn: ['Product Analytics (Mixpanel/Amplitude)', 'SQL & Metric Funnel Analysis', 'A/B Testing & Statistical Analysis', 'Feature Performance Tracking', 'Tableau Dashboards'],
        salary: 106000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'IT Consultant',
        mainly_learn: ['Enterprise ERP Systems (SAP/Oracle)', 'Cloud Business Solutions', 'System Integration & Middleware', 'IT Strategy & Governance', 'Digital Transformation Frameworks'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Data Analyst',
        mainly_learn: ['SQL & Data Warehousing', 'Python for Business Analytics', 'Power BI & Tableau', 'Descriptive & Diagnostic Analytics', 'Financial & Operational Reporting'],
        salary: 98000,
        demand: 'High',
        exp: 0
      }
    ]
  },
  CSIT: {
    branch_name: 'Computer Science & Information Technology (CS & IT)',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Software Developer',
        mainly_learn: ['Core Programming (Java/Python)', 'Data Structures & Algorithms', 'DBMS & SQL', 'Web Application Frameworks', 'Git & CI/CD', 'API Development'],
        salary: 110000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Systems Engineer',
        mainly_learn: ['Linux System Administration', 'Operating Systems Internals', 'Networking & Subnetting', 'Shell & Python Automation', 'Virtualization & Cloud Infrastructure'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Cloud Engineer',
        mainly_learn: ['AWS / Azure / GCP Fundamentals', 'Docker & Kubernetes', 'Infrastructure as Code (Terraform)', 'Cloud Networking & VPCs', 'CI/CD Automation'],
        salary: 122000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'IT Analyst',
        mainly_learn: ['SQL Analytical Querying', 'Python Data Processing', 'Business Systems Integration', 'Data Visualization (Power BI)', 'IT Process Optimization'],
        salary: 95000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Network Engineer',
        mainly_learn: ['TCP/IP Network Stack', 'Routing & Switching Configuration', 'Network Troubleshooting', 'Firewalls & Security Appliances', 'Network Monitoring & Automation'],
        salary: 104000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  SE: {
    branch_name: 'Software Engineering',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Software Engineer',
        mainly_learn: ['Data Structures & Algorithms', 'Design Patterns & Clean Code', 'Java / Python / C++', 'DBMS & SQL', 'Unit Testing & Refactoring', 'Git Flow'],
        salary: 115000,
        demand: 'Extremely High',
        exp: 0
      },
      {
        title: 'Application Developer',
        mainly_learn: ['Full-Stack Application Architecture', 'Frontend & Backend Frameworks', 'API Integration', 'Database Schema Design', 'Continuous Integration', 'App Security'],
        salary: 110000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'DevOps Engineer',
        mainly_learn: ['Linux CLI & Scripting', 'Docker & Containerization', 'Kubernetes Cluster Management', 'CI/CD Pipelines (GitHub Actions/Jenkins)', 'Terraform & Cloud Infra', 'Observability & Monitoring'],
        salary: 126000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'QA Engineer',
        mainly_learn: ['Software Testing Methodologies', 'Test Automation (Selenium / Playwright / Cypress)', 'API Testing (Postman / REST Assured)', 'Performance Testing (JMeter)', 'Defect Tracking & CI/CD'],
        salary: 96000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Software Architect',
        mainly_learn: ['Microservices Architecture', 'Distributed Systems Design', 'Domain-Driven Design (DDD)', 'High Availability & Fault Tolerance', 'System Scalability & Performance Tuning', 'Tech Stack Evaluation'],
        salary: 145000,
        demand: 'Extremely High',
        exp: 2
      }
    ]
  },
  CE: {
    branch_name: 'Computer Engineering',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Software Engineer',
        mainly_learn: ['Data Structures & Algorithms', 'C++ / Java / Python', 'Computer Systems Architecture', 'DBMS & SQL', 'Operating Systems', 'Git & Software Tooling'],
        salary: 114000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Systems Engineer',
        mainly_learn: ['Operating Systems & Kernels', 'Linux Systems Programming', 'Computer Architecture & Assembly', 'Networking Protocols', 'Device Drivers & Low-level C'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Network Engineer',
        mainly_learn: ['TCP/IP Network Architecture', 'Routing & Switching (BGP, OSPF)', 'Network Packet Inspection (Wireshark)', 'Socket Programming', 'Network Hardware Configuration'],
        salary: 102000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Hardware Engineer',
        mainly_learn: ['Digital Electronics & Logic Design', 'Computer Architecture & Microprocessors', 'Verilog HDL & FPGA Synthesis', 'PCB Schematic & Layout', 'Hardware Testing & Signal Integrity'],
        salary: 118000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Embedded Engineer',
        mainly_learn: ['Embedded C/C++', 'Microcontrollers (ARM Cortex)', 'RTOS Principles', 'Hardware Peripherals (SPI/I2C/UART/DMA)', 'JTAG In-Circuit Debugging'],
        salary: 115000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  CLOUD: {
    branch_name: 'Cloud Computing',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Cloud Engineer',
        mainly_learn: ['Cloud Fundamentals (AWS/Azure/GCP)', 'Linux System Administration', 'Docker & Containers', 'Kubernetes Basics', 'Terraform Infrastructure as Code', 'Cloud Storage & Networking'],
        salary: 124000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Cloud Architect',
        mainly_learn: ['Multi-Cloud & Hybrid Architectures', 'High-Availability Distributed Systems', 'Cloud Cost Optimization (FinOps)', 'Enterprise Cloud Migration', 'Zero-Trust Cloud Security Design'],
        salary: 145000,
        demand: 'Extremely High',
        exp: 2
      },
      {
        title: 'DevOps Engineer',
        mainly_learn: ['CI/CD Pipeline Automation', 'Docker & Kubernetes Orchestration', 'Infrastructure as Code (Terraform/Ansible)', 'GitOps & ArgoCD', 'Linux Shell Scripting'],
        salary: 125000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Cloud Security Engineer',
        mainly_learn: ['Cloud IAM & Least Privilege', 'Cloud Security Posture Management (CSPM)', 'Encryption at Rest & in Transit', 'VPC Network Security & Web Application Firewalls', 'Compliance & Auditing'],
        salary: 132000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Site Reliability Engineer',
        mainly_learn: ['SLOs, SLAs & Error Budgets', 'Prometheus & Grafana Observability', 'Incident Management & Postmortems', 'Chaos Engineering', 'Automated Self-Healing Infrastructure'],
        salary: 130000,
        demand: 'Extremely High',
        exp: 1
      }
    ]
  },
  BLOCKCHAIN: {
    branch_name: 'Blockchain Technology',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Blockchain Developer',
        mainly_learn: ['Blockchain Architecture & Consensus', 'Solidity Smart Contracts', 'Ethereum & EVM Mechanics', 'Web3.js / Ethers.js', 'Hardhat & Foundry Testing'],
        salary: 130000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Web3 Developer',
        mainly_learn: ['JavaScript & TypeScript', 'React Web3 UI Integration', 'Smart Contract Interactions', 'Wallet Integrations (MetaMask/WalletConnect)', 'IPFS & Decentralized Storage'],
        salary: 120000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Smart Contract Developer',
        mainly_learn: ['Advanced Solidity Programming', 'ERC Standards (ERC-20, ERC-721, ERC-1155)', 'Smart Contract Security & Reentrancy Audits', 'Gas Optimization in EVM Opcodes', 'Foundry Unit Testing'],
        salary: 135000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Blockchain Engineer',
        mainly_learn: ['Distributed Consensus Algorithms (PoS, Raft)', 'Cryptography (Elliptic Curves, Zero-Knowledge Proofs)', 'Systems Programming (Rust / Go)', 'P2P Networking Protocols', 'Layer-2 Rollup Architecture'],
        salary: 138000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'DApp Developer',
        mainly_learn: ['Full-Stack Decentralized Applications', 'Frontend (Next.js/React)', 'Smart Contract Backend (Solidity)', 'Oracle Integration (Chainlink)', 'The Graph Subgraphs & Indexing'],
        salary: 125000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },

  // ==========================================
  // ⚡ ELECTRICAL & ELECTRONICS (8 Branches)
  // ==========================================
  EEE: {
    branch_name: 'Electrical and Electronics Engineering (EEE)',
    category: 'Electrical & Electronics',
    goals: [
      {
        title: 'Electrical Engineer',
        mainly_learn: ['Circuit Theory & Analysis', 'Electrical Machines (Motors/Generators)', 'Power Systems Engineering', 'Control Systems Theory', 'MATLAB & Simulink'],
        salary: 104000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Power Systems Engineer',
        mainly_learn: ['Power Generation & Transmission', 'Load Flow & Short Circuit Analysis', 'ETAP / PowerWorld Simulation', 'Protective Relaying & Switchgear', 'Grid Code Standards'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Control Engineer',
        mainly_learn: ['Linear Control Theory & State Space', 'PID Controller Tuning', 'MATLAB / Simulink Dynamic Modeling', 'PLC Programming', 'Sensor & Actuator Interfacing'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Renewable Energy Engineer',
        mainly_learn: ['Power Electronics (Inverters/Converters)', 'Solar PV & Wind Energy Systems', 'Battery Energy Storage Systems (BESS)', 'Microgrid Integration', 'Grid Interconnection Standards'],
        salary: 110000,
        demand: 'Explosive Growth',
        exp: 0.5
      },
      {
        title: 'Electrical Design Engineer',
        mainly_learn: ['AutoCAD Electrical', 'Substation Layout & Single Line Diagrams', 'Cable Sizing & Voltage Drop Calculations', 'Panel Design & Switchgear', 'NEC / IEC Electrical Standards'],
        salary: 106000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  ECE: {
    branch_name: 'Electronics and Communication Engineering (ECE)',
    category: 'Electrical & Electronics',
    goals: [
      {
        title: 'Electronics Engineer',
        mainly_learn: ['Analog & Digital Electronics', 'Circuit Simulation (SPICE/LTspice)', 'Microprocessors & Microcontrollers', 'PCB Design & Prototyping (KiCad)', 'Testing & Debugging'],
        salary: 106000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Embedded Engineer',
        mainly_learn: ['Embedded C/C++', 'Microcontrollers (STM32/ESP32)', 'Hardware Communication Protocols (I2C/SPI/UART)', 'Real-Time Operating Systems (RTOS)', 'Oscilloscope Signal Debugging'],
        salary: 114000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Communication Engineer',
        mainly_learn: ['Signals & Systems', 'Digital Signal Processing (DSP)', 'Wireless & Cellular Communications (5G/6G)', 'Information Theory & Modulation', 'RF Transmission Lines'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'VLSI Engineer',
        mainly_learn: ['Digital Logic Design', 'Verilog / SystemVerilog HDL', 'RTL Design & Synthesis', 'CMOS Circuit Fundamentals', 'Static Timing Analysis Basics'],
        salary: 126000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'RF Engineer',
        mainly_learn: ['Radio Frequency Circuit Design', 'Smith Chart Impedance Matching', 'Antenna Design & Electromagnetic Fields', 'HFSS / CST Microwave Studio', 'Vector Network Analyzers (VNA)'],
        salary: 122000,
        demand: 'High',
        exp: 1.5
      }
    ]
  },
  EIE: {
    branch_name: 'Electronics and Instrumentation Engineering (EIE)',
    category: 'Electrical & Electronics',
    goals: [
      {
        title: 'Instrumentation Engineer',
        mainly_learn: ['Sensors & Transducers', 'Measurement Systems & Calibration', 'Piping & Instrumentation Diagrams (P&ID)', 'Industrial Transmitters (4-20mA)', 'Signal Conditioning'],
        salary: 102000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Control Systems Engineer',
        mainly_learn: ['Closed-Loop Feedback Control', 'PID Controller Auto-Tuning', 'MATLAB / Simulink', 'Industrial Process Dynamics', 'Distributed Control Systems (DCS)'],
        salary: 106000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Automation Engineer',
        mainly_learn: ['PLC Programming (Ladder & Structured Text)', 'SCADA & HMI Design', 'Industrial Fieldbuses (Modbus/Profibus)', 'Variable Frequency Drives (VFD)', 'Process Automation Workflows'],
        salary: 110000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Process Control Engineer',
        mainly_learn: ['Chemical & Industrial Process Simulation', 'DCS Architecture & Redundancy', 'Safety Instrumented Systems (SIS/SIL)', 'Alarm Management', 'Field Transmitter Calibration'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Instrumentation Design Engineer',
        mainly_learn: ['Instrument Hook-up Diagrams', 'Control Valve Sizing & Orifice Plates', 'Hazardous Area Classification (ATEX/IECEx)', 'Smart Field Devices (HART/Foundation Fieldbus)', 'AutoCAD P&ID'],
        salary: 108000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  ELECTRONICS: {
    branch_name: 'Electronics Engineering',
    category: 'Electrical & Electronics',
    goals: [
      {
        title: 'Electronics Engineer',
        mainly_learn: ['Analog & Digital Circuit Theory', 'Semiconductor Devices & Diode/BJT/MOSFET Circuits', 'SPICE Modeling', 'Power Supply & Voltage Regulator Design', 'Laboratory Bench Testing'],
        salary: 106000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Embedded Engineer',
        mainly_learn: ['Embedded C/C++', 'Microcontroller Architectures', 'Device Drivers & Hardware Registers', 'SPI, I2C, UART, CAN Protocols', 'Logic Analyzer Bus Tracing'],
        salary: 114000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Hardware Engineer',
        mainly_learn: ['Schematic Capture & PCB Layout (KiCad/Altium)', 'Component Selection & BOM Costing', 'Thermal Management & Heat Sinks', 'EMC / EMI Compliance Testing', 'Hardware Bring-up & Soldering'],
        salary: 116000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Electronics Design Engineer',
        mainly_learn: ['Mixed-Signal Circuit Design', 'High-Speed Digital Layout Guidelines', 'Power Electronics Topologies', 'Microcontroller Integration', 'Design for Manufacturing (DFM)'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Electronics Test Engineer',
        mainly_learn: ['Automated Test Equipment (ATE)', 'LabVIEW & Python Hardware Automation', 'Environmental Stress Screening (ESS)', 'Signal Integrity & Noise Measurement', 'Failure Analysis & Root Cause'],
        salary: 104000,
        demand: 'Steady',
        exp: 0.5
      }
    ]
  },
  VLSI: {
    branch_name: 'VLSI Design',
    category: 'Electrical & Electronics',
    goals: [
      {
        title: 'VLSI Engineer',
        mainly_learn: ['Digital Integrated Circuit Design', 'Verilog / SystemVerilog', 'CMOS Transistor Physics', 'RTL Coding & Simulation', 'EDA Tool Flows (Cadence/Synopsys)'],
        salary: 128000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'RTL Design Engineer',
        mainly_learn: ['SystemVerilog for Design', 'Finite State Machine (FSM) Synthesis', 'Computer Architecture & Pipeline Design', 'Clock Domain Crossing (CDC) Analysis', 'Low-Power RTL Design (UPF)'],
        salary: 132000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'ASIC Engineer',
        mainly_learn: ['ASIC Synthesis & Logic Equivalence', 'Design For Testability (DFT & Scan Insertion)', 'Standard Cell Characterization', 'Power, Performance, Area (PPA) Tradeoffs', 'Tapeout Flow'],
        salary: 135000,
        demand: 'Extremely High',
        exp: 1.5
      },
      {
        title: 'Verification Engineer',
        mainly_learn: ['SystemVerilog & Universal Verification Methodology (UVM)', 'Coverage-Driven Functional Verification', 'Assertion-Based Verification (SVA)', 'Constrained Random Testing', 'Testbench Architecture'],
        salary: 130000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Physical Design Engineer',
        mainly_learn: ['Floorplanning & Power Grid Synthesis', 'Placement & Clock Tree Synthesis (CTS)', 'Routing & Design Rule Checking (DRC/LVS)', 'Static Timing Analysis (STA) Slack Fixing', 'Cadence Innovus / Synopsys ICC2'],
        salary: 136000,
        demand: 'Extremely High',
        exp: 1.5
      }
    ]
  },
  EMBEDDED: {
    branch_name: 'Embedded Systems',
    category: 'Electrical & Electronics',
    goals: [
      {
        title: 'Embedded Engineer',
        mainly_learn: ['Embedded C/C++', 'Microcontroller Architecture (ARM Cortex-M)', 'Peripheral Interfacing (ADC, DAC, PWM)', 'I2C, SPI, UART Communication', 'Memory-Mapped I/O'],
        salary: 114000,
        demand: 'Extremely High',
        exp: 0.5
      },
      {
        title: 'Firmware Engineer',
        mainly_learn: ['Low-Level Hardware Drivers (DMA, Timers)', 'Bare-Metal & RTOS Programming', 'Bootloader Development & Memory Layouts', 'Hardware Debugging via JTAG/SWD', 'Power Optimization & Sleep Modes'],
        salary: 120000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Embedded Software Developer',
        mainly_learn: ['Embedded Linux & Kernel Modules', 'C++ Object-Oriented Embedded Design', 'Device Tree Configuration & Yocto Project', 'POSIX Multithreading', 'Network Sockets in Embedded Linux'],
        salary: 118000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'IoT Engineer',
        mainly_learn: ['Embedded Networking & WiFi/BLE Stacks', 'MQTT / CoAP Protocol Handlers', 'Sensor Node Energy Harvesting', 'Secure Over-The-Air (OTA) Updates', 'Cloud IoT Gateway Integration'],
        salary: 115000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Embedded Systems Architect',
        mainly_learn: ['Hardware-Software Codesign', 'SoC & Microprocessor Selection', 'Safety-Critical Standards (ISO 26262/MISRA C)', 'Fault-Tolerant RTOS Architecture', 'System Timing & Latency Guarantees'],
        salary: 140000,
        demand: 'Extremely High',
        exp: 2
      }
    ]
  },
  EE: {
    branch_name: 'Electrical Engineering',
    category: 'Electrical & Electronics',
    goals: [
      {
        title: 'Power Engineer',
        mainly_learn: ['Power Generation, Transmission & Distribution', 'Transformer & Switchgear Engineering', 'Load Flow & Short-Circuit Analysis (ETAP)', 'Relay Coordination', 'Grid Reliability'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Electrical Design Engineer',
        mainly_learn: ['AutoCAD Electrical & EPLAN', 'Low & Medium Voltage Distribution Systems', 'Panel Board & MCC Design', 'Lighting & Earthing Calculation', 'IEEE & IEC Standards'],
        salary: 106000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Control Engineer',
        mainly_learn: ['Industrial Motor Drives (VFD / Inverters)', 'Closed-Loop Feedback Systems', 'PLC & SCADA Interfacing', 'Sensor & Transducer Integration', 'PID Loop Tuning'],
        salary: 110000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Energy Engineer',
        mainly_learn: ['Energy Efficiency & Audit (ASHRAE/BEE)', 'Renewable Power Integration (Solar/Wind)', 'Power Factor Correction & Harmonics', 'Energy Storage & Microgrids', 'LCOE Economics'],
        salary: 108000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Electrical Systems Engineer',
        mainly_learn: ['Complex High-Voltage System Design', 'Substation Automation (IEC 61850)', 'HVDC Transmission Principles', 'Power System Stability & Transients', 'Grid Protection & SCADA Integration'],
        salary: 115000,
        demand: 'High',
        exp: 1.5
      }
    ]
  },
  ICE: {
    branch_name: 'Instrumentation & Control Engineering',
    category: 'Electrical & Electronics',
    goals: [
      {
        title: 'Instrumentation Engineer',
        mainly_learn: ['Process Sensors (Pressure, Temperature, Flow, Level)', 'Signal Conditioning & 4-20mA Loops', 'Piping and Instrumentation Diagrams (P&ID)', 'Calibration Standards', 'Smart Field Devices (HART)'],
        salary: 108000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Control Engineer',
        mainly_learn: ['Classical & Modern Control Theory', 'Dynamic Process Modeling (MATLAB/Simulink)', 'PID Controller Tuning', 'Feedback & Feedforward Control', 'State-Space Representations'],
        salary: 110000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Automation Engineer',
        mainly_learn: ['PLC Programming (Siemens/Rockwell)', 'SCADA & Industrial HMIs', 'Industrial Fieldbuses (Modbus/Profinet)', 'Control Panel Wiring & Layout', 'VFD Motor Control'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Process Control Engineer',
        mainly_learn: ['Distributed Control Systems (DCS - Emerson/Yokogawa)', 'Closed-Loop Process Optimization', 'Safety Instrumented Systems (SIS/SIL)', 'Emergency Shutdown (ESD) Logic', 'Process Historians'],
        salary: 115000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Control Systems Engineer',
        mainly_learn: ['Advanced Process Control (APC) & Model Predictive Control (MPC)', 'System Identification & Transfer Functions', 'Industrial Cyber-Physical Security', 'Real-Time Automation Networks', 'System Redundancy'],
        salary: 114000,
        demand: 'High',
        exp: 1
      }
    ]
  },

  // ==========================================
  // ⚙️ MECHANICAL & RELATED (8 Branches)
  // ==========================================
  MECH: {
    branch_name: 'Mechanical Engineering',
    category: 'Mechanical & Related',
    goals: [
      {
        title: 'Mechanical Engineer',
        mainly_learn: ['Engineering Mechanics', 'Thermodynamics & Heat Transfer', 'Mechanics of Materials', 'Manufacturing Processes', 'CAD Parametric Modeling', 'Fluid Mechanics'],
        salary: 98000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Design Engineer',
        mainly_learn: ['3D Solid Modeling (SolidWorks/Creo/CATIA)', 'Geometric Dimensioning & Tolerancing (GD&T)', 'Machine Element Design (Gears, Bearings, Shafts)', 'Finite Element Analysis (FEA)', 'Design for Manufacturing & Assembly (DFMA)'],
        salary: 104000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Manufacturing Engineer',
        mainly_learn: ['CNC Machining & CAM Programming', 'Metal Cutting & Forming Processes', 'Lean Manufacturing & 5S', 'Tool & Fixture Design', 'Statistical Quality Control'],
        salary: 100000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Thermal Engineer',
        mainly_learn: ['Thermodynamic Cycles (Rankine/Brayton)', 'Heat Exchanger Design', 'Computational Fluid Dynamics (ANSYS Fluent)', 'Conduction, Convection & Radiation', 'HVAC & Thermal Management'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Maintenance Engineer',
        mainly_learn: ['Total Productive Maintenance (TPM)', 'Vibration Analysis & Condition Monitoring', 'Hydraulic & Pneumatic Systems Maintenance', 'Root Cause Failure Analysis', 'Reliability-Centered Maintenance'],
        salary: 96000,
        demand: 'Steady',
        exp: 0.5
      }
    ]
  },
  MECHATRONICS: {
    branch_name: 'Mechatronics Engineering',
    category: 'Mechanical & Related',
    goals: [
      {
        title: 'Mechatronics Engineer',
        mainly_learn: ['Mechanical Design & Linkages', 'Sensors & Actuators Interfacing', 'Microcontroller Programming (C/C++)', 'Feedback Control Systems', 'Electro-Mechanical Prototyping'],
        salary: 106000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Robotics Engineer',
        mainly_learn: ['Robot Kinematics & Dynamics (D-H Matrices)', 'ROS & ROS 2 Architecture', 'Servo Motors & Encoders', 'Python & C++ Motion Planning', 'Sensor Fusion & Computer Vision'],
        salary: 118000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Automation Engineer',
        mainly_learn: ['PLC Programming & Ladder Logic', 'SCADA & HMI Development', 'Pneumatics & Electro-Hydraulics', 'Industrial Communication Protocols', 'Safety Circuits & Interlocks'],
        salary: 110000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Control Engineer',
        mainly_learn: ['Control Theory (PID, State-Space)', 'MATLAB / Simulink Dynamic Simulation', 'System Identification', 'Motion Controllers & Driver Tuning', 'Sensor Noise Filtering (Kalman)'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Systems Engineer',
        mainly_learn: ['Cross-Discipline System Integration (Mech/Elec/Software)', 'System Verification & Validation (V-Model)', 'Requirement Engineering & FMEA', 'Model-Based Systems Engineering (SysML)', 'Hardware-in-the-Loop (HIL) Testing'],
        salary: 114000,
        demand: 'High',
        exp: 1.5
      }
    ]
  },
  AUTO: {
    branch_name: 'Automobile Engineering',
    category: 'Mechanical & Related',
    goals: [
      {
        title: 'Automotive Engineer',
        mainly_learn: ['Internal Combustion & Hybrid Powertrains', 'Vehicle Dynamics & Handling', 'Chassis & Suspension Engineering', 'CAD Automotive Modeling', 'Automotive Materials'],
        salary: 102000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Vehicle Design Engineer',
        mainly_learn: ['Body-in-White (BIW) Design', 'CATIA / SolidWorks Surface Modeling', 'Crashworthiness & Crash Simulation (LS-DYNA)', 'Aerodynamic Drag Analysis', 'GD&T & Stamping Feasibility'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'EV Engineer',
        mainly_learn: ['Electric Vehicle Powertrain Architecture', 'Lithium-Ion Battery Systems & Sizing', 'Battery Management Systems (BMS)', 'Traction Inverters & Permanent Magnet Motors', 'Regenerative Braking Systems'],
        salary: 122000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'Automotive Systems Engineer',
        mainly_learn: ['CAN, LIN & Ethernet Bus Telemetry', 'Electronic Control Units (ECU) Calibration', 'AUTOSAR Architecture Fundamentals', 'Automotive Sensors & Actuators', 'Model-Based Development (Simulink)'],
        salary: 114000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Vehicle Dynamics Engineer',
        mainly_learn: ['Tire Mechanics & Pacejka Model', 'Suspension Kinematics & Ride Quality', 'Multi-Body Dynamics (Adams Car)', 'Steering Dynamics & Stability Control', 'Vehicle Track Testing & Telemetry Analysis'],
        salary: 116000,
        demand: 'High',
        exp: 1.5
      }
    ]
  },
  ROBOTICS: {
    branch_name: 'Robotics Engineering',
    category: 'Mechanical & Related',
    goals: [
      {
        title: 'Robotics Engineer',
        mainly_learn: ['Forward & Inverse Kinematics', 'ROS 2 Framework & Gazebo Simulation', 'Python / C++ Programming', 'Actuators, Harmonic Drives & Grippers', 'Trajectory Planning & PID Motion Control'],
        salary: 118000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Robot Programmer',
        mainly_learn: ['Industrial Robot Arm Programming (KUKA KRL / ABB RAPID / Fanuc TP)', 'RoboDK Offline Simulation', 'Tool Center Point (TCP) Calibration', 'Safety Zones & Interlocks', 'Workcell Integration'],
        salary: 105000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Automation Engineer',
        mainly_learn: ['PLC Integration with Robotic Workcells', 'Industrial Grippers & End-Effectors', 'Machine Vision Inspection (OpenCV)', 'Safety PLCs & Light Curtains', 'Assembly Line Robot Coordination'],
        salary: 110000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Robotics Software Engineer',
        mainly_learn: ['C++ Systems Programming for Robotics', 'Simultaneous Localization & Mapping (SLAM)', 'Path Planning Algorithms (A*, RRT*, DWA)', 'Computer Vision (OpenCV & Point Cloud)', 'Real-Time Linux (PREEMPT_RT)'],
        salary: 125000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'Robotics Systems Engineer',
        mainly_learn: ['Complete Autonomous Robot Architecture', 'Power & Thermal Distribution in Mobile Robots', 'Multi-Sensor Fusion (LiDAR, IMU, Depth Camera)', 'Hardware-in-the-Loop Simulation', 'Robot Reliability & Field Deployment'],
        salary: 122000,
        demand: 'Extremely High',
        exp: 1.5
      }
    ]
  },
  MFG: {
    branch_name: 'Manufacturing Engineering',
    category: 'Mechanical & Related',
    goals: [
      {
        title: 'Manufacturing Engineer',
        mainly_learn: ['Manufacturing Processes (Machining, Casting, Welding)', 'CNC G-Code & CAM Programming', 'Plant Layout & Material Handling', 'Lean Six Sigma Principles', 'Design for Manufacturing (DFM)'],
        salary: 100000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Production Engineer',
        mainly_learn: ['Production Scheduling & Capacity Planning', 'Line Balancing & Bottleneck Analysis', 'Overall Equipment Effectiveness (OEE)', 'Standard Operating Procedures (SOPs)', 'Shop Floor Management'],
        salary: 98000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Process Engineer',
        mainly_learn: ['Process Optimization & Cycle Time Reduction', 'Statistical Process Control (SPC & Cpk)', 'Root Cause Analysis & 8D Methodology', 'FMEA (Failure Mode and Effects Analysis)', 'Minitab Statistical Analysis'],
        salary: 104000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Quality Engineer',
        mainly_learn: ['ISO 9001 / IATF 16949 Standards', 'Coordinate Measuring Machines (CMM)', 'GD&T Inspection Techniques', 'Metrology & Gauge R&R', 'Defect Prevention & Quality Audits'],
        salary: 96000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Manufacturing Systems Engineer',
        mainly_learn: ['Computer Integrated Manufacturing (CIM)', 'Manufacturing Execution Systems (MES)', 'Automated Guided Vehicles & Conveyor Automation', 'Digital Factory Simulation', 'Smart Factory Industry 4.0'],
        salary: 108000,
        demand: 'High',
        exp: 1.5
      }
    ]
  },
  IE: {
    branch_name: 'Industrial Engineering',
    category: 'Mechanical & Related',
    goals: [
      {
        title: 'Industrial Engineer',
        mainly_learn: ['Work Study & Motion Economy', 'Facility Layout Design', 'Ergonomics & Human Factors', 'Operations Management', 'Cost Estimation & Engineering Economics'],
        salary: 102000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Operations Analyst',
        mainly_learn: ['Business Operations Modeling', 'Linear Programming & Simplex Algorithm', 'SQL & Data Visualization', 'Queueing Theory & Simulation (AnyLogic/FlexSim)', 'Process Flow Optimization'],
        salary: 104000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Process Engineer',
        mainly_learn: ['Value Stream Mapping (VSM)', 'Lean Six Sigma (DMAIC)', 'Continuous Improvement (Kaizen)', 'Cycle Time & Takt Time Analysis', 'Standard Work Implementation'],
        salary: 105000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Supply Chain Analyst',
        mainly_learn: ['Inventory Management (EOQ, Safety Stock, JIT)', 'Demand Forecasting & Time-Series Modeling', 'Logistics Network Optimization', 'Warehouse Management Systems (WMS)', 'ERP (SAP Supply Chain)'],
        salary: 106000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Operations Research Analyst',
        mainly_learn: ['Mathematical Optimization (Gurobi/CPLEX/Python PuLP)', 'Stochastic Modeling & Monte Carlo Simulation', 'Network Flow & Routing Algorithms', 'Decision Analysis Under Uncertainty', 'Statistical Modeling'],
        salary: 114000,
        demand: 'High',
        exp: 1.5
      }
    ]
  },
  PROD: {
    branch_name: 'Production Engineering',
    category: 'Mechanical & Related',
    goals: [
      {
        title: 'Production Engineer',
        mainly_learn: ['Production Planning & Control (PPC)', 'Assembly Line Coordination', 'Material Requirement Planning (MRP)', 'Tool & Die Sizing', 'Shop Floor Productivity'],
        salary: 98000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Manufacturing Engineer',
        mainly_learn: ['Metal Forming & Stamping Processes', 'CNC Machining (Turning & Milling)', 'CAM Toolpath Generation', 'Jigs & Fixtures Design', 'Welding & Fabrication Technology'],
        salary: 102000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Quality Engineer',
        mainly_learn: ['Quality Control Procedures', 'Sampling Plans (AQL)', 'Non-Destructive Testing (NDT)', 'Control Charts & SPC', 'Vendor Quality Management'],
        salary: 96000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Operations Engineer',
        mainly_learn: ['Plant Equipment Utilization', 'Preventive Maintenance Schedules', 'Energy & Resource Optimization', 'Industrial Safety Regulations (OSHA)', 'Operational Budgeting'],
        salary: 104000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Process Engineer',
        mainly_learn: ['Process Parametric Optimization', 'Die Casting & Injection Molding Tuning', 'Yield Improvement Studies', 'Scrap Reduction Techniques', 'Standard Operating Procedures'],
        salary: 103000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  AUTOROB: {
    branch_name: 'Automation & Robotics',
    category: 'Mechanical & Related',
    goals: [
      {
        title: 'Automation Engineer',
        mainly_learn: ['Programmable Logic Controllers (PLC)', 'SCADA & Supervisory Control', 'Sensors, Relays & Solenoids', 'Pneumatic & Hydraulic Workcells', 'Industrial Ethernet (EtherCAT/Profinet)'],
        salary: 110000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Robotics Engineer',
        mainly_learn: ['6-DOF Robot Arm Kinematics', 'RoboDK & Robot Simulation', 'ROS 2 Trajectory Generation', 'Safety Interlocks & Guarding', 'End-Effector Sizing & Design'],
        salary: 118000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Control Engineer',
        mainly_learn: ['Closed-Loop Motion Control', 'Servo Motor Tuning & Encoder Feedback', 'MATLAB Simulink Modeling', 'PID & Feedforward Controllers', 'Real-Time Automation Logic'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Industrial Automation Engineer',
        mainly_learn: ['Factory-wide Digital Twins', 'MES System Integration', 'Automated Material Handling & AGVs', 'OPC-UA Communication Standards', 'Variable Speed Drive Configuration'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Robotics Software Engineer',
        mainly_learn: ['C++ / Python for Automation', 'Machine Vision for Robot Guidance (OpenCV)', 'Obstacle Avoidance & Path Planning', 'Real-Time Edge Computing', 'ROS 2 Navigation Stack'],
        salary: 124000,
        demand: 'Explosive Growth',
        exp: 1
      }
    ]
  },

  // ==========================================
  // 🏗️ CIVIL & INFRASTRUCTURE (6 Branches)
  // ==========================================
  CIVIL: {
    branch_name: 'Civil Engineering',
    category: 'Civil & Infrastructure',
    goals: [
      {
        title: 'Civil Engineer',
        mainly_learn: ['Structural Mechanics', 'Surveying & Levelling (Total Station)', 'Concrete Technology & Construction Materials', 'Fluid Mechanics & Hydraulics', 'AutoCAD Drafting'],
        salary: 95000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Site Engineer',
        mainly_learn: ['Site Execution & Supervision', 'Bar Bending Schedules (BBS)', 'Concrete Pouring & Quality Inspection', 'Contractor Coordination', 'Site Safety & OSHA Compliance'],
        salary: 92000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Structural Engineer',
        mainly_learn: ['Structural Analysis Methods', 'RCC & Steel Structural Design (IS 456 / ACI)', 'ETABS / STAAD.Pro 3D Modeling', 'Seismic Load Calculations', 'Rebar Detailing'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Project Engineer',
        mainly_learn: ['Construction Project Management', 'Quantity Surveying & Cost Estimation (BOQ)', 'Primavera P6 / MS Project Scheduling', 'Subcontractor Management', 'Billing & Quality Auditing'],
        salary: 102000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Construction Engineer',
        mainly_learn: ['Construction Methods & Heavy Equipment', 'Formwork & Scaffolding Engineering', 'Soil Bearing & Foundation Verification', 'Precast Concrete Construction', 'Quality Assurance & Control (QA/QC)'],
        salary: 98000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  STRUCT: {
    branch_name: 'Structural Engineering',
    category: 'Civil & Infrastructure',
    goals: [
      {
        title: 'Structural Engineer',
        mainly_learn: ['Advanced Matrix Structural Analysis', 'Reinforced Concrete High-Rise Design', 'Structural Steel Framing (AISC / Eurocode)', 'Finite Element Structural Modeling (ETABS/SAP2000)', 'Wind & Seismic Response Spectra'],
        salary: 110000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Structural Designer',
        mainly_learn: ['AutoCAD & Revit Structure BIM', 'Structural Framing General Arrangements', 'Connection Detailing for Steel Structures', 'Rebar Clash Detection', 'Prestressed Concrete Design'],
        salary: 102000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Building Engineer',
        mainly_learn: ['Integrated Building Structural Systems', 'National Building Codes & Local Ordinances', 'Building Diagnostics & Deflection Checks', 'Facade & Curtain Wall Engineering', 'Structural Retrofitting & Repair'],
        salary: 104000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Construction Engineer',
        mainly_learn: ['Structural Field Erection & Shoring', 'Tolerances & Alignment Verification', 'Concrete Core Compression Testing', 'Steel Welding Inspection (NDT)', 'Site Structural Safety'],
        salary: 98000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Structural Analysis Engineer',
        mainly_learn: ['Non-linear Dynamic Pushover Analysis', 'Blast & Impact Load Modeling (ANSYS/Abaqus)', 'Base Isolation & Tuned Mass Dampers', 'Bridge Structural Analysis (CSiBridge)', 'Fatigue & Fracture Mechanics'],
        salary: 115000,
        demand: 'High',
        exp: 1.5
      }
    ]
  },
  CONST: {
    branch_name: 'Construction Technology',
    category: 'Civil & Infrastructure',
    goals: [
      {
        title: 'Construction Engineer',
        mainly_learn: ['Modern Construction Technologies', 'Concrete Pumping & Placement', 'Site Heavy Equipment Logistics', 'Site Earthwork & Grading', 'Construction Safety Protocols'],
        salary: 96000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Site Engineer',
        mainly_learn: ['Field Layout with Total Station / GPS', 'Reinforcement & Formwork Checks', 'Daily Progress Tracking & Logs', 'Material Quality Sampling', 'Contractor Supervision'],
        salary: 93000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Project Manager',
        mainly_learn: ['Critical Path Method (CPM) Scheduling', 'Primavera P6 & MS Project', 'Earned Value Management (EVM)', 'FIDIC / Construction Contracts', 'Risk Assessment & Budget Control'],
        salary: 115000,
        demand: 'High',
        exp: 2
      },
      {
        title: 'Construction Planner',
        mainly_learn: ['Baseline Schedule Formulation', 'Resource Leveling & Allocation', '4D BIM Schedule Integration', 'Delay Analysis & Time Extension Claims', 'Cash Flow Forecasting'],
        salary: 105000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'BIM Engineer',
        mainly_learn: ['Autodesk Revit Architecture & Structure', 'Navisworks Clash Detection & Reports', '5D BIM Cost Integration', 'BIM Execution Plan (BEP) Coordination', 'Point Cloud to BIM Modeling'],
        salary: 110000,
        demand: 'Extremely High',
        exp: 1
      }
    ]
  },
  ENV: {
    branch_name: 'Environmental Engineering',
    category: 'Civil & Infrastructure',
    goals: [
      {
        title: 'Environmental Engineer',
        mainly_learn: ['Environmental Chemistry & Microbiology', 'Water & Wastewater Unit Operations', 'Air Pollution Sampling & Modeling', 'Solid Waste Landfill Engineering', 'Environmental Regulations & Standards'],
        salary: 98000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Sustainability Engineer',
        mainly_learn: ['Carbon Accounting & Scope 1-3 GHG Protocol', 'Life Cycle Assessment (LCA - SimaPro)', 'LEED & Green Building Design', 'Circular Economy Principles', 'Corporate ESG Reporting'],
        salary: 106000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'Environmental Consultant',
        mainly_learn: ['Environmental Impact Assessment (EIA)', 'Phase I & II Environmental Site Assessments (ESA)', 'Regulatory Permitting & Compliance', 'Contaminated Land Remediation', 'Client Technical Reports'],
        salary: 100000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Environmental Analyst',
        mainly_learn: ['Environmental Data Analytics (R / Python)', 'GIS Spatial Mapping (ArcGIS/QGIS)', 'Hydrologic Watershed Modeling (HEC-HMS)', 'Water Quality Index Computations', 'Statistical Pollutant Tracking'],
        salary: 96000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Waste Management Engineer',
        mainly_learn: ['Hazardous & Municipal Waste Engineering', 'Anaerobic Digestion & Biogas Sizing', 'Waste-to-Energy Incineration Systems', 'Recycling Processing Facilities', ' Leachate & Landfill Gas Collection'],
        salary: 102000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  GEOTECH: {
    branch_name: 'Geotechnical Engineering',
    category: 'Civil & Infrastructure',
    goals: [
      {
        title: 'Geotechnical Engineer',
        mainly_learn: ['Soil Mechanics & Terzaghi Theory', 'Bearing Capacity & Settlement Calculations', 'Shallow & Deep Foundation Design', 'Slope Stability Analysis (SLOPE/W)', 'PLAXIS 2D/3D Finite Element Modeling'],
        salary: 106000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Soil Engineer',
        mainly_learn: ['Geotechnical Laboratory Soil Testing (Triaxial, Direct Shear)', 'Standard Penetration Testing (SPT) Logging', 'Soil Classification (USCS/AASHTO)', 'Permeability & Compaction Curves', 'Soil Stabilization Techniques'],
        salary: 98000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Foundation Engineer',
        mainly_learn: ['Driven & Bored Pile Foundation Sizing', 'Pile Group Settlement & Lateral Load Analysis', 'Mat/Raft Foundation on Elastic Subgrade', 'Retaining Wall & Sheet Pile Earth Pressures', 'Underpinning & Ground Improvement'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Site Investigation Engineer',
        mainly_learn: ['Subsurface Drilling & Core Logging', 'Cone Penetration Testing (CPT)', 'Groundwater Table Measurement & Seepage', 'Geophysical Surveys (Resistivity/Seismic)', 'Geotechnical Interpretative Reports (GIR)'],
        salary: 100000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Geotechnical Consultant',
        mainly_learn: ['Tunneling & Deep Excavation Shoring Design', 'Soil-Structure Interaction Analysis', 'Liquefaction Potential Assessment', 'Expert Geotechnical Risk Analysis', 'Forensic Geotechnical Investigations'],
        salary: 114000,
        demand: 'High',
        exp: 1.5
      }
    ]
  },
  TRANS: {
    branch_name: 'Transportation Engineering',
    category: 'Civil & Infrastructure',
    goals: [
      {
        title: 'Transportation Engineer',
        mainly_learn: ['Traffic Flow Theory & Highway Capacity Manual (HCM)', 'Transportation Planning 4-Step Models', 'GIS for Transportation Analysis', 'Pavement Design (AASHTO)', 'Public Transit Modeling'],
        salary: 102000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Highway Engineer',
        mainly_learn: ['Horizontal & Vertical Alignment Geometric Design', 'AutoCAD Civil 3D Roadway Corridors', 'Earthwork Cut/Fill Optimization', 'Highway Drainage & Culvert Sizing', 'AASHTO Green Book Guidelines'],
        salary: 100000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Traffic Engineer',
        mainly_learn: ['Traffic Signal Timing (Synchro / VISSIM)', 'Intersection Level of Service (LOS) Calculations', 'Roundabout & Interchange Design', 'Traffic Impact Studies (TIS)', 'Intelligent Transportation Systems (ITS)'],
        salary: 105000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Urban Mobility Planner',
        mainly_learn: ['Multi-Modal Transportation Network Planning', 'Active Transportation (Bicycle/Pedestrian) Infrastructure', 'Transit-Oriented Development (TOD)', 'Travel Demand Modeling (Cube/TransCAD)', 'Urban Public Transit Policy'],
        salary: 104000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Transportation Planner',
        mainly_learn: ['Regional Long-Range Transportation Plans (LRTP)', 'Cost-Benefit Analysis of Transit Corridors', 'Environmental NEPA Documentation for Highways', 'Traffic Data Big Data Analytics', 'Smart City Mobility Integration'],
        salary: 106000,
        demand: 'High',
        exp: 1
      }
    ]
  },

  // ==========================================
  // 🧪 CHEMICAL & MATERIALS (9 Branches)
  // ==========================================
  CHEM: {
    branch_name: 'Chemical Engineering',
    category: 'Chemical & Materials',
    goals: [
      {
        title: 'Chemical Engineer',
        mainly_learn: ['Chemical Reaction Engineering', 'Thermodynamics & Phase Equilibria', 'Fluid Mechanics & Transport Phenomena', 'Mass Transfer & Distillation', 'Process Flow Diagrams (PFD)'],
        salary: 104000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Process Engineer',
        mainly_learn: ['Process Simulation (Aspen Plus / HYSYS)', 'Heat Exchanger Sizing (HTRI)', 'Distillation Column Hydraulics & Trays', 'Mass & Energy Balances Convergence', 'Piping and Instrumentation Diagrams (P&ID)'],
        salary: 110000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Plant Engineer',
        mainly_learn: ['Continuous Plant Operations Management', 'Centrifugal Pumps, Compressors & Turbines', 'Shutdown & Turnaround Management', 'Plant Utilities (Steam, Cooling Water)', 'Equipment Maintenance'],
        salary: 106000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Process Safety Engineer',
        mainly_learn: ['HAZOP & What-If Process Hazard Analysis', 'Layer of Protection Analysis (LOPA)', 'Relief Valve & Rupture Disk Sizing (API 520)', 'Chemical Dispersion & Consequence Modeling', 'OSHA Process Safety Management (PSM)'],
        salary: 114000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Chemical Process Designer',
        mainly_learn: ['Front End Engineering Design (FEED)', 'Detailed Process Equipment Datasheets', 'Line Sizing & Hydraulic Calculations', 'Flare Header & Relief Network Sizing', 'Plant Debottlenecking Studies'],
        salary: 112000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  BIOTECH: {
    branch_name: 'Biotechnology',
    category: 'Chemical & Materials',
    goals: [
      {
        title: 'Biotechnologist',
        mainly_learn: ['Molecular Biology & Recombinant DNA', 'Microbiology & Cell Culture', 'Biochemistry & Enzymology', 'Analytical Bio-Techniques (ELISA, PCR)', 'Aseptic Techniques'],
        salary: 98000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Bioprocess Engineer',
        mainly_learn: ['Fermentation Kinetics & Bioreactor Sizing', 'Oxygen Transfer (kLa) & Heat Dissipation in Vessels', 'Downstream Chromatography (FPLC/HPLC)', 'Membrane Ultrafiltration & Centrifugation', 'cGMP Cleanroom Operations'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Research Scientist',
        mainly_learn: ['Gene Cloning & CRISPR Gene Editing', 'Mammalian & Microbial Cell Line Development', 'Experimental Assay Development', 'Statistical Data Analysis (R / GraphPad)', 'Scientific Manuscript Preparation'],
        salary: 116000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Biotech Analyst',
        mainly_learn: ['Biological Big Data Processing', 'Next-Gen Sequencing (NGS) Alignment', 'Bioinformatics Databases (NCBI / UniProt)', 'Biopharmaceutical Pipeline Market Analytics', 'Clinical Trial Data Evaluation'],
        salary: 102000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Quality Control Specialist',
        mainly_learn: ['Biopharmaceutical QC Release Testing', 'Endotoxin & Bioburden Testing', 'Stability Studies (ICH Guidelines)', 'Analytical Method Validation', 'Good Documentation Practices (GDP)'],
        salary: 100000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  BIOINFO: {
    branch_name: 'Bioinformatics',
    category: 'Chemical & Materials',
    goals: [
      {
        title: 'Bioinformatics Scientist',
        mainly_learn: ['Genomics & Transcriptomics Pipelines', 'Python (Biopython) & R (Bioconductor)', 'Sequence Alignment Algorithms (BLAST/Bowtie)', 'Statistical Genetics & GWAS', 'Variant Calling & Annotation'],
        salary: 122000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Computational Biologist',
        mainly_learn: ['Mathematical Biology & Network Models', 'Structural Bioinformatics & AlphaFold Modeling', 'Molecular Dynamics Simulation (GROMACS)', 'Machine Learning in Genomics', 'Differential Gene Expression (DESeq2)'],
        salary: 125000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Genomics Analyst',
        mainly_learn: ['Next-Generation Sequencing (NGS - Illumina/PacBio)', 'Single-Cell RNA-Seq Analysis (Seurat)', 'GATK Best Practices Pipeline', 'Clinical Genomic Variant Curation', 'Cancer Genomics & Neoantigen Discovery'],
        salary: 118000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Bioinformatics Engineer',
        mainly_learn: ['Workflow Orchestration (Nextflow / Snakemake)', 'Cloud Genomics Platforms (AWS Omics/DNAnexus)', 'Containerized Pipelines (Docker/Singularity)', 'High-Performance Computing (HPC / SLURM)', 'Biological Database Design'],
        salary: 124000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Biomedical Data Scientist',
        mainly_learn: ['Clinical Health Records (EHR) Analytics', 'Biomedical Machine Learning (PyTorch/Scikit-Learn)', 'Survival Analysis & Clinical Endpoints', 'Medical Imaging Feature Extraction', 'Multi-Omics Data Integration'],
        salary: 126000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  BIOMED: {
    branch_name: 'Biomedical Engineering',
    category: 'Chemical & Materials',
    goals: [
      {
        title: 'Biomedical Engineer',
        mainly_learn: ['Human Physiology for Engineers', 'Biomedical Electronic Instrumentation', 'Biosignal Processing (ECG/EEG/EMG)', 'Biomaterials Science', 'CAD for Medical Devices'],
        salary: 104000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Medical Device Engineer',
        mainly_learn: ['ISO 13485 & FDA 510(k) Medical Regulations', 'Design Controls & Risk Management (ISO 14971)', 'Medical Microcontroller Hardware Integration', 'Electromagnetic Compatibility for Medical Equipment (IEC 60601)', 'Design Verification Protocols'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Clinical Engineer',
        mainly_learn: ['Hospital Medical Equipment Management', 'Preventive Maintenance of ICU & Imaging Units', 'Clinical Technology Assessment', 'Medical Device Incident Investigation', 'Hospital Network Telemetry Integration'],
        salary: 98000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Healthcare Technology Specialist',
        mainly_learn: ['DICOM & HL7 Healthcare Interoperability', 'Electronic Health Record (EHR) Interfacing', 'Telehealth & Remote Patient Monitoring Devices', 'PACS Medical Imaging Systems', 'Cybersecurity in Medical Devices'],
        salary: 106000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Biomedical Researcher',
        mainly_learn: ['Biomechanics & Musculoskeletal FEA Modeling', 'Tissue Engineering & Biocompatibility (ISO 10993)', 'Implantable Biosensors Development', 'In Vitro & Animal Study Protocols', 'Translational Biomedical Research'],
        salary: 110000,
        demand: 'High',
        exp: 1.5
      }
    ]
  },
  BIOCHEM: {
    branch_name: 'Biochemical Engineering',
    category: 'Chemical & Materials',
    goals: [
      {
        title: 'Bioprocess Engineer',
        mainly_learn: ['Industrial Microbial Fermentation', 'Bioreactor Design, Scaling & Mass Transfer', 'Upstream Cell Culture Kinetics', 'Downstream Bio-Separations & Chromatography', 'Aseptic Manufacturing Equipment'],
        salary: 114000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Biochemical Engineer',
        mainly_learn: ['Enzyme Reaction Engineering & Biocatalysis', 'Metabolic Flux Analysis', 'Transport Phenomena in Biological Systems', 'Media Formulation & Stoichiometry', 'Process Flowsheet Modeling (SuperPro Designer)'],
        salary: 110000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Research Scientist',
        mainly_learn: ['Synthetic Biology & Pathway Engineering', 'Protein Expression & Purification', 'Bio-analytical Characterization (Mass Spec, HPLC)', 'Assay Optimization', 'Experimental DoE Methods'],
        salary: 118000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Fermentation Engineer',
        mainly_learn: ['Industrial Bioreactor Gas Sparging & Agitation', 'Fed-Batch & Continuous Fermentation Control', 'Process Analytical Technology (PAT) Probes', 'Sterilization Kinetics (HTST)', 'Scale-Up from Bench to 10,000L'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Bioprocess Development Engineer',
        mainly_learn: ['Quality by Design (QbD) in Biologics', 'Process Characterization & Parameter Space', 'Tangential Flow Filtration (TFF)', 'Viral Clearance & Filtration Studies', 'Tech Transfer to Commercial Manufacturing'],
        salary: 116000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  MAT: {
    branch_name: 'Materials Science & Engineering',
    category: 'Chemical & Materials',
    goals: [
      {
        title: 'Materials Engineer',
        mainly_learn: ['Crystal Structure & Defects', 'Mechanical Properties & Tensile Testing', 'Phase Diagrams & Transformations', 'Materials Selection (CES EduPack)', 'Corrosion Science & Coatings'],
        salary: 106000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Materials Scientist',
        mainly_learn: ['Solid State Physics & Quantum Chemistry', 'Materials Synthesis (CVD/PVD/Sol-Gel)', 'Spectroscopy & Characterization', 'Nanomaterials & Quantum Dots', 'Computational Materials Design (DFT)'],
        salary: 112000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Metallurgy Engineer',
        mainly_learn: ['Extractive & Physical Metallurgy', 'Heat Treatment of Steels & Non-Ferrous Alloys', 'Metallography & Optical Microscopy', 'Foundry Casting & Solidification', 'Fracture Mechanics & Fatigue'],
        salary: 104000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'R&D Engineer',
        mainly_learn: ['Advanced Composite Materials (CFRP)', 'High-Entropy Alloys & Superalloys', 'Design of Experiments (DoE)', 'Prototype Material Fabrication', 'Intellectual Property & Patent Search'],
        salary: 114000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Materials Characterization Engineer',
        mainly_learn: ['Scanning Electron Microscopy (SEM / EDS)', 'X-Ray Diffraction (XRD) Peak Analysis', 'Thermal Analysis (DSC / TGA / DMA)', 'Atomic Force Microscopy (AFM)', 'Metallurgical Failure Investigation'],
        salary: 108000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  POLYMER: {
    branch_name: 'Polymer Engineering',
    category: 'Chemical & Materials',
    goals: [
      {
        title: 'Polymer Engineer',
        mainly_learn: ['Polymer Chemistry & Polymerization Reactions', 'Structure-Property Relationships in Polymers', 'Polymer Compounding & Additives', 'Thermal Transitions (Tg & Tm)', 'Polymer Mechanical Testing'],
        salary: 105000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Plastics Engineer',
        mainly_learn: ['Plastic Injection Molding Process & Sizing', 'Moldflow Simulation & Gate Location', 'Extrusion & Blow Molding Operations', 'Plastic Part Design & Snap-Fits', 'Thermoforming & Tooling'],
        salary: 106000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Materials Engineer',
        mainly_learn: ['Engineering Thermoplastics & Thermosets', 'Elastomers & Rubber Vulcanization', 'Fiber-Reinforced Polymer Composites', 'Polymer Blend Morphology', 'Degradation & Weathering Testing'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Polymer Scientist',
        mainly_learn: ['Advanced Polymer Characterization (GPC/SEC, FTIR, NMR)', 'Biodegradable & Bio-based Polymers', 'Conductive & Smart Polymers', 'Polymer Nanocomposites', 'R&D Formulation Development'],
        salary: 112000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Polymer Process Engineer',
        mainly_learn: ['Extrusion Die Design & Rheological Pressure Drops', 'Melt Flow Index (MFI) & Viscoelasticity', 'Process Parameter Optimization (DoE)', 'Quality Control in Plastic Manufacturing', 'Recycling & Circular Plastics Processing'],
        salary: 107000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  FOOD: {
    branch_name: 'Food Technology',
    category: 'Chemical & Materials',
    goals: [
      {
        title: 'Food Technologist',
        mainly_learn: ['Food Chemistry & Nutrient Degradation', 'Food Microbiology & Spoilage Prevention', 'Food Formulation & Recipe Development', 'Sensory Evaluation & Testing', 'Food Packaging Science'],
        salary: 94000,
        demand: 'Steady',
        exp: 0
      },
      {
        title: 'Food Process Engineer',
        mainly_learn: ['Thermal Sterilization & Pasteurization Kinetics (F0/D/z)', 'Food Rheology & Non-Newtonian Pipe Flow', 'Aseptic Filling & Heat Exchanger Design', 'Spray Drying & Lyophilization', 'Scale-up of Food Unit Operations'],
        salary: 102000,
        demand: 'Steady',
        exp: 1
      },
      {
        title: 'Quality Control Engineer',
        mainly_learn: ['Food Quality Assurance & Lab Testing', 'Physicochemical Analysis (Brix, pH, Water Activity)', 'Inspection of Raw Materials & Packaging', 'Good Manufacturing Practices (GMP)', 'ISO 22000 / FSSC 22000 Standards'],
        salary: 90000,
        demand: 'Steady',
        exp: 0.5
      },
      {
        title: 'Food Safety Specialist',
        mainly_learn: ['HACCP Critical Control Point Plan Implementation', 'Pathogen Detection (Salmonella, Listeria)', 'FDA Food Safety Modernization Act (FSMA)', 'Allergen Control & Sanitation Protocols', 'Food Safety Auditing'],
        salary: 96000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Food Product Development Engineer',
        mainly_learn: ['New Product Development (NPD) Stage-Gate Process', 'Ingredient Functional Interactions', 'Shelf-Life Accelerated Testing', 'Clean Label Formulation', 'Pilot Plant Prototyping & Commercialization'],
        salary: 99000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  PHARMA: {
    branch_name: 'Pharmaceutical Engineering',
    category: 'Chemical & Materials',
    goals: [
      {
        title: 'Pharmaceutical Engineer',
        mainly_learn: ['Pharmaceutical Unit Operations', 'Active Pharmaceutical Ingredient (API) Synthesis', 'Drug Delivery Systems (Oral, Injectable)', 'Cleanroom Facility Design (HVAC)', 'cGMP Regulatory Guidelines'],
        salary: 108000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Process Engineer',
        mainly_learn: ['Tablet Compression & Coating Optimization', 'Liquid Sterile Filling & Lyophilization', 'Process Analytical Technology (PAT - NIR/Raman)', 'Batch vs Continuous Granulation', 'Scale-up from Pilot to Commercial'],
        salary: 114000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Validation Engineer',
        mainly_learn: ['Equipment Qualification (DQ / IQ / OQ / PQ)', 'Cleaning Validation & Residue Limits', 'Computerized Systems Validation (CSV / 21 CFR Part 11)', 'Process Validation Protocols', 'Change Control & Deviation Management'],
        salary: 106000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Manufacturing Engineer',
        mainly_learn: ['Sterile & Non-Sterile Dosage Form Production', 'Automated Packaging & Blister Lines', 'Operational Equipment Efficiency (OEE)', 'Yield Optimization & Scrap Reduction', 'EHS & Containment of Potent Compounds'],
        salary: 104000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Pharmaceutical Quality Engineer',
        mainly_learn: ['Quality by Design (QbD / ICH Q8/Q9/Q10)', 'Out-of-Specification (OOS) Root Cause Investigations', 'CAPA (Corrective and Preventive Action)', 'Batch Production Record Review', 'Regulatory Audit Preparation (US FDA/EMA)'],
        salary: 107000,
        demand: 'High',
        exp: 1
      }
    ]
  },

  // ==========================================
  // ✈️ AEROSPACE & SPECIALIZED (11 Branches)
  // ==========================================
  AERO: {
    branch_name: 'Aerospace Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Aerospace Engineer',
        mainly_learn: ['Incompressible & Compressible Aerodynamics', 'Flight Mechanics & Aircraft Performance', 'Aerospace Structural Analysis', 'Rocket & Jet Propulsion Principles', 'Flight Simulation (MATLAB/Simulink)'],
        salary: 118000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Aircraft Design Engineer',
        mainly_learn: ['Conceptual Aircraft Sizing & Weight Estimation', 'CAD Airframe Modeling (CATIA)', 'Wing & Fuselage Structural Layout', 'Aeroelasticity & Flutter Calculations', 'Composite Materials in Aerospace'],
        salary: 122000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Propulsion Engineer',
        mainly_learn: ['Gas Turbine Aerothermodynamic Cycles', 'Rocket Nozzle Design (de Laval/CEA)', 'Combustion Instability & Cooling Jackets', 'Turbomachinery (Compressors/Turbines)', 'Cryogenic Propellant Handling'],
        salary: 125000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Space Systems Engineer',
        mainly_learn: ['Orbital Mechanics (Keplerian Elements / Hohmann Transfer)', 'Spacecraft Subsystem Integration (ADCS, EPS, Thermal)', 'Space Environment Radiation Hardening', 'Link Budgets & Telemetry', 'Launch Vehicle Dynamics'],
        salary: 128000,
        demand: 'Explosive Growth',
        exp: 1.5
      },
      {
        title: 'Aerodynamics Engineer',
        mainly_learn: ['Computational Fluid Dynamics (ANSYS Fluent / OpenFOAM)', 'Boundary Layer Theory & Shock Wave Analysis', 'Airfoil Lift/Drag Polar Optimization', 'Wind Tunnel Testing & PIV Instrumentation', 'Transonic & Hypersonic Flow'],
        salary: 124000,
        demand: 'Extremely High',
        exp: 1
      }
    ]
  },
  AERONAUTICAL: {
    branch_name: 'Aeronautical Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Aeronautical Engineer',
        mainly_learn: ['Atmospheric Flight Mechanics', 'Subsonic & Supersonic Aerodynamics', 'Aviation Piston & Turboprop Engines', 'Aircraft Instruments & Avionics', 'Aircraft Airworthiness Standards'],
        salary: 116000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Aircraft Design Engineer',
        mainly_learn: ['Preliminary Aircraft Sizing', 'Wing Planform Optimization', 'CAD Structural Detailing (CATIA / NX)', 'Landing Gear Kinematics', 'FAR / EASA Airworthiness Compliance'],
        salary: 121000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Flight Systems Engineer',
        mainly_learn: ['Fly-By-Wire Flight Control Laws', 'Hydraulic & Pneumatic Aircraft Actuation', 'Environmental Control Systems (ECS)', 'Fuel Distribution & CG Balancing', 'System Safety Assessment (ARP 4761)'],
        salary: 123000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Aerodynamics Engineer',
        mainly_learn: ['Computational Fluid Dynamics (CFD)', 'Airfoil Design & High-Lift Devices (Slats/Flaps)', 'Induced & Parasitic Drag Reduction', 'Wind Tunnel Data Acquisition', 'Acoustic Noise Reduction'],
        salary: 122000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Aircraft Structures Engineer',
        mainly_learn: ['Finite Element Modeling of Airframes (Nastran/Patran)', 'Fatigue & Damage Tolerance Analysis (DT)', 'Buckling of Stiffened Thin Panels', 'Fastener & Joint Strength Sizing', 'Metallic & Carbon Fiber Stress Analysis'],
        salary: 119000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  AVIONICS: {
    branch_name: 'Avionics Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Avionics Engineer',
        mainly_learn: ['Avionics Databuses (MIL-STD-1553, ARINC 429)', 'Flight Management Systems (FMS)', 'Cockpit Electronic Flight Display (EFIS)', 'DO-178C / DO-254 Aviation Certification', 'Aircraft Electrical Wiring Interconnect Systems (EWIS)'],
        salary: 120000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Flight Control Engineer',
        mainly_learn: ['Aircraft 6-DOF Equations of Motion', 'Autopilot Control Laws (Pitch/Roll/Yaw Stability Augmentation)', 'State-Space Flight Controller Tuning (MATLAB)', 'Fly-By-Wire Actuator Servo Loops', 'Hardware-in-the-Loop Flight Rig Testing'],
        salary: 124000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Embedded Systems Engineer',
        mainly_learn: ['Safety-Critical Real-Time OS (VxWorks / PikeOS)', 'Bare-Metal C/C++ on Radiation-Tolerant Microprocessors', 'Hardware-Software Interfacing for Aerospace', 'JTAG Debugging & Logic Analysis', 'Fault-Tolerant Architecture'],
        salary: 122000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Aerospace Electronics Engineer',
        mainly_learn: ['Power Distribution Units & Inverters for Aircraft', 'Electromagnetic Interference (EMI/EMC per DO-160)', 'Radar Transceivers & RF Front-Ends', 'Lightning Protection for Airborne Electronics', 'PCB Layout for High Altitude & Vibration'],
        salary: 118000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Navigation Systems Engineer',
        mainly_learn: ['Inertial Navigation Systems (INS & Ring Laser Gyros)', 'GPS / GNSS Differential Positioning', 'Kalman Filtering for Sensor Fusion', 'Terrain Referenced Navigation', 'Instrument Landing Systems (ILS / VOR / DME)'],
        salary: 126000,
        demand: 'High',
        exp: 1.5
      }
    ]
  },
  MARINE: {
    branch_name: 'Marine Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Marine Engineer',
        mainly_learn: ['Marine Two-Stroke & Four-Stroke Diesel Engines', 'Ship Auxiliary Machinery (Boilers, Compressors, Purifiers)', 'Marine Power Generation & Switchboards', 'Bilge & Ballast Piping Systems', 'IMO / MARPOL Environmental Regulations'],
        salary: 108000,
        demand: 'Steady',
        exp: 0.5
      },
      {
        title: 'Ship Machinery Engineer',
        mainly_learn: ['Propulsion Shafting & Stern Tube Bearings', 'Marine Steering Gear & Controllable Pitch Propellers', 'Marine Refrigeration & HVAC Plants', 'Vibration & Condition Monitoring at Sea', 'Machinery Overhaul & Survey Class Rules'],
        salary: 110000,
        demand: 'Steady',
        exp: 1
      },
      {
        title: 'Marine Systems Engineer',
        mainly_learn: ['Ship Automation & Engine Room Alarm Systems', 'Electro-Technical Systems at Sea', 'Ballast Water Treatment Systems (BWTS)', 'Fuel Injection & Scrubber Emission Control', 'Dynamic Positioning Systems (DP)'],
        salary: 112000,
        demand: 'Steady',
        exp: 1
      },
      {
        title: 'Marine Operations Engineer',
        mainly_learn: ['Vessel Fleet Technical Management', 'Drydocking Specifications & Budgeting', 'Bunkering Operations & Fuel Quality', 'Port State Control (PSC) Inspections', 'Safety Management System (ISM Code)'],
        salary: 106000,
        demand: 'Steady',
        exp: 1
      },
      {
        title: 'Ship Maintenance Engineer',
        mainly_learn: ['Marine Corrosion Prevention & Cathodic Protection', 'Emergency Repairs & Welding on Vessels', 'Hydraulic Winch & Crane Maintenance', 'Turbine & Turbocharger Maintenance', 'Spares Inventory & Classification Surveys'],
        salary: 102000,
        demand: 'Steady',
        exp: 0.5
      }
    ]
  },
  NAVAL: {
    branch_name: 'Naval Architecture & Ocean Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Naval Architect',
        mainly_learn: ['Ship Hull Hydrostatics & Curves of Form', 'Intact & Damage Stability (GZ Curves per IMO)', 'Vessel Resistance & Propeller Propulsion Sizing', 'Maxsurf / Rhino 3D Hull Modeling', 'Classification Rules (DNV / ABS / Lloyd’s)'],
        salary: 115000,
        demand: 'Steady',
        exp: 1
      },
      {
        title: 'Marine Engineer',
        mainly_learn: ['Marine Propulsion Systems Integration', 'Auxiliary Machinery Layout', 'Shafting Alignment Calculations', 'Shipboard Piping & Electrical Integration', 'Sea Trials & Performance Verification'],
        salary: 108000,
        demand: 'Steady',
        exp: 0.5
      },
      {
        title: 'Offshore Engineer',
        mainly_learn: ['Offshore Fixed Jackets & Floating Platforms (FPSO/TLP)', 'Ocean Wave Mechanics & Hydrodynamic Loading', 'Mooring Line Analysis & Tensioning (OrcaFlex)', 'Subsea Risers & Pipelines', 'Marine Structural FEA'],
        salary: 120000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Ocean Engineer',
        mainly_learn: ['Ocean Wave Energy & Coastal Processes', 'Subsea Robotics & Autonomous Underwater Vehicles (AUVs)', 'Acoustic Underwater Communications', 'Marine Geotechnics & Anchor Design', 'Oceanographic Instrumentation'],
        salary: 114000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Ship Design Engineer',
        mainly_learn: ['Ship General Arrangement & Compartment Layout', 'Structural Midship Section Sizing & Scantlings', 'Weight Distribution & Trim Calculations', 'CFD Hull Flow Simulation', 'Production Lofting & Shipyard CAD'],
        salary: 112000,
        demand: 'Steady',
        exp: 0.5
      }
    ]
  },
  PETRO: {
    branch_name: 'Petroleum Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Petroleum Engineer',
        mainly_learn: ['Reservoir Rock & Fluid Properties', 'Directional Drilling & Well Trajectories', 'Multiphase Fluid Flow in Wellbores', 'Well Logging & Formation Evaluation', 'Production Optimization'],
        salary: 130000,
        demand: 'Steady',
        exp: 1
      },
      {
        title: 'Reservoir Engineer',
        mainly_learn: ['Reservoir Numerical Simulation (ECLIPSE / Petrel)', 'Material Balance Equations & Decline Curves', 'Enhanced Oil Recovery (EOR Techniques)', 'Well Test Pressure Transient Analysis', 'Reserve Estimation (SPE-PRMS)'],
        salary: 138000,
        demand: 'Steady',
        exp: 1.5
      },
      {
        title: 'Drilling Engineer',
        mainly_learn: ['Drillstring Mechanics & Bit Selection', 'Drilling Mud Hydraulics & Pressure Control', 'Blowout Preventer (BOP) Well Control', 'Casing & Cementing Design', 'Rig Operations & Drilling Optimization'],
        salary: 132000,
        demand: 'Steady',
        exp: 1
      },
      {
        title: 'Production Engineer',
        mainly_learn: ['Nodal Analysis & Inflow Performance (IPR)', 'Artificial Lift Systems (ESP, Gas Lift, Rod Pumps)', 'Surface Separation & Processing Facilities', 'Flow Assurance & Hydrate Prevention', 'Well Workover & Stimulation'],
        salary: 128000,
        demand: 'Steady',
        exp: 1
      },
      {
        title: 'Well Completion Engineer',
        mainly_learn: ['Lower & Upper Well Completion Design', 'Hydraulic Fracturing & Perforation Optimization', 'Sand Control (Gravel Packing / Screens)', 'Packers & Downhole Safety Valves (SSSV)', 'Intelligent Well Completions'],
        salary: 134000,
        demand: 'Steady',
        exp: 1.5
      }
    ]
  },
  MINING: {
    branch_name: 'Mining Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Mining Engineer',
        mainly_learn: ['Surface & Underground Mining Methods', 'Rock Mechanics & Slope Stability in Pits', 'Drilling, Blasting & Explosives Engineering', 'Mine Haulage & Heavy Equipment Fleet', 'Mine Regulations & Reclamation'],
        salary: 114000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Mine Planning Engineer',
        mainly_learn: ['Lerchs-Grossmann Pit Optimization', 'Block Modeling & Geostatistics (Surpac/Vulcan/Datamine)', 'Short & Long-Term Production Scheduling', 'Ore Reserve Classification (JORC/NI 43-101)', 'Waste Dump Design & Cut-Off Grade Analysis'],
        salary: 120000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Safety Engineer',
        mainly_learn: ['Subsurface Mine Ventilation Design (Ventsim)', 'Hazard Identification & Quantitative Risk Analysis', 'Ground Control & Roof Bolting Inspection', 'Mine Gas & Dust Monitoring', 'Emergency Escape & Rescue Planning'],
        salary: 108000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Mineral Engineer',
        mainly_learn: ['Mineral Processing & Comminution (Crushing/Grinding)', 'Froth Flotation & Separation Kinetics', 'Gravity, Magnetic & Electrostatic Concentration', 'Tailings Thickening & Dewatering', 'Mineral Metallurgical Balance'],
        salary: 112000,
        demand: 'Steady',
        exp: 1
      },
      {
        title: 'Mine Operations Engineer',
        mainly_learn: ['Daily Production Shift Supervision', 'Drill & Blast Quality Control', 'Excavator & Truck Dispatch Automation', 'Mine Dewatering & Pumping Networks', 'Operating Cost & Productivity Benchmarking'],
        salary: 110000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  METALLURGY: {
    branch_name: 'Metallurgical Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Metallurgical Engineer',
        mainly_learn: ['Physical Metallurgy & Crystal Structures', 'Extractive Metallurgy (Pyrometry/Hydrometry)', 'Heat Treatment Cycle Design', 'Mechanical Testing of Metals', 'Welding & Joining Metallurgy'],
        salary: 108000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Materials Engineer',
        mainly_learn: ['Alloy Development (Steels, Al, Ti, Ni-Superalloys)', 'Structure-Property-Processing Correlations', 'Thermodynamic Phase Calculations (CALPHAD)', 'Corrosion Prevention & Passivation', 'Non-Destructive Testing (Ultrasonic/Radiography)'],
        salary: 106000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Process Engineer',
        mainly_learn: ['Blast Furnace, BOF & EAF Steelmaking Operations', 'Continuous Casting & Ladle Metallurgy', 'Hot & Cold Rolling Mill Process Control', 'Slag Conditioning & Inclusion Removal', 'Plant Yield & Energy Optimization'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Quality Engineer',
        mainly_learn: ['Microstructural Metallography & Grain Size Analysis', 'Defect Analysis (Segregation, Porosity, Inclusions)', 'Hardness & Impact Toughness Verification', 'Quality Management Systems in Mills (ISO/IATF)', 'Statistical Quality Audits'],
        salary: 102000,
        demand: 'Steady',
        exp: 0.5
      },
      {
        title: 'Metallurgy Researcher',
        mainly_learn: ['Scanning Electron Microscopy (SEM/EDS/EBSD)', 'Phase Transformation Kinetics (TTT/CCT Diagrams)', 'High-Temperature Creep & Fracture Toughness', 'Additive Manufacturing Metallurgy', 'Powder Metallurgy Sintering Science'],
        salary: 116000,
        demand: 'High',
        exp: 1.5
      }
    ]
  },
  CERAMIC: {
    branch_name: 'Ceramic Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Ceramic Engineer',
        mainly_learn: ['Ceramic Raw Materials & Processing', 'High-Temperature Sintering Kinetics', 'Phase Equilibria in Oxide Systems', 'Mechanical Properties of Brittle Solids', 'Refractory Materials in Furnaces'],
        salary: 106000,
        demand: 'Steady',
        exp: 0.5
      },
      {
        title: 'Materials Engineer',
        mainly_learn: ['Advanced Technical Ceramics (SiC, Al2O3, ZrO2)', 'Ceramic Matrix Composites (CMC)', 'Thermal Barrier Coatings for Turbines', 'Glass Melting, Annealing & Strengthening', 'Failure Analysis of Ceramic Parts'],
        salary: 110000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Process Engineer',
        mainly_learn: ['Ceramic Powder Synthesis & Ball Milling', 'Slip Casting, Tape Casting & Uniaxial Pressing', 'Kiln Firing Profile Optimization', 'Glaze Formulation & Defect Elimination', 'Statistical Yield Control in Ceramic Plants'],
        salary: 104000,
        demand: 'Steady',
        exp: 0.5
      },
      {
        title: 'R&D Engineer',
        mainly_learn: ['Electroceramics (Piezoelectrics, Dielectrics, Varistors)', 'Solid Oxide Fuel Cell (SOFC) Electrolytes', 'Bioceramics for Implants (Hydroxyapatite)', 'Nanoceramics & Spark Plasma Sintering', 'DoE Experimental Formulation'],
        salary: 114000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Ceramic Product Engineer',
        mainly_learn: ['Product Design for Ceramic Manufacturing', 'Thermal Shock Resistance Optimization', 'Dielectric Component Testing', 'Abrasion & Wear-Resistant Tile Engineering', 'Customer Application Support'],
        salary: 105000,
        demand: 'Steady',
        exp: 0.5
      }
    ]
  },
  TEXTILE: {
    branch_name: 'Textile Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Textile Engineer',
        mainly_learn: ['Natural & Synthetic Fiber Science', 'Yarn Spinning Processes & Mechanics', 'Weaving & Knitting Fabric Formation', 'Textile Testing Standards (ASTM/ISO)', 'Fabric Structural Analysis'],
        salary: 96000,
        demand: 'Steady',
        exp: 0.5
      },
      {
        title: 'Textile Technologist',
        mainly_learn: ['Dyeing Chemistry & Spectrophotometry Color Matching', 'Chemical Finishing (Water-Repellent, Flame-Retardant)', 'Eco-Friendly Processing & Effluent Treatment (ETP)', 'Enzymatic Pretreatment & Bleaching', 'Colorfastness Testing'],
        salary: 98000,
        demand: 'Steady',
        exp: 0.5
      },
      {
        title: 'Production Engineer',
        mainly_learn: ['Spinning & Weaving Mill Production Scheduling', 'Loom Speeds & Weft Insertion Optimization', 'WIP Inventory & Machine Maintenance', 'Energy Efficiency in Mills', 'Lean Manufacturing in Textile Plants'],
        salary: 100000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Quality Engineer',
        mainly_learn: ['Yarn Evenness & Tensile Strength Testing (Uster)', 'Fabric Defect Inspection (4-Point System)', 'Dimensional Stability & Shrinkage Controls', 'OEKO-TEX & GOTS Sustainability Audits', 'Statistical Process Quality'],
        salary: 94000,
        demand: 'Steady',
        exp: 0.5
      },
      {
        title: 'Textile Process Engineer',
        mainly_learn: ['Technical Textiles (Geotextiles, Medical, Automotive)', 'Non-Woven Fabric Technologies (Spunbond/Meltblown)', 'Carbon & Aramid Fiber Composite Preforms', 'Conductive Smart E-Textiles Integration', 'Process Scale-Up'],
        salary: 108000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  AGRI: {
    branch_name: 'Agricultural Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Agricultural Engineer',
        mainly_learn: ['Tractor Powertrains & Farm Machinery', 'Soil & Water Conservation Engineering', 'Irrigation & Drainage Systems', 'Post-Harvest Processing Technologies', 'Agri-System CAD Design'],
        salary: 100000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Irrigation Engineer',
        mainly_learn: ['Drip & Sprinkler Micro-Irrigation Network Sizing', 'Crop Water Requirements (CROPWAT / Penman-Monteith)', 'Pressurized Pipe Hydraulics & Pump Selection', 'Automated Solenoid Valves & Controllers', 'Groundwater Recharge Infrastructure'],
        salary: 104000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Farm Machinery Engineer',
        mainly_learn: ['Tillage, Sowing & Harvesting Implement Design', 'Tractor Drawbar Pull & Implement Mechanics', 'Hydraulic Lift Systems & Testing (OECD Codes)', 'Ergonomics of Agricultural Machinery', 'Autonomous Steering & RTK-GPS Guidance'],
        salary: 106000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Agri-Tech Engineer',
        mainly_learn: ['Farm IoT Sensors (Soil Moisture, NPK, Weather)', 'Drone Multispectral Imagery (NDVI Analysis)', 'Greenhouse Climate & Hydroponic Automation', 'Farm Management Information Systems (FMIS)', 'AI in Crop Disease Detection'],
        salary: 112000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'Precision Agriculture Engineer',
        mainly_learn: ['Variable Rate Application (VRA) Sizing', 'Yield Monitoring & Spatial GIS Mapping', 'Autonomous Farm Robot Kinematics', 'Satellite Remote Sensing for Crop Health', 'Data-Driven Irrigation Scheduling'],
        salary: 114000,
        demand: 'Explosive Growth',
        exp: 1.5
      }
    ]
  },

  // ==========================================
  // 🌱 EMERGING / INTERDISCIPLINARY (9 Branches)
  // ==========================================
  RENEWABLE: {
    branch_name: 'Renewable Energy Engineering',
    category: 'Emerging / Interdisciplinary',
    goals: [
      {
        title: 'Renewable Energy Engineer',
        mainly_learn: ['Solar Photovoltaic & Thermal Systems', 'Wind Turbine Aerodynamics & Betz Limit', 'Power Electronics (Grid-Tie Inverters)', 'Renewable Resource Assessment', 'Levelized Cost of Energy (LCOE)'],
        salary: 112000,
        demand: 'Explosive Growth',
        exp: 0.5
      },
      {
        title: 'Solar Engineer',
        mainly_learn: ['PVsyst Solar 3D Shading & Yield Simulation', 'Utility-Scale Solar Array Design', 'Solar String Inverters & MPPT Sizing', 'Balance of System (BOS) Electrical Engineering', 'Solar Farm Interconnection'],
        salary: 108000,
        demand: 'Explosive Growth',
        exp: 0.5
      },
      {
        title: 'Wind Energy Engineer',
        mainly_learn: ['Wind Resource Assessment (WAsP / WindPRO)', 'Wind Farm Wake Effect Modeling', 'Turbine Pitch & Yaw Control Systems', 'Offshore Wind Foundation Mechanics', 'Wind Power Curve Validation'],
        salary: 114000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Energy Consultant',
        mainly_learn: ['Clean Energy Feasibility & Financial Modeling', 'Renewable Energy Policy & PPA Contracts', 'Carbon Credits & Renewable Energy Certificates (RECs)', 'Industrial Decarbonization Audits', 'Regulatory Tariff Structures'],
        salary: 110000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Energy Systems Engineer',
        mainly_learn: ['Battery Energy Storage Systems (BESS Sizing & Degradation)', 'Hybrid Solar-Wind-Storage Microgrids (HOMER Pro)', 'Grid Frequency Response & Peak Shaving', 'IEEE 1547 Interconnection Standards', 'Smart Grid SCADA'],
        salary: 116000,
        demand: 'Explosive Growth',
        exp: 1
      }
    ]
  },
  ENERGY: {
    branch_name: 'Energy Engineering',
    category: 'Emerging / Interdisciplinary',
    goals: [
      {
        title: 'Energy Engineer',
        mainly_learn: ['Thermal Power Cycles & Cogeneration (CHP)', 'Industrial Energy Auditing (ASHRAE Level I-III)', 'HVAC & Waste Heat Recovery Systems', 'Combustion Efficiency & Boilers', 'Energy Balance Modeling'],
        salary: 106000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Energy Analyst',
        mainly_learn: ['Building Energy Modeling (EnergyPlus / eQUEST)', 'Energy Consumption Data Analytics (Python/SQL)', 'Utility Tariff Rate Optimization', 'Peak Demand Shaving Strategies', 'Measurement and Verification (IPMVP)'],
        salary: 104000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Energy Systems Engineer',
        mainly_learn: ['District Energy & Microgrid Modeling', 'Thermal Energy Storage Systems', 'Industrial Heat Pump Sizing', 'Power Grid Integration & Optimization', 'HOMER Pro Energy Optimization'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Sustainability Engineer',
        mainly_learn: ['Corporate Decarbonization Roadmap Design', 'Scope 1, 2, 3 GHG Carbon Accounting', 'Life Cycle Assessment (LCA)', 'Net-Zero Transition Planning', 'Science-Based Targets initiative (SBTi)'],
        salary: 110000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'Energy Consultant',
        mainly_learn: ['Energy Performance Contracting (EPC)', 'Renewable Energy Integration Strategy', 'ISO 50001 Energy Management Systems', 'Capital Expenditure (CapEx) ROI Modeling', 'Regulatory Policy Compliance'],
        salary: 108000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  ROBOTICS_AI: {
    branch_name: 'Robotics & Artificial Intelligence',
    category: 'Emerging / Interdisciplinary',
    goals: [
      {
        title: 'Robotics Engineer',
        mainly_learn: ['Forward & Inverse Kinematics', 'ROS 2 Framework & Simulation', 'Actuators, Grippers & Sensor Interfacing', 'Path Planning Algorithms (A*, RRT*)', 'Feedback Motion Control'],
        salary: 122000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'AI Engineer',
        mainly_learn: ['Deep Neural Networks for Robotics', 'PyTorch / TensorRT Edge Acceleration', 'Perception Pipelines (Object Detection & Pose)', 'Reinforcement Learning in Robotics', 'Generative Vision-Language-Action Models'],
        salary: 135000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'Robot Learning Engineer',
        mainly_learn: ['Reinforcement Learning (PPO, SAC)', 'Sim-to-Real Policy Transfer (Isaac Gym/MuJoCo)', 'Imitation Learning & Trajectory Optimization', 'Visual Servoing & Force Feedback', 'Neural Motion Planners'],
        salary: 138000,
        demand: 'Explosive Growth',
        exp: 1.5
      },
      {
        title: 'Autonomous Systems Engineer',
        mainly_learn: ['LiDAR / Visual SLAM Navigation', 'Extended Kalman Filtering & Sensor Fusion', 'Autonomous Behavior Trees', 'Safety-Critical Fail-Safe Architectures', 'Edge GPU Computing (NVIDIA Jetson)'],
        salary: 130000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Computer Vision Engineer',
        mainly_learn: ['3D Point Cloud Processing (Open3D/PCL)', 'Real-Time Object Tracking (YOLOv8/ByteTrack)', 'Depth Estimation & Optical Flow', 'Camera Calibration & Epipolar Geometry', 'Edge Video Pipeline Optimization'],
        salary: 128000,
        demand: 'Explosive Growth',
        exp: 1
      }
    ]
  },
  AI_ROBOTICS: {
    branch_name: 'AI & Robotics',
    category: 'Emerging / Interdisciplinary',
    goals: [
      {
        title: 'AI Robotics Engineer',
        mainly_learn: ['Deep Learning for Robotic Perception', 'ROS 2 Python/C++ Nodes', 'Dynamic Obstacle Avoidance', 'Multi-Sensor Fusion (Camera, LiDAR, IMU)', 'NVIDIA Isaac Robotics SDK'],
        salary: 134000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'Autonomous Systems Engineer',
        mainly_learn: ['Self-Driving Vehicle & Mobile Robot Architecture', 'Global & Local Path Planners (TEB/DWA)', 'State Estimation & Localization', 'Model Predictive Control (MPC)', 'Drive-by-Wire Interfaces'],
        salary: 132000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Robotics Software Engineer',
        mainly_learn: ['Modern C++ (C++17/20) for Robotics', 'Real-Time Publish-Subscribe (DDS in ROS2)', 'Gazebo / Webots Physics Simulation', 'Robotic Arm Manipulation (MoveIt 2)', 'Automated Continuous Testing in Robotics'],
        salary: 126000,
        demand: 'Explosive Growth',
        exp: 0.5
      },
      {
        title: 'Robot Learning Engineer',
        mainly_learn: ['Deep Reinforcement Learning for Locomotion', 'Bipedal & Quadruped Control Policies', 'Domain Randomization in Simulation', 'End-to-End Visual Motor Policies', 'Reward Function Engineering'],
        salary: 136000,
        demand: 'Explosive Growth',
        exp: 1.5
      },
      {
        title: 'Computer Vision Engineer',
        mainly_learn: ['6D Pose Estimation for Grasping (GraspNet)', 'Semantic Segmentation of Complex Scenes', 'Stereo Vision & Depth Disparity', 'TensorRT Model Optimization', 'OpenCV & CUDA Acceleration'],
        salary: 128000,
        demand: 'Explosive Growth',
        exp: 1
      }
    ]
  },
  DATA_ENG: {
    branch_name: 'Data Engineering',
    category: 'Emerging / Interdisciplinary',
    goals: [
      {
        title: 'Data Engineer',
        mainly_learn: ['Advanced SQL & Query Optimization', 'Python / Scala for Data Processing', 'Distributed Computing (Apache Spark)', 'Data Pipeline Orchestration (Airflow/Dagster)', 'Data Lakehouses (Delta Lake / Iceberg)'],
        salary: 128000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Big Data Engineer',
        mainly_learn: ['Hadoop Ecosystem & MapReduce Concepts', 'Apache Spark Cluster Tuning', 'Real-Time Stream Processing (Apache Kafka/Flink)', 'Distributed Columnar Storage (Parquet/ORC)', 'NoSQL Databases (Cassandra/HBase)'],
        salary: 134000,
        demand: 'Extremely High',
        exp: 1.5
      },
      {
        title: 'Data Platform Engineer',
        mainly_learn: ['Cloud Data Infrastructure as Code (Terraform)', 'Snowflake / BigQuery Architecture', 'Data Mesh Principles & Data Contracts', 'Kubernetes for Data Platforms', 'Data Governance, Security & Lineage'],
        salary: 136000,
        demand: 'Extremely High',
        exp: 1.5
      },
      {
        title: 'Analytics Engineer',
        mainly_learn: ['dbt (data build tool) Transformations', 'Dimensional Data Modeling (Kimball Star Schema)', 'Advanced SQL Window Functions & CTEs', 'Data CI/CD & Automated Testing', 'BI Semantic Layer Integration'],
        salary: 120000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Data Warehouse Engineer',
        mainly_learn: ['Data Warehouse Schema Design & Normalization', 'ELT Pipeline Construction', 'Cloud MPP Database Tuning', 'Data Replication & Change Data Capture (CDC)', 'Data Security & Access Controls (RBAC)'],
        salary: 125000,
        demand: 'Extremely High',
        exp: 1
      }
    ]
  },
  QUANTUM: {
    branch_name: 'Quantum Technology',
    category: 'Emerging / Interdisciplinary',
    goals: [
      {
        title: 'Quantum Engineer',
        mainly_learn: ['Quantum Mechanics & Linear Algebra in Hilbert Spaces', 'Superconducting & Trapped-Ion Qubit Physics', 'Quantum Gates, Circuits & Measurement', 'Cryogenic Control Electronics', 'Qiskit / Cirq Quantum SDKs'],
        salary: 140000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Quantum Software Developer',
        mainly_learn: ['Qiskit, Cirq & PennyLane Programming', 'Quantum Algorithm Implementation (Grover, Shor, VQE)', 'Quantum Circuit Depth & Gate Synthesis Optimization', 'Quantum Noise Mitigation Techniques', 'Hybrid Quantum-Classical Algorithms'],
        salary: 138000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Quantum Researcher',
        mainly_learn: ['Quantum Information Theory & Entanglement', 'Quantum Error Correction (Surface Codes & Fault Tolerance)', 'Quantum Complexity Theory (BQP)', 'Quantum Key Distribution (QKD Protocols)', 'Scientific Research & Publishing'],
        salary: 145000,
        demand: 'High',
        exp: 2
      },
      {
        title: 'Quantum Computing Engineer',
        mainly_learn: ['Microwave Pulse Control for Qubit Gates (Qiskit Pulse)', 'Quantum Hardware Calibration Protocols', 'Quantum Characterization, Verification & Benchmarking (QCVB)', 'FPGA-based Quantum Controllers', 'Dilution Refrigerator Operations'],
        salary: 142000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Quantum Algorithm Developer',
        mainly_learn: ['Quantum Approximate Optimization Algorithm (QAOA)', 'Variational Quantum Eigensolvers (VQE)', 'Quantum Machine Learning (QML)', 'Matrix Mathematics & Unitary Operations', 'Quantum Chemistry Simulation'],
        salary: 139000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  SEMICONDUCTOR: {
    branch_name: 'Semiconductor Engineering',
    category: 'Emerging / Interdisciplinary',
    goals: [
      {
        title: 'Semiconductor Engineer',
        mainly_learn: ['Semiconductor Physics (Bandgap, Carrier Drift/Diffusion)', 'Cleanroom Fabrication Processes (Photolithography, Etch, CVD)', 'MOSFET / FinFET / GAA Device Physics', 'Wafer Metrology & Inspection', 'Cleanroom Yield Engineering'],
        salary: 124000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Chip Design Engineer',
        mainly_learn: ['Digital RTL Design (Verilog/SystemVerilog)', 'Logic Synthesis & Technology Mapping', 'Static Timing Analysis (STA) & Clock Tree Synthesis', 'ASIC Layout & DRC/LVS Verification', 'Cadence Innovus / Synopsys EDA Suite'],
        salary: 134000,
        demand: 'Extremely High',
        exp: 1.5
      },
      {
        title: 'Process Engineer',
        mainly_learn: ['Plasma Dry Etching & Wet Chemical Etch', 'Thin Film Deposition (ALD, PVD, CVD)', 'Chemical Mechanical Planarization (CMP)', 'Ion Implantation & High-Temp Annealing', 'Statistical Process Control (SPC) in Fabs'],
        salary: 122000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Verification Engineer',
        mainly_learn: ['SystemVerilog & UVM Testbench Architecture', 'Coverage-Driven Functional Verification', 'Assertion-Based Verification (SVA)', 'Hardware Emulation (Palladium / Zebu)', 'Bug Triage & Root Cause Analysis'],
        salary: 130000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Semiconductor Device Engineer',
        mainly_learn: ['TCAD Device Simulation (Synopsys Sentaurus / Silvaco)', 'I-V and C-V Semiconductor Characterization', 'Subthreshold Leakage & Short Channel Effects', 'Advanced Packaging (2.5D/3D Chiplets, TSV)', 'Device Reliability & TDDB Testing'],
        salary: 128000,
        demand: 'Extremely High',
        exp: 1
      }
    ]
  },
  SPACE: {
    branch_name: 'Space Technology',
    category: 'Emerging / Interdisciplinary',
    goals: [
      {
        title: 'Space Systems Engineer',
        mainly_learn: ['Spacecraft Systems Architecture & Requirements', 'Orbital Mechanics & Orbital Transfers (GMAT)', 'Space Environment Effects (Thermal Vacuum, Radiation)', 'Satellite Subsystems (ADCS, EPS, TT&C)', 'Launch Vehicle Integration'],
        salary: 132000,
        demand: 'Explosive Growth',
        exp: 1.5
      },
      {
        title: 'Satellite Engineer',
        mainly_learn: ['SmallSat & CubeSat Bus Architecture', 'Attitude Determination and Control (Star Trackers, Reaction Wheels)', 'Solar Array & Battery Power Management', 'RF Space Transponders & Antennas', 'Satellite Thermal Modeling (Thermal Desktop)'],
        salary: 126000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Mission Systems Engineer',
        mainly_learn: ['Mission Trajectory Design & Optimization', 'Ground Station Link Budgets & Downlink Scheduling', 'Autonomous Spacecraft Fault Recovery', 'Conjunction Assessment & Collision Avoidance', 'Mission Operations & Telemetry Analysis'],
        salary: 135000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Space Technology Researcher',
        mainly_learn: ['Electric & Hall-Effect Plasma Propulsion', 'Space In-Situ Resource Utilization (ISRU)', 'Space Robotics & On-Orbit Servicing', 'Radiation Hardened Electronics Research', 'Interplanetary Mission Concepts'],
        salary: 130000,
        demand: 'High',
        exp: 2
      },
      {
        title: 'Spacecraft Engineer',
        mainly_learn: ['Spacecraft Primary Structure FEA (Nastran/Abaqus)', 'Vibration & Acoustic Testing (Shaker Table Qualification)', 'Mechanism Design (Solar Array Deployment)', 'Mass Properties & CG Balancing', 'Cleanroom Spacecraft Assembly & Integration (AIT)'],
        salary: 128000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  DEFENCE: {
    branch_name: 'Defence Technology',
    category: 'Emerging / Interdisciplinary',
    goals: [
      {
        title: 'Defence Systems Engineer',
        mainly_learn: ['System-of-Systems Military Architecture', 'Tactical Data Links & Secure Comms (Link 16)', 'Hardened & Ruggedized Systems Design', 'MIL-STD-810 Environmental Qualification', 'Defense Procurement & Verification'],
        salary: 126000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Aerospace Engineer',
        mainly_learn: ['Missile Aerodynamics & Control Surfaces', 'Supersonic & Hypersonic Trajectory Simulation', 'Rocket Motors & Air-Breathing Ramjets', 'Radar Cross Section (RCS) Stealth Modeling', 'Airframe Structural Strength Under High G-Loads'],
        salary: 128000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Defence Electronics Engineer',
        mainly_learn: ['Active Electronically Scanned Array (AESA) Radars', 'Electronic Warfare (EW - Jamming & ESM)', 'FPGA Signal Processing for Defense', 'Secure Cryptographic Hardware', 'Electromagnetic Pulse (EMP) Hardening'],
        salary: 130000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Systems Engineer',
        mainly_learn: ['Guidance, Navigation and Control (GNC) Laws', 'Target Tracking with Extended Kalman Filters', 'Electro-Optical / Infrared (EO/IR) Payloads', 'Weapon System Integration & Testing', 'Real-Time Mission Computers'],
        salary: 124000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Defence Technology Researcher',
        mainly_learn: ['Hypersonic Flight Dynamics', 'Autonomous Swarm Defense Algorithms', 'Directed Energy Weapons (High Power Laser/Microwave)', 'Armor Materials & Terminal Ballistics', 'Advanced Threat Countermeasures'],
        salary: 134000,
        demand: 'High',
        exp: 2
      }
    ]
  }
};

// -------------------------------------------------------------
// COMPREHENSIVE ALIAS RESOLVER TO GUARANTEE STRICT 1:1 BRANCH MATCHING
// -------------------------------------------------------------

export const BRANCH_ALIASES: Record<string, string> = {
  // Computer & IT
  CSE: 'CSE',
  'COMPUTER SCIENCE': 'CSE',
  'COMPUTER SCIENCE AND ENGINEERING': 'CSE',
  'COMPUTER SCIENCE & ENGINEERING': 'CSE',
  'COMPUTER SCIENCE AND ENGINEERING (CSE)': 'CSE',
  'B.TECH COMPUTER SCIENCE': 'CSE',
  'B.TECH / B.E. COMPUTER SCIENCE': 'CSE',
  'M.TECH COMPUTER SCIENCE': 'CSE',
  'MCA COMPUTER APPLICATIONS': 'CSE',
  'BCA COMPUTER APPLICATIONS': 'CSE',

  IT: 'IT',
  'INFORMATION TECHNOLOGY': 'IT',
  'INFORMATION TECHNOLOGY (IT)': 'IT',
  'B.TECH INFORMATION TECHNOLOGY': 'IT',

  AIML: 'AIML',
  'AI/ML': 'AIML',
  'AI ML': 'AIML',
  'ARTIFICIAL INTELLIGENCE & MACHINE LEARNING': 'AIML',
  'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING': 'AIML',
  'ARTIFICIAL INTELLIGENCE & MACHINE LEARNING (AI/ML)': 'AIML',

  AIDS: 'AIDS',
  'AI & DS': 'AIDS',
  'AI AND DS': 'AIDS',
  'AI&DS': 'AIDS',
  'ARTIFICIAL INTELLIGENCE & DATA SCIENCE': 'AIDS',
  'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE': 'AIDS',
  'ARTIFICIAL INTELLIGENCE & DATA SCIENCE (AI & DS)': 'AIDS',
  'B.TECH AI & DATA SCIENCE': 'AIDS',

  DS: 'DS',
  'DATA SCIENCE': 'DS',

  CYBER: 'CYBER',
  'CYBER SECURITY': 'CYBER',
  'CYBERSECURITY': 'CYBER',
  'INFORMATION SECURITY': 'CYBER',

  IOT: 'IOT',
  'INTERNET OF THINGS': 'IOT',
  'INTERNET OF THINGS (IOT)': 'IOT',

  CSBS: 'CSBS',
  'COMPUTER SCIENCE & BUSINESS SYSTEMS': 'CSBS',
  'COMPUTER SCIENCE AND BUSINESS SYSTEMS': 'CSBS',
  'COMPUTER SCIENCE & BUSINESS SYSTEMS (CSBS)': 'CSBS',

  CSIT: 'CSIT',
  'CS & IT': 'CSIT',
  'CS AND IT': 'CSIT',
  'COMPUTER SCIENCE & INFORMATION TECHNOLOGY': 'CSIT',
  'COMPUTER SCIENCE AND INFORMATION TECHNOLOGY': 'CSIT',
  'COMPUTER SCIENCE & INFORMATION TECHNOLOGY (CS & IT)': 'CSIT',

  SE: 'SE',
  'SOFTWARE ENGINEERING': 'SE',

  CE: 'CE',
  'COMPUTER ENGINEERING': 'CE',

  CLOUD: 'CLOUD',
  'CLOUD COMPUTING': 'CLOUD',

  BLOCKCHAIN: 'BLOCKCHAIN',
  'BLOCKCHAIN TECHNOLOGY': 'BLOCKCHAIN',

  // Electrical & Electronics
  EEE: 'EEE',
  'ELECTRICAL AND ELECTRONICS ENGINEERING': 'EEE',
  'ELECTRICAL & ELECTRONICS ENGINEERING': 'EEE',
  'ELECTRICAL AND ELECTRONICS ENGINEERING (EEE)': 'EEE',

  ECE: 'ECE',
  'ELECTRONICS AND COMMUNICATION ENGINEERING': 'ECE',
  'ELECTRONICS & COMMUNICATION ENGINEERING': 'ECE',
  'ELECTRONICS AND COMMUNICATION ENGINEERING (ECE)': 'ECE',
  'B.TECH ELECTRONICS & COMM': 'ECE',

  EIE: 'EIE',
  'ELECTRONICS AND INSTRUMENTATION ENGINEERING': 'EIE',
  'ELECTRONICS & INSTRUMENTATION ENGINEERING': 'EIE',
  'ELECTRONICS AND INSTRUMENTATION ENGINEERING (EIE)': 'EIE',

  ELECTRONICS: 'ELECTRONICS',
  'ELECTRONICS ENGINEERING': 'ELECTRONICS',
  ELEC: 'ELECTRONICS',

  VLSI: 'VLSI',
  'VLSI DESIGN': 'VLSI',

  EMBEDDED: 'EMBEDDED',
  'EMBEDDED SYSTEMS': 'EMBEDDED',

  EE: 'EE',
  'ELECTRICAL ENGINEERING': 'EE',
  ELECTRICAL: 'EE',

  ICE: 'ICE',
  'INSTRUMENTATION & CONTROL ENGINEERING': 'ICE',
  'INSTRUMENTATION AND CONTROL ENGINEERING': 'ICE',

  // Mechanical & Related
  MECH: 'MECH',
  'MECHANICAL ENGINEERING': 'MECH',
  MECHANICAL: 'MECH',

  MECHATRONICS: 'MECHATRONICS',
  'MECHATRONICS ENGINEERING': 'MECHATRONICS',

  AUTO: 'AUTO',
  'AUTOMOBILE ENGINEERING': 'AUTO',
  AUTOMOBILE: 'AUTO',

  ROBOTICS: 'ROBOTICS',
  'ROBOTICS ENGINEERING': 'ROBOTICS',

  MFG: 'MFG',
  'MANUFACTURING ENGINEERING': 'MFG',

  IE: 'IE',
  'INDUSTRIAL ENGINEERING': 'IE',
  IND: 'IE',
  INDUSTRIAL: 'IE',

  PROD: 'PROD',
  'PRODUCTION ENGINEERING': 'PROD',

  AUTOROB: 'AUTOROB',
  'AUTOMATION & ROBOTICS': 'AUTOROB',
  'AUTOMATION AND ROBOTICS': 'AUTOROB',
  AUTOMATION: 'AUTOROB',

  // Civil & Infrastructure
  CIVIL: 'CIVIL',
  'CIVIL ENGINEERING': 'CIVIL',

  STRUCT: 'STRUCT',
  'STRUCTURAL ENGINEERING': 'STRUCT',
  STRUCTURAL: 'STRUCT',

  CONST: 'CONST',
  'CONSTRUCTION TECHNOLOGY': 'CONST',
  CTM: 'CONST',
  CONSTRUCTION: 'CONST',

  ENV: 'ENV',
  'ENVIRONMENTAL ENGINEERING': 'ENV',
  ENVIRONMENTAL: 'ENV',

  GEOTECH: 'GEOTECH',
  'GEOTECHNICAL ENGINEERING': 'GEOTECH',

  TRANS: 'TRANS',
  'TRANSPORTATION ENGINEERING': 'TRANS',

  // Chemical & Materials
  CHEM: 'CHEM',
  'CHEMICAL ENGINEERING': 'CHEM',
  CHEMICAL: 'CHEM',

  BIOTECH: 'BIOTECH',
  BIOTECHNOLOGY: 'BIOTECH',

  BIOINFO: 'BIOINFO',
  BIOINFORMATICS: 'BIOINFO',
  'BIO INFORMATICS': 'BIOINFO',

  BIOMED: 'BIOMED',
  'BIOMEDICAL ENGINEERING': 'BIOMED',
  BIOMEDICAL: 'BIOMED',

  BIOCHEM: 'BIOCHEM',
  'BIOCHEMICAL ENGINEERING': 'BIOCHEM',

  MAT: 'MAT',
  'MATERIALS SCIENCE & ENGINEERING': 'MAT',
  'MATERIALS SCIENCE AND ENGINEERING': 'MAT',
  'MATERIALS SCIENCE': 'MAT',

  POLYMER: 'POLYMER',
  'POLYMER ENGINEERING': 'POLYMER',
  POLY: 'POLYMER',

  FOOD: 'FOOD',
  'FOOD TECHNOLOGY': 'FOOD',

  PHARMA: 'PHARMA',
  'PHARMACEUTICAL ENGINEERING': 'PHARMA',

  // Aerospace & Specialized
  AERO: 'AERO',
  'AEROSPACE ENGINEERING': 'AERO',
  AEROSPACE: 'AERO',

  AERONAUTICAL: 'AERONAUTICAL',
  'AERONAUTICAL ENGINEERING': 'AERONAUTICAL',
  AERONAUTIC: 'AERONAUTICAL',

  AVIONICS: 'AVIONICS',
  'AVIONICS ENGINEERING': 'AVIONICS',

  MARINE: 'MARINE',
  'MARINE ENGINEERING': 'MARINE',

  NAVAL: 'NAVAL',
  'NAVAL ARCHITECTURE & OCEAN ENGINEERING': 'NAVAL',
  'NAVAL ARCHITECTURE AND OCEAN ENGINEERING': 'NAVAL',
  'NAVAL ARCHITECTURE': 'NAVAL',

  PETRO: 'PETRO',
  'PETROLEUM ENGINEERING': 'PETRO',
  PETROLEUM: 'PETRO',

  MINING: 'MINING',
  'MINING ENGINEERING': 'MINING',

  METALLURGY: 'METALLURGY',
  'METALLURGICAL ENGINEERING': 'METALLURGY',
  MET: 'METALLURGY',

  CERAMIC: 'CERAMIC',
  'CERAMIC ENGINEERING': 'CERAMIC',

  TEXTILE: 'TEXTILE',
  'TEXTILE ENGINEERING': 'TEXTILE',

  AGRI: 'AGRI',
  'AGRICULTURAL ENGINEERING': 'AGRI',
  AGRICULTURAL: 'AGRI',

  // Emerging / Interdisciplinary
  RENEWABLE: 'RENEWABLE',
  'RENEWABLE ENERGY ENGINEERING': 'RENEWABLE',
  'RENEWABLE ENERGY': 'RENEWABLE',

  ENERGY: 'ENERGY',
  'ENERGY ENGINEERING': 'ENERGY',

  ROBOTICS_AI: 'ROBOTICS_AI',
  'ROBOTICS & ARTIFICIAL INTELLIGENCE': 'ROBOTICS_AI',
  'ROBOTICS AND ARTIFICIAL INTELLIGENCE': 'ROBOTICS_AI',

  AI_ROBOTICS: 'AI_ROBOTICS',
  'AI & ROBOTICS': 'AI_ROBOTICS',
  'AI AND ROBOTICS': 'AI_ROBOTICS',

  DATA_ENG: 'DATA_ENG',
  'DATA ENGINEERING': 'DATA_ENG',

  QUANTUM: 'QUANTUM',
  'QUANTUM TECHNOLOGY': 'QUANTUM',

  SEMICONDUCTOR: 'SEMICONDUCTOR',
  'SEMICONDUCTOR ENGINEERING': 'SEMICONDUCTOR',

  SPACE: 'SPACE',
  'SPACE TECHNOLOGY': 'SPACE',

  DEFENCE: 'DEFENCE',
  'DEFENCE TECHNOLOGY': 'DEFENCE',
  DEFENSE: 'DEFENCE',
  'DEFENSE TECHNOLOGY': 'DEFENCE'
};

// -------------------------------------------------------------
// HELPER METHODS
// -------------------------------------------------------------

export function normalizeBranchCode(branchInput?: string): string {
  if (!branchInput) return 'CSE';
  const clean = branchInput.trim();
  const upper = clean.toUpperCase();

  // Direct alias match
  if (BRANCH_ALIASES[upper]) {
    return BRANCH_ALIASES[upper];
  }

  // Remove common punctuation and emojis
  const sanitized = upper.replace(/[^\w\s&]/g, ' ').replace(/\s+/g, ' ').trim();
  if (BRANCH_ALIASES[sanitized]) {
    return BRANCH_ALIASES[sanitized];
  }

  // Check if it's already a direct key in CAREER_GOALS_DATA
  if (CAREER_GOALS_DATA[upper]) {
    return upper;
  }

  // Check key contains or substring match
  for (const [aliasKey, targetCode] of Object.entries(BRANCH_ALIASES)) {
    if (upper === aliasKey || upper.includes(aliasKey) || aliasKey.includes(upper)) {
      return targetCode;
    }
  }

  return 'CSE';
}

function getSubjectCategory(skill: string): 'Core Subject' | 'Applied Engineering' | 'Tooling & Systems' {
  const s = skill.toLowerCase();
  if (s.includes('git') || s.includes('docker') || s.includes('linux') || s.includes('autocad') || s.includes('kicad') || s.includes('tool') || s.includes('excel') || s.includes('ansys') || s.includes('power bi') || s.includes('tableau') || s.includes('wireshark') || s.includes('burp')) {
    return 'Tooling & Systems';
  }
  if (s.includes('dsa') || s.includes('dbms') || s.includes('os') || s.includes('operating') || s.includes('network') || s.includes('oop') || s.includes('math') || s.includes('thermodynamics') || s.includes('mechanics') || s.includes('structures') || s.includes('circuits') || s.includes('control') || s.includes('algorithms') || s.includes('chemistry') || s.includes('biology') || s.includes('physics')) {
    return 'Core Subject';
  }
  return 'Applied Engineering';
}

function getSpecificRecommendedLearning(skill: string): string {
  const s = skill.toLowerCase();
  if (s.includes('dsa') || s.includes('algorithm') || s.includes('data structure')) {
    return 'DSA: Master Trees, Graphs, Sorting, Hash Maps & solve Medium LeetCode problems.';
  }
  if (s.includes('python') || s.includes('programming') || s.includes('c++') || s.includes('java')) {
    return `${skill}: Deepen language fundamentals, memory management, OOP patterns, and clean architecture.`;
  }
  if (s.includes('dbms') || s.includes('database') || s.includes('sql')) {
    return 'DBMS & SQL: Study Relational Schema Design, Normalization (1NF to BCNF), Indexing & Complex Joins.';
  }
  if (s.includes('os') || s.includes('operating system')) {
    return 'Operating Systems: Process Scheduling, Concurrency/Mutexes, Virtual Memory Paging & Linux Syscalls.';
  }
  if (s.includes('network')) {
    return 'Computer Networks: Master OSI 7-Layer, TCP/IP handshake, Sockets, HTTP/3 & Routing Protocols.';
  }
  if (s.includes('git')) {
    return 'Git Version Control: Branching strategies, Interactive Rebase, Merge Conflicts & GitHub Actions.';
  }
  if (s.includes('system design') || s.includes('architecture')) {
    return 'System Design: Scalability patterns, Load Balancing, Caching (Redis), Sharding & Microservices.';
  }
  if (s.includes('cloud') || s.includes('aws') || s.includes('docker') || s.includes('kubernetes')) {
    return `${skill}: Containerization, CI/CD deployment pipelines, Infrastructure-as-Code & Observability.`;
  }
  if (s.includes('machine learning') || s.includes('ml') || s.includes('deep learning')) {
    return `${skill}: Mathematical formulations, Loss backprop, PyTorch modeling, Cross-validation & Evaluation metrics.`;
  }
  return `${skill}: Study core engineering textbooks, complete lab problem sets, and build an integrated module.`;
}

function getDefaultStudentLevel(skillName: string, index: number): number {
  const s = skillName.toLowerCase();
  if (s.includes('python')) return 4.2;
  if (s.includes('dsa') || s.includes('algorithm')) return 2.1;
  if (s.includes('sql')) return 3.5;
  if (s.includes('dbms')) return 2.8;
  if (s.includes('git')) return 4.0;
  if (s.includes('system design')) return 1.5;
  if (s.includes('operating system') || s.includes('os')) return 2.5;
  if (s.includes('network')) return 2.7;

  const baselineValues = [3.8, 2.4, 3.5, 2.8, 3.9, 1.8, 2.6, 3.2, 2.0, 3.4];
  return baselineValues[index % baselineValues.length];
}

function formatGoals(branchCode: string, entry: BranchGoalEntry): CareerGoalDefinition[] {
  return entry.goals.map((g, idx) => {
    const slug = g.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const id = `CG_${branchCode}_${idx + 1}_${slug}`;

    const required_skills = g.mainly_learn.map((skillName, sIdx) => {
      const isTop = sIdx < 3;
      const isMid = sIdx >= 3 && sIdx < 6;
      const reqLevel = isTop ? 4.5 : (isMid ? 4.0 : 3.5);
      const studentLevel = getDefaultStudentLevel(skillName, sIdx);
      const category = getSubjectCategory(skillName);

      return {
        skill_id: `SK_${slug}_${sIdx}`,
        skill_name: skillName,
        required_level: reqLevel,
        default_student_level: studentLevel,
        importance: isTop ? 0.95 : (isMid ? 0.85 : 0.75),
        priority: (isTop ? 'Critical' : (isMid ? 'High' : 'Medium')) as 'Critical' | 'High' | 'Medium',
        estimated_hours: isTop ? 35 : 20,
        subject_category: category,
        recommended_learning: getSpecificRecommendedLearning(skillName)
      };
    });

    const coreSubjects = g.mainly_learn.filter(s => getSubjectCategory(s) === 'Core Subject');
    const mainList = coreSubjects.length >= 3 ? coreSubjects : g.mainly_learn;

    return {
      id,
      title: g.title,
      branch_code: branchCode,
      branch_name: entry.branch_name,
      category: entry.category,
      mainly_learn: g.mainly_learn,
      description: `Targeted career path for ${entry.branch_name} graduates specializing as ${g.title}. Focuses on mastering core industry competencies: ${g.mainly_learn.slice(0, 4).join(', ')}.`,
      market_demand: g.demand,
      avg_salary_usd: g.salary,
      min_exp_years: g.exp,
      required_skills,
      roadmap_stages: [
        {
          stage: 1,
          title: 'Core Subject Fundamentals & Foundations',
          focus_skills: g.mainly_learn.slice(0, 3),
          main_subjects: mainList.slice(0, 2),
          deliverable: 'Comprehensive mastery of foundational theory, standard problem sets, and core lab assignments.',
          recommended_topics: [
            'Core Subject Textbook Theory & Standard Syllabus Principles',
            'Analytical Problem Sets & Algorithmic Rigor',
            'Weekly Laboratory Experiments & Hands-On Problem Solving'
          ]
        },
        {
          stage: 2,
          title: 'Applied Engineering Systems & Intermediate Practice',
          focus_skills: g.mainly_learn.slice(3, 6).length > 0 ? g.mainly_learn.slice(3, 6) : g.mainly_learn.slice(1, 3),
          main_subjects: mainList.slice(2, 4).length > 0 ? mainList.slice(2, 4) : mainList.slice(0, 2),
          deliverable: 'Integrated multi-module project simulating real-world industry pipeline and laboratory requirements.',
          recommended_topics: [
            'System Architecture, Interfacing & Protocol Standards',
            'Performance Benchmarking, Complexity & Optimization',
            'Automated Testing, Verification & Simulation Runs'
          ]
        },
        {
          stage: 3,
          title: 'Advanced Capstone & Industry Placement Readiness',
          focus_skills: g.mainly_learn.slice(6).length > 0 ? g.mainly_learn.slice(6) : g.mainly_learn.slice(g.mainly_learn.length - 2),
          main_subjects: mainList.slice(mainList.length - 2),
          deliverable: 'Production-ready capstone project, system design review, and placement interview readiness.',
          recommended_topics: [
            'Scalable Production Architectures & Edge-Case Resilience',
            'Comprehensive Engineering Capstone & Code/Design Review',
            'Technical Placement Interviews & Defense Presentation'
          ]
        }
      ]
    };
  });
}

/**
 * Returns strictly and exclusively the career goals for the specified branch.
 */
export function getCareerGoalsForBranch(branchInput?: string): CareerGoalDefinition[] {
  const code = normalizeBranchCode(branchInput);
  if (CAREER_GOALS_DATA[code]) {
    return formatGoals(code, CAREER_GOALS_DATA[code]);
  }
  return formatGoals('CSE', CAREER_GOALS_DATA['CSE']);
}

/**
 * Returns all structured career goals across all branches.
 */
export function getAllCareerGoals(): CareerGoalDefinition[] {
  const all: CareerGoalDefinition[] = [];
  for (const [code, entry] of Object.entries(CAREER_GOALS_DATA)) {
    all.push(...formatGoals(code, entry));
  }
  return all;
}
