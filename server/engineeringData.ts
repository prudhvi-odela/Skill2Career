// Backend mirror of Engineering Branch Curricula and Compiler Tools

export interface ServerSubject {
  code: string;
  name: string;
  semester: number;
  credits: number;
  category: string;
  description: string;
  learningOutcomes: string[];
  keyTopics: string[];
  recommendedTools: string[];
}

export interface ServerScheduleItem {
  week: number;
  theme: string;
  theoryTopics: string[];
  labWorkflow: string;
  compilerTask: string;
  deliverable: string;
  hoursNeeded: number;
}

export interface ServerBranch {
  code: string;
  name: string;
  shortName: string;
  category: string;
  categoryEmoji: string;
  tagline: string;
  description: string;
  primaryLanguage: string;
  compilerType: string;
  toolsAndTech: string[];
  targetRoles: string[];
  subjects: ServerSubject[];
  schedule: ServerScheduleItem[];
}

export const SERVER_CATEGORIES = [
  'Computer & IT',
  'Electrical & Electronics',
  'Mechanical & Related',
  'Civil & Infrastructure',
  'Chemical & Materials',
  'Aerospace & Specialized',
  'Emerging / Interdisciplinary'
];

export const SERVER_BRANCHES: Record<string, ServerBranch> = {
  CSE: {
    code: 'CSE',
    name: 'Computer Science and Engineering (CSE)',
    shortName: 'CSE',
    category: 'Computer & IT',
    categoryEmoji: '💻',
    tagline: 'Algorithms, operating systems, distributed architectures & modern software design',
    description: 'Comprehensive software engineering and computational sciences covering algorithms, architecture, compilers, distributed systems, and enterprise engineering.',
    primaryLanguage: 'python',
    compilerType: 'code_ide',
    toolsAndTech: ['Python', 'C++', 'Git', 'Linux', 'Docker', 'PostgreSQL', 'GDB'],
    targetRoles: ['Full-Stack Software Engineer', 'Backend Systems Architect', 'Algorithms Specialist', 'Site Reliability Engineer'],
    subjects: [
      {
        code: 'CS201',
        name: 'Data Structures & Algorithms',
        semester: 3,
        credits: 4,
        category: 'Core',
        description: 'Non-linear structures, graph theory, asymptotic notation, balanced trees, and dynamic programming.',
        learningOutcomes: ['Design time-efficient algorithmic pipelines', 'Implement AVL and Red-Black trees from scratch', 'Solve shortest path and network flow graphs'],
        keyTopics: ['Big-O Analysis', 'Dijkstra & A*', 'Dynamic Programming', 'B-Trees & Heaps', 'Hashing & Collision Resolution'],
        recommendedTools: ['Python 3.12', 'GCC 13', 'Valgrind']
      },
      {
        code: 'CS202',
        name: 'Database Management Systems & SQL',
        semester: 4,
        credits: 4,
        category: 'Core',
        description: 'Relational algebra, schema normalization up to BCNF, ACID transactions, and index tuning.',
        learningOutcomes: ['Write production-grade recursive SQL queries', 'Design concurrency locks and isolation levels', 'Optimize query execution plans'],
        keyTopics: ['ER Modeling', 'BCNF Normalization', 'WAL & Two-Phase Commit', 'B+ Tree Indexing', 'Distributed Sharding'],
        recommendedTools: ['PostgreSQL', 'pgAdmin', 'DBeaver']
      },
      {
        code: 'CS301',
        name: 'Operating Systems & Virtualization',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Process scheduling, POSIX threads, virtual memory paging, TLB, deadlocks, and kernel architecture.',
        learningOutcomes: ['Solve multi-process race conditions with mutexes', 'Trace page faults and page replacement algorithms', 'Build Unix daemon processes'],
        keyTopics: ['Fork & Exec', 'Semaphores & Mutexes', 'Demand Paging & LRU', 'VFS & Ext4', 'Container Namespaces & cgroups'],
        recommendedTools: ['Linux Ubuntu', 'QEMU', 'C / POSIX pthreads']
      },
      {
        code: 'CS302',
        name: 'Computer Networks & Distributed Protocols',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'OSI and TCP/IP stack, socket programming, HTTP/3, TLS encryption, and routing algorithms.',
        learningOutcomes: ['Program TCP/UDP socket servers', 'Inspect network packets using Wireshark', 'Analyze BGP and OSPF routing'],
        keyTopics: ['TCP 3-Way Handshake & Congestion Control', 'DNS & BGP', 'HTTP/2 and HTTP/3 QUIC', 'TLS 1.3 Key Exchange', 'WebSocket Architecture'],
        recommendedTools: ['Wireshark', 'cURL', 'Socket.io']
      }
    ],
    schedule: [
      {
        week: 1,
        theme: 'Advanced Algorithmic Foundations & Complexity Analysis',
        theoryTopics: ['Master Theorem & Asymptotic Bounds', 'Memory Hierarchy & Cache Locality', 'Space Complexity Analysis'],
        labWorkflow: 'Implement recursive binary search vs iterative cache lines in C++',
        compilerTask: 'Write an in-place QuickSort with 3-way partitioning and verify O(N log N) execution.',
        deliverable: 'Benchmarked sorting benchmark report with CPU cycle counts',
        hoursNeeded: 14
      },
      {
        week: 2,
        theme: 'Graph Theory & Topological Dependencies',
        theoryTopics: ['Directed Acyclic Graphs (DAG)', 'Kahn’s Topological Sorting', 'Strongly Connected Components (Kosaraju)'],
        labWorkflow: 'Construct a package dependency resolver like npm/cargo using graph DAG traversal.',
        compilerTask: 'Detect cycles in a directed graph representing deadlock dependency chains.',
        deliverable: 'Working package dependency resolution engine',
        hoursNeeded: 16
      }
    ]
  },
  ECE: {
    code: 'ECE',
    name: 'Electronics and Communication Engineering (ECE)',
    shortName: 'ECE',
    category: 'Electrical & Electronics',
    categoryEmoji: '⚡',
    tagline: 'Digital signal processing, RF communication, semiconductor devices & embedded systems',
    description: 'Analog and digital circuit theory, electromagnetic transmission lines, digital signal processing (DSP), cellular networks, and microcontroller programming.',
    primaryLanguage: 'verilog',
    compilerType: 'circuit_logic',
    toolsAndTech: ['Verilog HDL', 'MATLAB / Octave', 'LTspice', 'Embedded C', 'KiCad', 'Oscilloscopes'],
    targetRoles: ['Hardware Design Engineer', 'DSP Engineer', 'RF Systems Engineer', 'Embedded Firmware Developer'],
    subjects: [
      {
        code: 'EC201',
        name: 'Signals and Systems & Transform Theory',
        semester: 3,
        credits: 4,
        category: 'Core',
        description: 'Continuous and discrete time signals, Fourier transform, Laplace and Z-transforms, convolution, and LTI systems.',
        learningOutcomes: ['Compute continuous and discrete convolutions', 'Apply FFT to analyze frequency spectra', 'Determine LTI system stability with pole-zero plots'],
        keyTopics: ['Linear Time-Invariant Systems', 'Continuous Fourier Transform (CTFT)', 'Z-Transform & Region of Convergence (ROC)', 'Bode Plots', 'Nyquist Sampling Theorem'],
        recommendedTools: ['MATLAB / Octave', 'Python Scipy.signal', 'LTspice']
      },
      {
        code: 'EC302',
        name: 'Digital Electronics & Logic Design',
        semester: 4,
        credits: 4,
        category: 'Core',
        description: 'Boolean algebra, Karnaugh maps, combinational logic (multiplexers, adders), sequential logic (flip-flops, counters, FSMs).',
        learningOutcomes: ['Minimize Boolean expressions using K-maps', 'Design synchronous Finite State Machines', 'Write synthesizable Verilog modules'],
        keyTopics: ['K-Maps & Don’t Care States', 'D and JK Flip-Flops', 'Mealy and Moore State Machines', 'Setup and Hold Time Violations', 'Verilog Always Blocks'],
        recommendedTools: ['ModelSim', 'Logisim', 'EDA Playground']
      }
    ],
    schedule: [
      {
        week: 1,
        theme: 'Combinational Logic Synthesis & Gate Delay Analysis',
        theoryTopics: ['Boolean Theorems & De Morgan’s Laws', 'Propagation Delay & Fan-out', 'Multiplexers & Encoders'],
        labWorkflow: 'Model a 4-bit Carry-Lookahead Adder in Verilog and simulate timing waveforms.',
        compilerTask: 'Simulate a full adder circuit with logic gates and calculate output truth table.',
        deliverable: 'Synthesizable 4-bit adder module with simulation testbench',
        hoursNeeded: 14
      }
    ]
  },
  MECH: {
    code: 'MECH',
    name: 'Mechanical Engineering',
    shortName: 'Mechanical',
    category: 'Mechanical & Related',
    categoryEmoji: '⚙️',
    tagline: 'Thermodynamics, fluid mechanics, CAD/CAM, finite element analysis (FEA) & machine design',
    description: 'Thermodynamic cycles, fluid dynamics, stress analysis, manufacturing automation, and machine element design.',
    primaryLanguage: 'python',
    compilerType: 'kinematics_sim',
    toolsAndTech: ['SolidWorks', 'ANSYS Mechanical', 'AutoCAD', 'Python', 'MATLAB', 'Mastercam CNC'],
    targetRoles: ['Mechanical Design Engineer', 'Thermal & Fluids Analyst', 'Manufacturing Operations Manager', 'FEA Specialist'],
    subjects: [
      {
        code: 'ME201',
        name: 'Thermodynamics & Heat Transfer',
        semester: 3,
        credits: 4,
        category: 'Core',
        description: 'First and Second laws of thermodynamics, Carnot cycle, Rankine & Brayton power cycles, conduction, convection, and radiation.',
        learningOutcomes: ['Evaluate thermodynamic cycle thermal efficiencies', 'Solve multi-layer wall heat conduction', 'Size shell-and-tube heat exchangers'],
        keyTopics: ['Carnot & Clausius Inequality', 'Rankine Steam Cycle', 'Fourier’s Law of Conduction', 'Newton’s Law of Cooling', 'Stefan-Boltzmann Radiation'],
        recommendedTools: ['EES (Engineering Equation Solver)', 'ANSYS Fluent', 'MATLAB']
      }
    ],
    schedule: [
      {
        week: 1,
        theme: 'Planar Mechanisms & Linkage Mobility Analysis',
        theoryTopics: ['Kutzbach-Gruebler Mobility Criterion', 'Grashof’s Condition for 4-Bar Chains', 'Inversion of Slider-Crank Mechanisms'],
        labWorkflow: 'Simulate a 4-bar crank-rocker mechanism and trace coupler curve trajectory.',
        compilerTask: 'Calculate degrees of freedom for planar mechanisms using Gruebler equation: M = 3(n-1) - 2j - h.',
        deliverable: 'Linkage kinematic solver with mobility verification report',
        hoursNeeded: 14
      }
    ]
  },
  CIVIL: {
    code: 'CIVIL',
    name: 'Civil Engineering',
    shortName: 'Civil',
    category: 'Civil & Infrastructure',
    categoryEmoji: '🏗️',
    tagline: 'Structural design, reinforced concrete, geotechnical foundations & transportation networks',
    description: 'Structural analysis, reinforced concrete design (IS 456 / ACI 318), soil mechanics, hydraulic flows, and modern infrastructure construction.',
    primaryLanguage: 'python',
    compilerType: 'structural_calc',
    toolsAndTech: ['STAAD.Pro', 'ETABS', 'AutoCAD Civil 3D', 'Revit', 'Python', 'ArcGIS'],
    targetRoles: ['Structural Design Engineer', 'Geotechnical Consultant', 'Highway Transportation Planner', 'Site Construction Project Manager'],
    subjects: [
      {
        code: 'CE201',
        name: 'Structural Analysis & Indeterminate Structures',
        semester: 3,
        credits: 4,
        category: 'Core',
        description: 'Shear force and bending moment diagrams, slope deflection method, moment distribution method, and matrix stiffness analysis.',
        learningOutcomes: ['Compute support reactions and maximum bending moments', 'Analyze indeterminate continuous beams', 'Formulate global structural stiffness matrices'],
        keyTopics: ['Simply Supported vs Fixed Beams', 'Point Loads & Uniformly Distributed Loads (UDL)', 'Moment Distribution Method (Hardy Cross)', 'Influence Line Diagrams', 'Direct Stiffness Method'],
        recommendedTools: ['STAAD.Pro', 'Python Numpy', 'AutoCAD']
      }
    ],
    schedule: [
      {
        week: 1,
        theme: 'Beam Bending Moment & Shear Force Diagram Equations',
        theoryTopics: ['Equations of Equilibrium (Sigma F = 0, Sigma M = 0)', 'Relation between Load, Shear and Moment: dM/dx = V', 'Point of Contraflexure'],
        labWorkflow: 'Model a simply supported beam with uniformly distributed load (UDL) and determine maximum deflection at midspan.',
        compilerTask: 'Calculate maximum bending moment: M_max = (w * L^2) / 8 for a simply supported beam.',
        deliverable: 'Automated beam flexure and shear force calculator',
        hoursNeeded: 14
      }
    ]
  },
  CHEM: {
    code: 'CHEM',
    name: 'Chemical Engineering',
    shortName: 'Chemical',
    category: 'Chemical & Materials',
    categoryEmoji: '🧪',
    tagline: 'Reaction kinetics, mass transfer distillation, process simulation & chemical thermodynamics',
    description: 'Chemical reactors, continuous distillation columns, heat exchanger networks, fluid fluid mechanics, and automated process control.',
    primaryLanguage: 'python',
    compilerType: 'reaction_kinetics',
    toolsAndTech: ['Aspen Plus', 'Aspen HYSYS', 'MATLAB', 'Python', 'DWSIM'],
    targetRoles: ['Process Design Engineer', 'Plant Operations Specialist', 'Chemical Safety & Optimization Consultant'],
    subjects: [
      {
        code: 'CH201',
        name: 'Chemical Reaction Engineering & Kinetics',
        semester: 4,
        credits: 4,
        category: 'Core',
        description: 'Reaction rate laws, Arrhenius temperature dependence, ideal reactors (Batch, CSTR, PFR), and reactor sizing.',
        learningOutcomes: ['Calculate reaction rate constants from experimental data', 'Size CSTR and PFR reactors for target conversion', 'Analyze multiple reactions in series and parallel'],
        keyTopics: ['Arrhenius Equation: k = A * exp(-Ea / RT)', 'Batch Reactor Space-Time', 'Continuous Stirred Tank Reactor (CSTR)', 'Plug Flow Reactor (PFR)', 'Catalytic Catalyst Deactivation'],
        recommendedTools: ['Python Scipy.integrate', 'Aspen Plus', 'DWSIM']
      }
    ],
    schedule: [
      {
        week: 1,
        theme: 'Arrhenius Reaction Kinetics & Rate Constant Modeling',
        theoryTopics: ['Activation Energy & Collision Theory', 'Arrhenius Temperature Dependence', 'Differential Method of Rate Analysis'],
        labWorkflow: 'Simulate temperature-dependent conversion of a first-order irreversible liquid phase reaction in a CSTR.',
        compilerTask: 'Compute rate constant k = A * exp(-Ea / (R * T)) and reactant conversion percentage.',
        deliverable: 'Chemical kinetics reactor sizing script with Arrhenius sensitivity plots',
        hoursNeeded: 14
      }
    ]
  },
  AERO: {
    code: 'AERO',
    name: 'Aerospace Engineering',
    shortName: 'Aerospace',
    category: 'Aerospace & Specialized',
    categoryEmoji: '✈️',
    tagline: 'Aerodynamics, jet propulsion, orbital mechanics, flight dynamics & structural composites',
    description: 'Subsonic and supersonic aerodynamics, gas turbine jet engines, rocket propulsion, satellite orbital trajectory calculations, and lightweight composite structures.',
    primaryLanguage: 'python',
    compilerType: 'aerodynamics_sim',
    toolsAndTech: ['ANSYS Fluent', 'XFLR5', 'MATLAB / Simulink', 'Python', 'OpenFOAM', 'NASA CEA'],
    targetRoles: ['Aerodynamicist', 'Propulsion Systems Engineer', 'Flight Dynamics & Control Specialist', 'Orbital Mechanics Analyst'],
    subjects: [
      {
        code: 'AE201',
        name: 'Aerodynamics & Lift/Drag Generation',
        semester: 4,
        credits: 4,
        category: 'Core',
        description: 'Inviscid incompressible flow, Kutta-Joukowski theorem, thin airfoil theory, finite wing induced drag, and Prandtl lifting line theory.',
        learningOutcomes: ['Calculate aerodynamic lift and drag coefficients (CL, CD)', 'Compute induced drag coefficient: CDi = CL^2 / (pi * AR * e)', 'Determine airfoil stall angle of attack'],
        keyTopics: ['Bernoulli Equation & Pressure Coefficient (Cp)', 'Circulation & Kutta Condition', 'Prandtl Lifting Line Theory', 'Aspect Ratio (AR) and Induced Drag', 'Transonic Wave Drag & Area Rule'],
        recommendedTools: ['XFLR5', 'ANSYS Fluent', 'OpenFOAM']
      }
    ],
    schedule: [
      {
        week: 1,
        theme: 'Wing Aerodynamics & Induced Drag Computation',
        theoryTopics: ['Lift-to-Drag Ratio (L/D) Optimization', 'Wing Aspect Ratio (AR) & Oswald Efficiency Factor', 'Induced Drag Physics'],
        labWorkflow: 'Compute aerodynamic lift force, drag force, and total induced drag coefficient for a rectangular wing.',
        compilerTask: 'Calculate total drag coefficient CD = CD0 + (CL^2 / (pi * AR * e)) across angles of attack.',
        deliverable: 'Wing polar curve generator and aerodynamic efficiency calculator',
        hoursNeeded: 15
      }
    ]
  },
  QUANTUM: {
    code: 'QUANTUM',
    name: 'Quantum Technology',
    shortName: 'Quantum Tech',
    category: 'Emerging / Interdisciplinary',
    categoryEmoji: '🌱',
    tagline: 'Qubit superposition, quantum logic circuits, Shor/Grover algorithms & quantum cryptography',
    description: 'Superconducting and photonic qubits, Bloch sphere state vectors, quantum gates (Hadamard, CNOT, Phase), quantum entanglement, and fault-tolerant algorithms.',
    primaryLanguage: 'python',
    compilerType: 'quantum_sim',
    toolsAndTech: ['Qiskit (IBM)', 'Cirq (Google)', 'PennyLane', 'Python', 'QuTiP'],
    targetRoles: ['Quantum Algorithm Developer', 'Quantum Hardware Engineer', 'Quantum Cryptography Specialist'],
    subjects: [
      {
        code: 'QT301',
        name: 'Quantum Information & Circuit Mechanics',
        semester: 5,
        credits: 4,
        category: 'Core',
        description: 'Bra-ket Dirac notation, qubit superposition, Hadamard and Pauli gates, Bell states, and quantum teleportation protocol.',
        learningOutcomes: ['Calculate state vector evolution across single and multi-qubit gates', 'Generate maximally entangled Bell states (|Phi+>)', 'Simulate quantum circuits using Qiskit/Cirq'],
        keyTopics: ['Qubit State Vector |psi> = alpha|0> + beta|1>', 'Bloch Sphere Coordinates (theta, phi)', 'Hadamard Gate & Superposition', 'Controlled-NOT (CNOT) Entanglement', 'No-Cloning Theorem'],
        recommendedTools: ['Qiskit', 'IBM Quantum Composer', 'Cirq']
      }
    ],
    schedule: [
      {
        week: 1,
        theme: 'Single Qubit Superposition & Hadamard Gate Simulation',
        theoryTopics: ['Bra-Ket Algebra & Inner Products', 'Hadamard Matrix Representation', 'Measurement Probability Amplitudes'],
        labWorkflow: 'Apply a Hadamard gate to base state |0> to create balanced superposition (|0> + |1>)/sqrt(2).',
        compilerTask: 'Simulate single qubit state vector and compute measurement probability for |0> and |1>.',
        deliverable: 'Quantum state vector simulator with probability distribution plotter',
        hoursNeeded: 16
      }
    ]
  }
};
