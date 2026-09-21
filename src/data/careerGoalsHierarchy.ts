// Branch -> Career Goal -> Required Skills Knowledge Base for Skill2Career

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
    importance: number; // 0 to 1
    priority: 'Critical' | 'High' | 'Medium';
    estimated_hours: number;
  }[];
  roadmap_stages: {
    stage: number;
    title: string;
    focus_skills: string[];
    deliverable: string;
  }[];
}

// -------------------------------------------------------------
// CURATED HIERARCHY OF BRANCHES AND CAREER GOALS
// -------------------------------------------------------------

export const CAREER_GOALS_DATA: Record<string, {
  branch_name: string;
  category: string;
  goals: {
    title: string;
    mainly_learn: string[];
    salary: number;
    demand: 'Extremely High' | 'High' | 'Steady' | 'Explosive Growth';
    exp: number;
  }[];
}> = {
  // ================= 💻 Computer & IT =================
  CSE: {
    branch_name: 'Computer Science and Engineering',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Software Engineer',
        mainly_learn: ['DSA', 'OOP', 'Java / Python / C++', 'Git', 'DBMS', 'SQL', 'OS', 'Computer Networks', 'System Design'],
        salary: 115000,
        demand: 'Extremely High',
        exp: 0
      },
      {
        title: 'Full-Stack Developer',
        mainly_learn: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'SQL/NoSQL', 'REST APIs', 'Git'],
        salary: 112000,
        demand: 'Extremely High',
        exp: 0
      },
      {
        title: 'Backend Developer',
        mainly_learn: ['Python / Java / Node.js', 'APIs', 'SQL', 'NoSQL', 'Authentication', 'System Design', 'Docker'],
        salary: 118000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'System Engineer',
        mainly_learn: ['Operating Systems', 'Linux', 'Networking', 'Cloud', 'Scripting (Bash/Python)', 'Troubleshooting', 'System Design'],
        salary: 108000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  IT: {
    branch_name: 'Information Technology',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Software Developer',
        mainly_learn: ['Programming', 'DSA', 'OOP', 'DBMS', 'SQL', 'Git', 'APIs'],
        salary: 105000,
        demand: 'Extremely High',
        exp: 0
      },
      {
        title: 'IT Consultant',
        mainly_learn: ['Programming basics', 'Databases', 'Cloud', 'Networking', 'Business Analysis', 'Communication'],
        salary: 102000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'System Administrator',
        mainly_learn: ['Linux', 'Windows Server', 'Networking', 'Shell Scripting', 'Cloud', 'Security'],
        salary: 98000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'IT Analyst',
        mainly_learn: ['SQL', 'Excel', 'Data Analysis', 'Python', 'Business Analysis', 'Visualization'],
        salary: 96000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  AIML: {
    branch_name: 'Artificial Intelligence & Machine Learning',
    category: 'Computer & IT',
    goals: [
      {
        title: 'AI Engineer',
        mainly_learn: ['Python', 'ML', 'Deep Learning', 'NLP', 'Computer Vision', 'APIs', 'MLOps'],
        salary: 135000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'ML Engineer',
        mainly_learn: ['Python', 'DSA', 'Statistics', 'ML Algorithms', 'TensorFlow / PyTorch', 'Deployment', 'MLOps'],
        salary: 132000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'AI Researcher',
        mainly_learn: ['Mathematics', 'Statistics', 'Python', 'ML', 'Deep Learning', 'Research Methodology', 'Papers'],
        salary: 140000,
        demand: 'High',
        exp: 2
      },
      {
        title: 'Applied Scientist',
        mainly_learn: ['Statistics', 'ML', 'Deep Learning', 'Experimentation', 'Python', 'Research'],
        salary: 138000,
        demand: 'High',
        exp: 1.5
      }
    ]
  },
  AIDS: {
    branch_name: 'AI & Data Science',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Data Scientist',
        mainly_learn: ['Python', 'Statistics', 'SQL', 'Pandas', 'ML', 'Visualization', 'Feature Engineering'],
        salary: 125000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'ML Engineer',
        mainly_learn: ['Python', 'DSA', 'ML', 'Deep Learning', 'Model Deployment', 'MLOps'],
        salary: 130000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'Data Analyst',
        mainly_learn: ['SQL', 'Excel', 'Python', 'Pandas', 'Statistics', 'Power BI / Tableau'],
        salary: 95000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'AI Engineer',
        mainly_learn: ['Python', 'ML', 'Deep Learning', 'NLP/CV', 'APIs', 'Deployment'],
        salary: 128000,
        demand: 'Explosive Growth',
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
        mainly_learn: ['Python', 'SQL', 'Statistics', 'ML', 'Pandas', 'Visualization'],
        salary: 126000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Data Analyst',
        mainly_learn: ['SQL', 'Excel', 'Python', 'Statistics', 'Power BI / Tableau'],
        salary: 96000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Data Engineer',
        mainly_learn: ['Python/Java', 'SQL', 'ETL', 'Data Warehousing', 'Spark', 'Airflow', 'Cloud'],
        salary: 128000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'BI Analyst',
        mainly_learn: ['SQL', 'Power BI / Tableau', 'Excel', 'Data Modeling', 'Business Analysis'],
        salary: 98000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  CYBER: {
    branch_name: 'Cyber Security',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Cybersecurity Engineer',
        mainly_learn: ['Networking', 'Linux', 'Security Fundamentals', 'Cryptography', 'Python', 'Firewalls', 'Cloud Security'],
        salary: 124000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Security Analyst',
        mainly_learn: ['Networking', 'SIEM Tools', 'Linux', 'Threat Detection', 'Incident Response'],
        salary: 105000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Ethical Hacker',
        mainly_learn: ['Networking', 'Linux', 'Python', 'Web Security', 'Penetration Testing', 'OWASP Top 10'],
        salary: 120000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'SOC Analyst',
        mainly_learn: ['Networking', 'SIEM', 'Log Analysis', 'Threat Intelligence', 'Incident Response'],
        salary: 98000,
        demand: 'High',
        exp: 0
      }
    ]
  },
  IOT: {
    branch_name: 'Internet of Things (IoT)',
    category: 'Computer & IT',
    goals: [
      {
        title: 'IoT Engineer',
        mainly_learn: ['C/C++', 'Python', 'Sensors', 'Microcontrollers', 'Networking', 'MQTT', 'Cloud IoT'],
        salary: 114000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'IoT Developer',
        mainly_learn: ['Python/C++', 'Embedded Systems', 'APIs', 'MQTT', 'Databases', 'Cloud'],
        salary: 112000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Embedded Engineer',
        mainly_learn: ['C/C++', 'Microcontrollers', 'RTOS', 'Embedded Linux', 'Electronics'],
        salary: 116000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'IoT Solutions Architect',
        mainly_learn: ['IoT Architecture', 'Cloud', 'Networking', 'Security', 'Databases', 'Distributed Systems'],
        salary: 136000,
        demand: 'Extremely High',
        exp: 2
      }
    ]
  },
  CSBS: {
    branch_name: 'Computer Science and Business Systems',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Software Engineer',
        mainly_learn: ['DSA', 'Programming', 'OOP', 'DBMS', 'Git', 'APIs'],
        salary: 112000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Business Analyst',
        mainly_learn: ['SQL', 'Excel', 'Data Analysis', 'Requirements Analysis', 'Communication'],
        salary: 104000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Product Analyst',
        mainly_learn: ['SQL', 'Statistics', 'Product Analytics', 'Excel', 'BI Tools'],
        salary: 106000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'IT Consultant',
        mainly_learn: ['Programming', 'Cloud', 'Databases', 'Business Analysis', 'Communication'],
        salary: 108000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  CSIT: {
    branch_name: 'Computer Science & Information Technology',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Software Developer',
        mainly_learn: ['Programming', 'DSA', 'DBMS', 'SQL', 'Git', 'APIs'],
        salary: 110000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Systems Engineer',
        mainly_learn: ['Linux', 'Networking', 'Cloud', 'Scripting', 'Operating Systems'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Cloud Engineer',
        mainly_learn: ['Linux', 'Networking', 'AWS / Azure / GCP', 'Docker', 'Kubernetes'],
        salary: 122000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'IT Analyst',
        mainly_learn: ['SQL', 'Python', 'Excel', 'Data Visualization', 'Business Analysis'],
        salary: 95000,
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
        mainly_learn: ['DSA', 'OOP', 'DBMS', 'OS', 'Networking', 'Git'],
        salary: 115000,
        demand: 'Extremely High',
        exp: 0
      },
      {
        title: 'Application Developer',
        mainly_learn: ['Java / Python / JavaScript', 'APIs', 'Databases', 'Frameworks'],
        salary: 110000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'DevOps Engineer',
        mainly_learn: ['Linux', 'Git', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'Cloud', 'Terraform'],
        salary: 126000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'QA Engineer',
        mainly_learn: ['Software Testing', 'Test Automation', 'Selenium / Playwright', 'API Testing', 'SQL', 'CI/CD'],
        salary: 96000,
        demand: 'High',
        exp: 0
      }
    ]
  },
  CE: {
    branch_name: 'Computer Engineering',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Software Engineer',
        mainly_learn: ['DSA', 'Programming', 'DBMS', 'Operating Systems', 'Git'],
        salary: 114000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Systems Engineer',
        mainly_learn: ['Operating Systems', 'Linux', 'Networking', 'Cloud'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Network Engineer',
        mainly_learn: ['Networking', 'TCP/IP', 'Routing', 'Switching', 'Linux'],
        salary: 102000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Hardware Engineer',
        mainly_learn: ['Digital Electronics', 'Computer Architecture', 'Verilog', 'PCB basics'],
        salary: 118000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  CLOUD: {
    branch_name: 'Cloud Computing',
    category: 'Computer & IT',
    goals: [
      {
        title: 'Cloud Engineer',
        mainly_learn: ['Linux', 'Networking', 'AWS / Azure / GCP', 'Docker', 'Kubernetes', 'Terraform'],
        salary: 124000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Cloud Architect',
        mainly_learn: ['Cloud Architecture', 'Networking', 'Security', 'Distributed Systems'],
        salary: 145000,
        demand: 'Extremely High',
        exp: 2
      },
      {
        title: 'DevOps Engineer',
        mainly_learn: ['Linux', 'Git', 'Docker', 'Kubernetes', 'CI/CD', 'Cloud'],
        salary: 125000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Cloud Security Engineer',
        mainly_learn: ['Cloud Platforms', 'IAM', 'Networking', 'Security', 'Encryption', 'Compliance'],
        salary: 132000,
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
        mainly_learn: ['Blockchain fundamentals', 'Solidity', 'JavaScript/TypeScript', 'Web3', 'Smart Contracts'],
        salary: 130000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Web3 Developer',
        mainly_learn: ['JavaScript/TypeScript', 'React', 'Solidity', 'APIs', 'Web3 libraries'],
        salary: 120000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Smart Contract Developer',
        mainly_learn: ['Solidity', 'Ethereum', 'Smart Contracts', 'Security Audits', 'Testing'],
        salary: 135000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Blockchain Engineer',
        mainly_learn: ['Distributed Systems', 'Cryptography', 'Blockchain Architecture', 'Systems Programming (Rust/Go)'],
        salary: 138000,
        demand: 'High',
        exp: 1.5
      }
    ]
  },

  // ================= ⚡ Electrical & Electronics =================
  EEE: {
    branch_name: 'Electrical and Electronics Engineering',
    category: 'Electrical & Electronics',
    goals: [
      {
        title: 'Electrical Engineer',
        mainly_learn: ['Circuit Theory', 'Electrical Machines', 'Power Systems', 'Control Systems', 'MATLAB'],
        salary: 104000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Power Systems Engineer',
        mainly_learn: ['Power Systems', 'Electrical Machines', 'Grid Protection', 'MATLAB / ETAP'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Control Engineer',
        mainly_learn: ['Control Systems', 'MATLAB / Simulink', 'Signals', 'PLC Programming'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Renewable Energy Engineer',
        mainly_learn: ['Power Electronics', 'Solar / Wind Systems', 'Energy Storage', 'Power Systems'],
        salary: 110000,
        demand: 'Explosive Growth',
        exp: 0.5
      }
    ]
  },
  ECE: {
    branch_name: 'Electronics and Communication Engineering',
    category: 'Electrical & Electronics',
    goals: [
      {
        title: 'Electronics Engineer',
        mainly_learn: ['Digital Electronics', 'Analog Electronics', 'Microprocessors', 'PCB Design'],
        salary: 106000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Embedded Engineer',
        mainly_learn: ['C/C++', 'Microcontrollers (STM32/ESP32)', 'RTOS', 'Embedded Linux'],
        salary: 114000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Communication Engineer',
        mainly_learn: ['Signals & Systems', 'Digital Communication', 'RF Engineering', 'Networking'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'VLSI Engineer',
        mainly_learn: ['Digital Logic', 'Verilog / SystemVerilog', 'RTL Design', 'Computer Architecture'],
        salary: 126000,
        demand: 'Extremely High',
        exp: 1
      }
    ]
  },
  EIE: {
    branch_name: 'Electronics & Instrumentation Engineering',
    category: 'Electrical & Electronics',
    goals: [
      {
        title: 'Instrumentation Engineer',
        mainly_learn: ['Sensors', 'Transducers', 'Measurement Systems', 'PLC', 'SCADA'],
        salary: 102000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Control Systems Engineer',
        mainly_learn: ['Control Theory', 'MATLAB', 'PLC', 'Industrial Automation'],
        salary: 106000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Automation Engineer',
        mainly_learn: ['PLC', 'SCADA', 'Industrial Networks', 'Sensors', 'Robotics'],
        salary: 110000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  VLSI: {
    branch_name: 'VLSI Design',
    category: 'Electrical & Electronics',
    goals: [
      {
        title: 'VLSI Engineer',
        mainly_learn: ['Digital Logic', 'Verilog', 'SystemVerilog', 'RTL', 'CMOS'],
        salary: 128000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'RTL Design Engineer',
        mainly_learn: ['Verilog / SystemVerilog', 'Digital Design', 'Computer Architecture', 'Synthesis'],
        salary: 132000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'ASIC Engineer',
        mainly_learn: ['RTL', 'ASIC Flow', 'CMOS', 'EDA Tools (Synopsys/Cadence)'],
        salary: 135000,
        demand: 'Extremely High',
        exp: 1.5
      },
      {
        title: 'Verification Engineer',
        mainly_learn: ['SystemVerilog', 'UVM Methodology', 'Digital Design', 'Functional Verification'],
        salary: 130000,
        demand: 'Extremely High',
        exp: 1
      }
    ]
  },
  EMBEDDED: {
    branch_name: 'Embedded Systems',
    category: 'Electrical & Electronics',
    goals: [
      {
        title: 'Embedded Engineer',
        mainly_learn: ['C/C++', 'Microcontrollers', 'RTOS', 'UART / SPI / I2C Buses'],
        salary: 114000,
        demand: 'Extremely High',
        exp: 0.5
      },
      {
        title: 'Firmware Engineer',
        mainly_learn: ['C', 'Microcontrollers', 'Device Drivers', 'RTOS', 'Hardware Debugging'],
        salary: 120000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Embedded Software Developer',
        mainly_learn: ['C/C++', 'Embedded Linux', 'RTOS', 'Device Drivers', 'BSP'],
        salary: 118000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'IoT Engineer',
        mainly_learn: ['Embedded C/C++', 'Sensors', 'MQTT', 'Networking', 'Cloud Services'],
        salary: 115000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },

  // ================= ⚙️ Mechanical & Related =================
  MECH: {
    branch_name: 'Mechanical Engineering',
    category: 'Mechanical & Related',
    goals: [
      {
        title: 'Mechanical Engineer',
        mainly_learn: ['Engineering Mechanics', 'Thermodynamics', 'Manufacturing Processes', 'CAD'],
        salary: 98000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Design Engineer',
        mainly_learn: ['CAD', 'SolidWorks / CATIA', 'GD&T', 'Materials', 'Mechanical Design'],
        salary: 104000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Manufacturing Engineer',
        mainly_learn: ['Manufacturing Processes', 'CNC Machining', 'CAD/CAM', 'Quality Control'],
        salary: 100000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Thermal Engineer',
        mainly_learn: ['Thermodynamics', 'Heat Transfer', 'Fluid Mechanics', 'CFD Simulation'],
        salary: 108000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  MECHATRONICS: {
    branch_name: 'Mechatronics Engineering',
    category: 'Mechanical & Related',
    goals: [
      {
        title: 'Mechatronics Engineer',
        mainly_learn: ['Mechanical Design', 'Electronics', 'Sensors', 'Control Systems'],
        salary: 106000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Robotics Engineer',
        mainly_learn: ['Robotics Kinematics', 'C++/Python', 'Sensors', 'Feedback Control', 'ROS'],
        salary: 116000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Automation Engineer',
        mainly_learn: ['PLC', 'SCADA', 'Sensors', 'Control Systems'],
        salary: 108000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Control Engineer',
        mainly_learn: ['Control Theory', 'MATLAB / Simulink', 'Sensors', 'Actuators'],
        salary: 107000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  AUTO: {
    branch_name: 'Automobile Engineering',
    category: 'Mechanical & Related',
    goals: [
      {
        title: 'Automotive Engineer',
        mainly_learn: ['Vehicle Dynamics', 'Automotive Systems', 'CAD Modeling'],
        salary: 102000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Vehicle Design Engineer',
        mainly_learn: ['CAD', 'Mechanical Design', 'Lightweight Materials', 'Crash Simulation'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'EV Engineer',
        mainly_learn: ['Lithium Batteries', 'Power Electronics', 'Traction Motors', 'BMS', 'EV Architecture'],
        salary: 122000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'Automotive Systems Engineer',
        mainly_learn: ['Embedded Systems', 'CAN Bus', 'Automotive Sensors', 'ECU Control Systems'],
        salary: 114000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  ROBOTICS: {
    branch_name: 'Robotics Engineering',
    category: 'Mechanical & Related',
    goals: [
      {
        title: 'Robotics Engineer',
        mainly_learn: ['Robotics Kinematics', 'Python / C++', 'ROS / ROS2', 'Sensors', 'Control Systems'],
        salary: 118000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Robot Programmer',
        mainly_learn: ['C++', 'Python', 'ROS', 'Industrial Robot Programming (KUKA/ABB)'],
        salary: 105000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Automation Engineer',
        mainly_learn: ['PLC', 'SCADA', 'Industrial Robotics Workcells'],
        salary: 110000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Robotics Software Engineer',
        mainly_learn: ['C++', 'Python', 'ROS', 'Computer Vision (OpenCV)', 'Path Planning Algorithms'],
        salary: 125000,
        demand: 'Explosive Growth',
        exp: 1
      }
    ]
  },

  // ================= 🏗️ Civil & Infrastructure =================
  CIVIL: {
    branch_name: 'Civil Engineering',
    category: 'Civil & Infrastructure',
    goals: [
      {
        title: 'Civil Engineer',
        mainly_learn: ['Structural Analysis', 'Construction Technology', 'Surveying', 'AutoCAD'],
        salary: 95000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Site Engineer',
        mainly_learn: ['Construction Management', 'AutoCAD', 'Surveying Equipment', 'Cost Estimation'],
        salary: 92000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Structural Engineer',
        mainly_learn: ['Structural Analysis', 'RCC Design', 'Steel Design', 'STAAD.Pro / ETABS'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Project Engineer',
        mainly_learn: ['Project Management', 'Cost Estimation', 'Primavera / MS Project', 'Site Execution'],
        salary: 102000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  STRUCT: {
    branch_name: 'Structural Engineering',
    category: 'Civil & Infrastructure',
    goals: [
      {
        title: 'Structural Engineer',
        mainly_learn: ['Structural Analysis', 'RCC Structures', 'Steel Structures', 'ETABS / STAAD'],
        salary: 110000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Structural Designer',
        mainly_learn: ['AutoCAD', 'Revit Structure', 'Structural Detailing', 'BIM Workflows'],
        salary: 102000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Building Engineer',
        mainly_learn: ['Structural Design', 'BIM', 'Building Codes', 'Construction Techniques'],
        salary: 104000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Construction Engineer',
        mainly_learn: ['Construction Management', 'Materials Testing', 'Site Planning', 'Safety Standards'],
        salary: 98000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  ENV: {
    branch_name: 'Environmental Engineering',
    category: 'Civil & Infrastructure',
    goals: [
      {
        title: 'Environmental Engineer',
        mainly_learn: ['Environmental Science', 'Waste Management', 'Water Treatment', 'EIA'],
        salary: 98000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Sustainability Engineer',
        mainly_learn: ['Sustainability Frameworks', 'Energy Management', 'Carbon Accounting', 'Environmental Analysis'],
        salary: 106000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'Environmental Consultant',
        mainly_learn: ['Environmental Regulations', 'Impact Assessment', 'Data Analysis', 'Reporting'],
        salary: 100000,
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
        mainly_learn: ['Soil Mechanics', 'Foundation Engineering', 'Engineering Geology', 'PLAXIS / GeoStudio'],
        salary: 106000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Soil Engineer',
        mainly_learn: ['Soil Testing (SPT/Triaxial)', 'Soil Mechanics', 'Geotechnical Lab Analysis'],
        salary: 98000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Foundation Engineer',
        mainly_learn: ['Foundation Design (Shallow/Deep)', 'Soil Mechanics', 'Structural Interaction'],
        salary: 108000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  TRANS: {
    branch_name: 'Transportation Engineering',
    category: 'Civil & Infrastructure',
    goals: [
      {
        title: 'Transportation Engineer',
        mainly_learn: ['Transportation Planning', 'Highway Engineering', 'GIS Spatial Data', 'Traffic Flow'],
        salary: 102000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Highway Engineer',
        mainly_learn: ['Highway Geometric Design', 'Surveying', 'AutoCAD', 'Civil 3D'],
        salary: 100000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Traffic Engineer',
        mainly_learn: ['Traffic Flow Theory', 'Signal Timing (VISSIM/SUMO)', 'Transportation Data Analysis'],
        salary: 105000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Urban Mobility Planner',
        mainly_learn: ['GIS', 'Urban Planning', 'Transportation Data', 'Public Transit Modeling'],
        salary: 104000,
        demand: 'High',
        exp: 1
      }
    ]
  },

  // ================= 🧪 Chemical, Bio & Materials =================
  CHEM: {
    branch_name: 'Chemical Engineering',
    category: 'Chemical & Materials',
    goals: [
      {
        title: 'Chemical Engineer',
        mainly_learn: ['Chemical Processes', 'Thermodynamics', 'Fluid Mechanics', 'Process Control'],
        salary: 104000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Process Engineer',
        mainly_learn: ['Process Design', 'Mass Transfer', 'Heat Transfer', 'Aspen Plus Simulation'],
        salary: 110000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Plant Engineer',
        mainly_learn: ['Process Operations', 'Plant Safety', 'Equipment Maintenance', 'Process Control'],
        salary: 106000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Process Safety Engineer',
        mainly_learn: ['Process Safety', 'HAZOP Studies', 'LOPA Quantitative Risk', 'Chemical Safety Codes'],
        salary: 114000,
        demand: 'High',
        exp: 1.5
      }
    ]
  },
  BIOTECH: {
    branch_name: 'Biotechnology',
    category: 'Chemical & Materials',
    goals: [
      {
        title: 'Biotechnologist',
        mainly_learn: ['Molecular Biology', 'Genetics', 'Microbiology', 'Biotechnology Techniques'],
        salary: 98000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Bioprocess Engineer',
        mainly_learn: ['Bioprocessing', 'Fermentation Kinetics', 'Bioreactors', 'Downstream Purification'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Research Scientist',
        mainly_learn: ['Molecular Biology', 'Assay Design', 'Statistics', 'Experimental Methods'],
        salary: 116000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Biotech Analyst',
        mainly_learn: ['Biological Data Analysis', 'Bioinformatics Tools', 'R / Python', 'Biostatistics'],
        salary: 102000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  BIOINFO: {
    branch_name: 'Bio Informatics',
    category: 'Chemical & Materials',
    goals: [
      {
        title: 'Bioinformatics Scientist',
        mainly_learn: ['Genetics', 'Python/R', 'Biostatistics', 'Genomics Pipelines', 'NCBI Databases'],
        salary: 122000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Computational Biologist',
        mainly_learn: ['Biological Algorithms', 'Python/R', 'Structural Biology', 'Statistical Modeling'],
        salary: 125000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Genomics Analyst',
        mainly_learn: ['Genomics', 'Next-Gen Sequencing (NGS)', 'Python/R', 'Bioinformatics Pipelines (GATK)'],
        salary: 118000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Bioinformatics Engineer',
        mainly_learn: ['Python', 'R', 'Linux', 'Databases', 'Nextflow / Snakemake', 'Genomic Data Pipelines'],
        salary: 124000,
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
        mainly_learn: ['Physiology', 'Biomedical Electronics', 'Medical Devices', 'Biosignal Processing'],
        salary: 104000,
        demand: 'High',
        exp: 0
      },
      {
        title: 'Medical Device Engineer',
        mainly_learn: ['Sensors', 'CAD Design', 'FDA / ISO 13485 Standards', 'Biomechanics'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Clinical Engineer',
        mainly_learn: ['Medical Equipment Maintenance', 'Biomedical Instrumentation', 'Hospital Healthcare Systems'],
        salary: 98000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Healthcare Technology Specialist',
        mainly_learn: ['Healthcare IT (DICOM/HL7)', 'Medical Devices', 'Clinical Data Analysis'],
        salary: 106000,
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
        mainly_learn: ['Materials Science', 'Physical Metallurgy', 'Materials Characterization (SEM/XRD)'],
        salary: 106000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Materials Scientist',
        mainly_learn: ['Solid State Physics', 'Materials Synthesis', 'Spectroscopy', 'R&D Methodology'],
        salary: 112000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Metallurgy Engineer',
        mainly_learn: ['Extractive & Physical Metallurgy', 'Heat Treatment', 'Non-Destructive Testing'],
        salary: 104000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'R&D Materials Engineer',
        mainly_learn: ['Materials Science', 'Finite Element Simulation', 'Nanomaterials', 'Research Methods'],
        salary: 114000,
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
        mainly_learn: ['Food Chemistry', 'Food Processing Operations', 'Food Microbiology', 'Formulation'],
        salary: 94000,
        demand: 'Steady',
        exp: 0
      },
      {
        title: 'Food Process Engineer',
        mainly_learn: ['Thermal Sterilization Kinetics', 'Fluid Rheology', 'Aseptic Filling', 'Packaging Design'],
        salary: 102000,
        demand: 'Steady',
        exp: 1
      },
      {
        title: 'Quality Control Engineer',
        mainly_learn: ['Quality Assurance', 'Analytical Testing', 'Sensory Evaluation', 'ISO 22000'],
        salary: 90000,
        demand: 'Steady',
        exp: 0.5
      },
      {
        title: 'Food Safety Specialist',
        mainly_learn: ['HACCP Critical Control Points', 'Food Safety Audits', 'Microbiology Testing', 'FDA Regulations'],
        salary: 96000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  PHARMA: {
    branch_name: 'Pharmaceutical Engineering',
    category: 'Chemical & Materials',
    goals: [
      {
        title: 'Pharmaceutical Engineer',
        mainly_learn: ['Process Engineering', 'Pharmaceutical Unit Operations', 'GMP Good Manufacturing Practice', 'Cleanroom Ops'],
        salary: 108000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Process Engineer',
        mainly_learn: ['Process Design', 'API Synthesis', 'Scale-up Dynamics', 'Process Analytical Tech (PAT)'],
        salary: 114000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Validation Engineer',
        mainly_learn: ['IQ/OQ/PQ Validation', 'GMP Regulations', 'Cleanroom Environmental Control', 'Quality Risk'],
        salary: 106000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Manufacturing Engineer',
        mainly_learn: ['Sterile Manufacturing', 'Tablet Compression', 'Lyophilization', 'Statistical Process Control'],
        salary: 104000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },

  // ================= ✈️ Aerospace & Specialized =================
  AERO: {
    branch_name: 'Aerospace Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Aerospace Engineer',
        mainly_learn: ['Aerodynamics', 'Propulsion Systems', 'Aircraft Structures', 'CAD', 'MATLAB / Simulink'],
        salary: 118000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Aircraft Design Engineer',
        mainly_learn: ['Compressible Aerodynamics', 'CAD', 'Structural FEA (Nastran)', 'Composite Materials'],
        salary: 122000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Propulsion Engineer',
        mainly_learn: ['Gas Turbines', 'Combustion Thermodynamics', 'Rocket Propulsion', 'CFD Simulation'],
        salary: 125000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Space Systems Engineer',
        mainly_learn: ['Orbital Mechanics (Keplerian)', 'Satellite Subsystems', 'Attitude Control (ADCS)', 'Thermal Vacuum'],
        salary: 128000,
        demand: 'Explosive Growth',
        exp: 1.5
      }
    ]
  },
  AVIONICS: {
    branch_name: 'Avionics Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Avionics Engineer',
        mainly_learn: ['Aerospace Electronics', 'Embedded Systems', 'MIL-STD-1553 / ARINC 429', 'Flight Control Systems'],
        salary: 120000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Flight Control Engineer',
        mainly_learn: ['Flight Dynamics', 'Fly-by-Wire Control Laws', 'MATLAB / Simulink', 'Kalman Filtering'],
        salary: 124000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Embedded Systems Engineer',
        mainly_learn: ['DO-178C Safety Standards', 'RTOS (VxWorks)', 'C/C++', 'Avionics Hardware Interfaces'],
        salary: 122000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  MARINE: {
    branch_name: 'Marine Engineering & Naval Architecture',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Marine Engineer',
        mainly_learn: ['Marine Diesel Machinery', 'Ship Auxiliary Systems', 'Thermodynamics', 'Marine Fluid Systems'],
        salary: 108000,
        demand: 'Steady',
        exp: 0.5
      },
      {
        title: 'Naval Architect',
        mainly_learn: ['Ship Hull Hydrostatics', 'Metacentric GZ Stability Curves', 'CAD', 'Structural Hull Sizing'],
        salary: 115000,
        demand: 'Steady',
        exp: 1
      },
      {
        title: 'Offshore Engineer',
        mainly_learn: ['Offshore Platform Dynamics', 'Wave Hydrodynamics', 'Mooring Line Analysis', 'Subsea Piping'],
        salary: 120000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  PETRO: {
    branch_name: 'Petroleum Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Petroleum Engineer',
        mainly_learn: ['Reservoir Rock Properties', 'Drilling Engineering', 'Multiphase Production', 'Well Logging'],
        salary: 130000,
        demand: 'Steady',
        exp: 1
      },
      {
        title: 'Reservoir Engineer',
        mainly_learn: ['Reservoir Simulation (ECLIPSE)', 'Material Balance', 'Decline Curve Analysis', 'Enhanced Oil Recovery'],
        salary: 138000,
        demand: 'Steady',
        exp: 1.5
      },
      {
        title: 'Drilling Engineer',
        mainly_learn: ['Drillstring Hydraulics', 'Blowout Preventer (BOP) Systems', 'Directional Drilling', 'Mud Logging'],
        salary: 132000,
        demand: 'Steady',
        exp: 1
      },
      {
        title: 'Production Engineer',
        mainly_learn: ['Nodal Analysis', 'Artificial Lift (ESP/Gas Lift)', 'Surface Separators', 'Pipeline Flow Assurance'],
        salary: 128000,
        demand: 'Steady',
        exp: 1
      }
    ]
  },
  MINING: {
    branch_name: 'Mining Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Mining Engineer',
        mainly_learn: ['Surface & Underground Mining Methods', 'Rock Mechanics', 'Mine Planning', 'Mining Safety Codes'],
        salary: 114000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Mine Planning Engineer',
        mainly_learn: ['Lerchs-Grossmann Pit Optimization', 'Block Modeling (Surpac/Vulcan)', 'Ore Reserve Estimation'],
        salary: 120000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Safety Engineer',
        mainly_learn: ['Mine Ventilation (Ventsim)', 'Hazard Identification', 'Subsurface Gas Monitoring', 'Emergency Escape'],
        salary: 108000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },

  // ================= 🌱 Emerging / Interdisciplinary =================
  RENEWABLE: {
    branch_name: 'Renewable Energy Engineering',
    category: 'Emerging / Interdisciplinary',
    goals: [
      {
        title: 'Renewable Energy Engineer',
        mainly_learn: ['Photovoltaic Solar Systems', 'Wind Turbine Aerodynamics', 'Power Inverters', 'Grid Interconnection'],
        salary: 112000,
        demand: 'Explosive Growth',
        exp: 0.5
      },
      {
        title: 'Solar Engineer',
        mainly_learn: ['PVsyst Yield Simulation', 'Solar MPPT Inverters', 'BOS Electrical Sizing', 'Irradiance Modeling'],
        salary: 108000,
        demand: 'Explosive Growth',
        exp: 0.5
      },
      {
        title: 'Wind Energy Engineer',
        mainly_learn: ['Wind Resource Assessment (WAsP)', 'Blade Aerodynamics', 'Wind Farm Wake Modeling', 'Turbine Pitch Control'],
        salary: 114000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Energy Storage Consultant',
        mainly_learn: ['BESS Battery Storage Systems', 'Grid Peak Shaving', 'Levelized Cost of Energy (LCOE)', 'Microgrids'],
        salary: 120000,
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
        mainly_learn: ['Industrial Energy Systems', 'Applied Thermodynamics', 'Renewable Energy', 'Energy Auditing (ASHRAE)'],
        salary: 106000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Energy Systems Analyst',
        mainly_learn: ['Energy Modeling (SAM/HOMER)', 'Building Energy Simulation (EnergyPlus)', 'Utility Rate Structures'],
        salary: 104000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Sustainability Engineer',
        mainly_learn: ['Decarbonization Pathways', 'Scope 1-3 Greenhouse Gas Accounting', 'Life Cycle Assessment (LCA)'],
        salary: 110000,
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
        mainly_learn: ['Python', 'Advanced SQL', 'Distributed ETL', 'Apache Spark', 'Apache Airflow', 'Cloud Data Warehouses'],
        salary: 128000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Big Data Engineer',
        mainly_learn: ['Hadoop / Spark', 'Kafka Real-Time Streaming', 'Distributed Storage (Parquet/Delta)', 'Scala / Python'],
        salary: 134000,
        demand: 'Extremely High',
        exp: 1.5
      },
      {
        title: 'Data Platform Engineer',
        mainly_learn: ['Data Infrastructure as Code', 'Snowflake / BigQuery', 'Kubernetes for Data', 'Data Governance'],
        salary: 136000,
        demand: 'Extremely High',
        exp: 1.5
      },
      {
        title: 'Analytics Engineer',
        mainly_learn: ['dbt (Data Build Tool)', 'Dimensional Data Modeling (Kimball)', 'Advanced SQL', 'Data CI/CD'],
        salary: 120000,
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
        mainly_learn: ['Linear Algebra & Complex Hilbert Spaces', 'Quantum Mechanics', 'Python', 'Quantum Circuits & Gates'],
        salary: 140000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Quantum Software Developer',
        mainly_learn: ['Python', 'Qiskit / Cirq SDK', 'Quantum Algorithms (Shor / Grover / VQE)', 'Quantum Noise Mitigation'],
        salary: 138000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Quantum Researcher',
        mainly_learn: ['Quantum Information Theory', 'Quantum Error Correction (Surface Codes)', 'Superconducting Qubits', 'Research Papers'],
        salary: 145000,
        demand: 'High',
        exp: 2
      }
    ]
  },
  SEMICONDUCTOR: {
    branch_name: 'Semiconductor Engineering',
    category: 'Emerging / Interdisciplinary',
    goals: [
      {
        title: 'Semiconductor Engineer',
        mainly_learn: ['Semiconductor Physics', 'Cleanroom Photolithography', 'Etching & Chemical Deposition', 'Wafer Metrology'],
        salary: 124000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Chip Design Engineer',
        mainly_learn: ['Digital Logic Design', 'Verilog / SystemVerilog', 'RTL Synthesis', 'Static Timing Analysis (STA)'],
        salary: 134000,
        demand: 'Extremely High',
        exp: 1.5
      },
      {
        title: 'Process Integration Engineer',
        mainly_learn: ['FinFET / GAA Transistor Physics', 'Yield Engineering', 'Statistical Process Control (SPC)', 'Defect Analysis'],
        salary: 128000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Verification Engineer',
        mainly_learn: ['SystemVerilog', 'UVM Verification', 'Assertion-Based Verification', 'Coverage Closure'],
        salary: 130000,
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
        mainly_learn: ['Spacecraft Systems Architecture', 'Orbital Mechanics', 'Radiation-Tolerant Avionics', 'Thermal Balances'],
        salary: 132000,
        demand: 'Explosive Growth',
        exp: 1.5
      },
      {
        title: 'Satellite Engineer',
        mainly_learn: ['SmallSat / CubeSat Bus Systems', 'RF Space Transceivers', 'Solar Array & Battery Systems', 'Space Telemetry'],
        salary: 126000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Mission Systems Engineer',
        mainly_learn: ['Mission Trajectory Planning (GMAT)', 'Ground Station Link Budgets', 'Fault Detection & Autonomous Recovery'],
        salary: 135000,
        demand: 'High',
        exp: 1.5
      }
    ]
  },
  DEFENCE: {
    branch_name: 'Defence Technology',
    category: 'Emerging / Interdisciplinary',
    goals: [
      {
        title: 'Defence Systems Engineer',
        mainly_learn: ['System-of-Systems Integration', 'Secure Tactical Communication', 'Hardened Embedded Systems', 'MIL Standards'],
        salary: 126000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Defence Electronics & Radar Engineer',
        mainly_learn: ['Phased Array Radar Systems', 'Digital Signal Processing (DSP)', 'RF Electronic Countermeasures', 'FPGA Programming'],
        salary: 130000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Guidance & Tracking Specialist',
        mainly_learn: ['Inertial Navigation Systems (INS)', 'Kalman Filtering & Multi-Sensor Fusion', 'Missile Guidance Laws (Proportional Navigation)'],
        salary: 134000,
        demand: 'High',
        exp: 1.5
      }
    ]
  },
  // ================= ⚡ Additional Electrical & Electronics =================
  ELECTRONICS: {
    branch_name: 'Electronics Engineering',
    category: 'Electrical & Electronics',
    goals: [
      {
        title: 'Electronics Design Engineer',
        mainly_learn: ['Analog Circuits', 'Digital Electronics', 'PCB Design (KiCad/Altium)', 'Microcontrollers', 'SPICE Simulation', 'Testing & Debugging'],
        salary: 114000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Consumer Electronics Firmware Engineer',
        mainly_learn: ['Embedded C', 'RTOS', 'I2C/SPI/UART', 'Circuit Debugging', 'Oscilloscopes & Logic Analyzers', 'Low Power Optimization'],
        salary: 118000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'RF & Wireless Engineer',
        mainly_learn: ['RF Circuit Design', 'Antennas & Propagation', 'Impedance Matching', 'Spectrum Analyzers', 'Wireless Protocols (Wi-Fi/BT)', 'EMC/EMI Compliance'],
        salary: 124000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Electronics Test & Validation Engineer',
        mainly_learn: ['Automated Test Equipment (ATE)', 'LabVIEW / Python Automation', 'Oscilloscopes', 'Environmental Stress Testing', 'Root Cause Analysis'],
        salary: 108000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  EE: {
    branch_name: 'Electrical Engineering',
    category: 'Electrical & Electronics',
    goals: [
      {
        title: 'Power Systems Engineer',
        mainly_learn: ['Power Generation & Transmission', 'Load Flow Analysis', 'MATLAB / ETAP', 'Grid Protection & Relays', 'Substation Design', 'Renewable Integration'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Electrical Design Engineer',
        mainly_learn: ['AutoCAD Electrical', 'Switchgear & Transformers', 'Panel Design', 'Cable Sizing & Calculations', 'NEC / IEC Standards', 'Power Distribution'],
        salary: 106000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Control & Drives Engineer',
        mainly_learn: ['AC/DC Motors & Drives', 'Inverters & Converters', 'PLC Programming', 'SCADA', 'Feedback Control Systems', 'Sensor Interfacing'],
        salary: 110000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Energy Auditor & Consultant',
        mainly_learn: ['Power Quality Analysis', 'Harmonics Mitigation', 'Energy Efficiency', 'Tariff Analysis', 'ISO 50001 Standards'],
        salary: 104000,
        demand: 'Steady',
        exp: 1
      }
    ]
  },
  ICE: {
    branch_name: 'Instrumentation & Control Engineering',
    category: 'Electrical & Electronics',
    goals: [
      {
        title: 'Instrumentation Engineer',
        mainly_learn: ['Sensors & Transducers', 'Signal Conditioning', 'Calibration', 'P&ID Diagrams', 'Field Transmitters & Control Valves', 'HART Protocol'],
        salary: 108000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Process Control Automation Engineer',
        mainly_learn: ['DCS (Distributed Control Systems)', 'PLC & SCADA', 'PID Tuning', 'Industrial Ethernet / Modbus', 'Safety Instrumented Systems (SIS/SIL)'],
        salary: 115000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Industrial Automation Specialist',
        mainly_learn: ['Siemens TIA Portal / Rockwell Studio 5000', 'HMI Development', 'Motion Control & VFDs', 'OPC-UA', 'Edge Computing in Manufacturing'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Measurement & Calibration Specialist',
        mainly_learn: ['Metrology Standards', 'Precision Measuring Instruments', 'Uncertainty Analysis', 'ISO/IEC 17025', 'Automated Data Acquisition'],
        salary: 102000,
        demand: 'Steady',
        exp: 0.5
      }
    ]
  },

  // ================= ⚙️ Additional Mechanical & Related =================
  MFG: {
    branch_name: 'Manufacturing Engineering',
    category: 'Mechanical & Related',
    goals: [
      {
        title: 'Manufacturing Process Engineer',
        mainly_learn: ['CNC Machining & G-Code', 'CAD/CAM (Mastercam/Fusion 360)', 'Lean Manufacturing & 5S', 'DFM (Design for Manufacturing)', 'Six Sigma', 'Tooling & Fixtures'],
        salary: 105000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Quality Assurance & Metrology Engineer',
        mainly_learn: ['CMM (Coordinate Measuring Machines)', 'GD&T', 'Statistical Process Control (SPC)', 'FMEA', 'ISO 9001 Standards', 'Root Cause Analysis'],
        salary: 102000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Plant & Operations Engineer',
        mainly_learn: ['Line Balancing', 'Capacity Planning', 'Factory Layout Design', 'OEE (Overall Equipment Effectiveness)', 'OSHA & Industrial Safety', 'Supply Chain Coordination'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Additive Manufacturing Specialist',
        mainly_learn: ['3D Printing Technologies (SLS, DMLS, FDM)', 'Slicing Toolpaths', 'Additive Metallurgy', 'Post-Processing', 'Topology Optimization'],
        salary: 112000,
        demand: 'Explosive Growth',
        exp: 1
      }
    ]
  },
  IE: {
    branch_name: 'Industrial Engineering',
    category: 'Mechanical & Related',
    goals: [
      {
        title: 'Industrial Optimization Engineer',
        mainly_learn: ['Operations Research & Linear Programming', 'Simulation (Arena / AnyLogic)', 'Time & Motion Studies', 'Ergonomics & Workstation Design', 'Python / R Optimization'],
        salary: 106000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Supply Chain & Logistics Analyst',
        mainly_learn: ['Inventory Management (EOQ, JIT)', 'Warehouse Management Systems (WMS)', 'Demand Forecasting', 'Supply Chain Analytics (SQL/PowerBI)', 'Logistics Network Design'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Lean Six Sigma Black Belt Specialist',
        mainly_learn: ['DMAIC Methodology', 'Value Stream Mapping (VSM)', 'Kaizen Events', 'Minitab Statistical Analysis', 'Waste Elimination', 'Change Management'],
        salary: 115000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Production Planning & Scheduling Specialist',
        mainly_learn: ['ERP Systems (SAP / Oracle)', 'MRP II Calculations', 'Master Production Schedule (MPS)', 'Capacity Requirements Planning (CRP)', 'Agile Operations'],
        salary: 104000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  PROD: {
    branch_name: 'Production Engineering',
    category: 'Mechanical & Related',
    goals: [
      {
        title: 'Production Operations Engineer',
        mainly_learn: ['Machining & Metal Forming Processes', 'Assembly Line Management', 'Tool & Die Design', 'Production Scheduling', 'Yield Optimization', 'Standard Operating Procedures (SOP)'],
        salary: 102000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Tooling & Die Design Specialist',
        mainly_learn: ['Press Tool Design', 'Injection Mold Design', 'CAD (SolidWorks/CATIA)', 'Die Casting Mechanics', 'Heat Treatment of Tool Steels', 'FEA for Forming'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Plant Reliability & Maintenance Engineer',
        mainly_learn: ['Total Productive Maintenance (TPM)', 'Vibration Analysis & Thermography', 'Condition Monitoring', 'Preventive Maintenance', 'RCM (Reliability-Centered Maintenance)'],
        salary: 106000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Production Quality Supervisor',
        mainly_learn: ['Inspection & Gauge R&R', 'Control Plans & Process Audits', 'Scrap & Rework Reduction', '8D Problem Solving', 'Worker Safety Compliance'],
        salary: 98000,
        demand: 'Steady',
        exp: 0.5
      }
    ]
  },
  AUTOROB: {
    branch_name: 'Automation & Robotics',
    category: 'Mechanical & Related',
    goals: [
      {
        title: 'Industrial Robotics Integrator',
        mainly_learn: ['Industrial Robot Arms (ABB, KUKA, FANUC)', 'Robot Kinematics & Trajectories', 'RoboDK & Simulation', 'End-Effector & Gripper Design', 'Safety Interlocks & Fencing'],
        salary: 116000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Factory Automation Architect',
        mainly_learn: ['PLC Programming (Ladder, Structured Text)', 'SCADA & HMI Systems', 'Industrial Networks (EtherNet/IP, Profinet)', 'VFDs & Servo Drives', 'Digital Twins'],
        salary: 120000,
        demand: 'Extremely High',
        exp: 1.5
      },
      {
        title: 'Machine Vision & Inspection Specialist',
        mainly_learn: ['OpenCV / Cognex VisionPro', '2D/3D Industrial Cameras & Lighting', 'Pattern Matching & Flaw Detection', 'High-Speed Image Processing', 'Industrial Edge AI'],
        salary: 118000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Automated Guided Vehicle (AGV/AMR) Engineer',
        mainly_learn: ['Mobile Robot Navigation', 'LiDAR & Ultrasonic Sensors', 'SLAM Algorithms', 'Fleet Management Systems', 'Battery & Power Management'],
        salary: 114000,
        demand: 'Explosive Growth',
        exp: 0.5
      }
    ]
  },

  // ================= 🏗️ Additional Civil & Infrastructure =================
  CONST: {
    branch_name: 'Construction Technology',
    category: 'Civil & Infrastructure',
    goals: [
      {
        title: 'Construction Project Manager',
        mainly_learn: ['Primavera P6 / MS Project', 'Construction Estimation & Costing', 'Site Logistics & Site Safety', 'Contract Management (FIDIC)', 'Quality Control in Concreting'],
        salary: 115000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'BIM (Building Information Modeling) Manager',
        mainly_learn: ['Revit Architecture & Structure', 'Navisworks Clash Detection', 'BIM 4D Scheduling & 5D Costing', 'IFC & OpenBIM Standards', 'Point Cloud to BIM Modeling'],
        salary: 118000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Structural Execution & Field Engineer',
        mainly_learn: ['Formwork & Scaffolding Design', 'Reinforcement Detailing & BBS', 'Concrete Mix Design & Testing', 'Substructure & Foundation Execution', 'Surveying with Total Station'],
        salary: 98000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Sustainable & Smart Construction Specialist',
        mainly_learn: ['Precast & Modular Construction', 'LEED / Green Building Certification', 'Construction Automation & Drones', 'Life Cycle Assessment (LCA)', 'Energy Efficient Building Materials'],
        salary: 106000,
        demand: 'High',
        exp: 1
      }
    ]
  },

  // ================= 🧪 Additional Chemical & Materials =================
  BIOCHEM: {
    branch_name: 'Biochemical Engineering',
    category: 'Chemical & Materials',
    goals: [
      {
        title: 'Bioprocess Engineer',
        mainly_learn: ['Fermentation Technology', 'Bioreactor Design & Scale-up', 'Downstream Processing (Chromatography, Filtration)', 'Mass & Energy Balances in Bioreactions', 'Cell Culture Kinetics'],
        salary: 114000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Biochemical R&D Scientist',
        mainly_learn: ['Enzyme Kinetics & Catalysis', 'Protein Purification (HPLC/FPLC)', 'Metabolic Engineering', 'Analytical Biochemistry', 'Spectrophotometry & Mass Spec'],
        salary: 118000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Upstream & Downstream Processing Specialist',
        mainly_learn: ['Media Formulation & Sterilization', 'Ultrafiltration & Centrifugation', 'Biofuel & Bio-products Synthesis', 'cGMP & Cleanroom Standards', 'Process Analytical Technology (PAT)'],
        salary: 110000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Regulatory Affairs & Biosafety Specialist',
        mainly_learn: ['FDA / EMA Biosimilar Regulations', 'ICH Guidelines', 'Biosafety Levels (BSL-2/3) Protocols', 'Quality by Design (QbD)', 'Validation & Documentation'],
        salary: 108000,
        demand: 'Steady',
        exp: 1
      }
    ]
  },
  POLYMER: {
    branch_name: 'Polymer Engineering',
    category: 'Chemical & Materials',
    goals: [
      {
        title: 'Polymer Processing Engineer',
        mainly_learn: ['Injection Molding & Extrusion', 'Moldflow Simulation', 'Polymer Rheology', 'Extrusion Die Design', 'Blow Molding & Thermoforming', 'Process Parameter Tuning'],
        salary: 106000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Polymer Materials Scientist',
        mainly_learn: ['Polymer Synthesis & Characterization (DSC, TGA, FTIR)', 'Biodegradable & Sustainable Polymers', 'Composite Materials Formulation', 'Mechanical Testing (Tensile, Impact)', 'Nanocomposites'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Rubber & Elastomer Technologist',
        mainly_learn: ['Vulcanization & Compounding', 'Viscoelasticity', 'Rubber Testing Standards', 'Tire & Seal Technology', 'Reinforcing Fillers (Carbon Black, Silica)'],
        salary: 104000,
        demand: 'Steady',
        exp: 1
      },
      {
        title: 'Circular Plastics & Recycling Engineer',
        mainly_learn: ['Mechanical & Chemical Recycling', 'Polymer Sorting & Pyrolysis', 'Life Cycle Assessment (LCA)', 'Plastics Waste Upcycling', 'Regulatory Standards'],
        salary: 108000,
        demand: 'Explosive Growth',
        exp: 0.5
      }
    ]
  },

  // ================= ✈️ Additional Aerospace & Specialized =================
  AERONAUTICAL: {
    branch_name: 'Aeronautical Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Aircraft Aerodynamicist',
        mainly_learn: ['Computational Fluid Dynamics (ANSYS Fluent / OpenFOAM)', 'Subsonic & Supersonic Aerodynamics', 'Airfoil Design & Wind Tunnel Testing', 'Boundary Layer Theory', 'Compressible Flow'],
        salary: 122000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Flight Dynamics & Stability Engineer',
        mainly_learn: ['Flight Mechanics', 'Aircraft Stability & Control', 'MATLAB / Simulink Flight Sim', 'Fly-By-Wire Flight Control Laws', 'Handling Qualities'],
        salary: 125000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Aircraft Propulsion Systems Engineer',
        mainly_learn: ['Turbofan & Turbojet Gas Turbines', 'Combustion Chamber Design', 'Thermodynamic Engine Cycles (Brayton Cycle)', 'Blade Cooling & Aerothermal Analysis', 'Emissions Reduction'],
        salary: 128000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Aircraft Structural Stress Engineer',
        mainly_learn: ['Finite Element Analysis (Nastran / Abaqus)', 'Fatigue & Damage Tolerance', 'Airframe Structural Layout', 'Aeroelasticity & Flutter Analysis', 'Metallic & Composite Airframes'],
        salary: 120000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  NAVAL: {
    branch_name: 'Naval Architecture & Ocean Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Naval Architect (Ship Hull Designer)',
        mainly_learn: ['Hull Form Hydrodynamics (Maxsurf / Rhino)', 'Ship Stability & Buoyancy Calculations', 'Resistance & Propulsion Estimation', 'Classification Rules (DNV/ABS/LR)', 'Ship General Arrangement'],
        salary: 116000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Offshore & Marine Structures Engineer',
        mainly_learn: ['Wave Mechanics & Morison Equation', 'Floating Offshore Platforms (FPSO, Semi-Sub)', 'Structural FEA of Marine Decks', 'Mooring & Riser Analysis (OrcaFlex)', 'Corrosion Protection in Seawater'],
        salary: 124000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Marine Systems & Machinery Engineer',
        mainly_learn: ['Marine Diesel & Dual-Fuel Propulsion', 'Piping & Bilge/Ballast Systems', 'HVAC & Refrigeration for Ships', 'Electrical Power Generation at Sea', 'IMO & MARPOL Environmental Rules'],
        salary: 110000,
        demand: 'Steady',
        exp: 0.5
      },
      {
        title: 'Subsea & Ocean Robotics Engineer',
        mainly_learn: ['Autonomous Underwater Vehicles (AUVs/ROVs)', 'Hydroacoustic Positioning', 'Pressure Hull Design', 'Underwater Manipulators', 'Oceanographic Sensor Payloads'],
        salary: 122000,
        demand: 'Explosive Growth',
        exp: 1
      }
    ]
  },
  METALLURGY: {
    branch_name: 'Metallurgical Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Physical Metallurgist',
        mainly_learn: ['Phase Diagrams & TTT Diagrams', 'Heat Treatment of Steels & Alloys', 'Metallography & Optical Microscopy', 'Scanning Electron Microscopy (SEM/EDS)', 'Grain Boundary Engineering'],
        salary: 110000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Extractive & Chemical Metallurgist',
        mainly_learn: ['Pyrometallurgy & Blast Furnace Operations', 'Hydrometallurgy & Leaching', 'Electrowinning & Refining', 'Slag Chemistry & Thermodynamics', 'Metal Recycling & Smelting'],
        salary: 112000,
        demand: 'Steady',
        exp: 1
      },
      {
        title: 'Failure Analysis & NDT Specialist',
        mainly_learn: ['Fracture Mechanics & Fatigue', 'Non-Destructive Testing (Ultrasonic, Eddy Current, X-Ray)', 'Corrosion Mechanisms & Cathodic Protection', 'Root Cause Failure Investigation', 'Welding Metallurgy'],
        salary: 116000,
        demand: 'High',
        exp: 1.5
      },
      {
        title: 'Advanced Aerospace Alloys Specialist',
        mainly_learn: ['Nickel-based Superalloys for Turbines', 'Titanium & Aluminum Aerospace Alloys', 'Powder Metallurgy & Sintering', 'High Entropy Alloys (HEAs)', 'Creep Resistance Optimization'],
        salary: 122000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  CERAMIC: {
    branch_name: 'Ceramic Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Advanced Technical Ceramics Engineer',
        mainly_learn: ['Oxide & Non-Oxide Ceramics (Alumina, Zirconia, SiC)', 'Powder Synthesis & Sintering Science', 'High-Temperature Refractories', 'Thermal Barrier Coatings (TBC)', 'Spark Plasma Sintering (SPS)'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Electronic & Electroceramics Specialist',
        mainly_learn: ['Piezoelectric & Ferroelectric Ceramics', 'Dielectric Capacitors & MLCCs', 'Solid Oxide Fuel Cells (SOFC)', 'Ceramic Superconductors', 'Semiconducting Oxides'],
        salary: 118000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Glass & Optical Materials Engineer',
        mainly_learn: ['Glass Melting & Annealing Kinetics', 'Optical Fiber Fabrication & Doping', 'Bio-active Glasses', 'Toughened & Borosilicate Glass', 'Laser Glass Characterization'],
        salary: 110000,
        demand: 'Steady',
        exp: 0.5
      },
      {
        title: 'Bioceramics & Medical Implants Specialist',
        mainly_learn: ['Hydroxyapatite & Bio-compatible Coatings', 'Dental Ceramics & Zirconia Prosthetics', 'Porous Bone Scaffolds', 'In Vitro Degradation Testing', 'ISO 13779 Standards'],
        salary: 115000,
        demand: 'High',
        exp: 1
      }
    ]
  },
  TEXTILE: {
    branch_name: 'Textile Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Technical Textiles & Composites Specialist',
        mainly_learn: ['Carbon Fiber & Aramid Reinforcements', '3D Weaving & Braiding', 'Geotextiles & Agrotextiles', 'Ballistic Protection Fabrics', 'Coated & Laminated Membranes'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Smart Textiles & Wearable Electronics Engineer',
        mainly_learn: ['Conductive Yarns & Printed Electronics', 'Textile Sensors (ECG, Respiration, Strain)', 'Flexible Energy Storage on Fabrics', 'Washability & Durability Testing', 'E-Textile Integration'],
        salary: 115000,
        demand: 'Explosive Growth',
        exp: 0.5
      },
      {
        title: 'Textile Processing & Wet Finishing Technologist',
        mainly_learn: ['Dyeing Chemistry & Spectrophotometry', 'Functional Finishes (Water-repellent, Antimicrobial, Flame-retardant)', 'Eco-friendly Dyeing & Effluent Treatment (ETP)', 'Enzymatic Processing', 'Color Matching'],
        salary: 102000,
        demand: 'Steady',
        exp: 0.5
      },
      {
        title: 'Apparel Production & Quality Manager',
        mainly_learn: ['Garment Manufacturing Machinery', 'Lean Manufacturing in Apparel', 'Fabric Quality Inspection (4-Point System)', 'Supply Chain Traceability', 'OEKO-TEX & GOTS Certifications'],
        salary: 98000,
        demand: 'Steady',
        exp: 1
      }
    ]
  },
  AGRI: {
    branch_name: 'Agricultural Engineering',
    category: 'Aerospace & Specialized',
    goals: [
      {
        title: 'Farm Machinery & Mechanization Engineer',
        mainly_learn: ['Tractor Hydraulics & Powertrains', 'Tillage, Sowing & Harvesting Equipment', 'CAD of Agricultural Implements', 'Testing Codes (OECD / BIS)', 'Autonomous Tractor Systems'],
        salary: 104000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Soil & Water Conservation Engineer',
        mainly_learn: ['Irrigation Engineering (Drip, Sprinkler)', 'Hydrologic Modeling & Watershed Management', 'Drainage Design & Salinity Control', 'GIS & Remote Sensing for Water Resources', 'Groundwater Recharge Methods'],
        salary: 106000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Post-Harvest & Food Processing Engineer',
        mainly_learn: ['Grain Drying, Cleaning & Storage Silos', 'Cold Chain Logistics & Cold Storage Design', 'Food Processing Operations (Milling, Extrusion)', 'Controlled Atmosphere Storage', 'Food Safety Standards'],
        salary: 102000,
        demand: 'Steady',
        exp: 0.5
      },
      {
        title: 'Agricultural Automation & Sensor Specialist',
        mainly_learn: ['Soil Moisture & NPK Sensors', 'IoT Weather Stations', 'Telemetry & Actuators in Farming', 'Greenhouse Climate Control Systems', 'Farm Management Information Systems (FMIS)'],
        salary: 110000,
        demand: 'Explosive Growth',
        exp: 1
      }
    ]
  },

  // ================= 🌱 Additional Emerging / Interdisciplinary =================
  ENV_ENG: {
    branch_name: 'Environmental Engineering',
    category: 'Emerging / Interdisciplinary',
    goals: [
      {
        title: 'Environmental Impact & Sustainability Specialist',
        mainly_learn: ['EIA (Environmental Impact Assessment)', 'Carbon Footprint Accounting & GHG Protocol', 'Life Cycle Assessment (SimaPro / openLCA)', 'Corporate Sustainability Reporting (GRI / CSRD)', 'ESG Metrics'],
        salary: 108000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Air Quality & Emission Control Specialist',
        mainly_learn: ['Air Dispersion Modeling (AERMOD / CALPUFF)', 'Industrial Scrubbers, Cyclones & Baghouses', 'Ambient Air Monitoring (PM2.5, NOx, SO2)', 'Carbon Capture & Storage (CCS)', 'Clean Air Regulations'],
        salary: 112000,
        demand: 'High',
        exp: 1
      },
      {
        title: 'Water & Wastewater Treatment Technologist',
        mainly_learn: ['Advanced Oxidation Processes (AOP)', 'Membrane Bioreactors (MBR) & Reverse Osmosis', 'Biological Nutrient Removal (BNR)', 'Zero Liquid Discharge (ZLD)', 'Sludge Digestion & Biogas'],
        salary: 110000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Circular Economy & Remediation Specialist',
        mainly_learn: ['Hazardous Waste Treatment', 'Bioremediation & Phytoremediation', 'Solid Waste Gasification', 'Soil Contaminant Transport Modeling', 'Resource Recovery Systems'],
        salary: 106000,
        demand: 'High',
        exp: 0.5
      }
    ]
  },
  AGRI_ENG: {
    branch_name: 'Agricultural Engineering',
    category: 'Emerging / Interdisciplinary',
    goals: [
      {
        title: 'Precision Agriculture Specialist',
        mainly_learn: ['Precision Farming GPS / RTK Guidance', 'Variable Rate Application (VRA)', 'Drone Multispectral Imagery (NDVI)', 'Yield Monitoring Systems', 'Satellite Remote Sensing'],
        salary: 112000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'Controlled Environment Agriculture (CEA) Engineer',
        mainly_learn: ['Hydroponics, Aeroponics & Aquaponics', 'LED Horticultural Lighting Spectra', 'Automated Nutrient Dosing Systems', 'Greenhouse Microclimate Automation', 'Vertical Farming Operations'],
        salary: 110000,
        demand: 'High',
        exp: 0.5
      },
      {
        title: 'Smart Ag-Tech Solutions Architect',
        mainly_learn: ['Farm IoT Gateways & LoRaWAN', 'AI for Crop Disease Detection', 'Soil Moisture Predictive Analytics', 'Automated Irrigation Controllers', 'Robotic Harvesting & Weeding'],
        salary: 116000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'Climate-Resilient Agro-Systems Consultant',
        mainly_learn: ['Crop Water Requirement Modeling (CROPWAT)', 'Carbon Sequestration in Agriculture', 'Regenerative Agriculture Practices', 'Agro-Photovoltaic Systems', 'Biochar & Soil Regeneration'],
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
        title: 'Robotics AI Research Scientist',
        mainly_learn: ['Reinforcement Learning for Robotics (PPO, SAC)', 'Sim-to-Real Transfer (Isaac Gym, MuJoCo)', 'Visual-Motor Policies', 'End-to-End Deep Learning Navigation', 'Trajectory Optimization'],
        salary: 140000,
        demand: 'Explosive Growth',
        exp: 1.5
      },
      {
        title: 'Embodied AI & Humanoid Robotics Engineer',
        mainly_learn: ['Bipedal & Quadruped Locomotion', 'Whole-Body Control (WBC)', 'ROS 2 / C++', 'Vision-Language-Action (VLA) Models', 'High-Torque Actuators'],
        salary: 145000,
        demand: 'Explosive Growth',
        exp: 1.5
      },
      {
        title: 'Autonomous Mobile Robots (AMR) Architect',
        mainly_learn: ['Visual SLAM & LiDAR SLAM', 'Global & Local Path Planning (A*, TEB, DWA)', 'Sensor Fusion (Extended Kalman Filter)', 'Behavior Trees', 'Edge GPU Deployment (Jetson Orin)'],
        salary: 135000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'AI-Powered Robotic Manipulation Specialist',
        mainly_learn: ['6D Object Pose Estimation', 'Robotic Grasp Synthesis (GraspNet)', 'Tactile Sensing & Force Feedback', 'Motion Planning (MoveIt 2, OMPL)', 'Real-Time Collision Avoidance'],
        salary: 138000,
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
        title: 'Intelligent Autonomous Systems Engineer',
        mainly_learn: ['Perception Pipelines (YOLO, PointNet, Transformers)', 'ROS 2 Humble / Iron', 'Kalman Filtering & Bayesian Estimation', 'Obstacle Avoidance & MPC', 'Linux Embedded C++'],
        salary: 135000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'Industrial AI Robot Integrator',
        mainly_learn: ['Collaborative Robotics (Cobots)', 'Deep Learning Defect Detection', 'Industrial Vision Guidance', 'Digital Twin Simulation (NVIDIA Omniverse)', 'Safety & ISO 15066 Compliance'],
        salary: 128000,
        demand: 'Extremely High',
        exp: 1
      },
      {
        title: 'Drone & UAV AI Engineer',
        mainly_learn: ['PX4 / ArduPilot Autopilots', 'Optical Flow & Visual Odometry', 'GPS-Denied Autonomous Navigation', 'AI Edge Computer Vision', 'Aerial Swarm Coordination'],
        salary: 132000,
        demand: 'Explosive Growth',
        exp: 1
      },
      {
        title: 'Field & Service Robotics Specialist',
        mainly_learn: ['Outdoor All-Terrain Mobile Robotics', 'Sensor Fusion (Radar, LiDAR, Cameras)', 'Long-Horizon Mission Planning', 'Remote Teleoperation & Latency Management', 'Robust Field Deployment'],
        salary: 126000,
        demand: 'High',
        exp: 0.5
      }
    ]
  }

};

// -------------------------------------------------------------
// HELPER METHODS TO MAP CAREER GOALS TO REAL-WORLD DATA
// -------------------------------------------------------------

const BRANCH_ALIASES: Record<string, string> = {
  BIOINFORMATICS: 'BIOINFO',
  'BIO INFORMATICS': 'BIOINFO',
  ELECTRONIC: 'ELECTRONICS',
  ELEC: 'ELECTRONICS',
  ELECTRICAL: 'EE',
  AUTOMOBILE: 'AUTO',
  STRUCTURAL: 'STRUCT',
  CTM: 'CONST',
  CONSTRUCTION: 'CONST',
  POLY: 'POLYMER',
  MET: 'METALLURGY',
  DEFENSE: 'DEFENCE',
  AUTOMATION: 'AUTOROB',
  IND: 'IE',
  INDUSTRIAL: 'IE',
  AERO: 'AERO',
  AERONAUTIC: 'AERONAUTICAL',
  ENV: 'ENV',
  ENVIRONMENTAL: 'ENV',
  AGRI: 'AGRI',
  AGRICULTURAL: 'AGRI'
};

export function getCareerGoalsForBranch(branchCode: string) {
  const cleanCode = branchCode ? branchCode.toUpperCase().trim() : 'CSE';

  // Direct match
  if (CAREER_GOALS_DATA[cleanCode]) {
    return formatGoals(cleanCode, CAREER_GOALS_DATA[cleanCode]);
  }

  // Alias match
  if (BRANCH_ALIASES[cleanCode] && CAREER_GOALS_DATA[BRANCH_ALIASES[cleanCode]]) {
    return formatGoals(BRANCH_ALIASES[cleanCode], CAREER_GOALS_DATA[BRANCH_ALIASES[cleanCode]]);
  }

  // Check fuzzy key
  const key = Object.keys(CAREER_GOALS_DATA).find(
    k => cleanCode.includes(k) || k.includes(cleanCode)
  );

  if (key && CAREER_GOALS_DATA[key]) {
    return formatGoals(key, CAREER_GOALS_DATA[key]);
  }

  // Fallback to CSE
  return formatGoals('CSE', CAREER_GOALS_DATA['CSE']);
}

function formatGoals(branchCode: string, entry: (typeof CAREER_GOALS_DATA)[string]): CareerGoalDefinition[] {
  return entry.goals.map((g, idx) => {
    const slug = g.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const id = `CG_${branchCode}_${idx + 1}_${slug}`;

    const required_skills = g.mainly_learn.map((skillName, sIdx) => {
      const isTop = sIdx < 3;
      const isMid = sIdx >= 3 && sIdx < 6;
      return {
        skill_id: `SK_${slug}_${sIdx}`,
        skill_name: skillName,
        required_level: isTop ? 4 : (isMid ? 3 : 3),
        importance: isTop ? 0.95 : (isMid ? 0.85 : 0.75),
        priority: (isTop ? 'Critical' : (isMid ? 'High' : 'Medium')) as 'Critical' | 'High' | 'Medium',
        estimated_hours: isTop ? 25 : 15
      };
    });

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
          title: 'Foundational Competencies',
          focus_skills: g.mainly_learn.slice(0, 3),
          deliverable: 'Core theoretical and syntax fundamentals with hands-on exercises.'
        },
        {
          stage: 2,
          title: 'Applied Engineering Workflows',
          focus_skills: g.mainly_learn.slice(3, 6),
          deliverable: 'Real-world project pipeline, automated testing, and industry tooling.'
        },
        {
          stage: 3,
          title: 'Production Systems & Verification',
          focus_skills: g.mainly_learn.slice(6),
          deliverable: 'End-to-end deployment, optimization, and capstone portfolio verification.'
        }
      ]
    };
  });
}

export function getAllCareerGoals(): CareerGoalDefinition[] {
  const all: CareerGoalDefinition[] = [];
  for (const [code, entry] of Object.entries(CAREER_GOALS_DATA)) {
    all.push(...formatGoals(code, entry));
  }
  return all;
}
