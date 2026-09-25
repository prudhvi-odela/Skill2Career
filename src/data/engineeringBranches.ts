export interface Subject {
  code: string;
  name: string;
  semester: number;
  credits: number;
  category: 'Core' | 'Elective' | 'Lab' | 'Foundation';
  description: string;
  learningOutcomes: string[];
  keyTopics: string[];
  recommendedTools: string[];
}

export interface WeeklyScheduleItem {
  week: number;
  theme: string;
  theoryTopics: string[];
  labWorkflow: string;
  compilerTask: string;
  deliverable: string;
  hoursNeeded: number;
}

export interface PracticeChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  description: string;
  initialCode: string;
  language: string;
  testInput: string;
  expectedOutput: string;
  hint: string;
}

export type CompilerToolType =
  | 'code_ide'
  | 'circuit_logic'
  | 'kinematics_sim'
  | 'structural_calc'
  | 'reaction_kinetics'
  | 'aerodynamics_sim'
  | 'quantum_sim';

export interface BranchDefinition {
  code: string;
  name: string;
  shortName: string;
  category: string;
  categoryEmoji: string;
  tagline: string;
  description: string;
  primaryLanguage: string;
  compilerType: CompilerToolType;
  toolsAndTech: string[];
  targetRoles: string[];
  subjects: Subject[];
  schedule: WeeklyScheduleItem[];
  challenges: PracticeChallenge[];
}

export interface BranchCategory {
  name: string;
  emoji: string;
  branches: BranchDefinition[];
}

import { ADDITIONAL_BRANCHES } from './additionalBranches';

// -------------------------------------------------------------
// CURATED MASTER ENGINEERING BRANCHES
// -------------------------------------------------------------

const BASE_ENGINEERING_CATEGORIES: BranchCategory[] = [
  {
    name: 'Computer & IT',
    emoji: '💻',
    branches: [
      {
        code: 'CSE',
        name: 'Computer Science and Engineering (CSE)',
        shortName: 'CSE',
        category: 'Computer & IT',
        categoryEmoji: '💻',
        tagline: 'Foundations of algorithms, operating systems, distributed architectures & modern software design',
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
          },
          {
            code: 'CS401',
            name: 'Compiler Design & Formal Languages',
            semester: 7,
            credits: 4,
            category: 'Core',
            description: 'Lexical analysis, LL/LR parsing, Abstract Syntax Trees, intermediate representation, and code optimization.',
            learningOutcomes: ['Construct lexical tokenizers with Lex/Flex', 'Implement context-free grammar parsers', 'Generate Three-Address Code (TAC)'],
            keyTopics: ['DFA / NFA State Machines', 'CYK & LR(1) Parsing', 'Static Single Assignment (SSA)', 'Register Allocation', 'JIT Compilation'],
            recommendedTools: ['Flex & Bison', 'LLVM', 'Python AST']
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
          },
          {
            week: 3,
            theme: 'Concurrency, Semaphores & Memory Synchronization',
            theoryTopics: ['Dining Philosophers Problem', 'Reader-Writer Problem', 'Compare-and-Swap (CAS) Atomic Primitives'],
            labWorkflow: 'Build a bounded thread-safe ring buffer queue with lock-free atomic pointers.',
            compilerTask: 'Implement mutex locks and test deadlock conditions with multi-threading.',
            deliverable: 'Lock-free queue implementation with stress testing suite',
            hoursNeeded: 15
          },
          {
            week: 4,
            theme: 'Database Engine Mechanics & B-Tree Storage',
            theoryTopics: ['Disk I/O vs Memory Pages', 'B-Tree vs Log-Structured Merge Trees', 'WAL Logging & Crash Recovery'],
            labWorkflow: 'Build a minimal key-value store using write-ahead logging and B-Tree index pages.',
            compilerTask: 'Write a parser for SQL SELECT/INSERT operations targeting memory tables.',
            deliverable: 'Minimalist ACID-compliant micro key-value database',
            hoursNeeded: 18
          }
        ],
        challenges: [
          {
            id: 'CSE_CH1',
            title: 'LRU Cache Implementation',
            difficulty: 'Medium',
            description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) get and put operations.',
            language: 'python',
            initialCode: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        # Hint: Use a doubly linked list + hash map

    def get(self, key: int) -> int:
        return self.cache.get(key, -1)

    def put(self, key: int, value: int) -> None:
        self.cache[key] = value

# Test execution
cache = LRUCache(2)
cache.put(1, 100)
cache.put(2, 200)
print(f"Key 1: {cache.get(1)}")
cache.put(3, 300)
print(f"Key 2 (evicted): {cache.get(2)}")
`,
            testInput: 'capacity = 2, operations: put(1,100), put(2,200), get(1), put(3,300), get(2)',
            expectedOutput: 'Key 1: 100\nKey 2 (evicted): -1',
            hint: 'Use Python collections.OrderedDict or maintain a DoublyLinkedList node with head and tail pointers.'
          }
        ]
      },
      {
        code: 'IT',
        name: 'Information Technology (IT)',
        shortName: 'IT',
        category: 'Computer & IT',
        categoryEmoji: '💻',
        tagline: 'Enterprise systems, cloud networking, web infrastructure & database management',
        description: 'Focuses on deploying, administering, and engineering IT infrastructure, web services, cloud computing, and enterprise database integrations.',
        primaryLanguage: 'javascript',
        compilerType: 'code_ide',
        toolsAndTech: ['Node.js', 'AWS', 'Kubernetes', 'Terraform', 'PostgreSQL', 'Nginx'],
        targetRoles: ['Cloud Infrastructure Engineer', 'Enterprise Solutions Architect', 'DevOps Specialist'],
        subjects: [
          {
            code: 'IT201',
            name: 'Cloud Computing & Infrastructure as Code',
            semester: 4,
            credits: 4,
            category: 'Core',
            description: 'AWS architecture, VPC networking, auto-scaling, S3, IAM, and Terraform orchestration.',
            learningOutcomes: ['Provision cloud resources with Terraform', 'Configure multi-tier VPCs', 'Set up auto-scaling groups'],
            keyTopics: ['EC2 & S3', 'Terraform HCL', 'Serverless Lambdas', 'IAM Least Privilege', 'CloudWatch Monitoring'],
            recommendedTools: ['AWS CLI', 'Terraform', 'LocalStack']
          },
          {
            code: 'IT301',
            name: 'Web Enterprise Architecture & Microservices',
            semester: 5,
            credits: 4,
            category: 'Core',
            description: 'Event-driven architecture, API gateways, microservices communication, and reverse proxies.',
            learningOutcomes: ['Deploy reverse proxies with Nginx', 'Design asynchronous Kafka/RabbitMQ events', 'Enforce JWT OAuth authentication'],
            keyTopics: ['Nginx Reverse Proxy', 'RabbitMQ Messaging', 'gRPC vs REST', 'Distributed Tracing', 'Redis Cache Tiering'],
            recommendedTools: ['Docker', 'RabbitMQ', 'Express.js']
          }
        ],
        schedule: [
          {
            week: 1,
            theme: 'Enterprise Network Topology & CIDR Subnetting',
            theoryTopics: ['IPv4 Subnetting & Masking', 'VPC Routing Tables', 'NAT Gateways & Bastion Hosts'],
            labWorkflow: 'Configure a virtual private cloud with private application and public load balancer subnets.',
            compilerTask: 'Write a script to compute CIDR IP ranges, network broadcast addresses, and usable host counts.',
            deliverable: 'Automated IP CIDR calculator and network layout blueprint',
            hoursNeeded: 12
          }
        ],
        challenges: [
          {
            id: 'IT_CH1',
            title: 'CIDR Subnet Range Calculator',
            difficulty: 'Easy',
            description: 'Calculate the total number of usable host IP addresses for a given subnet prefix.',
            language: 'python',
            initialCode: `def calculate_usable_hosts(cidr_prefix: int) -> int:
    if cidr_prefix >= 31:
        return 0
    total_ips = 2 ** (32 - cidr_prefix)
    # Subtract 2 for network ID and broadcast address
    return total_ips - 2

print(f"/24 hosts: {calculate_usable_hosts(24)}")
print(f"/28 hosts: {calculate_usable_hosts(28)}")
`,
            testInput: 'CIDR /24 and /28',
            expectedOutput: '/24 hosts: 254\n/28 hosts: 14',
            hint: 'Usable hosts = 2^(32 - prefix) - 2 for IPv4 standard networks.'
          }
        ]
      },
      {
        code: 'AIML',
        name: 'Artificial Intelligence & Machine Learning (AI/ML)',
        shortName: 'AI/ML',
        category: 'Computer & IT',
        categoryEmoji: '💻',
        tagline: 'Deep neural networks, computer vision, natural language transformers & model engineering',
        description: 'Comprehensive curriculum spanning mathematical statistics, optimization algorithms, convolutional networks, transformers, and MLOps deployment.',
        primaryLanguage: 'python',
        compilerType: 'code_ide',
        toolsAndTech: ['PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy', 'HuggingFace'],
        targetRoles: ['Machine Learning Engineer', 'Deep Learning Research Scientist', 'AI Product Engineer'],
        subjects: [
          {
            code: 'AI301',
            name: 'Mathematical Foundations of Deep Learning',
            semester: 5,
            credits: 4,
            category: 'Core',
            description: 'Multivariable calculus, matrix decompositions (SVD, Eigenvalues), gradient descent variants (Adam, RMSProp).',
            learningOutcomes: ['Derive backpropagation equations analytically', 'Implement gradient descent with momentum', 'Understand loss manifolds'],
            keyTopics: ['Jacobians & Hessians', 'Singular Value Decomposition', 'Backpropagation', 'Cross-Entropy Loss', 'Vanishing Gradients'],
            recommendedTools: ['NumPy', 'SymPy', 'PyTorch']
          },
          {
            code: 'AI302',
            name: 'Transformers, LLMs & Natural Language Processing',
            semester: 6,
            credits: 4,
            category: 'Core',
            description: 'Self-attention mechanisms, multi-head attention, positional encoding, BERT, GPT, and RAG architectures.',
            learningOutcomes: ['Implement scaled dot-product attention in NumPy/PyTorch', 'Tokenize and fine-tune transformer models', 'Construct Retrieval Augmented Generation pipelines'],
            keyTopics: ['Self-Attention Matrix Math', 'Byte-Pair Encoding (BPE)', 'Rotary Positional Embeddings', 'LoRA & PEFT Fine-Tuning', 'Vector Embedding Cosine Similarity'],
            recommendedTools: ['HuggingFace', 'LangChain', 'ChromaDB']
          }
        ],
        schedule: [
          {
            week: 1,
            theme: 'Vector Mathematics & Matrix Calculus in Neural Networks',
            theoryTopics: ['Dot Products & Projections', 'Matrix Multiplication & Tensors', 'Automatic Differentiation'],
            labWorkflow: 'Build a 2-layer perceptron with forward and backward passes using raw NumPy (no PyTorch).',
            compilerTask: 'Implement the Softmax activation function and Cross-Entropy loss with numerical stability.',
            deliverable: 'Stable Softmax & Backpropagation engine tested on XOR dataset',
            hoursNeeded: 16
          }
        ],
        challenges: [
          {
            id: 'AIML_CH1',
            title: 'Scaled Dot-Product Attention in Python',
            difficulty: 'Medium',
            description: 'Implement the standard Transformer Scaled Dot-Product Attention formula: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V.',
            language: 'python',
            initialCode: `import math

def scaled_dot_product_attention(Q, K, V):
    # Q: [seq_len, d_k]
    # K: [seq_len, d_k]
    # V: [seq_len, d_v]
    d_k = len(Q[0])
    
    # Compute Q * K^T
    scores = []
    for q_vec in Q:
        row = []
        for k_vec in K:
            dot = sum(q * k for q, k in zip(q_vec, k_vec))
            row.append(dot / math.sqrt(d_k))
        scores.append(row)
    
    # Apply softmax row-wise
    weights = []
    for row in scores:
        max_val = max(row)
        exp_row = [math.exp(x - max_val) for x in row]
        sum_exp = sum(exp_row)
        weights.append([x / sum_exp for x in exp_row])
        
    # Multiply by V
    output = []
    for w_row in weights:
        out_vec = [0.0] * len(V[0])
        for w, v_vec in zip(w_row, V):
            for i, v_val in enumerate(v_vec):
                out_vec[i] += w * v_val
        output.append([round(x, 4) for x in out_vec])
    return output

Q = [[1.0, 0.0], [0.0, 1.0]]
K = [[1.0, 0.0], [0.0, 1.0]]
V = [[10.0, 20.0], [30.0, 40.0]]
result = scaled_dot_product_attention(Q, K, V)
print("Attention Output:", result)
`,
            testInput: 'Orthogonal Q, K with d_k = 2',
            expectedOutput: 'Attention Output: [[15.7612, 25.7612], [24.2388, 34.2388]]',
            hint: 'Ensure numerical stability by subtracting the row maximum before exponentiating.'
          }
        ]
      },
      {
        code: 'AIDS',
        name: 'Artificial Intelligence & Data Science (AI & DS)',
        shortName: 'AI & DS',
        category: 'Computer & IT',
        categoryEmoji: '💻',
        tagline: 'Statistical inference, big data pipelines, machine learning & predictive analytics',
        description: 'Blends computational AI with large-scale data engineering, statistical modeling, distributed data platforms, and predictive business intelligence.',
        primaryLanguage: 'python',
        compilerType: 'code_ide',
        toolsAndTech: ['Apache Spark', 'Python', 'SQL', 'PyTorch', 'Kafka', 'Tableau'],
        targetRoles: ['Data Scientist', 'AI Solutions Architect', 'Quantitative Analyst'],
        subjects: [
          {
            code: 'DS201',
            name: 'Applied Statistical Inference & Probability',
            semester: 4,
            credits: 4,
            category: 'Core',
            description: 'Bayesian statistics, hypothesis testing (p-values, t-tests, ANOVA), Central Limit Theorem, and Monte Carlo simulations.',
            learningOutcomes: ['Conduct A/B testing statistical analyses', 'Apply Bayes rule to probabilistic models', 'Run Monte Carlo risk simulations'],
            keyTopics: ['Normal & Poisson Distributions', 'Hypothesis Testing & Type I/II Errors', 'Bayesian Conjugate Priors', 'Markov Chains', 'Monte Carlo Simulation'],
            recommendedTools: ['SciPy', 'Statsmodels', 'Jupyter']
          }
        ],
        schedule: [
          {
            week: 1,
            theme: 'Hypothesis Testing & Exploratory Data Pipelines',
            theoryTopics: ['Z-Scores & P-Values', 'Null Hypothesis Formulation', 'Confidence Intervals'],
            labWorkflow: 'Perform two-sample t-test verification on product conversion datasets.',
            compilerTask: 'Calculate sample variance, standard error, and critical t-statistic from raw arrays.',
            deliverable: 'Automated statistical significance testing script',
            hoursNeeded: 14
          }
        ],
        challenges: []
      },
      {
        code: 'CYBER',
        name: 'Cyber Security',
        shortName: 'Cyber Security',
        category: 'Computer & IT',
        categoryEmoji: '💻',
        tagline: 'Cryptographic algorithms, threat hunting, ethical hacking & network defense',
        description: 'Covers modern cryptographic protocols, penetration testing, defensive engineering, malware reverse engineering, and cloud security frameworks.',
        primaryLanguage: 'python',
        compilerType: 'code_ide',
        toolsAndTech: ['Wireshark', 'Burp Suite', 'Metasploit', 'Python', 'Nmap', 'Snort'],
        targetRoles: ['Information Security Analyst', 'Penetration Tester', 'SOC Engineer', 'Cryptographer'],
        subjects: [
          {
            code: 'SEC301',
            name: 'Applied Cryptography & Secure Protocols',
            semester: 5,
            credits: 4,
            category: 'Core',
            description: 'Symmetric encryption (AES-GCM), asymmetric cryptosystems (RSA, ECC), digital signatures, and Zero-Knowledge Proofs.',
            learningOutcomes: ['Implement AES block cipher modes', 'Verify RSA key pair generation', 'Audit TLS cipher suites'],
            keyTopics: ['AES-256 GCM', 'Diffie-Hellman Key Exchange', 'Elliptic Curve Cryptography (secp256k1)', 'SHA-3 & HMAC', 'Zero Knowledge Basics'],
            recommendedTools: ['OpenSSL', 'Cryptography (Python)', 'GnuPG']
          }
        ],
        schedule: [
          {
            week: 1,
            theme: 'Modular Arithmetic & Diffie-Hellman Key Exchange',
            theoryTopics: ['Discrete Logarithm Problem', 'Primitive Roots Modulo P', 'Public-Private Key Generation'],
            labWorkflow: 'Simulate Alice and Bob establishing a shared secret over an insecure channel.',
            compilerTask: 'Implement Diffie-Hellman key exchange and verify that both shared keys match.',
            deliverable: 'End-to-end simulated DH key agreement program',
            hoursNeeded: 14
          }
        ],
        challenges: []
      },
      {
        code: 'CLOUD',
        name: 'Cloud Computing',
        shortName: 'Cloud Computing',
        category: 'Computer & IT',
        categoryEmoji: '💻',
        tagline: 'Distributed microservices, container orchestration, serverless & global scalability',
        description: 'Multi-cloud architectures, Kubernetes container clusters, distributed tracing, high-availability storage, and infrastructure automation.',
        primaryLanguage: 'python',
        compilerType: 'code_ide',
        toolsAndTech: ['Kubernetes', 'Docker', 'AWS', 'GCP', 'Terraform', 'Prometheus'],
        targetRoles: ['Cloud Architect', 'DevOps Platform Engineer', 'Kubernetes Administrator'],
        subjects: [
          {
            code: 'CLD301',
            name: 'Container Orchestration & Kubernetes',
            semester: 6,
            credits: 4,
            category: 'Core',
            description: 'Pods, ReplicaSets, Deployments, Ingress controllers, Helm charts, and service meshes.',
            learningOutcomes: ['Deploy zero-downtime rolling updates', 'Configure cluster autoscalers', 'Implement Istio service mesh routing'],
            keyTopics: ['Kubernetes Control Plane (etcd, kube-apiserver)', 'ConfigMaps & Secrets', 'StatefulSets & PVs', 'Horizontal Pod Autoscaler (HPA)', 'Prometheus Metrics'],
            recommendedTools: ['Minikube', 'kubectl', 'Helm']
          }
        ],
        schedule: [],
        challenges: []
      },
      {
        code: 'BLOCKCHAIN',
        name: 'Blockchain Technology',
        shortName: 'Blockchain',
        category: 'Computer & IT',
        categoryEmoji: '💻',
        tagline: 'Decentralized consensus, cryptographic ledgers, smart contracts & Web3 protocols',
        description: 'Distributed consensus (PoW, PoS), Solidity smart contracts, EVM byte-code execution, cryptographic merkle trees, and DeFi protocols.',
        primaryLanguage: 'javascript',
        compilerType: 'code_ide',
        toolsAndTech: ['Solidity', 'Ethereum', 'Hardhat', 'Ethers.js', 'Rust', 'IPFS'],
        targetRoles: ['Smart Contract Auditor', 'Web3 Protocol Engineer', 'Blockchain Architect'],
        subjects: [
          {
            code: 'BC401',
            name: 'Smart Contract Engineering & EVM Architecture',
            semester: 7,
            credits: 4,
            category: 'Core',
            description: 'Solidity syntax, reentrancy security vulnerabilities, gas optimization, ERC standards, and EVM opcodes.',
            learningOutcomes: ['Write and test ERC-20 / ERC-721 contracts', 'Detect reentrancy and integer overflow attack vectors', 'Optimize gas usage in EVM assembly'],
            keyTopics: ['EVM Storage Layout', 'Reentrancy Guard Patterns', 'Merkle Proof Verification', 'Oracles & Chainlink', 'Layer-2 Rollups'],
            recommendedTools: ['Hardhat', 'Foundry', 'Remix IDE']
          }
        ],
        schedule: [],
        challenges: []
      }
    ]
  },
  {
    name: 'Electrical & Electronics',
    emoji: '⚡',
    branches: [
      {
        code: 'ECE',
        name: 'Electronics and Communication Engineering (ECE)',
        shortName: 'ECE',
        category: 'Electrical & Electronics',
        categoryEmoji: '⚡',
        tagline: 'Digital signal processing, RF communication, semiconductor devices & embedded systems',
        description: 'Spans analog and digital circuit theory, electromagnetic transmission lines, digital signal processing (DSP), cellular networks, and microcontroller programming.',
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
            code: 'EC301',
            name: 'Digital Signal Processing (DSP) & Filter Design',
            semester: 5,
            credits: 4,
            category: 'Core',
            description: 'FIR and IIR filter design (Butterworth, Chebyshev), Fast Fourier Transform (FFT) algorithms, and DSP processors.',
            learningOutcomes: ['Design digital low-pass and band-pass filters', 'Implement radix-2 Cooley-Tukey FFT in C', 'Quantize coefficients to avoid limit cycles'],
            keyTopics: ['Bilinear Transformation', 'Windowing Methods (Hamming, Blackman)', 'Radix-2 FFT', 'Fixed-point vs Floating-point DSP', 'Adaptive Filters (LMS)'],
            recommendedTools: ['MATLAB DSP System Toolbox', 'ARM CMSIS-DSP']
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
          },
          {
            week: 2,
            theme: 'Sequential Logic, Flip-Flops & Finite State Machines',
            theoryTopics: ['Edge-Triggered D Flip-Flops', 'Setup & Hold Times', 'Mealy vs Moore Machine Architecture'],
            labWorkflow: 'Design a sequence detector FSM detecting 1011 patterns with non-overlapping clock pulses.',
            compilerTask: 'Simulate state transitions and verify output flag on sequence detection.',
            deliverable: 'FSM state diagram, transition table, and Verilog implementation',
            hoursNeeded: 16
          }
        ],
        challenges: [
          {
            id: 'ECE_CH1',
            title: '4-Bit Ripple Carry Adder Verification',
            difficulty: 'Easy',
            description: 'Simulate a 4-bit binary adder and compute the sum and carry out for given binary inputs.',
            language: 'verilog',
            initialCode: `// 4-bit Full Adder Simulation
module FullAdder(input a, input b, input cin, output sum, output cout);
    assign sum = a ^ b ^ cin;
    assign cout = (a & b) | (b & cin) | (a & cin);
endmodule

// Test with inputs: A = 1101 (13), B = 0111 (7)
// Expected: Sum = 0100 (4), Cout = 1 (Total = 20)
`,
            testInput: 'A=13, B=7',
            expectedOutput: 'Sum=4, Cout=1, Total=20',
            hint: 'Sum bit is XOR of A, B, and Cin. Carry is majority function.'
          }
        ]
      },
      {
        code: 'VLSI',
        name: 'VLSI Design',
        shortName: 'VLSI Design',
        category: 'Electrical & Electronics',
        categoryEmoji: '⚡',
        tagline: 'Semiconductor physics, ASIC/FPGA architecture, CMOS layout & static timing analysis',
        description: 'Microelectronic chip design, CMOS inverter physics, ASIC synthesis flow, Static Timing Analysis (STA), physical layout, and FPGA programming.',
        primaryLanguage: 'verilog',
        compilerType: 'circuit_logic',
        toolsAndTech: ['Cadence Virtuoso', 'Synopsys Design Compiler', 'Verilog', 'SystemVerilog', 'Xilinx Vivado', 'Magic VLSI'],
        targetRoles: ['ASIC Design Engineer', 'RTL Verification Engineer', 'Physical Design Specialist', 'FPGA Developer'],
        subjects: [
          {
            code: 'VLSI301',
            name: 'CMOS Digital Integrated Circuits',
            semester: 5,
            credits: 4,
            category: 'Core',
            description: 'MOSFET I-V equations, velocity saturation, CMOS inverter DC characteristics, noise margins, and dynamic power dissipation.',
            learningOutcomes: ['Calculate CMOS switching threshold voltage', 'Analyze dynamic and leakage power', 'Layout CMOS NAND and NOR gates adhering to DRC rules'],
            keyTopics: ['MOSFET Triode & Saturation Physics', 'Inverter Noise Margins (NMH, NML)', 'Elmore Delay Model', 'Subthreshold Leakage', 'Euler Path Layout'],
            recommendedTools: ['SPICE', 'Magic Layout', 'Electric VLSI']
          },
          {
            code: 'VLSI401',
            name: 'Static Timing Analysis (STA) & ASIC Flow',
            semester: 7,
            credits: 4,
            category: 'Core',
            description: 'Clock skew, clock jitter, setup and hold slack calculations, false paths, multicycle paths, and standard cell library characterization.',
            learningOutcomes: ['Compute worst-case setup and hold timing slack', 'Fix hold violations using buffer insertion', 'Generate SDC timing constraints'],
            keyTopics: ['Clock Distribution Networks', 'Setup Slack: Tclk - (Tcq + Tcomb + Tsetup)', 'Hold Slack: Tcq + Tcomb - Thold', 'Process-Voltage-Temperature (PVT) Corners', 'Clock Tree Synthesis (CTS)'],
            recommendedTools: ['Synopsys PrimeTime', 'OpenSTA', 'Xilinx Vivado']
          }
        ],
        schedule: [
          {
            week: 1,
            theme: 'Static Timing Analysis & Clock Slack Equations',
            theoryTopics: ['Clock Period & Jitter Margins', 'Setup Constraint Physics', 'Hold Time Physics'],
            labWorkflow: 'Calculate data arrival time vs data required time across 5 logic stages.',
            compilerTask: 'Compute setup slack and flag if setup violation exists at 500 MHz clock frequency.',
            deliverable: 'Automated timing budget calculator with PVT variation analysis',
            hoursNeeded: 16
          }
        ],
        challenges: []
      },
      {
        code: 'EMBEDDED',
        name: 'Embedded Systems',
        shortName: 'Embedded Systems',
        category: 'Electrical & Electronics',
        categoryEmoji: '⚡',
        tagline: 'Microcontroller architecture, real-time operating systems (RTOS), I2C/SPI & device drivers',
        description: 'Hardware-software codesign, ARM Cortex-M architecture, FreeRTOS task scheduling, UART/SPI/I2C peripheral drivers, and low-power IoT devices.',
        primaryLanguage: 'c',
        compilerType: 'circuit_logic',
        toolsAndTech: ['Embedded C', 'ARM Cortex-M', 'FreeRTOS', 'Keil uVision', 'STM32CubeIDE', 'JTAG / SWD'],
        targetRoles: ['Embedded Firmware Engineer', 'IoT Hardware Specialist', 'Automotive ECU Programmer'],
        subjects: [
          {
            code: 'EMB301',
            name: 'ARM Cortex-M Architecture & Peripheral Interfacing',
            semester: 5,
            credits: 4,
            category: 'Core',
            description: 'Thumb-2 instruction set, NVIC interrupt controller, SysTick timer, memory-mapped I/O, DMA controllers, and SPI/I2C bus.',
            learningOutcomes: ['Write bare-metal register-level GPIO drivers', 'Configure Nested Vector Interrupt Controller (NVIC)', 'Implement non-blocking DMA UART transmissions'],
            keyTopics: ['Memory Mapped I/O Registers', 'NVIC Priority Grouping', 'SysTick Timer Interrupts', 'SPI Master-Slave Protocols', 'I2C Acknowledgment & Clock Stretching'],
            recommendedTools: ['STM32F4 Discovery', 'Keil MDK', 'Saleae Logic Analyzer']
          }
        ],
        schedule: [],
        challenges: []
      },
      {
        code: 'EEE',
        name: 'Electrical and Electronics Engineering (EEE)',
        shortName: 'EEE',
        category: 'Electrical & Electronics',
        categoryEmoji: '⚡',
        tagline: 'Power systems, electrical machines, power electronics converters & smart grid distribution',
        description: 'Focuses on power generation, transformer mechanics, synchronous motors, high-voltage transmission, DC-DC buck/boost converters, and inverters.',
        primaryLanguage: 'c',
        compilerType: 'circuit_logic',
        toolsAndTech: ['MATLAB Simulink', 'PSCAD', 'AutoCAD Electrical', 'Embedded C', 'Power World Simulator'],
        targetRoles: ['Power Systems Engineer', 'Electrical Grid Specialist', 'Motor Drive Controls Developer'],
        subjects: [
          {
            code: 'EE201',
            name: 'Electrical Machines & Transformers',
            semester: 3,
            credits: 4,
            category: 'Core',
            description: 'Magnetic circuits, single/three-phase transformers, DC machines, induction motors, and synchronous alternators.',
            learningOutcomes: ['Calculate transformer regulation and efficiency', 'Analyze induction motor torque-speed curves', 'Compute armature reaction in alternators'],
            keyTopics: ['Hysteresis & Eddy Current Losses', 'Equivalent Circuit of Transformers', 'Induction Motor Slip', 'Torque-Speed Characteristics', 'V-Curves of Synchronous Motors'],
            recommendedTools: ['MATLAB Simulink Simscape', 'Ansys Maxwell']
          }
        ],
        schedule: [],
        challenges: []
      }
    ]
  },
  {
    name: 'Mechanical & Related',
    emoji: '⚙️',
    branches: [
      {
        code: 'MECH',
        name: 'Mechanical Engineering',
        shortName: 'Mechanical',
        category: 'Mechanical & Related',
        categoryEmoji: '⚙️',
        tagline: 'Thermodynamics, fluid mechanics, CAD/CAM, finite element analysis (FEA) & machine design',
        description: 'Broad mechanical discipline encompassing thermodynamic cycles, fluid dynamics, stress analysis, manufacturing automation, and machine element design.',
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
          },
          {
            code: 'ME202',
            name: 'Mechanics of Materials & Stress Analysis',
            semester: 4,
            credits: 4,
            category: 'Core',
            description: 'Stress-strain tensors, Mohr’s circle, beam bending moments, shear stress, torsional shaft deflection, and Euler buckling.',
            learningOutcomes: ['Construct shear force and bending moment diagrams', 'Determine principal stresses via Mohr’s Circle', 'Apply Von Mises and Tresca failure criteria'],
            keyTopics: ['Normal & Shear Stresses', 'Mohr’s Circle Construction', 'Pure Bending Equation: M/I = sigma/y = E/R', 'Torsion of Circular Shafts', 'Von Mises Yield Criterion'],
            recommendedTools: ['ANSYS Mechanical', 'SolidWorks Simulation']
          },
          {
            code: 'ME301',
            name: 'Kinematics & Dynamics of Machinery',
            semester: 5,
            credits: 4,
            category: 'Core',
            description: 'Four-bar linkages, velocity and acceleration polygon diagrams, cam profiles, gear trains, and flywheel gyroscopic couples.',
            learningOutcomes: ['Synthesize planar mechanism degrees of freedom via Gruebler’s criterion', 'Calculate epicyclic gear train velocity ratios', 'Balance rotating masses statically and dynamically'],
            keyTopics: ['Kutzbach-Gruebler Mobility Criterion', 'Instantaneous Centers of Velocity', 'Involute Gear Profiles & Interference', 'Planetary Gear Ratios', 'Static & Dynamic Balancing'],
            recommendedTools: ['SolidWorks Motion', 'Python SymPy']
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
        ],
        challenges: [
          {
            id: 'MECH_CH1',
            title: 'Gruebler Planar Mechanism Mobility Calculator',
            difficulty: 'Easy',
            description: 'Calculate the degrees of freedom (Mobility M) for a planar linkage: M = 3*(n - 1) - 2*j1 - j2, where n is number of links, j1 is single DOF joints (revolute/prismatic), j2 is higher pairs (cams/gears).',
            language: 'python',
            initialCode: `def calculate_mobility(links: int, lower_pairs: int, higher_pairs: int) -> int:
    # M = 3*(n - 1) - 2*j1 - j2
    m = 3 * (links - 1) - 2 * lower_pairs - higher_pairs
    return m

# Standard 4-bar linkage: n=4 links, j1=4 revolute joints, j2=0
four_bar = calculate_mobility(4, 4, 0)
print(f"4-Bar Mobility: {four_bar} DOF")

# 5-bar linkage with 5 revolute joints:
five_bar = calculate_mobility(5, 5, 0)
print(f"5-Bar Mobility: {five_bar} DOF")
`,
            testInput: '4-bar (n=4, j1=4, j2=0)',
            expectedOutput: '4-Bar Mobility: 1 DOF\n5-Bar Mobility: 2 DOF',
            hint: 'A single degree of freedom mechanism (M=1) requires exactly one driver motor.'
          }
        ]
      },
      {
        code: 'ROBOTICS',
        name: 'Robotics Engineering',
        shortName: 'Robotics',
        category: 'Mechanical & Related',
        categoryEmoji: '⚙️',
        tagline: 'Forward/Inverse kinematics, ROS 2, computer vision, trajectory planning & actuator controls',
        description: 'Integration of robotics mechanical manipulators, Denavit-Hartenberg parameters, ROS 2 nodes, trajectory generation, and sensory feedback loops.',
        primaryLanguage: 'python',
        compilerType: 'kinematics_sim',
        toolsAndTech: ['ROS 2', 'Gazebo', 'Python', 'C++', 'OpenCV', 'MoveIt!'],
        targetRoles: ['Robotics Software Engineer', 'Motion Planning Specialist', 'Autonomous Systems Developer'],
        subjects: [
          {
            code: 'ROB301',
            name: 'Robot Kinematics & Coordinate Transformations',
            semester: 5,
            credits: 4,
            category: 'Core',
            description: 'Homogeneous transformation matrices, Denavit-Hartenberg (D-H) convention, forward kinematics, and inverse kinematic analytical solutions.',
            learningOutcomes: ['Formulate 4x4 homogeneous transformation matrices', 'Assign standard D-H frames to multi-link robotic arms', 'Compute end-effector Cartesian coordinates from joint angles'],
            keyTopics: ['Rotation Matrices (Euler & Quaternions)', 'D-H Table Formulation', 'Forward Kinematics Chain', 'Inverse Kinematics Geometric Approach', 'Jacobian Velocity Kinematics & Singularities'],
            recommendedTools: ['Robotics Toolbox for Python', 'Gazebo', 'RViz']
          }
        ],
        schedule: [
          {
            week: 1,
            theme: '2-Link Planar Robotic Arm Forward Kinematics',
            theoryTopics: ['Trigonometric Forward Kinematics', 'Frame Transformations', 'Work Envelope Computation'],
            labWorkflow: 'Compute end-effector (X, Y) positions for given link lengths L1, L2 and joint angles theta1, theta2.',
            compilerTask: 'Implement forward kinematics solver and plot arm joint trajectories.',
            deliverable: 'Interactive 2-DOF robotic arm forward kinematics engine',
            hoursNeeded: 15
          }
        ],
        challenges: []
      },
      {
        code: 'MECHATRONICS',
        name: 'Mechatronics Engineering',
        shortName: 'Mechatronics',
        category: 'Mechanical & Related',
        categoryEmoji: '⚙️',
        tagline: 'Electro-mechanical systems, PLC automation, PID control loops & sensory actuators',
        description: 'Synergy of mechanical engineering, electronics, computer control, and systems design for industrial automation and smart machines.',
        primaryLanguage: 'python',
        compilerType: 'kinematics_sim',
        toolsAndTech: ['MATLAB Simulink', 'Siemens PLC (TIA Portal)', 'LabVIEW', 'Arduino/C++', 'SolidWorks'],
        targetRoles: ['Mechatronics Engineer', 'Automation Systems Specialist', 'Control Systems Developer'],
        subjects: [
          {
            code: 'MTR301',
            name: 'Sensors, Actuators & Feedback Control Systems',
            semester: 5,
            credits: 4,
            category: 'Core',
            description: 'PID controller tuning (Ziegler-Nichols), rotary encoders, stepper/servo motor drivers, pneumatic actuators, and state-space control.',
            learningOutcomes: ['Tune PID gains for zero steady-state error', 'Interface rotary encoders with microcontrollers', 'Design closed-loop speed control'],
            keyTopics: ['PID Mathematical Formulation', 'Ziegler-Nichols Tuning', 'Brushless DC Motor Commutation', 'PWM Driver Circuits', 'Root Locus Stability'],
            recommendedTools: ['Simulink', 'Arduino IDE', 'Proteus']
          }
        ],
        schedule: [],
        challenges: []
      },
      {
        code: 'AUTOMOBILE',
        name: 'Automobile Engineering',
        shortName: 'Automobile',
        category: 'Mechanical & Related',
        categoryEmoji: '⚙️',
        tagline: 'Vehicle dynamics, powertrain electrification, braking systems & aerodynamic drag',
        description: 'Design of automotive systems, internal combustion & electric powertrains, suspension kinematics, aerodynamic drag, and ADAS active safety.',
        primaryLanguage: 'python',
        compilerType: 'kinematics_sim',
        toolsAndTech: ['CarSim', 'MATLAB Simulink', 'SolidWorks', 'ANSYS Fluent', 'CANalyzer'],
        targetRoles: ['Vehicle Dynamics Engineer', 'EV Powertrain Specialist', 'Automotive Calibration Developer'],
        subjects: [
          {
            code: 'AUTO301',
            name: 'Electric Vehicle Powertrain & Battery Systems',
            semester: 6,
            credits: 4,
            category: 'Core',
            description: 'Lithium-ion battery chemistries, Battery Management Systems (BMS), regenerative braking, and permanent magnet motor drives.',
            learningOutcomes: ['Size battery pack capacity for target driving range', 'Model state-of-charge (SoC) estimation algorithms', 'Calculate tractive effort and motor torque curves'],
            keyTopics: ['Vehicle Tractive Resistance Equations', 'Battery C-Rate & Thermal Runaway', 'BMS Cell Balancing', 'Regenerative Brake Energy Recovery', 'Inverter Space Vector PWM'],
            recommendedTools: ['Simulink Powertrain Blockset', 'AVL CRUISE']
          }
        ],
        schedule: [],
        challenges: []
      }
    ]
  },
  {
    name: 'Civil & Infrastructure',
    emoji: '🏗️',
    branches: [
      {
        code: 'CIVIL',
        name: 'Civil Engineering',
        shortName: 'Civil',
        category: 'Civil & Infrastructure',
        categoryEmoji: '🏗️',
        tagline: 'Structural design, reinforced concrete, geotechnical foundations & transportation networks',
        description: 'Encompasses structural analysis, reinforced concrete design (IS 456 / ACI 318), soil mechanics, hydraulic flows, and modern infrastructure construction.',
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
          },
          {
            code: 'CE301',
            name: 'Design of Reinforced Concrete Structures',
            semester: 5,
            credits: 4,
            category: 'Core',
            description: 'Limit state method, singly and doubly reinforced beams, slab design, column axial loads, and footing shear capacity.',
            learningOutcomes: ['Calculate balanced, under-reinforced and over-reinforced beam capacities', 'Design shear reinforcement stirrups', 'Determine development length of rebar'],
            keyTopics: ['Limit State of Collapse (Flexure & Shear)', 'Stress Block Parameters', 'One-way and Two-way Slabs', 'Short and Slender Columns', 'Isolated Footing Design'],
            recommendedTools: ['ETABS', 'STAAD.Pro']
          },
          {
            code: 'CE302',
            name: 'Soil Mechanics & Geotechnical Foundations',
            semester: 5,
            credits: 4,
            category: 'Core',
            description: 'Soil classification, Terzaghi’s bearing capacity theory, consolidation settlement, Mohr-Coulomb shear strength, and pile foundations.',
            learningOutcomes: ['Calculate ultimate and safe bearing capacity of shallow footings', 'Determine primary consolidation settlement', 'Evaluate slope stability factor of safety'],
            keyTopics: ['Atterberg Limits', 'Darcy’s Law & Permeability', 'Terzaghi Bearing Capacity Factors (Nc, Nq, Ngamma)', 'Direct Shear and Triaxial Tests', 'Rankine Earth Pressure Theory'],
            recommendedTools: ['PLAXIS', 'GeoStudio']
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
        ],
        challenges: [
          {
            id: 'CIVIL_CH1',
            title: 'Simply Supported Beam Maximum Moment Calculator',
            difficulty: 'Easy',
            description: 'Calculate the maximum bending moment (kNm) and midspan deflection for a simply supported beam of length L (m) with a Uniformly Distributed Load w (kN/m).',
            language: 'python',
            initialCode: `def calculate_beam_moment(length_m: float, udl_kn_per_m: float) -> float:
    # M_max = (w * L^2) / 8
    max_moment = (udl_kn_per_m * (length_m ** 2)) / 8.0
    return round(max_moment, 2)

# Test with 6m span and 12 kN/m UDL:
m = calculate_beam_moment(6.0, 12.0)
print(f"Maximum Bending Moment: {m} kNm")
`,
            testInput: 'L = 6.0m, w = 12.0 kN/m',
            expectedOutput: 'Maximum Bending Moment: 54.0 kNm',
            hint: 'Midspan moment is w*L^2/8. Maximum shear force at supports is w*L/2.'
          }
        ]
      },
      {
        code: 'STRUCTURAL',
        name: 'Structural Engineering',
        shortName: 'Structural',
        category: 'Civil & Infrastructure',
        categoryEmoji: '🏗️',
        tagline: 'High-rise earthquake engineering, finite element structural frames & steel truss design',
        description: 'Advanced structural mechanics, seismic response spectrum analysis, wind load dynamics, structural steel connections, and cable-stayed bridges.',
        primaryLanguage: 'python',
        compilerType: 'structural_calc',
        toolsAndTech: ['ETABS', 'SAP2000', 'STAAD.Pro', 'AutoCAD', 'Python'],
        targetRoles: ['Senior Structural Consultant', 'Bridge Design Specialist', 'Seismic Retrofitting Engineer'],
        subjects: [
          {
            code: 'STR401',
            name: 'Earthquake Engineering & Seismic Design',
            semester: 7,
            credits: 4,
            category: 'Core',
            description: 'Response spectrum analysis, equivalent static lateral force, base shear calculation, ductility detailing, and base isolation.',
            learningOutcomes: ['Calculate design seismic base shear (Vb = Ah * W)', 'Determine lateral force distribution across building stories', 'Apply ductile detailing rules for RC frames'],
            keyTopics: ['Response Spectrum Curves (Sa/g)', 'Zone Factor & Importance Factor', 'Fundamental Natural Period of Building', 'Torsional Irregularity', 'Elastomeric Base Isolators'],
            recommendedTools: ['ETABS', 'SAP2000']
          }
        ],
        schedule: [],
        challenges: []
      }
    ]
  },
  {
    name: 'Chemical & Materials',
    emoji: '🧪',
    branches: [
      {
        code: 'CHEM',
        name: 'Chemical Engineering',
        shortName: 'Chemical',
        category: 'Chemical & Materials',
        categoryEmoji: '🧪',
        tagline: 'Reaction kinetics, mass transfer distillation, process simulation & chemical thermodynamics',
        description: 'Design of chemical reactors, continuous distillation columns, heat exchanger networks, fluid fluid mechanics, and automated process control.',
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
          },
          {
            code: 'CH301',
            name: 'Mass Transfer & Separation Processes',
            semester: 5,
            credits: 4,
            category: 'Core',
            description: 'Fick’s law of diffusion, McCabe-Thiele distillation method, liquid-liquid extraction, and absorption packed towers.',
            learningOutcomes: ['Determine theoretical stages in distillation columns via McCabe-Thiele', 'Calculate minimum reflux ratio (R_min)', 'Size packed column height using HTU and NTU'],
            keyTopics: ['Vapor-Liquid Equilibrium (VLE & Raoult’s Law)', 'McCabe-Thiele Operating Lines', 'Relative Volatility', 'Flooding in Packed Columns', 'Membrane Separation Processes'],
            recommendedTools: ['Aspen HYSYS', 'MATLAB']
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
        ],
        challenges: [
          {
            id: 'CHEM_CH1',
            title: 'Arrhenius Reaction Rate Constant Calculator',
            difficulty: 'Easy',
            description: 'Calculate the rate constant k using the Arrhenius equation: k = A * exp(-Ea / (R * T)), where R = 8.314 J/(mol*K).',
            language: 'python',
            initialCode: `import math

def calculate_arrhenius_k(pre_exponential_A: float, activation_energy_J: float, temp_kelvin: float) -> float:
    R = 8.314  # Gas constant J/(mol*K)
    exponent = -activation_energy_J / (R * temp_kelvin)
    k = pre_exponential_A * math.exp(exponent)
    return k

# Test with A = 1.0e13 s^-1, Ea = 80,000 J/mol at T = 300K:
k_300 = calculate_arrhenius_k(1.0e13, 80000, 300)
print(f"k at 300K: {k_300:.4e} s^-1")
`,
            testInput: 'A = 1.0e13, Ea = 80000 J/mol, T = 300K',
            expectedOutput: 'k at 300K: 1.1965e-01 s^-1',
            hint: 'Ensure temperature is in Kelvin and activation energy is in Joules (not kJ).'
          }
        ]
      },
      {
        code: 'BIOTECH',
        name: 'Biotechnology',
        shortName: 'Biotechnology',
        category: 'Chemical & Materials',
        categoryEmoji: '🧪',
        tagline: 'Recombinant DNA, bioprocess fermentation, genomic bioinformatics & protein engineering',
        description: 'Genetic engineering, CRISPR gene editing, bioreactor fermentation modeling, enzyme kinetics (Michaelis-Menten), and downstream bio-purification.',
        primaryLanguage: 'python',
        compilerType: 'reaction_kinetics',
        toolsAndTech: ['Biopython', 'BLAST', 'PyMOL', 'MATLAB', 'RStudio'],
        targetRoles: ['Bioinformatics Scientist', 'Bioprocess Fermentation Engineer', 'Cell & Gene Therapy Specialist'],
        subjects: [
          {
            code: 'BT301',
            name: 'Enzyme Engineering & Bioprocess Fermentation',
            semester: 5,
            credits: 4,
            category: 'Core',
            description: 'Michaelis-Menten kinetics, Lineweaver-Burk plots, competitive inhibition, dissolved oxygen mass transfer (kLa), and chemostat operation.',
            learningOutcomes: ['Calculate Vmax and Km from enzyme assay data', 'Estimate volumetric oxygen transfer coefficient (kLa)', 'Model microbial cell growth with Monod equation'],
            keyTopics: ['Michaelis-Menten Equation: v = (Vmax * [S]) / (Km + [S])', 'Lineweaver-Burk Linearization', 'Monod Growth Model: mu = mu_max * S / (Ks + S)', 'Batch vs Fed-batch Fermentation', 'Chromatographic Downstream Purification'],
            recommendedTools: ['Biopython', 'PyMOL', 'MATLAB']
          }
        ],
        schedule: [],
        challenges: []
      }
    ]
  },
  {
    name: 'Aerospace & Specialized',
    emoji: '✈️',
    branches: [
      {
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
          },
          {
            code: 'AE301',
            name: 'Jet Engine Propulsion & Rocket Mechanics',
            semester: 5,
            credits: 4,
            category: 'Core',
            description: 'Turbojet, turbofan, and ramjet Brayton thermodynamic cycles, de Laval convergent-divergent nozzles, and rocket Tsiolkovsky equation.',
            learningOutcomes: ['Calculate specific impulse (Isp) and rocket thrust', 'Design supersonic convergent-divergent nozzles', 'Compute rocket delta-V staging requirements'],
            keyTopics: ['Tsiolkovsky Rocket Equation: delta-V = Isp * g0 * ln(m0 / mf)', 'Isentropic Compressible Nozzle Flow', 'Choked Flow & Mach 1 at Throat', 'Turbofan Bypass Ratio Efficiency', 'Specific Fuel Consumption (TSFC)'],
            recommendedTools: ['NASA CEA', 'MATLAB']
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
        ],
        challenges: [
          {
            id: 'AERO_CH1',
            title: 'Wing Induced Drag & Lift Coefficient Calculator',
            difficulty: 'Easy',
            description: 'Calculate the induced drag coefficient (CDi) for an aircraft wing with aspect ratio AR, lift coefficient CL, and Oswald efficiency factor e: CDi = (CL^2) / (pi * AR * e).',
            language: 'python',
            initialCode: `import math

def calculate_induced_drag(cl: float, aspect_ratio: float, oswald_e: float = 0.85) -> float:
    cd_i = (cl ** 2) / (math.pi * aspect_ratio * oswald_e)
    return round(cd_i, 5)

# Test with CL = 0.6, AR = 8.0, e = 0.85:
cdi = calculate_induced_drag(0.6, 8.0, 0.85)
print(f"Induced Drag Coefficient CDi: {cdi}")
`,
            testInput: 'CL = 0.6, AR = 8.0, e = 0.85',
            expectedOutput: 'Induced Drag Coefficient CDi: 0.01686',
            hint: 'A higher aspect ratio (e.g. gliders) drastically reduces induced drag.'
          }
        ]
      }
    ]
  },
  {
    name: 'Emerging / Interdisciplinary',
    emoji: '🌱',
    branches: [
      {
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
        ],
        challenges: [
          {
            id: 'QT_CH1',
            title: 'Hadamard Gate State Vector Simulation',
            difficulty: 'Easy',
            description: 'Apply the 2x2 Hadamard unitary matrix H to a single qubit state vector [alpha, beta]^T and return the resulting amplitudes.',
            language: 'python',
            initialCode: `import math

def apply_hadamard(alpha: float, beta: float):
    # H = (1 / sqrt(2)) * [[1, 1], [1, -1]]
    factor = 1.0 / math.sqrt(2)
    new_alpha = factor * (alpha + beta)
    new_beta = factor * (alpha - beta)
    return round(new_alpha, 4), round(new_beta, 4)

# Apply to state |0>: [1.0, 0.0]
out_a, out_b = apply_hadamard(1.0, 0.0)
print(f"Output state: {out_a}|0> + {out_b}|1>")
print(f"Probabilities: P(0) = {round(out_a**2, 2)}, P(1) = {round(out_b**2, 2)}")
`,
            testInput: 'State |0> ([1.0, 0.0])',
            expectedOutput: 'Output state: 0.7071|0> + 0.7071|1>\nProbabilities: P(0) = 0.5, P(1) = 0.5',
            hint: 'A Hadamard gate puts a deterministic state into equal 50/50 superposition.'
          }
        ]
      },
      {
        code: 'SEMICONDUCTOR',
        name: 'Semiconductor Engineering',
        shortName: 'Semiconductors',
        category: 'Emerging / Interdisciplinary',
        categoryEmoji: '🌱',
        tagline: 'Cleanroom lithography, bandgap physics, GAAFET/FinFET transistors & packaging',
        description: 'Silicon wafer fabrication, extreme ultraviolet (EUV) lithography, P-N junction bandgap physics, FinFET / Gate-All-Around (GAA) architectures, and advanced packaging.',
        primaryLanguage: 'python',
        compilerType: 'circuit_logic',
        toolsAndTech: ['TCAD (Synopsys/Silvaco)', 'SPICE', 'Python', 'MATLAB'],
        targetRoles: ['Semiconductor Process Engineer', 'Device Physics Specialist', 'Packaging & Yield Engineer'],
        subjects: [
          {
            code: 'SEMI301',
            name: 'Semiconductor Device Physics & Band Theory',
            semester: 5,
            credits: 4,
            category: 'Core',
            description: 'Energy band diagrams, Fermi-Dirac distribution, carrier drift/diffusion, P-N junction depletion region, and Schottky barriers.',
            learningOutcomes: ['Calculate intrinsic carrier concentration (ni) across temperatures', 'Plot built-in potential Vbi of P-N junctions', 'Model quantum tunneling in sub-3nm nodes'],
            keyTopics: ['Direct vs Indirect Bandgaps', 'Fermi Level (Ef)', 'Einstein Relation for Diffusion', 'Avalanche vs Zener Breakdown', 'FinFET and GAAFET Topologies'],
            recommendedTools: ['Silvaco TCAD', 'MATLAB']
          }
        ],
        schedule: [],
        challenges: []
      },
      {
        code: 'ENERGY',
        name: 'Renewable Energy Engineering',
        shortName: 'Renewable Energy',
        category: 'Emerging / Interdisciplinary',
        categoryEmoji: '🌱',
        tagline: 'Solar photovoltaic sizing, wind turbine Betz limit, battery storage & microgrids',
        description: 'Photovoltaic P-N cell modeling, wind turbine aerodynamics (Betz limit), green hydrogen electrolysis, battery energy storage systems, and smart microgrid controls.',
        primaryLanguage: 'python',
        compilerType: 'kinematics_sim',
        toolsAndTech: ['PVsyst', 'HOMER Pro', 'MATLAB Simulink', 'Python'],
        targetRoles: ['Renewable Energy Systems Designer', 'Solar PV Consultant', 'Grid Storage Architect'],
        subjects: [
          {
            code: 'REN301',
            name: 'Solar Photovoltaics & Wind Power Systems',
            semester: 5,
            credits: 4,
            category: 'Core',
            description: 'Single-diode PV cell equivalent circuit, Maximum Power Point Tracking (MPPT), wind aerodynamic power coefficient Cp, and Betz limit.',
            learningOutcomes: ['Extract PV maximum power point (Vmp, Imp)', 'Implement Perturb and Observe (P&O) MPPT algorithm', 'Calculate wind turbine electrical power output'],
            keyTopics: ['Solar Irradiance & Temperature Derating', 'MPPT Algorithms', 'Betz Limit: Max Cp = 16/27 (59.3%)', 'Inverter Sizing Ratio', 'LCOE (Levelized Cost of Energy)'],
            recommendedTools: ['PVsyst', 'MATLAB Simulink']
          }
        ],
        schedule: [],
        challenges: []
      }
    ]
  }
];

import { CAREER_GOALS_DATA } from './careerGoalsHierarchy';

// Merge all additional branches into their corresponding categories
ADDITIONAL_BRANCHES.forEach(extra => {
  const cat = BASE_ENGINEERING_CATEGORIES.find(c => c.name.toLowerCase() === extra.category.toLowerCase());
  if (cat && !cat.branches.some(b => b.code.toUpperCase() === extra.code.toUpperCase())) {
    cat.branches.push(extra);
  }
});

export const ENGINEERING_CATEGORIES: BranchCategory[] = BASE_ENGINEERING_CATEGORIES;

// Helper: flat list of all branches
export const ALL_BRANCHES: BranchDefinition[] = ENGINEERING_CATEGORIES.flatMap(cat => cat.branches);

// Synchronize targetRoles strictly to CAREER_GOALS_DATA
ALL_BRANCHES.forEach(branch => {
  const code = branch.code.toUpperCase().trim();
  if (CAREER_GOALS_DATA[code]) {
    branch.targetRoles = CAREER_GOALS_DATA[code].goals.map(g => g.title);
  }
});

export function getBranchByCode(code: string): BranchDefinition {
  if (!code) return ALL_BRANCHES[0];
  const clean = code.trim();
  const upper = clean.toUpperCase();

  // 1. Exact code match
  const directMatch = ALL_BRANCHES.find(b => b.code.toUpperCase() === upper);
  if (directMatch) return directMatch;

  // 2. Extract code in parentheses if available e.g. "Biotechnology (BIOTECH)" -> "BIOTECH"
  const parenMatch = upper.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    const extractedCode = parenMatch[1].trim();
    const fromParen = ALL_BRANCHES.find(b => b.code.toUpperCase() === extractedCode);
    if (fromParen) return fromParen;
  }

  // 3. Name or shortName exact / substring matching
  const nameMatch = ALL_BRANCHES.find(b => {
    const bName = b.name.toUpperCase();
    const bShort = b.shortName.toUpperCase();
    return upper === bName || upper === bShort || upper.includes(bName) || bName.includes(upper);
  });
  if (nameMatch) return nameMatch;

  // 4. Domain & keyword heuristics for accurate discipline resolution
  if (upper.includes('BIOTECH') || upper.includes('BIO-TECH') || upper.includes('BIOLOGY')) {
    const b = ALL_BRANCHES.find(x => x.code === 'BIOTECH' || x.code === 'BT');
    if (b) return b;
  }
  if (upper.includes('BIOINFO') || upper.includes('BIO-INFO') || upper.includes('BIOINFORMATICS')) {
    const b = ALL_BRANCHES.find(x => x.code === 'BIOINFO' || x.code === 'BIO');
    if (b) return b;
  }
  if (upper.includes('CHEMICAL') || upper.includes('CHEM') || upper.includes('PROCESS')) {
    const b = ALL_BRANCHES.find(x => x.code === 'CHEM');
    if (b) return b;
  }
  if (upper.includes('AEROSPACE') || upper.includes('AERO') || upper.includes('AVIONICS')) {
    const b = ALL_BRANCHES.find(x => x.code === 'AERO' || x.code === 'AVIONICS');
    if (b) return b;
  }
  if (upper.includes('CIVIL')) {
    const b = ALL_BRANCHES.find(x => x.code === 'CIVIL');
    if (b) return b;
  }
  if (upper.includes('MECHANICAL') || upper.includes('MECH')) {
    const b = ALL_BRANCHES.find(x => x.code === 'MECH');
    if (b) return b;
  }
  if (upper.includes('ELECTRICAL') || upper.includes('EEE')) {
    const b = ALL_BRANCHES.find(x => x.code === 'EEE');
    if (b) return b;
  }
  if (upper.includes('ELECTRONIC') || upper.includes('ECE')) {
    const b = ALL_BRANCHES.find(x => x.code === 'ECE');
    if (b) return b;
  }
  if (upper.includes('DATA SCIENCE') || upper.includes(' DS')) {
    const b = ALL_BRANCHES.find(x => x.code === 'DS' || x.code === 'AIDS');
    if (b) return b;
  }
  if (upper.includes('ARTIFICIAL INTELLIGENCE') || upper.includes('AIML')) {
    const b = ALL_BRANCHES.find(x => x.code === 'AIML');
    if (b) return b;
  }

  return ALL_BRANCHES[0];
}


