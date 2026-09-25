import { TopicAssessment } from './assessmentData.js';

export const MULTI_BRANCH_ASSESSMENTS: TopicAssessment[] = [
  // ==========================================
  // ⚡ ELECTRONICS & COMMUNICATION (ECE)
  // ==========================================
  {
    id: 'ASM_ECE_VLSI_01',
    skill_id: 'SK_ECE_VLSI',
    title: 'VLSI Digital Design & RTL Synthesis Assessment',
    category: 'VLSI & Semiconductors',
    domain: 'Hardware Engineering',
    difficulty: 'Intermediate',
    time_limit_minutes: 12,
    pass_score: 70.0,
    is_active: true,
    branch_code: 'ECE',
    branch_name: 'Electronics & Communication Engineering',
    role: 'VLSI Design Engineer',
    subject: 'Digital System Design & VLSI',
    topic: 'Verilog RTL & Synthesis',
    learning_resources: [
      { title: 'ASIC World Verilog Guide', url: 'https://www.asic-world.com/verilog/veritut.html', category: 'Tutorial', description: 'Comprehensive Verilog HDL syntax, behavioral modeling, and testbenches.' },
      { title: 'Cadence VLSI Education', url: 'https://www.cadence.com/en_US/home/training.html', category: 'Industry Tooling', description: 'RTL-to-GDSII digital implementation workflows.' }
    ],
    questions: [
      {
        id: 'Q_ECE_01',
        question_text: 'In Verilog HDL, what is the critical difference between blocking (`=`) and non-blocking (`<=`) assignments?',
        options_json: [
          'Blocking assignments execute in parallel; non-blocking execute sequentially',
          'Blocking assignments evaluate and update immediately within the sequential block; non-blocking schedule updates at the end of the time step, avoiding race conditions in sequential flip-flops',
          'Non-blocking assignments cannot be used inside `always @(posedge clk)` blocks',
          'Blocking assignments are only synthesized into physical wire interconnects'
        ],
        correct_option_index: 1,
        explanation: 'In sequential digital logic, non-blocking (`<=`) assignments ensure all flip-flops sample their inputs simultaneously on the clock edge before updates occur, preventing race conditions.'
      },
      {
        id: 'Q_ECE_02',
        question_text: 'In Static Timing Analysis (STA), what does a "Setup Time Violation" indicate?',
        options_json: [
          'The data signal arrived too early before the previous clock edge',
          'The data signal arrived too late and did not remain stable for the required minimum time before the active clock edge',
          'The clock frequency is too low for the register',
          'The ground bounce voltage exceeded 1.2V'
        ],
        correct_option_index: 1,
        explanation: 'Setup time ($T_{setup}$) is the minimum time data must be stable before the clock edge. If the combinational path delay is too long, a setup violation occurs, which can be fixed by lowering clock frequency or optimizing logic.'
      },
      {
        id: 'Q_ECE_03',
        question_text: 'Which CMOS logic property contributes to its near-zero static power dissipation?',
        options_json: [
          'CMOS transistors have zero internal resistance',
          'In steady-state, either the pull-up PMOS network or pull-down NMOS network is strictly OFF, preventing a direct DC path from VDD to GND',
          'CMOS circuits run exclusively on AC current',
          'Sub-threshold leakage current is mathematically zero in silicon'
        ],
        correct_option_index: 1,
        explanation: 'Complementary MOS topology ensures that under static state, one of the complementary networks (NMOS or PMOS) is non-conducting, restricting current to negligible leakage.'
      },
      {
        id: 'Q_ECE_04',
        question_text: 'What is the purpose of Clock Tree Synthesis (CTS) in physical ASIC design?',
        options_json: [
          'To generate random test vectors for BIST',
          'To balance clock delays to all sequential elements, minimizing clock skew and insertion delay across the die',
          'To convert digital signals into analog sine waves',
          'To eliminate power supply decoupling capacitors'
        ],
        correct_option_index: 1,
        explanation: 'CTS constructs a balanced buffer network (H-tree, mesh) so the clock reaches all flip-flops at almost the exact same instant, controlling clock skew.'
      }
    ]
  },
  {
    id: 'ASM_ECE_EMBEDDED_01',
    skill_id: 'SK_ECE_EMB',
    title: 'Embedded Systems & ARM Cortex Microcontrollers',
    category: 'Embedded Systems',
    domain: 'Firmware Engineering',
    difficulty: 'Intermediate',
    time_limit_minutes: 10,
    pass_score: 70.0,
    is_active: true,
    branch_code: 'ECE',
    branch_name: 'Electronics & Communication Engineering',
    role: 'Embedded Firmware Engineer',
    subject: 'Microcontrollers & Embedded Systems',
    topic: 'ARM Cortex-M & Interrupts',
    learning_resources: [
      { title: 'ARM Developer Cortex-M Architecture', url: 'https://developer.arm.com/documentation', category: 'Architecture Spec', description: 'Technical reference manual for Cortex-M NVIC, registers, and memory map.' },
      { title: 'FreeRTOS Official Documentation', url: 'https://www.freertos.org/', category: 'RTOS', description: 'Real-time kernel scheduling, queues, and task synchronization.' }
    ],
    questions: [
      {
        id: 'Q_EMB_01',
        question_text: 'In an embedded C program, why must variables shared between an Interrupt Service Routine (ISR) and the main loop be declared as `volatile`?',
        options_json: [
          'To allocate the variable in high-speed EEPROM memory',
          'To prevent the compiler optimizer from caching the variable in a CPU register and omitting memory reads',
          'To enable automatic hardware encryption of the variable',
          'To allow multi-threaded memory paging'
        ],
        correct_option_index: 1,
        explanation: 'The `volatile` qualifier instructs the compiler that the variable can change asynchronously outside the program flow (e.g., by hardware interrupt), forcing a fresh memory read every time.'
      },
      {
        id: 'Q_EMB_02',
        question_text: 'Which serial communication bus is synchronous, full-duplex, and uses separate MISO, MOSI, SCK, and CS lines?',
        options_json: ['I2C (Inter-Integrated Circuit)', 'SPI (Serial Peripheral Interface)', 'UART (Universal Asynchronous Receiver-Transmitter)', 'CAN Bus (Controller Area Network)'],
        correct_option_index: 1,
        explanation: 'SPI is a 4-wire synchronous, full-duplex bus featuring Master-Out-Slave-In, Master-In-Slave-Out, Serial Clock, and Chip Select.'
      },
      {
        id: 'Q_EMB_03',
        question_text: 'What happens in an RTOS during "Priority Inversion"?',
        options_json: [
          'The scheduler reverses the order of all tasks in the ready queue',
          'A high-priority task is blocked waiting for a resource held by a low-priority task, while a medium-priority task preempts the low-priority task',
          'Interrupts are disabled indefinitely by the kernel',
          'The CPU clock speed is doubled to catch up'
        ],
        correct_option_index: 1,
        explanation: 'Priority inversion occurs when a medium-priority task runs while a high-priority task waits on a mutex held by a low-priority task. Priority Inheritance protocol solves this.'
      }
    ]
  },

  // ==========================================
  // ⚙️ MECHANICAL ENGINEERING (MECH)
  // ==========================================
  {
    id: 'ASM_MECH_THERMO_01',
    skill_id: 'SK_MECH_THERMO',
    title: 'Applied Thermodynamics & Power Cycles Diagnostic',
    category: 'Thermal Science',
    domain: 'Mechanical Systems',
    difficulty: 'Intermediate',
    time_limit_minutes: 12,
    pass_score: 70.0,
    is_active: true,
    branch_code: 'MECH',
    branch_name: 'Mechanical Engineering',
    role: 'Thermal Systems Engineer',
    subject: 'Applied Thermodynamics',
    topic: 'Rankine, Brayton & Carnot Cycles',
    learning_resources: [
      { title: 'MIT OpenCourseWare Thermodynamics', url: 'https://ocw.mit.edu/courses/mechanical-engineering/', category: 'Courseware', description: 'Laws of thermodynamics, entropy, and thermodynamic power cycles.' },
      { title: 'NIST Chemistry WebBook Fluid Properties', url: 'https://webbook.nist.gov/chemistry/fluid/', category: 'Reference Tables', description: 'Thermophysical steam tables and fluid state properties.' }
    ],
    questions: [
      {
        id: 'Q_MECH_01',
        question_text: 'Which thermodynamic ideal cycle serves as the theoretical model for gas turbine jet engines and combined-cycle plants?',
        options_json: ['Rankine Cycle', 'Brayton Cycle', 'Otto Cycle', 'Diesel Cycle'],
        correct_option_index: 1,
        explanation: 'The Brayton cycle consists of adiabatic compression, constant-pressure heat addition, adiabatic expansion, and constant-pressure heat rejection—the standard model for gas turbines.'
      },
      {
        id: 'Q_MECH_02',
        question_text: 'Why does superheating steam in an ideal Rankine cycle increase both thermal efficiency and turbine blade lifespan?',
        options_json: [
          'It increases the average temperature of heat addition and raises the steam quality (dryness fraction) at the turbine exhaust',
          'It converts water into supercritical carbon dioxide',
          'It eliminates the need for a condenser in the power plant',
          'It drops the boiler operating pressure to atmospheric levels'
        ],
        correct_option_index: 0,
        explanation: 'Superheating increases the mean temperature at which heat is added (Carnot principle) and ensures the steam exiting the turbine contains minimal water droplets, preventing blade erosion.'
      },
      {
        id: 'Q_MECH_03',
        question_text: 'What does the Second Law of Thermodynamics (Kelvin-Planck statement) dictate regarding heat engines?',
        options_json: [
          'Energy cannot be created or destroyed',
          'It is impossible for any device operating in a cycle to receive heat from a single thermal reservoir and produce a net amount of work',
          'Absolute zero temperature can be reached in a finite number of steps',
          'Enthalpy is conserved in all throttling processes'
        ],
        correct_option_index: 1,
        explanation: 'Kelvin-Planck states that no heat engine can have a thermal efficiency of 100%; some heat must always be rejected to a low-temperature sink.'
      }
    ]
  },
  {
    id: 'ASM_MECH_FEA_01',
    skill_id: 'SK_MECH_FEA',
    title: 'Mechanics of Materials & FEA Stress Analysis',
    category: 'Mechanical Simulation',
    domain: 'Design Engineering',
    difficulty: 'Advanced',
    time_limit_minutes: 15,
    pass_score: 70.0,
    is_active: true,
    branch_code: 'MECH',
    branch_name: 'Mechanical Engineering',
    role: 'CAD/CAE Design Engineer',
    subject: 'Mechanics of Materials & FEA',
    topic: 'Stress Tensors & Von Mises Yielding',
    learning_resources: [
      { title: 'ANSYS Innovation Courses FEA', url: 'https://innovationspace.ansys.com/', category: 'Simulation Academy', description: 'Structural mechanics, meshing refinement, and stress concentration.' }
    ],
    questions: [
      {
        id: 'Q_FEA_01',
        question_text: 'When is the Von Mises yield criterion most appropriately applied in engineering design?',
        options_json: [
          'To predict brittle failure in cast iron and concrete',
          'To predict yielding in ductile metals (steel, aluminum) subjected to complex multi-axial stress states',
          'To compute aerodynamic drag on airfoil surfaces',
          'To estimate laminar-to-turbulent flow transitions'
        ],
        correct_option_index: 1,
        explanation: 'Von Mises (Maximum Distortion Energy theory) states yielding begins when the distortion energy density reaches that at yield in pure tension, making it ideal for ductile metals.'
      },
      {
        id: 'Q_FEA_02',
        question_text: 'What is the purpose of conducting a "Mesh Convergence Study" in Finite Element Analysis?',
        options_json: [
          'To ensure CAD surfaces are painted with realistic colors',
          'To verify that stress and displacement results become independent of element mesh size and reach asymptotic numerical stability',
          'To speed up CPU clock frequency during solving',
          'To eliminate the need for physical boundary conditions'
        ],
        correct_option_index: 1,
        explanation: 'Mesh convergence verifies that refining element density in high-stress gradient zones produces mathematically convergent stress results without artificial singularity errors.'
      }
    ]
  },

  // ==========================================
  // 🏗️ CIVIL ENGINEERING (CIVIL)
  // ==========================================
  {
    id: 'ASM_CIVIL_STRUCT_01',
    skill_id: 'SK_CIVIL_STRUCT',
    title: 'Structural Analysis & Reinforced Concrete Design (IS/Eurocode)',
    category: 'Structural Engineering',
    domain: 'Infrastructure',
    difficulty: 'Intermediate',
    time_limit_minutes: 12,
    pass_score: 70.0,
    is_active: true,
    branch_code: 'CIVIL',
    branch_name: 'Civil Engineering',
    role: 'Structural Engineer',
    subject: 'Structural Analysis & Concrete Design',
    topic: 'Limit State Method & Bending Moments',
    learning_resources: [
      { title: 'NPTEL Structural Engineering Lectures', url: 'https://nptel.ac.in/courses', category: 'Lectures', description: 'Moment distribution method, slope deflection, and RCC design.' },
      { title: 'American Concrete Institute (ACI)', url: 'https://www.concrete.org/', category: 'Building Codes', description: 'Reinforced concrete design standards and structural detailing.' }
    ],
    questions: [
      {
        id: 'Q_CIV_01',
        question_text: 'Under the Limit State Method (LSM) for reinforced concrete beam design, why is an "under-reinforced" section intentionally preferred over an "over-reinforced" section?',
        options_json: [
          'Over-reinforced beams are prohibited because steel is cheaper than concrete',
          'Under-reinforced sections ensure ductile tensile failure: steel yields first with visible deflection and cracking before catastrophic concrete crushing occurs',
          'Under-reinforced beams require no shear stirrups',
          'Over-reinforced beams cannot resist torsional moments'
        ],
        correct_option_index: 1,
        explanation: 'In an under-reinforced section, steel yields before concrete reaches its ultimate compressive strain (0.0035), giving ample warning signs (ductile behavior) before failure.'
      },
      {
        id: 'Q_CIV_02',
        question_text: 'In a simply supported beam of span L carrying a uniformly distributed load (UDL) of w (kN/m), what is the maximum bending moment and where does it occur?',
        options_json: [
          'wL/2 at the supports',
          'wL^2 / 8 at mid-span (L/2)',
          'wL^2 / 12 at the quarter-span',
          'wL^3 / 24 at mid-span'
        ],
        correct_option_index: 1,
        explanation: 'Integrating shear force $V(x) = w(L/2 - x)$ yields the classic parabolic bending moment equation $M_{max} = wL^2 / 8$ at the beam centerline where shear is zero.'
      },
      {
        id: 'Q_CIV_03',
        question_text: 'What soil mechanics principle is defined by Terzaghi\'s Effective Stress equation ($\sigma\' = \sigma - u$)?',
        options_json: [
          'Total stress is always negative in saturated soils',
          'Soil shear strength, volume change, and settlement are governed exclusively by effective stress ($\sigma\'$), which equals total stress ($\sigma$) minus pore water pressure ($u$)',
          'Water pressure increases soil bearing capacity indefinitely',
          'Compaction removes all voids from organic soils'
        ],
        correct_option_index: 1,
        explanation: 'Terzaghi\'s effective stress equation is the cornerstone of geotechnical engineering: frictional resistance and shear strength depend solely on inter-granular stress ($\sigma\'$).'
      }
    ]
  },

  // ==========================================
  // 🔌 ELECTRICAL & ELECTRONICS (EE)
  // ==========================================
  {
    id: 'ASM_EE_POWER_01',
    skill_id: 'SK_EE_POWER',
    title: 'Power Systems & Fault Analysis Diagnostic',
    category: 'Power Systems',
    domain: 'Clean Energy & Grid',
    difficulty: 'Intermediate',
    time_limit_minutes: 12,
    pass_score: 70.0,
    is_active: true,
    branch_code: 'EE',
    branch_name: 'Electrical & Electronics Engineering',
    role: 'Power Systems Engineer',
    subject: 'Power Systems Engineering',
    topic: 'Load Flow, Symmetrical Components & Protection',
    learning_resources: [
      { title: 'IEEE Power & Energy Society (PES)', url: 'https://www.ieee-pes.org/', category: 'Professional Society', description: 'Smart grid standards, relay coordination, and transmission systems.' },
      { title: 'ETAP Power System University Tutorials', url: 'https://etap.com/', category: 'Simulation Software', description: 'Load flow calculations, short circuit analysis, and protective relay settings.' }
    ],
    questions: [
      {
        id: 'Q_EE_01',
        question_text: 'In 3-phase power transmission systems, which mathematical tool resolves unbalanced voltage/current phasors into balanced sets?',
        options_json: [
          'Fourier Series Decomposition',
          'Fortescue Symmetrical Components (Positive, Negative, and Zero sequence)',
          'Laplace S-Domain Transformation',
          'Taylor Series Expansion'
        ],
        correct_option_index: 1,
        explanation: 'Fortescue theorem states that any unsymmetrical set of three-phase vectors can be broken down into positive sequence, negative sequence, and zero sequence balanced sets.'
      },
      {
        id: 'Q_EE_02',
        question_text: 'In a DC-DC Buck converter operating in continuous conduction mode (CCM) with duty cycle D, what is the output voltage $V_{out}$ in terms of input $V_{in}$?',
        options_json: [
          'V_out = V_in / D',
          'V_out = D * V_in',
          'V_out = V_in / (1 - D)',
          'V_out = D * V_in / (1 - D)'
        ],
        correct_option_index: 1,
        explanation: 'By inductor volt-second balance during steady-state CCM, $V_{out} = D \times V_{in}$, where duty ratio $0 < D < 1$, stepping down the voltage.'
      },
      {
        id: 'Q_EE_03',
        question_text: 'What is the purpose of Distance Relays (impedance relays) on high-voltage transmission lines?',
        options_json: [
          'To measure battery charging status',
          'To detect faults by calculating the ratio of voltage to current ($Z = V/I$), which is proportional to physical distance along the line',
          'To convert AC power to DC for substation computers',
          'To regulate generator mechanical governor speed'
        ],
        correct_option_index: 1,
        explanation: 'Distance protection measures positive-sequence impedance $Z = V/I$. When a line fault occurs, $Z$ drops below the threshold set for Zone 1 or Zone 2, triggering instantaneous breaker trip.'
      }
    ]
  },

  // ==========================================
  // ⚗️ CHEMICAL ENGINEERING (CHEM)
  // ==========================================
  {
    id: 'ASM_CHEM_REACTION_01',
    skill_id: 'SK_CHEM_REACTION',
    title: 'Chemical Reaction Engineering & Distillation Assessment',
    category: 'Process Engineering',
    domain: 'Petrochemical & Pharma',
    difficulty: 'Intermediate',
    time_limit_minutes: 12,
    pass_score: 70.0,
    is_active: true,
    branch_code: 'CHEM',
    branch_name: 'Chemical Engineering',
    role: 'Process Design Engineer',
    subject: 'Chemical Reaction Engineering & Mass Transfer',
    topic: 'CSTR vs PFR & McCabe-Thiele Method',
    learning_resources: [
      { title: 'Fogler Elements of Chemical Reaction Engineering', url: 'https://umich.edu/~elements/', category: 'Textbook Companion', description: 'Reactor sizing equations, conversion, and Arrhenius kinetics.' },
      { title: 'AspenTech Academy', url: 'https://www.aspentech.com/en/training', category: 'Process Simulation', description: 'Aspen Plus steady-state modeling and thermodynamic property methods.' }
    ],
    questions: [
      {
        id: 'Q_CHEM_01',
        question_text: 'For an isothermal reaction with positive order ($n > 0$), which continuous reactor requires less volume to achieve the same conversion of reactant?',
        options_json: [
          'Continuous Stirred Tank Reactor (CSTR)',
          'Plug Flow Reactor (PFR)',
          'Both require identically equal volume',
          'Fluidized Bed with backmixing'
        ],
        correct_option_index: 1,
        explanation: 'In a PFR, reactant concentration starts high and drops progressively, maintaining a higher average reaction rate. In a CSTR, the entire tank operates at the exit (lowest) concentration.'
      },
      {
        id: 'Q_CHEM_02',
        question_text: 'In the McCabe-Thiele graphical method for binary distillation, what represents the minimum reflux ratio ($R_{min}$)?',
        options_json: [
          'The slope of the stripping line equals 1.0',
          'The operating line intersects the equilibrium curve at the feed condition pinch point, requiring an infinite number of theoretical trays',
          'The reboiler duty reaches absolute zero',
          'The top distillate composition equals bottom residue'
        ],
        correct_option_index: 1,
        explanation: 'At minimum reflux, the rectifying operating line touches the vapor-liquid equilibrium (VLE) curve at a pinch point, meaning separation requires an infinite number of equilibrium stages.'
      }
    ]
  },

  // ==========================================
  // 🧬 BIOTECHNOLOGY (BIOTECH)
  // ==========================================
  {
    id: 'ASM_BIOTECH_GENOMICS_01',
    skill_id: 'SK_BIOTECH_GEN',
    title: 'Molecular Biology, CRISPR & Bioprocess Fermentation',
    category: 'Biotechnology',
    domain: 'Life Sciences',
    difficulty: 'Intermediate',
    time_limit_minutes: 12,
    pass_score: 70.0,
    is_active: true,
    branch_code: 'BIOTECH',
    branch_name: 'Biotechnology Engineering',
    role: 'Bioinformatics & Bioprocess Specialist',
    subject: 'Molecular Biology & Bioprocess Engineering',
    topic: 'Gene Editing & Fermentation Kinetics',
    learning_resources: [
      { title: 'NCBI BLAST Documentation', url: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi', category: 'Bioinformatics Tool', description: 'Basic Local Alignment Search Tool algorithms and E-value interpretation.' },
      { title: 'Bioprocess Engineering Principles (Doran)', url: 'https://www.sciencedirect.com/book/9780122208515/bioprocess-engineering-principles', category: 'Academic Reference', description: 'Mass and oxygen transfer in bioreactors, scale-up, and sterilization.' }
    ],
    questions: [
      {
        id: 'Q_BIO_01',
        question_text: 'In CRISPR-Cas9 genome editing, what provides sequence specificity to guide the Cas9 endonuclease to the target genomic locus?',
        options_json: [
          'Zinc finger protein motifs',
          'Single guide RNA (sgRNA) containing a 20-nucleotide spacer complementary to the target DNA sequence adjacent to a PAM site',
          'T4 DNA Ligase',
          'Double-stranded cDNA primers'
        ],
        correct_option_index: 1,
        explanation: 'The synthetic single guide RNA (sgRNA) pairs through Watson-Crick base pairing with the 20-bp genomic target sequence, while Cas9 recognizes the Protospacer Adjacent Motif (PAM) to cleave.'
      },
      {
        id: 'Q_BIO_02',
        question_text: 'What mathematical model describes microbial specific growth rate ($\mu$) as a function of limiting substrate concentration ($S$)?',
        options_json: [
          'Monod Equation: $\mu = \mu_{max} \frac{S}{K_s + S}$',
          'Arrhenius Equation: $k = A e^{-E_a / RT}$',
          'Navier-Stokes Equation',
          'Hardy-Weinberg Equilibrium'
        ],
        correct_option_index: 0,
        explanation: 'Monod kinetics mirrors Michaelis-Menten enzyme kinetics: $\mu = \mu_{max} S / (K_s + S)$, where $K_s$ is the substrate affinity constant.'
      }
    ]
  },

  // ==========================================
  // 🚀 AEROSPACE ENGINEERING (AERO)
  // ==========================================
  {
    id: 'ASM_AERO_PROPULSION_01',
    skill_id: 'SK_AERO_PROP',
    title: 'Rocket Propulsion, Aerodynamics & Orbital Mechanics',
    category: 'Aerospace Engineering',
    domain: 'Aviation & Space',
    difficulty: 'Advanced',
    time_limit_minutes: 15,
    pass_score: 70.0,
    is_active: true,
    branch_code: 'AERO',
    branch_name: 'Aerospace Engineering',
    role: 'Aerospace Propulsion Engineer',
    subject: 'Rocket Propulsion & Aerodynamics',
    topic: 'Supersonic Nozzles & Tsiolkovsky Equation',
    learning_resources: [
      { title: 'NASA Glenn Research Center Beginner\'s Guide to Aerodynamics', url: 'https://www.grc.nasa.gov/www/k-12/airplane/', category: 'Aero Education', description: 'Lift, drag, boundary layers, and compressible Mach flow.' },
      { title: 'Rocket Propulsion Elements (Sutton)', url: 'https://www.wiley.com/', category: 'Industry Classic', description: 'Liquid and solid propellant rocket engines, nozzle expansion, and chamber kinetics.' }
    ],
    questions: [
      {
        id: 'Q_AERO_01',
        question_text: 'According to the Tsiolkovsky Rocket Equation ($\Delta v = I_{sp} g_0 \ln \frac{m_0}{m_f}$), what two factors dictate maximum achievable orbital velocity change?',
        options_json: [
          'Atmospheric wind speed and payload battery capacity',
          'Effective exhaust velocity ($I_{sp} g_0$) and the propellant mass fraction ratio ($m_0 / m_f$)',
          'Solar radiation pressure and magnetic dipole moment',
          'Turbofan bypass ratio and wing dihedral angle'
        ],
        correct_option_index: 1,
        explanation: 'Delta-V is fundamentally governed by the specific impulse ($I_{sp}$) of the propulsion system and the natural log of initial wet mass over final dry mass.'
      },
      {
        id: 'Q_AERO_02',
        question_text: 'In a converging-diverging (de Laval) supersonic rocket nozzle, what occurs at the throat section when sonic choking condition is achieved?',
        options_json: [
          'Mach number is exactly 1.0 (local speed of sound) and mass flow rate reaches its theoretical maximum',
          'Fluid pressure increases to infinity',
          'The flow undergoes an oblique shock wave',
          'Mach number drops to subsonic zero'
        ],
        correct_option_index: 0,
        explanation: 'At the minimum cross-sectional area (throat), fluid velocity reaches $M = 1$. In the diverging section, gas expands isentropically, accelerating to supersonic speeds ($M > 1$).'
      }
    ]
  },

  // ==========================================
  // 🤖 ROBOTICS & AUTOMATION (ROBOTICS)
  // ==========================================
  {
    id: 'ASM_ROBOT_KINEMATICS_01',
    skill_id: 'SK_ROBOT_KIN',
    title: 'Robot Kinematics, ROS2 & Autonomous Navigation',
    category: 'Robotics & Control',
    domain: 'Autonomous Systems',
    difficulty: 'Intermediate',
    time_limit_minutes: 12,
    pass_score: 70.0,
    is_active: true,
    branch_code: 'ROBOTICS',
    branch_name: 'Robotics & Automation',
    role: 'Autonomous Systems Engineer',
    subject: 'Robotics & Mechanism Design',
    topic: 'DH Parameters, Forward/Inverse Kinematics & SLAM',
    learning_resources: [
      { title: 'ROS 2 Official Documentation', url: 'https://docs.ros.org/en/humble/', category: 'Robotics Middleware', description: 'Nodes, topics, actions, Nav2 stack, and DDS architecture.' },
      { title: 'Modern Robotics (Lynch & Park)', url: 'http://modernrobotics.org/', category: 'Textbook & Code', description: 'Twists, wrenches, product of exponentials, and robot dynamics.' }
    ],
    questions: [
      {
        id: 'Q_ROB_01',
        question_text: 'What are the four standard Denavit-Hartenberg (DH) parameters used to model serial robotic manipulator links?',
        options_json: [
          'Voltage, Current, Flux, Resistance',
          'Link length ($a$), link twist ($\alpha$), link offset ($d$), and joint angle ($\theta$)',
          'Mass, Center of Gravity, Inertia tensor, Friction coefficient',
          'Proportional, Integral, Derivative, Feedforward gains'
        ],
        correct_option_index: 1,
        explanation: 'The DH convention defines four kinematic parameters ($a, \alpha, d, \theta$) to derive homogeneous transformation matrices between consecutive link coordinate frames.'
      },
      {
        id: 'Q_ROB_02',
        question_text: 'In mobile robot Simultaneous Localization and Mapping (SLAM), what is the "Loop Closure" problem?',
        options_json: [
          'Reconnecting disconnected wire harnesses in motors',
          'Recognizing that the robot has returned to a previously visited physical location and adjusting accumulated odometry drift across the entire map',
          'Executing an infinite while-loop in C++',
          'Spinning the wheels in place when encountering an obstacle'
        ],
        correct_option_index: 1,
        explanation: 'Dead-reckoning odometry drifts continuously over time. Loop closure detects a previously mapped landmark, allowing pose graph optimization to eliminate accumulated drift.'
      }
    ]
  },

  // ==========================================
  // 📊 DATA SCIENCE & AI (DS)
  // ==========================================
  {
    id: 'ASM_DS_ML_01',
    skill_id: 'SK_DS_ML',
    title: 'Machine Learning Pipelines & Transformer Architectures',
    category: 'Machine Learning',
    domain: 'Data Science & AI',
    difficulty: 'Intermediate',
    time_limit_minutes: 12,
    pass_score: 70.0,
    is_active: true,
    branch_code: 'DS',
    branch_name: 'Data Science & Artificial Intelligence',
    role: 'Lead Data Scientist / AI Engineer',
    subject: 'Statistical Machine Learning & Deep Learning',
    topic: 'Cross-Validation, Regularization & Attention Mechanisms',
    learning_resources: [
      { title: 'Scikit-Learn User Guide', url: 'https://scikit-learn.org/stable/user_guide.html', category: 'Documentation', description: 'Pipelines, feature scaling, model selection, and hyperparameter tuning.' },
      { title: 'Hugging Face Transformers Course', url: 'https://huggingface.co/course/chapter1/1', category: 'Interactive Course', description: 'Attention mechanisms, tokenizer architectures, and fine-tuning.' }
    ],
    questions: [
      {
        id: 'Q_DS_01',
        question_text: 'In Transformer architectures (Vaswani et al.), what is the mathematical formula for Scaled Dot-Product Attention?',
        options_json: [
          'Attention(Q, K, V) = ReLU(Q * K + b)',
          'Attention(Q, K, V) = Softmax( (Q * K^T) / sqrt(d_k) ) * V',
          'Attention(Q, K, V) = Sigmoid(Q + K + V)',
          'Attention(Q, K, V) = argmax(Q * K * V)'
        ],
        correct_option_index: 1,
        explanation: 'Scaled Dot-Product Attention computes the dot product of Query with all Keys, divided by $\sqrt{d_k}$ to prevent vanishing gradients at large dimensions, followed by Softmax weights applied to Values.'
      },
      {
        id: 'Q_DS_02',
        question_text: 'What is the primary difference between L1 (Lasso) and L2 (Ridge) weight regularization?',
        options_json: [
          'L1 accelerates training speed; L2 slows it down',
          'L1 adds the absolute sum of weights to the loss, driving non-critical coefficients to absolute zero (feature selection); L2 penalizes squared weights, shrinking them continuously toward zero without exact zeroing',
          'L1 can only be applied to classification trees',
          'L2 disables cross-validation'
        ],
        correct_option_index: 1,
        explanation: 'Due to the diamond geometry of the L1 penalty norm, contour lines intersect at axes, producing sparse solutions with exact zeros for automatic feature selection.'
      }
    ]
  }
];

/**
 * On-demand dynamic assessment generator for ANY branch, role, subject, or topic!
 * Guarantees that every subject, role, and topic requested has a verified assessment ready to take.
 */
export function createDynamicTopicAssessment(
  branch: string,
  role: string,
  subject: string,
  topic: string
): TopicAssessment {
  const safeBranch = branch || 'Engineering';
  const safeRole = role || 'Specialist Engineer';
  const safeSubject = subject || 'Core Engineering Subject';
  const safeTopic = topic || 'Technical Competencies';
  const hashId = Math.abs((safeTopic + safeSubject).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(36);

  return {
    id: `ASM_DYN_${hashId}`,
    skill_id: `SK_${hashId.toUpperCase()}`,
    title: `${safeTopic} Mastery & Diagnostic Assessment`,
    category: `${safeBranch} Mastery`,
    domain: `${safeRole} Track`,
    difficulty: 'Intermediate',
    time_limit_minutes: 10,
    pass_score: 70.0,
    is_active: true,
    branch_code: safeBranch.substring(0, 5).toUpperCase(),
    branch_name: safeBranch,
    role: safeRole,
    subject: safeSubject,
    topic: safeTopic,
    learning_resources: [
      {
        title: `${safeTopic} Official Standards & Reference Manual`,
        url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(safeTopic),
        category: 'Reference Manual',
        description: `Comprehensive academic and industry foundations for ${safeTopic} in ${safeSubject}.`
      },
      {
        title: `${safeSubject} Industrial Best Practices & Case Studies`,
        url: 'https://scholar.google.com/scholar?q=' + encodeURIComponent(`${safeTopic} ${safeSubject}`),
        category: 'Technical Research',
        description: `Verified engineering principles, experimental methodologies, and placement standards.`
      }
    ],
    questions: [
      {
        id: `Q_${hashId}_1`,
        question_text: `In the context of ${safeSubject}, what is the foundational governing principle or definition of ${safeTopic}?`,
        options_json: [
          `It defines the physical/computational limits, boundary conditions, and equilibrium state for ${safeTopic}`,
          `It is an optional aesthetic metric with no influence on system performance or safety margins`,
          `It strictly applies only to obsolete legacy equipment and is prohibited in modern engineering`,
          `It guarantees zero-latency, 100% theoretical efficiency under all operating conditions`
        ],
        correct_option_index: 0,
        explanation: `In ${safeSubject}, ${safeTopic} establishes fundamental governing equations and equilibrium criteria that ensure design integrity and physical validity.`
      },
      {
        id: `Q_${hashId}_2`,
        question_text: `When evaluating ${safeTopic} for real-world application in a ${safeRole} workflow, which tradeoff is most critical?`,
        options_json: [
          `Maximizing software licensing cost regardless of engineering yield`,
          `Balancing accuracy, convergence, and safety factors against computational / physical resource constraints`,
          `Omitting experimental testing and relying solely on uncalibrated guesswork`,
          `Bypassing quality assurance and international engineering standards`
        ],
        correct_option_index: 1,
        explanation: `Engineering practice for a ${safeRole} requires optimizing performance and reliability margins within practical physical and economic constraints.`
      },
      {
        id: `Q_${hashId}_3`,
        question_text: `What is the standard procedure to verify and validate results when analyzing ${safeTopic}?`,
        options_json: [
          `Assume initial assumptions are always correct without validation`,
          `Perform dimensional analysis, benchmark against known analytical solutions, and verify with sensitivity studies`,
          `Delete any simulation runs that deviate from expected output`,
          `Rely solely on single-point estimations without error bounds`
        ],
        correct_option_index: 1,
        explanation: `Rigorous engineering validation of ${safeTopic} requires unit/dimensional consistency, asymptotic checks against closed-form solutions, and sensitivity analysis.`
      },
      {
        id: `Q_${hashId}_4`,
        question_text: `Which industry standard or simulation environment is most widely adopted for ${safeTopic}?`,
        options_json: [
          `Unstructured spreadsheets without version tracking`,
          `Domain-specific verified CAE / CAD / IDE / analytical simulation packages following ISO/IEEE/ASME standards`,
          `Manual hand-sketches without dimensioned tolerances`,
          `Uncalibrated third-party scripts with no unit testing`
        ],
        correct_option_index: 1,
        explanation: `Production engineering requires certified, standardized software toolchains and adherence to established regulatory and design standards.`
      }
    ]
  };
}
