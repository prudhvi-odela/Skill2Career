import type { BranchDefinition } from './engineeringBranches';

export const ADDITIONAL_BRANCHES: BranchDefinition[] = [
  // ==========================================
  // COMPUTER & IT (Missing 6 branches)
  // ==========================================
  {
    code: 'DS',
    name: 'Data Science',
    shortName: 'Data Science',
    category: 'Computer & IT',
    categoryEmoji: '💻',
    tagline: 'Statistical inference, exploratory data analysis, large-scale data wrangling & predictive analytics',
    description: 'Focuses on the mathematical and computational methods to extract actionable insights from structured and unstructured data, including Bayesian inference, hypothesis testing, distributed Spark computing, and feature engineering.',
    primaryLanguage: 'python',
    compilerType: 'code_ide',
    toolsAndTech: ['Python', 'Pandas', 'NumPy', 'Apache Spark', 'SQL', 'Tableau', 'Scipy'],
    targetRoles: ['Data Scientist', 'Quantitative Analytics Specialist', 'Big Data Engineer', 'Business Intelligence Architect'],
    subjects: [
      {
        code: 'DS201',
        name: 'Statistical Inference & Hypothesis Testing',
        semester: 3,
        credits: 4,
        category: 'Core',
        description: 'Probability distributions, central limit theorem, p-value calculations, ANOVA, confidence intervals, and Bayesian estimation.',
        learningOutcomes: ['Formulate null and alternative hypotheses', 'Execute parametric and non-parametric tests in Python', 'Calculate Bayesian posterior probabilities'],
        keyTopics: ['Normal & t-Distributions', 'Type I & II Errors', 'Z-Test & T-Test', 'Chi-Square Goodness of Fit', 'Maximum Likelihood Estimation'],
        recommendedTools: ['Python Scipy.stats', 'Jupyter Notebook']
      },
      {
        code: 'DS301',
        name: 'Large-Scale Distributed Analytics with Apache Spark',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Resilient Distributed Datasets (RDDs), Spark DataFrames, cluster resource allocation, window functions, and distributed machine learning with Spark MLlib.',
        learningOutcomes: ['Design Spark processing pipelines over terabyte-scale datasets', 'Perform distributed aggregations without memory shuffling bottlenecks', 'Tune Spark DAG execution'],
        keyTopics: ['RDD Partitions & Shuffling', 'Spark SQL Catalyst Optimizer', 'Broadcast Joins', 'Structured Streaming', 'Parquet Columnar Storage'],
        recommendedTools: ['PySpark', 'Databricks', 'Apache Hadoop']
      }
    ],
    schedule: [
      {
        week: 1,
        theme: 'Data Cleansing, Imputation & Vectorized Pandas Transformations',
        theoryTopics: ['Missing Value Mechanisms (MCAR, MAR, MNAR)', 'Outlier Detection (Z-Score, IQR)', 'Vectorization vs Itertuples'],
        labWorkflow: 'Clean a dirty 500,000-row real estate dataset, impute missing values, and calculate statistical correlation matrices.',
        compilerTask: 'Write a Python script computing IQR thresholds and removing anomalies from numeric telemetry data.',
        deliverable: 'Tested data preprocessing pipeline script with statistical summary report',
        hoursNeeded: 14
      }
    ],
    challenges: [
      {
        id: 'DS_CH1',
        title: 'Compute Z-Score Anomaly Detector',
        difficulty: 'Easy',
        description: 'Given an array of numbers, identify all values that deviate by more than 2.0 standard deviations from the sample mean.',
        language: 'python',
        initialCode: `import statistics

def find_anomalies(data):
    # Calculate mean and standard deviation
    mean = statistics.mean(data)
    stdev = statistics.stdev(data)
    # Return list of values with |z| > 2.0
    anomalies = [x for x in data if abs((x - mean) / stdev) > 2.0]
    return anomalies

sample = [10, 12, 11, 13, 12, 100, 11, 12, -80, 14]
print("Anomalies:", find_anomalies(sample))`,
        testInput: '[10, 12, 11, 13, 12, 100, 11, 12, -80, 14]',
        expectedOutput: 'Anomalies: [100, -80]',
        hint: 'Use (x - mean) / stdev for each item in the list.'
      }
    ]
  },
  {
    code: 'IOT',
    name: 'Internet of Things (IoT)',
    shortName: 'IoT',
    category: 'Computer & IT',
    categoryEmoji: '💻',
    tagline: 'Edge sensor nodes, wireless telemetry protocols, MQTT brokers & cloud IoT backends',
    description: 'Integrates embedded microcontrollers, low-power wireless communication (BLE, Zigbee, LoRaWAN), lightweight application protocols (MQTT, CoAP), and cloud time-series ingestion platforms.',
    primaryLanguage: 'python',
    compilerType: 'code_ide',
    toolsAndTech: ['ESP32', 'Arduino', 'Python', 'MQTT', 'Node-RED', 'Raspberry Pi', 'InfluxDB'],
    targetRoles: ['IoT Embedded Engineer', 'Connected Device Architect', 'Smart Sensor Systems Specialist', 'Edge Computing Engineer'],
    subjects: [
      {
        code: 'IOT201',
        name: 'Sensor Interfacing & Embedded Bus Protocols',
        semester: 3,
        credits: 4,
        category: 'Core',
        description: 'Analog-to-digital conversion, I2C pull-up resistor sizing, SPI full-duplex transmission, UART baud rate framing, and GPIO interrupt handling.',
        learningOutcomes: ['Interface environmental sensor ICs via I2C and SPI', 'Calculate bus transmission bandwidth and clock jitter', 'Write non-blocking interrupt service routines'],
        keyTopics: ['I2C Master-Slave Addressing', 'SPI Clock Polarity & Phase (CPOL/CPHA)', 'ADC Sampling & Aliasing', 'Debouncing & External Interrupts', 'PWM Duty Cycle Control'],
        recommendedTools: ['ESP32 DevKit', 'Logic Analyzer', 'PlatformIO']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'CSBS',
    name: 'Computer Science & Business Systems (CSBS)',
    shortName: 'CSBS',
    category: 'Computer & IT',
    categoryEmoji: '💻',
    tagline: 'Enterprise software architecture, financial computing, ERP systems & technology strategy',
    description: 'Bridges deep software engineering with modern business economics, enterprise resource planning (ERP), corporate financial modeling, customer relationship platforms, and agile digital transformation.',
    primaryLanguage: 'python',
    compilerType: 'code_ide',
    toolsAndTech: ['Python', 'SQL', 'SAP ERP', 'PowerBI', 'Tableau', 'Docker', 'Salesforce'],
    targetRoles: ['Enterprise Tech Consultant', 'Business Systems Architect', 'Fintech Engineer', 'Product Solutions Specialist'],
    subjects: [
      {
        code: 'CSBS301',
        name: 'Enterprise Architecture & Cloud ERP Systems',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Multi-tier enterprise architectures, business process re-engineering, ERP data schemas, API integrations, and corporate governance.',
        learningOutcomes: ['Design scalable enterprise service layers', 'Map cross-functional business processes into ERP workflows', 'Evaluate total cost of ownership (TCO) for cloud migrations'],
        keyTopics: ['SOA & Microservices', 'ERP Relational Schemas', 'Business Process Modeling Notation (BPMN)', 'ITIL & SLA Governance', 'Disaster Recovery RPO/RTO'],
        recommendedTools: ['Enterprise Architect', 'Draw.io', 'Postman']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'CSIT',
    name: 'Computer Science & Information Technology (CS & IT)',
    shortName: 'CS & IT',
    category: 'Computer & IT',
    categoryEmoji: '💻',
    tagline: 'Network management, enterprise system integration, distributed IT infrastructure & cyber services',
    description: 'Combines computational algorithms with the practical engineering of enterprise networks, active directory systems, virtualization, IT security policies, and client-server system administration.',
    primaryLanguage: 'python',
    compilerType: 'code_ide',
    toolsAndTech: ['Linux', 'Python', 'Cisco Packet Tracer', 'Windows Server', 'Bash', 'Terraform', 'Wireshark'],
    targetRoles: ['IT Systems Administrator', 'Network Operations Architect', 'Enterprise Solutions Integrator', 'Infrastructure Engineer'],
    subjects: [
      {
        code: 'CSIT201',
        name: 'Enterprise Network Engineering & Switching Protocols',
        semester: 4,
        credits: 4,
        category: 'Core',
        description: 'VLAN segmentation, Spanning Tree Protocol (STP), OSPF dynamic routing, Access Control Lists (ACLs), and NAT translation.',
        learningOutcomes: ['Configure multi-VLAN campus networks', 'Prevent broadcast storms using Rapid STP', 'Establish secure site-to-site VPN tunnels'],
        keyTopics: ['802.1Q Trunking', 'RSTP Convergence', 'OSPF Cost Metrics', 'Standard & Extended ACLs', 'Dynamic NAT / PAT'],
        recommendedTools: ['Cisco Packet Tracer', 'GNS3', 'Wireshark']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'SE',
    name: 'Software Engineering',
    shortName: 'Software Engineering',
    category: 'Computer & IT',
    categoryEmoji: '💻',
    tagline: 'Architectural patterns, clean code principles, test automation & large-scale refactoring',
    description: 'Focuses rigorously on software lifecycle methodologies, automated testing frameworks, domain-driven design, continuous integration, design patterns (GoF), and evolutionary architectural migration.',
    primaryLanguage: 'javascript',
    compilerType: 'code_ide',
    toolsAndTech: ['TypeScript', 'Node.js', 'Jest', 'Git', 'Docker', 'SonarQube', 'Linux'],
    targetRoles: ['Software Architect', 'Quality Engineering Lead', 'Full-Cycle Software Engineer', 'Application Modernization Consultant'],
    subjects: [
      {
        code: 'SE301',
        name: 'Design Patterns & Domain-Driven Design',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'SOLID design principles, Creational, Structural, and Behavioral patterns (GoF), bounded contexts, aggregates, and clean hex architecture.',
        learningOutcomes: ['Refactor monolithic code into decoupled design patterns', 'Implement Factory, Observer, and Strategy patterns', 'Design bounded contexts using Domain-Driven Design'],
        keyTopics: ['Single Responsibility & Open/Closed', 'Dependency Inversion & IoC Containers', 'Observer & Event-Driven Patterns', 'Hexagonal Ports & Adapters', 'Cyclomatic Complexity Metrics'],
        recommendedTools: ['TypeScript', 'Jest', 'SonarQube']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'CE',
    name: 'Computer Engineering',
    shortName: 'Computer Engineering',
    category: 'Computer & IT',
    categoryEmoji: '💻',
    tagline: 'Digital computer hardware, instruction set architectures (RISC-V/x86), memory hierarchy & bus interfacing',
    description: 'Sits at the exact nexus of hardware and software, covering digital logic design, CPU pipelining, cache coherence protocols, FPGA synthesis, device driver development, and memory controllers.',
    primaryLanguage: 'c',
    compilerType: 'code_ide',
    toolsAndTech: ['C / C++', 'Verilog', 'RISC-V Simulator', 'Linux Kernel', 'GDB', 'QEMU'],
    targetRoles: ['Computer Hardware Engineer', 'Firmware & BSP Developer', 'CPU Pipeline Architect', 'SoC System Integration Specialist'],
    subjects: [
      {
        code: 'CE301',
        name: 'Computer Organization & RISC-V Pipeline Architecture',
        semester: 4,
        credits: 4,
        category: 'Core',
        description: '5-stage instruction pipelining, data and control hazards, branch prediction, L1/L2 cache hierarchies, and virtual memory paging.',
        learningOutcomes: ['Design 5-stage CPU datapath and control logic', 'Resolve pipeline stalls via data forwarding and hazard detection', 'Calculate cache miss penalties and hit rates'],
        keyTopics: ['Instruction Fetch to Write-back Stages', 'Data Forwarding Units', 'Dynamic 2-Bit Branch Predictors', 'Direct-Mapped vs Set-Associative Caches', 'TLB & Page Tables'],
        recommendedTools: ['RARS RISC-V Simulator', 'Verilator', 'C']
      }
    ],
    schedule: [],
    challenges: []
  },

  // ==========================================
  // ELECTRICAL & ELECTRONICS (Missing 4 branches)
  // ==========================================
  {
    code: 'EIE',
    name: 'Electronics and Instrumentation Engineering (EIE)',
    shortName: 'EIE',
    category: 'Electrical & Electronics',
    categoryEmoji: '⚡',
    tagline: 'Industrial sensors, telemetry signal conditioners, PLC automation & process calibration',
    description: 'Covers physical and chemical sensing elements, Wheatstone bridge signal conditioning, operational amplifier filters, 4-20mA industrial current loops, and smart field transmitters.',
    primaryLanguage: 'python',
    compilerType: 'circuit_logic',
    toolsAndTech: ['LabVIEW', 'MATLAB', 'Multisim', 'PLC', 'RTD Sensors', 'Oscilloscope'],
    targetRoles: ['Instrumentation Specialist', 'Control Systems Engineer', 'Calibration & Metrology Engineer', 'Automation Designer'],
    subjects: [
      {
        code: 'EIE201',
        name: 'Transducers & Measurement Signal Conditioning',
        semester: 3,
        credits: 4,
        category: 'Core',
        description: 'Strain gauges, RTDs, thermocouples, LVDT displacement sensors, instrumentation amplifiers, and cold junction compensation.',
        learningOutcomes: ['Calibrate strain gauge Wheatstone bridges', 'Design low-noise instrumentation amplifier circuits', 'Linearize sensor resistance curves across temperature ranges'],
        keyTopics: ['Seebeck Effect & Thermocouples', 'LVDT Differential Voltage', 'CMRR in Instrumentation Amplifiers', 'Active Low-Pass Sallen-Key Filters', 'HART Communication Protocol'],
        recommendedTools: ['NI LabVIEW', 'Multisim', 'Digital Multimeters']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'EE',
    name: 'Electronics Engineering',
    shortName: 'Electronics Engineering',
    category: 'Electrical & Electronics',
    categoryEmoji: '⚡',
    tagline: 'Discrete semiconductor circuits, analog op-amps, power switching converters & PCB layout',
    description: 'Encompasses discrete and integrated electronic circuits, small-signal BJT/MOSFET amplifiers, DC-DC buck/boost power converters, operational amplifier feedback topologies, and high-frequency printed circuit board design.',
    primaryLanguage: 'python',
    compilerType: 'circuit_logic',
    toolsAndTech: ['KiCad', 'LTspice', 'Altium Designer', 'Multisim', 'Python', 'Soldering Stations'],
    targetRoles: ['Hardware Design Engineer', 'Analog Electronics Specialist', 'Power Supply Designer', 'PCB Layout Engineer'],
    subjects: [
      {
        code: 'EE201',
        name: 'Analog Electronic Circuits & Small-Signal Modeling',
        semester: 3,
        credits: 4,
        category: 'Core',
        description: 'BJT and MOSFET hybrid-pi small signal models, common-emitter/common-source amplifiers, differential pairs, and feedback oscillators.',
        learningOutcomes: ['Calculate voltage gain, input/output impedances of transistor stages', 'Determine 3dB bandwidth roll-off frequencies', 'Stabilize feedback amplifiers using Bode margin analysis'],
        keyTopics: ['Small-Signal Hybrid-Pi Parameters', 'Differential Gain & CMRR', 'Miller Effect & Capacitance', 'Barkhausen Oscillation Criterion', 'Class A/B/C Power Amplifiers'],
        recommendedTools: ['LTspice', 'KiCad PCB']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'ELEC',
    name: 'Electrical Engineering',
    shortName: 'Electrical Engineering',
    category: 'Electrical & Electronics',
    categoryEmoji: '⚡',
    tagline: 'Rotating electrical machinery, high-voltage transformers, power distribution & transmission line physics',
    description: 'Dedicated to heavy electrical power infrastructure: 3-phase AC synchronous generators, induction motors, transformer equivalent circuits, per-unit fault calculations, and switchgear protection.',
    primaryLanguage: 'python',
    compilerType: 'circuit_logic',
    toolsAndTech: ['MATLAB Simulink', 'ETAP', 'AutoCAD Electrical', 'PowerWorld', 'PSCAD'],
    targetRoles: ['Electrical Power Systems Engineer', 'Substation Design Engineer', 'High-Voltage Plant Engineer', 'Transmission Line Specialist'],
    subjects: [
      {
        code: 'ELEC201',
        name: 'Electrical Machines & 3-Phase Transformers',
        semester: 4,
        credits: 4,
        category: 'Core',
        description: 'Rotating magnetic field theory, 3-phase induction motor torque-slip characteristics, synchronous generator V-curves, and open/short-circuit transformer testing.',
        learningOutcomes: ['Construct transformer equivalent circuits from test data', 'Plot torque-speed curves of squirrel cage induction motors', 'Calculate synchronous generator power angle and excitation'],
        keyTopics: ['Rotating Magnetic Field (RMF)', 'Transformer Core Losses & Copper Losses', 'Induction Motor Slip & Breakdown Torque', 'Synchronous Reactance (Xs)', 'Autotransformers & Vector Groups'],
        recommendedTools: ['MATLAB Simscape Electrical', 'ETAP']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'ICE',
    name: 'Instrumentation & Control Engineering',
    shortName: 'Instrumentation & Control',
    category: 'Electrical & Electronics',
    categoryEmoji: '⚡',
    tagline: 'Modern state-space control, PID auto-tuning, SCADA telemetry & robotic servo actuators',
    description: 'Focuses on the mathematical design and real-time execution of automated closed-loop systems, state-space representations, Kalman filter observers, industrial PLCs, and servo motion controllers.',
    primaryLanguage: 'python',
    compilerType: 'circuit_logic',
    toolsAndTech: ['MATLAB Control System Toolbox', 'LabVIEW', 'Siemens TIA Portal', 'Python Control', 'Arduino'],
    targetRoles: ['Control Systems Engineer', 'Industrial Automation Specialist', 'Process Dynamics Consultant', 'Robotics Systems Integrator'],
    subjects: [
      {
        code: 'ICE301',
        name: 'Control Systems Engineering & Root Locus Design',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Transfer functions, block diagram algebra, Routh-Hurwitz stability criterion, Root Locus trajectories, Nyquist stability, and PID gain tuning.',
        learningOutcomes: ['Formulate system transfer functions from differential equations', 'Plot root locus paths and tune damping ratios', 'Design lead-lag phase compensators for target phase margins'],
        keyTopics: ['First & Second Order Step Responses', 'Damping Ratio (zeta) & Natural Frequency (omega_n)', 'Routh-Hurwitz Stability Criterion', 'Root Locus Asymptotes & Breakaway Points', 'Nyquist Encirclement Criterion'],
        recommendedTools: ['MATLAB Control Toolbox', 'Python-control']
      }
    ],
    schedule: [],
    challenges: []
  },

  // ==========================================
  // MECHANICAL & RELATED (Missing 2 branches)
  // ==========================================
  {
    code: 'MFG',
    name: 'Manufacturing Engineering',
    shortName: 'Manufacturing Engineering',
    category: 'Mechanical & Related',
    categoryEmoji: '⚙️',
    tagline: 'CNC G-code machining, metal casting, plastic injection molding, additive manufacturing & quality inspection',
    description: 'Covers physical component production, tool geometry, cutting force mechanics (Merchant circle), casting solidification (Chvorinov rule), CNC milling/turning, plastic injection molding, and Coordinate Measuring Machine (CMM) inspection.',
    primaryLanguage: 'python',
    compilerType: 'kinematics_sim',
    toolsAndTech: ['Mastercam', 'Fusion 360 CAM', 'AutoCAD', 'SolidWorks', 'CMM Scanners', 'G-Code Simulators'],
    targetRoles: ['Manufacturing Engineer', 'CNC Programmer & CAM Specialist', 'Tooling & Die Designer', 'Production Operations Manager'],
    subjects: [
      {
        code: 'MFG301',
        name: 'Machining Dynamics, Metal Cutting & CNC Technology',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Merchant circle force analysis, Taylor tool life equation, cutting temperatures, CNC G-code programming, and surface roughness parameters (Ra).',
        learningOutcomes: ['Calculate cutting forces and shear plane angles', 'Write multi-axis CNC G-code programs for complex milled profiles', 'Estimate tool life based on cutting speed and feed rates'],
        keyTopics: ['Merchant Circle Force Diagrams', 'Taylor Equation: VT^n = C', 'G-Code (G01, G02, G03, G81)', 'Casting Chvorinov Solidification Time', 'Injection Molding Gate & Runner Design'],
        recommendedTools: ['Fusion 360 CAM', 'NCViewer G-Code Simulator']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'IND',
    name: 'Industrial Engineering',
    shortName: 'Industrial Engineering',
    category: 'Mechanical & Related',
    categoryEmoji: '⚙️',
    tagline: 'Operations research, facility layout optimization, Lean Six Sigma & supply chain mathematics',
    description: 'Applies rigorous mathematics, stochastic queuing models, linear programming, human factors ergonomics, and statistical quality control to eliminate systemic waste and optimize throughput across complex operations.',
    primaryLanguage: 'python',
    compilerType: 'kinematics_sim',
    toolsAndTech: ['FlexSim', 'Arena Simulation', 'Minitab', 'Python (SciPy.optimize)', 'Excel Solver', 'Tableau'],
    targetRoles: ['Industrial Engineer', 'Operations Research Analyst', 'Supply Chain Optimization Engineer', 'Continuous Improvement Manager'],
    subjects: [
      {
        code: 'IND301',
        name: 'Operations Research & Linear Programming',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Simplex algorithm, dual problems, transportation and assignment formulations, M/M/1 queuing theory, and dynamic programming.',
        learningOutcomes: ['Formulate multi-variable production optimization models', 'Solve primal and dual linear programs using Simplex', 'Calculate expected queue waiting times and server utilization rates'],
        keyTopics: ['Simplex Tableau Pivoting', 'Duality Theory & Shadow Prices', 'Vogel Approximation for Transportation', 'Little’s Law in Queuing Networks', 'Integer Programming Branch & Bound'],
        recommendedTools: ['Python PuLP', 'SciPy Optimize', 'Minitab']
      }
    ],
    schedule: [],
    challenges: []
  },

  // ==========================================
  // CIVIL & INFRASTRUCTURE (Missing 4 branches)
  // ==========================================
  {
    code: 'ENV',
    name: 'Environmental Engineering',
    shortName: 'Environmental Engineering',
    category: 'Civil & Infrastructure',
    categoryEmoji: '🏗️',
    tagline: 'Biological wastewater treatment, air pollution dispersion modeling, solid waste landfills & environmental impact',
    description: 'Combines civil hydraulics with biochemical remediation to design municipal water filtration plants, activated sludge bioreactors, Gaussian air pollution plumes, and sanitary landfill leachate containment liners.',
    primaryLanguage: 'python',
    compilerType: 'structural_calc',
    toolsAndTech: ['EPANET', 'HEC-RAS', 'AERMOD', 'AutoCAD', 'Python', 'GIS / QGIS'],
    targetRoles: ['Environmental Engineer', 'Water Quality & Wastewater Specialist', 'Air Quality Dispersion Modeler', 'Sustainability & ESG Consultant'],
    subjects: [
      {
        code: 'ENV301',
        name: 'Water & Wastewater Biological Treatment Systems',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'BOD/COD kinetics, activated sludge aeration tank sizing, sludge volume index (SVI), secondary clarifiers, and disinfection kinetics.',
        learningOutcomes: ['Size aeration basins based on food-to-microorganism (F/M) ratios', 'Calculate 5-day Biological Oxygen Demand (BOD5)', 'Model chlorine contact chamber disinfection contact time'],
        keyTopics: ['First-Order BOD Reaction Rates', 'Monod Growth Kinetics in Bioreactors', 'Mean Cell Residence Time (Theta_c)', 'Trickling Filters & RBCs', 'Membrane Bioreactors (MBR)'],
        recommendedTools: ['EPANET', 'BioWin', 'Excel']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'CTM',
    name: 'Construction Technology & Management (CTM)',
    shortName: 'Construction Technology',
    category: 'Civil & Infrastructure',
    categoryEmoji: '🏗️',
    tagline: '5D BIM scheduling, Primavera critical path, cost estimation & jobsite safety engineering',
    description: 'Focuses on the execution phase of mega-infrastructure projects: heavy construction equipment fleet management, concrete formwork design, Primavera P6 / MS Project critical path scheduling, and Navisworks clash management.',
    primaryLanguage: 'python',
    compilerType: 'structural_calc',
    toolsAndTech: ['Primavera P6', 'Autodesk Revit', 'Navisworks', 'MS Project', 'AutoCAD', 'Excel'],
    targetRoles: ['Construction Project Manager', 'Planning & Scheduling Engineer', 'BIM Coordination Specialist', 'Quantity Surveyor & Cost Estimator'],
    subjects: [
      {
        code: 'CTM301',
        name: 'Project Scheduling & Critical Path Method (CPM)',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Work breakdown structures (WBS), forward and backward pass calculations, total and free float, PERT probabilistic schedules, and resource leveling.',
        learningOutcomes: ['Calculate Early/Late Start and Finish dates across activity networks', 'Identify critical path bottlenecks', 'Perform project crash cost trade-off optimization'],
        keyTopics: ['AON & AOA Network Diagrams', 'Total Float vs Free Float', 'PERT Beta Distribution 3-Point Estimates', 'Resource Smoothing & Leveling', 'Earned Value Analysis (CPI / SPI)'],
        recommendedTools: ['Primavera P6', 'Navisworks', 'MS Project']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'TRANS',
    name: 'Transportation Engineering',
    shortName: 'Transportation Engineering',
    category: 'Civil & Infrastructure',
    categoryEmoji: '🏗️',
    tagline: 'Highway geometric alignment, asphalt pavement layer design, traffic capacity & signal timing',
    description: 'Encompasses highway design, super-elevation transitions, stopping sight distance calculations, CBR-based flexible and rigid pavement design, roundabouts, and Webster signal cycle optimization.',
    primaryLanguage: 'python',
    compilerType: 'structural_calc',
    toolsAndTech: ['AutoCAD Civil 3D', 'VISSIM', 'Synchro', 'ArcGIS', 'Python'],
    targetRoles: ['Transportation Infrastructure Engineer', 'Highway Alignment Designer', 'Traffic Simulation Specialist', 'Urban Mobility Planner'],
    subjects: [
      {
        code: 'TRANS301',
        name: 'Highway Geometric Design & Pavement Engineering',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Horizontal curves, transition spirals, vertical parabolic summit and valley curves, California Bearing Ratio (CBR) pavement thickness sizing, and traffic volume capacity.',
        learningOutcomes: ['Calculate super-elevation rates and widening for design speeds', 'Design vertical curves for required stopping sight distances', 'Size asphalt layers based on cumulative equivalent standard axles (ESAL)'],
        keyTopics: ['Stopping Sight Distance (SSD) Equations', 'Super-Elevation: e + f = V^2 / 127R', 'Parabolic Vertical Curve Offsets', 'IRC / AASHTO Flexible Pavement Design', 'Webster Traffic Signal Timing Method'],
        recommendedTools: ['AutoCAD Civil 3D', 'VISSIM']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'GEOTECH',
    name: 'Geotechnical Engineering',
    shortName: 'Geotechnical Engineering',
    category: 'Civil & Infrastructure',
    categoryEmoji: '🏗️',
    tagline: 'Terzaghi soil bearing capacity, deep pile foundations, slope stability & flownet seepage',
    description: 'Explores subsurface soil mechanics: Mohr-Coulomb shear strength envelopes, consolidation settlement rates, Rankine/Coulomb lateral earth pressures on retaining walls, and Bishop slope stability factor of safety.',
    primaryLanguage: 'python',
    compilerType: 'structural_calc',
    toolsAndTech: ['PLAXIS', 'GeoStudio (SLOPE/W)', 'AutoCAD', 'Python', 'Excel'],
    targetRoles: ['Geotechnical Consultant', 'Foundation Design Engineer', 'Tunnelling & Dam Specialist', 'Soil Mechanics Laboratory Director'],
    subjects: [
      {
        code: 'GEO301',
        name: 'Advanced Soil Mechanics & Foundation Engineering',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Terzaghi bearing capacity factors (Nc, Nq, Ngamma), primary consolidation settlement calculations (Cc, Cv), Rankine active/passive earth pressure, and deep pile group efficiency.',
        learningOutcomes: ['Compute allowable bearing pressure for shallow and raft footings', 'Determine primary settlement time rates using Terzaghi 1D consolidation', 'Analyze retaining wall stability against overturning and sliding'],
        keyTopics: ['Mohr-Coulomb Failure Criteria', 'Terzaghi Bearing Capacity Formula', 'Consolidation Log-Time Curve Fitting', 'Active & Passive Rankine Earth Pressures', 'Fellenius & Bishop Method of Slices'],
        recommendedTools: ['PLAXIS 2D', 'GeoStudio SLOPE/W']
      }
    ],
    schedule: [],
    challenges: []
  },

  // ==========================================
  // CHEMICAL & MATERIALS (Missing 6 branches)
  // ==========================================
  {
    code: 'PETRO',
    name: 'Petroleum Engineering',
    shortName: 'Petroleum Engineering',
    category: 'Chemical & Materials',
    categoryEmoji: '🧪',
    tagline: 'Hydrocarbon reservoir simulation, directional well drilling, petrophysical logging & enhanced oil recovery',
    description: 'Focuses on subsurface oil and gas extraction: Darcy multi-phase flow through porous rocks, material balance reservoir equations, drilling mud rheology, well completion design, and tertiary CO2 injection recovery.',
    primaryLanguage: 'python',
    compilerType: 'reaction_kinetics',
    toolsAndTech: ['Petrel', 'Eclipse', 'Techlog', 'Python', 'CMG Reservoir Simulator'],
    targetRoles: ['Petroleum Reservoir Engineer', 'Subsurface Drilling Engineer', 'Petrophysical Well Log Analyst', 'Production Optimization Specialist'],
    subjects: [
      {
        code: 'PETRO301',
        name: 'Reservoir Engineering & Multi-Phase Fluid Dynamics',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Darcy radial flow equations, oil formation volume factors (Bo), gas-oil ratio (GOR), wellbore skin factor, and decline curve analysis.',
        learningOutcomes: ['Calculate original hydrocarbons in place using material balance', 'Estimate radial pressure drawdowns in producing wells', 'Predict well productivity index and inflow performance relationship (IPR)'],
        keyTopics: ['Darcy Law in Porous Media', 'PVT Black Oil Fluid Properties', 'Material Balance Equations (Havlena-Odeh)', 'Vogel Inflow Performance Relationship', 'Waterflooding Fractional Flow (Buckley-Leverett)'],
        recommendedTools: ['Schlumberger Petrel', 'Eclipse']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'PETROCHEM',
    name: 'Petrochemical Engineering',
    shortName: 'Petrochemical Engineering',
    category: 'Chemical & Materials',
    categoryEmoji: '🧪',
    tagline: 'Crude oil fractionation, catalytic cracking, ethylene/propylene synthesis & refinery units',
    description: 'Covers downstream petroleum refining and monomer synthesis: atmospheric and vacuum distillation units, fluid catalytic cracking (FCC), reforming, alkylation, and petrochemical polymer precursor synthesis.',
    primaryLanguage: 'python',
    compilerType: 'reaction_kinetics',
    toolsAndTech: ['Aspen HYSYS', 'Petro-SIM', 'MATLAB', 'P&ID Tools'],
    targetRoles: ['Petrochemical Process Engineer', 'Refinery Operations Specialist', 'Catalytic Cracking Unit Engineer', 'Downstream Plant Designer'],
    subjects: [
      {
        code: 'PETROC301',
        name: 'Refinery Process Engineering & Catalytic Cracking',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Crude distillation curve assays (TBP), fluid catalytic cracking reaction mechanisms, steam reforming of methane, and sweetening amine scrubbers.',
        learningOutcomes: ['Design atmospheric crude fractionator side-strippers', 'Balance cracking unit thermal regenerator energy demands', 'Size acid gas removal amine absorption columns'],
        keyTopics: ['True Boiling Point (TBP) Distillation Curves', 'FCC Riser Reactor Kinetics', 'Hydrodesulfurization (HDS) Units', 'Steam Methane Reforming', 'Refinery Hydrogen Pinch Analysis'],
        recommendedTools: ['Aspen HYSYS', 'Aspen Plus']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'MAT',
    name: 'Materials Science & Engineering',
    shortName: 'Materials Science',
    category: 'Chemical & Materials',
    categoryEmoji: '🧪',
    tagline: 'Crystal lattices, XRD spectroscopy, phase equilibrium thermodynamics & advanced composites',
    description: 'Studies the fundamental relationship between microscopic material structure and macroscopic properties: Bravais crystal lattices, Miller indices, dislocations, thermal phase diagrams (binary/ternary), and carbon fiber composites.',
    primaryLanguage: 'python',
    compilerType: 'reaction_kinetics',
    toolsAndTech: ['Thermo-Calc', 'ImageJ', 'OriginLab', 'Python', 'MATLAB'],
    targetRoles: ['Materials Characterization Scientist', 'Composite Materials Engineer', 'Metallurgist & Failure Analyst', 'Semiconductor Thin-Film Specialist'],
    subjects: [
      {
        code: 'MAT201',
        name: 'Structure & Properties of Engineering Materials',
        semester: 3,
        credits: 4,
        category: 'Core',
        description: 'Bravais lattices, Bragg law of X-Ray diffraction, edge and screw dislocations, Hall-Petch grain boundary strengthening, and binary phase diagrams.',
        learningOutcomes: ['Index XRD diffraction peaks to crystal lattice parameters', 'Calculate theoretical material densities from atomic packing factors', 'Read lever-rule equilibrium phase fractions from phase diagrams'],
        keyTopics: ['FCC, BCC & HCP Atomic Packing', 'Miller Indices (hkl)', 'Bragg Law: 2d sin(theta) = n lambda', 'Lever Rule & Eutectic Invariant Reactions', 'Hall-Petch Grain Strengthening'],
        recommendedTools: ['Thermo-Calc', 'OriginLab']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'MET',
    name: 'Metallurgical Engineering',
    shortName: 'Metallurgy',
    category: 'Chemical & Materials',
    categoryEmoji: '🧪',
    tagline: 'Blast furnace iron extraction, steelmaking converters, heat treatment kinetics & corrosion control',
    description: 'Encompasses the science and industrial extraction of metals from ores, Ellingham thermodynamic oxidation diagrams, continuous casting, TTT/CCT transformation curves for steel hardening, and cathodic protection.',
    primaryLanguage: 'python',
    compilerType: 'reaction_kinetics',
    toolsAndTech: ['FactSage', 'AutoCAD', 'Optical Microscopy', 'Hardness Testers', 'Python'],
    targetRoles: ['Extractive Metallurgist', 'Heat Treatment Metallurgical Engineer', 'Welding & Corrosion Consultant', 'Foundry Operations Lead'],
    subjects: [
      {
        code: 'MET301',
        name: 'Physical Metallurgy & Phase Transformations in Steel',
        semester: 4,
        credits: 4,
        category: 'Core',
        description: 'Iron-Iron Carbide (Fe-Fe3C) phase diagram, pearlite, bainite, and martensite phase transformations, Time-Temperature-Transformation (TTT) diagrams, and hardenability Jominy end-quench tests.',
        learningOutcomes: ['Design austenitizing, quenching, and tempering heat-treatment cycles', 'Interpret continuous cooling transformation (CCT) diagrams', 'Calculate critical cooling velocities to achieve full martensitic structure'],
        keyTopics: ['Fe-C Phase Diagram & Eutectoid Point (0.76% C)', 'Diffusionless Martensitic Transformation', 'TTT & CCT Diagrams', 'Jominy End-Quench Hardenability', 'Tempering of Martensite (Retained Austenite)'],
        recommendedTools: ['FactSage', 'Optical Metallurgical Microscope']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'POLY',
    name: 'Polymer Technology',
    shortName: 'Polymer Technology',
    category: 'Chemical & Materials',
    categoryEmoji: '🧪',
    tagline: 'Step-growth polymerization, molecular weight distribution, viscoelastic rheology & injection molding',
    description: 'Covers the chemistry, physics, and industrial processing of macromolecular polymers: addition and condensation synthesis, glass transition temperature (Tg), non-Newtonian shear thinning rheology, and twin-screw extrusion.',
    primaryLanguage: 'python',
    compilerType: 'reaction_kinetics',
    toolsAndTech: ['Moldflow', 'AutoCAD', 'DSC Instruments', 'Python', 'Rheometers'],
    targetRoles: ['Polymer R&D Scientist', 'Injection Molding Process Specialist', 'Bioplastics Formulation Chemist', 'Polymer Testing Lab Director'],
    subjects: [
      {
        code: 'POLY301',
        name: 'Polymer Synthesis, Structure & Viscoelasticity',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Free-radical polymerization kinetics, Carothers equation for step growth, number/weight average molecular weights (Mn/Mw), and Maxwell/Voigt viscoelastic models.',
        learningOutcomes: ['Calculate polymer conversion at gel points using Carothers equation', 'Determine glass transition (Tg) and melting (Tm) peaks via DSC curves', 'Model creep compliance and stress relaxation using mechanical spring-dashpot models'],
        keyTopics: ['Carothers Gel Point Equation', 'Polydispersity Index (Mw / Mn)', 'Differential Scanning Calorimetry (DSC)', 'Maxwell & Kelvin-Voigt Models', 'Non-Newtonian Power-Law Fluid Flow'],
        recommendedTools: ['Autodesk Moldflow', 'TA Instruments Rheology Suite']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'BIOCHEM',
    name: 'Biochemical Engineering',
    shortName: 'Biochemical Engineering',
    category: 'Chemical & Materials',
    categoryEmoji: '🧪',
    tagline: 'Enzyme Michaelis-Menten kinetics, stirred-tank bioreactors, sterile aeration & bioseparations',
    description: 'Bridges chemical engineering transport phenomena with biological systems: cellular metabolic fluxes, immobilized enzyme reactors, sterilization kinetics (Del factor), dissolved oxygen mass transfer (kLa), and protein chromatography.',
    primaryLanguage: 'python',
    compilerType: 'reaction_kinetics',
    toolsAndTech: ['SuperPro Designer', 'MATLAB', 'Python', 'Bioreactor SCADA'],
    targetRoles: ['Biochemical Process Engineer', 'Fermentation Scale-up Lead', 'Downstream Bioseparations Specialist', 'Vaccine Manufacturing Engineer'],
    subjects: [
      {
        code: 'BIOCH301',
        name: 'Bioreactor Design & Enzyme Kinetics',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Michaelis-Menten enzyme catalytic rates, Monod microbial growth equations, volumetric oxygen transfer coefficient (kLa), and batch/continuous chemostat design.',
        learningOutcomes: ['Calculate Km and Vmax from Lineweaver-Burk double reciprocal plots', 'Size continuous stirred tank fermenters (chemostats) for maximum biomass productivity', 'Determine thermal sterilization cycles with Del factor death kinetics'],
        keyTopics: ['Michaelis-Menten & Lineweaver-Burk Plots', 'Monod Growth: mu = mu_max * S / (Ks + S)', 'Chemostat Critical Dilution Rate (D_crit)', 'kLa Dynamic Gassing-Out Measurement', 'Del Factor Thermal Sterilization Kinetics'],
        recommendedTools: ['SuperPro Designer', 'MATLAB']
      }
    ],
    schedule: [],
    challenges: []
  },

  // ==========================================
  // AEROSPACE & SPECIALIZED (Missing 7 branches)
  // ==========================================
  {
    code: 'AERONAUTICAL',
    name: 'Aeronautical Engineering',
    shortName: 'Aeronautical',
    category: 'Aerospace & Specialized',
    categoryEmoji: '✈️',
    tagline: 'Subsonic/supersonic flight mechanics, aircraft stability derivatives, wing vortex drag & landing gear',
    description: 'Dedicated to fixed-wing and rotary atmospheric flight vehicles: aerodynamic lift-to-drag optimization, longitudinal and lateral dynamic stability derivatives (phugoid, Dutch roll), and airframe structural load factors.',
    primaryLanguage: 'python',
    compilerType: 'aerodynamics_sim',
    toolsAndTech: ['XFLR5', 'ANSYS Fluent', 'OpenVSP', 'MATLAB Flight Dynamics', 'Python'],
    targetRoles: ['Aeronautical Design Engineer', 'Flight Dynamics & Control Specialist', 'Airframe Structural Analyst', 'Flight Test Data Engineer'],
    subjects: [
      {
        code: 'AERO301',
        name: 'Aircraft Flight Mechanics & Dynamic Stability',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Steady level flight, rate of climb, service ceiling, aircraft equations of motion, longitudinal static margin, and short-period / phugoid oscillations.',
        learningOutcomes: ['Construct aircraft power-required and thrust-available curves', 'Calculate neutral point location and static margin for stability', 'Solve linearized longitudinal stability quartic characteristic roots'],
        keyTopics: ['Thrust Required vs Velocity Curves', 'Wing Downwash Angle & Tail Lift', 'Neutral Point & Longitudinal Static Margin', 'Phugoid & Short-Period Modes', 'V-n Flight Maneuver Load Factor Diagrams'],
        recommendedTools: ['XFLR5', 'OpenVSP', 'MATLAB']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'MARINE',
    name: 'Marine Engineering',
    shortName: 'Marine Engineering',
    category: 'Aerospace & Specialized',
    categoryEmoji: '✈️',
    tagline: 'Ship hull hydrostatics, marine diesel two-stroke engines, propeller cavitation & offshore stability',
    description: 'Focuses on ocean-going vessels, cargo ships, and offshore platforms: Archimedean hull displacement, transverse metacentric height (GM), propeller thrust wake fraction, marine auxiliary boiler loops, and steering gear.',
    primaryLanguage: 'python',
    compilerType: 'kinematics_sim',
    toolsAndTech: ['Maxsurf', 'Rhino Marine', 'AutoCAD', 'Python', 'Ship Simulator'],
    targetRoles: ['Marine Propulsion Engineer', 'Naval Architect', 'Offshore Platform Designer', 'Ship Superintendent'],
    subjects: [
      {
        code: 'MAR201',
        name: 'Ship Hydrostatics & Intact Stability',
        semester: 4,
        credits: 4,
        category: 'Core',
        description: 'Center of buoyancy (B), center of gravity (G), transverse metacenter (M), righting lever curves (GZ), and IMO intact stability criteria.',
        learningOutcomes: ['Calculate transverse metacentric height (GM) to assess initial vessel stability', 'Construct hydrostatic curves of form from offset tables', 'Determine dynamic stability angles under beam wind and rolling forces'],
        keyTopics: ['Archimedes Principle & Waterplane Area (Aw)', 'Metacentric Height: GM = KB + BM - KG', 'Transverse BM = I / Volume', 'Righting Lever GZ Curve & Angle of Loll', 'IMO Intact Stability Code Requirements'],
        recommendedTools: ['Maxsurf Stability', 'AutoCAD']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'MINING',
    name: 'Mining Engineering',
    shortName: 'Mining Engineering',
    category: 'Aerospace & Specialized',
    categoryEmoji: '✈️',
    tagline: 'Rock mechanics, open-pit pit optimization, underground ventilation & explosive blasting design',
    description: 'Encompasses mineral ore reserve modeling, drilling and explosive blast charge geometry, rock mass rating (RMR), open-pit ultimate pit limits (Lerchs-Grossmann), and underground mine airflow ventilation networks.',
    primaryLanguage: 'python',
    compilerType: 'structural_calc',
    toolsAndTech: ['Datamine', 'Surpac', 'Rocscience', 'Ventsim', 'AutoCAD'],
    targetRoles: ['Mining Operations Engineer', 'Rock Geomechanics Consultant', 'Mine Planning & Ventilation Specialist', 'Explosives & Blasting Engineer'],
    subjects: [
      {
        code: 'MINE301',
        name: 'Rock Mechanics & Mine Excavation Design',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Hoek-Brown empirical rock mass failure criteria, Rock Mass Rating (RMR) classification, underground tunnel support rockbolts, and slope stability.',
        learningOutcomes: ['Calculate rock mass compressive strength using Hoek-Brown parameters', 'Classify rock formations using Bieniawski RMR scoring', 'Size rockbolt spacing and shotcrete thickness for tunnel excavation roofs'],
        keyTopics: ['Uniaxial Compressive Strength (UCS)', 'Bieniawski RMR & Barton Q-System', 'Hoek-Brown Failure Envelope', 'Kozlov Mine Ventilation Network Laws', 'Powder Factor in Explosive Blasting'],
        recommendedTools: ['Rocscience Phase2', 'Ventsim']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'AGRI',
    name: 'Agricultural Engineering',
    shortName: 'Agricultural Engineering',
    category: 'Aerospace & Specialized',
    categoryEmoji: '✈️',
    tagline: 'Precision drip irrigation hydraulics, tractor powertrain mechanics, grain drying & automated harvesting',
    description: 'Applies engineering mechanics to food production: soil-tillage tool interactions, tractor tractive efficiency, pressurized drip emitter friction loss (Hazen-Williams), grain psychrometric drying, and autonomous agricultural drones.',
    primaryLanguage: 'python',
    compilerType: 'kinematics_sim',
    toolsAndTech: ['CROPWAT', 'AutoCAD', 'Python', 'QGIS', 'MATLAB'],
    targetRoles: ['Precision Agriculture Engineer', 'Irrigation Systems Designer', 'Farm Machinery R&D Specialist', 'Post-Harvest Processing Consultant'],
    subjects: [
      {
        code: 'AGRI301',
        name: 'Irrigation Engineering & Soil-Water Dynamics',
        semester: 4,
        credits: 4,
        category: 'Core',
        description: 'Evapotranspiration (Penman-Monteith equation), soil moisture field capacity and wilting point, drip lateral hydraulics, and sprinkler uniformity coefficients.',
        learningOutcomes: ['Calculate crop water requirements using FAO Penman-Monteith method', 'Size pipe diameter and pump horsepower for pressurized micro-irrigation', 'Calculate Christiansen uniformity coefficient for sprinkler networks'],
        keyTopics: ['Reference Evapotranspiration (ETo)', 'Hazen-Williams Pipe Head Loss Formula', 'Christiansen Uniformity Coefficient (CU)', 'Subsurface Drainage Spacing (Hooghoudt)', 'Tractor Drawbar Pull & Slip Mechanics'],
        recommendedTools: ['FAO CROPWAT', 'EPANET']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'FOOD',
    name: 'Food Technology',
    shortName: 'Food Technology',
    category: 'Aerospace & Specialized',
    categoryEmoji: '✈️',
    tagline: 'Thermal pasteurization kinetics, food rheology, aseptic packaging & HACCP safety engineering',
    description: 'Covers unit operations in food processing: thermal death time curves (D and z values), lethality F0 calculations, freeze-drying sublimation heat transfer, non-Newtonian food fluid viscosity, and HACCP quality auditing.',
    primaryLanguage: 'python',
    compilerType: 'reaction_kinetics',
    toolsAndTech: ['MATLAB', 'Python', 'Texture Analyzers', 'Excel', 'Viscometers'],
    targetRoles: ['Food Process Engineer', 'Quality Assurance & HACCP Lead', 'Thermal Processing Authority', 'Product Development Food Scientist'],
    subjects: [
      {
        code: 'FOOD301',
        name: 'Food Process Engineering & Thermal Lethality Kinetics',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Decimal reduction time (D-value), thermal resistance constant (z-value), sterilizing value (F0), General Method of lethality integration, and plate heat exchangers.',
        learningOutcomes: ['Calculate commercial sterility F0 values for canned low-acid foods', 'Determine D-values and z-values from microbial death survivor curves', 'Model non-Newtonian flow behavior index (n) of puree emulsions'],
        keyTopics: ['D-Value & z-Value Kinetics', '12D Botulinum Cook Target', 'Ball Method of Thermal Process Evaluation', 'Herschel-Bulkley Rheological Model', 'Water Activity (aw) & Sorption Isotherms'],
        recommendedTools: ['MATLAB', 'Excel']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'TEXTILE',
    name: 'Textile Engineering',
    shortName: 'Textile Engineering',
    category: 'Aerospace & Specialized',
    categoryEmoji: '✈️',
    tagline: 'Polymer fiber extrusion, yarn twist mechanics, weaving loom kinematics & smart conductive fabrics',
    description: 'Encompasses natural and synthetic fiber polymer spinning, carding and drafting kinematics, ring-spinning twist multipliers, shuttleless loom dynamics (air-jet/rapier), fabric tensile mechanics, and smart wearable conductive e-textiles.',
    primaryLanguage: 'python',
    compilerType: 'kinematics_sim',
    toolsAndTech: ['AutoCAD', 'TexGen', 'Python', 'MATLAB'],
    targetRoles: ['Textile Production Specialist', 'Technical Textiles & Composites Engineer', 'Smart Fabric R&D Scientist', 'Quality & Weaving Operations Manager'],
    subjects: [
      {
        code: 'TEX301',
        name: 'Yarn Mechanics & Weaving Loom Kinematics',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Fiber drafting theory, twist insertion, yarn count systems (Tex, Denier, English Count Ne), loom shedding mechanisms, and fabric tensile Peirce geometry.',
        learningOutcomes: ['Convert between Tex, Denier, and Ne yarn count systems', 'Calculate loom production efficiency and weft insertion rates', 'Apply Peirce fabric geometry models to calculate crimp and cover factors'],
        keyTopics: ['Direct vs Indirect Yarn Count Systems', 'Twist Factor & Tensile Tenacity', 'Shedding, Picking & Beat-up Mechanisms', 'Peirce Geometry of Woven Fabrics', 'Electrospinning of Nanofibers'],
        recommendedTools: ['TexGen', 'AutoCAD']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'BIOMED',
    name: 'Biomedical Engineering',
    shortName: 'Biomedical Engineering',
    category: 'Aerospace & Specialized',
    categoryEmoji: '✈️',
    tagline: 'Biosignal filtering (ECG/EEG), orthopedic biomechanics, biocompatible implants & medical imaging',
    description: 'Combines engineering principles with medical sciences: bioelectric action potentials, ECG instrumentation amplifiers with high CMRR, MRI/CT image reconstruction (Radon transform), titanium prosthesis stress distribution, and ISO 13485 regulations.',
    primaryLanguage: 'python',
    compilerType: 'circuit_logic',
    toolsAndTech: ['MATLAB Biosignal', 'Python', 'SolidWorks', 'LabVIEW', 'ImageJ'],
    targetRoles: ['Biomedical Equipment Engineer', 'Medical Imaging Algorithm Developer', 'Clinical Biomechanics Specialist', 'Medical Device Regulatory Consultant'],
    subjects: [
      {
        code: 'BMED301',
        name: 'Biomedical Instrumentation & Physiological Signals',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Nernst equilibrium potential, ECG lead topologies (Einthoven triangle), right-leg drive circuits for 50/60Hz noise cancellation, and pulse oximeter optical absorption (Beer-Lambert law).',
        learningOutcomes: ['Design 3-opamp instrumentation amplifiers for biopotential recording', 'Implement digital bandpass and notch filters to clean ECG traces', 'Calculate blood oxygen saturation (SpO2) from dual-wavelength photoplethysmography'],
        keyTopics: ['Resting & Action Potentials', 'Einthoven 12-Lead ECG Configuration', 'Driven Right Leg (DRL) Common-Mode Cancellation', 'Beer-Lambert Law & Photoplethysmography (PPG)', 'Defibrillator Protection & Electrical Isolation'],
        recommendedTools: ['MATLAB Biosignal Toolbox', 'LTspice', 'ImageJ']
      }
    ],
    schedule: [],
    challenges: []
  },

  // ==========================================
  // EMERGING / INTERDISCIPLINARY (Missing 4 branches)
  // ==========================================
  {
    code: 'NANO',
    name: 'Nanotechnology',
    shortName: 'Nanotechnology',
    category: 'Emerging / Interdisciplinary',
    categoryEmoji: '🌱',
    tagline: 'Quantum dots, electron beam lithography, carbon nanotubes & atomic force microscopy',
    description: 'Operates at the 1-100nm nanoscale where quantum confinement effects dominate: exciton Bohr radius in quantum dots, carbon nanotube chirality, cleanroom photolithography/EBL, and Atomic Force Microscopy (AFM) surface cantilever deflection.',
    primaryLanguage: 'python',
    compilerType: 'quantum_sim',
    toolsAndTech: ['Python', 'Gwyddion AFM Software', 'LAMMPS Molecular Dynamics', 'MATLAB'],
    targetRoles: ['Nanotechnology Fabrication Specialist', 'Nanomaterials Scientist', 'Cleanroom Lithography Engineer', 'Surface Metrology Consultant'],
    subjects: [
      {
        code: 'NANO301',
        name: 'Nanoscale Physics, Synthesis & Characterization',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Quantum size confinement, density of states across 3D/2D/1D/0D systems, chemical vapor deposition (CVD) of graphene, and AFM cantilever resonance.',
        learningOutcomes: ['Calculate quantum dot bandgap shift using Brus equation', 'Index carbon nanotube electronic band structure from (n,m) chiral vectors', 'Process Atomic Force Microscopy height topography scans'],
        keyTopics: ['Quantum Confinement & Exciton Bohr Radius', 'Brus Equation for Nanocrystals', 'Carbon Nanotubes: Armchair, Zigzag & Chiral', 'CVD Growth Kinetics of 2D Materials', 'AFM Contact vs Tapping Resonance Modes'],
        recommendedTools: ['Gwyddion', 'Python']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'SMART_CITIES',
    name: 'Smart Cities Engineering',
    shortName: 'Smart Cities',
    category: 'Emerging / Interdisciplinary',
    categoryEmoji: '🌱',
    tagline: 'Urban IoT sensor grids, smart utility microgrids, intelligent traffic control & GIS spatial planning',
    description: 'Integrates municipal civil infrastructure with digital technology: smart water metering leakage detection, automated dynamic traffic lights, district energy systems, GIS spatial land-use analysis, and urban digital twins.',
    primaryLanguage: 'python',
    compilerType: 'structural_calc',
    toolsAndTech: ['ArcGIS / QGIS', 'Python', 'SUMO Traffic Simulator', 'EPANET', 'PostGIS'],
    targetRoles: ['Smart City Infrastructure Architect', 'Urban Digital Twin Engineer', 'Intelligent Transportation Planner', 'Municipal IoT Operations Lead'],
    subjects: [
      {
        code: 'CITY301',
        name: 'Urban Digital Twins, GIS Spatial Modeling & Smart Grids',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Geographic Information Systems (GIS) coordinate projections, spatial vector buffer queries, urban heat island modeling, and IoT smart street lighting networks.',
        learningOutcomes: ['Perform spatial overlay and proximity analysis in GIS', 'Simulate city-scale traffic congestion relief using dynamic tolling models', 'Design district water distribution networks with pressure-reducing valve automation'],
        keyTopics: ['Vector & Raster GIS Data Structures', 'Spatial Indexing with R-Trees', 'Microscopic Urban Traffic Simulation in SUMO', 'Smart Water District Metering Areas (DMA)', 'Urban Building Energy Modeling (UBEM)'],
        recommendedTools: ['QGIS', 'SUMO Traffic Simulator', 'PostGIS']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'AUTOMATION',
    name: 'Automation & Robotics',
    shortName: 'Automation & Robotics',
    category: 'Emerging / Interdisciplinary',
    categoryEmoji: '🌱',
    tagline: 'Cyber-physical systems, multi-axis robotic arms, PLC industrial networks & vision inspection',
    description: 'Unites mechanical manipulation, electronic servo drives, PLC fieldbuses (Profinet, EtherCAT), machine vision cameras, and collaborative robots (cobots) for high-speed industrial assembly and logistics automation.',
    primaryLanguage: 'python',
    compilerType: 'kinematics_sim',
    toolsAndTech: ['ROS 2', 'Siemens TIA Portal', 'OpenCV', 'Python', 'RoboDK', 'CoppeliaSim'],
    targetRoles: ['Automation & Robotics Engineer', 'Robotic Workcell Integrator', 'Machine Vision Systems Specialist', 'Industrial Cyber-Physical Architect'],
    subjects: [
      {
        code: 'AUT301',
        name: 'Industrial Robotics & Cyber-Physical Automation',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: '6-axis articulated robot kinematics, payload and inertia matching, industrial Ethernet fieldbuses (EtherCAT), and 2D/3D machine vision blob and edge inspection.',
        learningOutcomes: ['Program industrial robot pick-and-place trajectories in 3D workcells', 'Implement real-time industrial Ethernet communication routines', 'Configure machine vision cameras for automated defect detection'],
        keyTopics: ['6-DOF Robot Workspace & Singularities', 'Profinet & EtherCAT Deterministic Protocols', 'Camera Calibration & Homography Matrices', 'Safety PLCs & Collaborative Robot (ISO 10218) Standards', 'OPC UA Industrial Interoperability'],
        recommendedTools: ['RoboDK', 'OpenCV', 'Siemens TIA Portal']
      }
    ],
    schedule: [],
    challenges: []
  },
  {
    code: 'DEFENSE',
    name: 'Defense Technology',
    shortName: 'Defense Technology',
    category: 'Emerging / Interdisciplinary',
    categoryEmoji: '🌱',
    tagline: 'Phased array radar signal processing, missile proportional navigation, armor ballistics & electronic warfare',
    description: 'Covers specialized defense engineering: Pulse-Doppler radar range ambiguity resolution, Proportional Navigation (PN) intercept guidance laws, terminal ballistics armor penetration equations, and electronic counter-countermeasures (ECCM).',
    primaryLanguage: 'python',
    compilerType: 'kinematics_sim',
    toolsAndTech: ['MATLAB / Simulink', 'Python', 'ANSYS Autodyn', 'C++'],
    targetRoles: ['Defense Systems Engineer', 'Guidance & Navigation (GNC) Specialist', 'Radar Signal Processing Architect', 'Armament Ballistics Analyst'],
    subjects: [
      {
        code: 'DEF301',
        name: 'Radar Systems & Proportional Missile Guidance',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Radar range equation, matched filter pulse compression (Chirp waveforms), Constant False Alarm Rate (CFAR) detection, and True Proportional Navigation (TPN) kinematics.',
        learningOutcomes: ['Calculate maximum radar detection range under thermal noise', 'Simulate missile-target pursuit trajectories with proportional navigation', 'Implement CFAR threshold detectors to isolate low-RCS targets from clutter'],
        keyTopics: ['Radar Cross Section (RCS) & Swerling Target Models', 'Pulse Doppler & Blind Speeds', 'Cell-Averaging CFAR (CA-CFAR)', 'Proportional Navigation Constant N (3 to 5)', 'Electronic Warfare Jamming-to-Signal (J/S) Ratios'],
        recommendedTools: ['MATLAB Phased Array System Toolbox', 'Python']
      }
    ],
    schedule: [],
    challenges: []
  }
];
