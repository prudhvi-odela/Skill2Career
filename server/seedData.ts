import { ALL_CAREER_ROLES } from '../src/data/branchCareerRoles.js';

export interface Skill {
  skill_id: string;
  skill_name: string;
  category: string;
  domain: string;
  description: string;
  aliases: string[];
}

export interface CareerSkillRequirement {
  skill_id: string;
  skill_name: string;
  required_level: number;
  importance: number;
  is_core: boolean;
}

export interface CareerRole {
  career_id: string;
  career_title: string;
  domain: string;
  category?: string;
  branch_codes?: string[];
  description: string;
  min_exp_years: number;
  avg_salary_usd: number;
  market_demand?: string;
  key_workflows?: string[];
  required_skills: CareerSkillRequirement[];
}

export const SKILLS_CATALOG: Skill[] = [
  { skill_id: 'SK001', skill_name: 'Python', category: 'Languages', domain: 'General', description: 'High-level versatile programming language.', aliases: ['python', 'py', 'python3'] },
  { skill_id: 'SK002', skill_name: 'JavaScript', category: 'Languages', domain: 'Web Development', description: 'Dynamic scripting language for web development.', aliases: ['javascript', 'js', 'es6'] },
  { skill_id: 'SK003', skill_name: 'TypeScript', category: 'Languages', domain: 'Web Development', description: 'Typed superset of JavaScript.', aliases: ['typescript', 'ts'] },
  { skill_id: 'SK004', skill_name: 'Java', category: 'Languages', domain: 'Enterprise & Backend', description: 'Object-oriented language for enterprise applications.', aliases: ['java', 'core java'] },
  { skill_id: 'SK005', skill_name: 'C++', category: 'Languages', domain: 'Systems & High Performance', description: 'General-purpose language with low-level memory control.', aliases: ['cpp', 'c++'] },
  { skill_id: 'SK006', skill_name: 'Go', category: 'Languages', domain: 'Cloud & Backend', description: 'Concurrent compiled language developed by Google.', aliases: ['golang', 'go'] },
  { skill_id: 'SK007', skill_name: 'Rust', category: 'Languages', domain: 'Systems & Security', description: 'Memory-safe systems programming language.', aliases: ['rust', 'rustlang'] },
  { skill_id: 'SK008', skill_name: 'SQL', category: 'Languages', domain: 'Databases', description: 'Standard query language for relational databases.', aliases: ['sql', 'postgres', 'mysql'] },
  { skill_id: 'SK009', skill_name: 'React', category: 'Frontend', domain: 'Web Development', description: 'Component-based declarative UI library.', aliases: ['react', 'reactjs'] },
  { skill_id: 'SK010', skill_name: 'Vue.js', category: 'Frontend', domain: 'Web Development', description: 'Progressive JavaScript framework for UI.', aliases: ['vue', 'vuejs'] },
  { skill_id: 'SK011', skill_name: 'Next.js', category: 'Frontend', domain: 'Web Development', description: 'React framework for production SSR and SSG.', aliases: ['nextjs', 'next'] },
  { skill_id: 'SK012', skill_name: 'HTML5 & CSS3', category: 'Frontend', domain: 'Web Development', description: 'Core markup and styling standards of the web.', aliases: ['html', 'css', 'html5', 'css3'] },
  { skill_id: 'SK013', skill_name: 'Tailwind CSS', category: 'Frontend', domain: 'Web Development', description: 'Utility-first CSS framework for rapid UI.', aliases: ['tailwind', 'tailwindcss'] },
  { skill_id: 'SK014', skill_name: 'Redux / State Management', category: 'Frontend', domain: 'Web Development', description: 'Predictable state container for JavaScript apps.', aliases: ['redux', 'zustand'] },
  { skill_id: 'SK015', skill_name: 'FastAPI', category: 'Backend', domain: 'Backend & APIs', description: 'Modern high-performance Python web framework.', aliases: ['fastapi', 'fast-api'] },
  { skill_id: 'SK016', skill_name: 'Node.js & Express', category: 'Backend', domain: 'Backend & APIs', description: 'JavaScript runtime and minimalist web framework.', aliases: ['nodejs', 'node', 'express'] },
  { skill_id: 'SK017', skill_name: 'Django', category: 'Backend', domain: 'Backend & APIs', description: 'Full-featured batteries-included Python framework.', aliases: ['django', 'drf'] },
  { skill_id: 'SK018', skill_name: 'Spring Boot', category: 'Backend', domain: 'Enterprise & Backend', description: 'Production-grade Java framework for microservices.', aliases: ['spring', 'springboot'] },
  { skill_id: 'SK019', skill_name: 'RESTful API Design', category: 'Backend', domain: 'System Architecture', description: 'Standard architectural principles for REST APIs.', aliases: ['rest', 'rest api', 'http api'] },
  { skill_id: 'SK020', skill_name: 'GraphQL', category: 'Backend', domain: 'APIs & Integration', description: 'Query language for APIs and runtime for fulfilling queries.', aliases: ['graphql', 'apollo'] },
  { skill_id: 'SK021', skill_name: 'PostgreSQL', category: 'Databases', domain: 'Relational Databases', description: 'Advanced open-source relational database system.', aliases: ['postgres', 'postgresql', 'psql'] },
  { skill_id: 'SK022', skill_name: 'MySQL', category: 'Databases', domain: 'Relational Databases', description: 'Widely deployed open-source relational database.', aliases: ['mysql', 'mariadb'] },
  { skill_id: 'SK023', skill_name: 'MongoDB', category: 'Databases', domain: 'NoSQL', description: 'Document-based distributed NoSQL database.', aliases: ['mongodb', 'mongo', 'nosql'] },
  { skill_id: 'SK024', skill_name: 'Redis', category: 'Databases', domain: 'Caching & In-Memory', description: 'In-memory data structure store used as cache/broker.', aliases: ['redis', 'caching'] },
  { skill_id: 'SK025', skill_name: 'Vector Databases (Pinecone/Milvus)', category: 'Databases', domain: 'AI & Search', description: 'Databases engineered for embedding storage & cosine similarity.', aliases: ['vector db', 'pinecone', 'milvus', 'qdrant', 'chroma'] },
  { skill_id: 'SK026', skill_name: 'Pandas & NumPy', category: 'AI & ML', domain: 'Data Analysis', description: 'Core Python libraries for numerical computing and dataframes.', aliases: ['pandas', 'numpy'] },
  { skill_id: 'SK027', skill_name: 'Scikit-Learn', category: 'AI & ML', domain: 'Machine Learning', description: 'Standard machine learning library for predictive data analysis.', aliases: ['sklearn', 'scikit-learn'] },
  { skill_id: 'SK028', skill_name: 'PyTorch', category: 'AI & ML', domain: 'Deep Learning', description: 'Tensors and dynamic neural networks in Python.', aliases: ['pytorch', 'torch'] },
  { skill_id: 'SK029', skill_name: 'TensorFlow / Keras', category: 'AI & ML', domain: 'Deep Learning', description: 'End-to-end open source platform for machine learning.', aliases: ['tensorflow', 'tf', 'keras'] },
  { skill_id: 'SK030', skill_name: 'Natural Language Processing (NLP)', category: 'AI & ML', domain: 'NLP & LLMs', description: 'Techniques for processing, tokenizing, and understanding natural text.', aliases: ['nlp', 'transformers', 'huggingface'] },
  { skill_id: 'SK031', skill_name: 'Computer Vision', category: 'AI & ML', domain: 'Vision', description: 'Algorithms for image classification, segmentation, and object detection.', aliases: ['cv', 'opencv', 'vision'] },
  { skill_id: 'SK032', skill_name: 'Generative AI & LLMs (LangChain/RAG)', category: 'AI & ML', domain: 'Generative AI', description: 'Prompt engineering, Retrieval Augmented Generation, and LLM chains.', aliases: ['rag', 'genai', 'langchain', 'llamaindex'] },
  { skill_id: 'SK033', skill_name: 'MLOps & Model Deployment', category: 'AI & ML', domain: 'MLOps', description: 'Pipeline automation, model tracking, and serving endpoints.', aliases: ['mlops', 'mlflow', 'bentoml'] },
  { skill_id: 'SK034', skill_name: 'Docker & Containerization', category: 'DevOps & Cloud', domain: 'Containers', description: 'Container platform for isolating application environments.', aliases: ['docker', 'containers'] },
  { skill_id: 'SK035', skill_name: 'Kubernetes', category: 'DevOps & Cloud', domain: 'Orchestration', description: 'Automated container deployment, scaling, and management.', aliases: ['k8s', 'kubernetes'] },
  { skill_id: 'SK036', skill_name: 'AWS / Cloud Architecture', category: 'DevOps & Cloud', domain: 'Cloud Infrastructure', description: 'Scalable cloud computing resources, IAM, VPC, and serverless.', aliases: ['aws', 'cloud', 'gcp', 'azure'] },
  { skill_id: 'SK037', skill_name: 'Terraform (IaC)', category: 'DevOps & Cloud', domain: 'Infrastructure as Code', description: 'Declarative infrastructure configuration and provisioning.', aliases: ['terraform', 'iac'] },
  { skill_id: 'SK038', skill_name: 'CI/CD Pipelines (GitHub Actions)', category: 'DevOps & Cloud', domain: 'Automation', description: 'Automated build, test, and deployment workflows.', aliases: ['cicd', 'github actions', 'jenkins'] },
  { skill_id: 'SK039', skill_name: 'Linux / Unix CLI & Shell Scripting', category: 'DevOps & Cloud', domain: 'Systems', description: 'Command-line system navigation, piping, and bash scripting.', aliases: ['linux', 'bash', 'shell'] },
  { skill_id: 'SK040', skill_name: 'Data Structures & Algorithms', category: 'Core CS', domain: 'Fundamentals', description: 'Trees, graphs, dynamic programming, sorting, and complexity analysis.', aliases: ['dsa', 'algorithms', 'data structures'] },
  { skill_id: 'SK041', skill_name: 'System Design & Distributed Systems', category: 'Core CS', domain: 'Architecture', description: 'High availability, load balancing, caching, partition tolerance.', aliases: ['system design', 'distributed systems'] },
  { skill_id: 'SK042', skill_name: 'Computer Networks (TCP/IP, HTTP/3)', category: 'Core CS', domain: 'Networking', description: 'OSI layers, packet routing, socket programming, and protocol handshakes.', aliases: ['networking', 'tcp', 'http'] },
  { skill_id: 'SK043', skill_name: 'Git & Version Control', category: 'Software Tools', domain: 'Collaboration', description: 'Branching strategies, merge conflict resolution, and git flow.', aliases: ['git', 'github', 'version control'] },
  { skill_id: 'SK044', skill_name: 'Unit & Integration Testing (PyTest/Jest)', category: 'Software Tools', domain: 'Quality Assurance', description: 'Automated testing methodologies, test coverage, and mocks.', aliases: ['testing', 'pytest', 'jest'] },
  { skill_id: 'SK045', skill_name: 'Network Security & Cryptography', category: 'Security', domain: 'Cybersecurity', description: 'Symmetric/asymmetric encryption, TLS certificates, and auth tokens.', aliases: ['security', 'cryptography', 'cybersecurity'] },
  { skill_id: 'SK046', skill_name: 'Penetration Testing & Vulnerability Assessment', category: 'Security', domain: 'Cybersecurity', description: 'OWASP Top 10 vulnerabilities, burp suite, and defensive hardening.', aliases: ['pentesting', 'owasp', 'ethical hacking'] },
  { skill_id: 'SK047', skill_name: 'Problem Solving & Critical Reasoning', category: 'Soft Skills', domain: 'Cognitive', description: 'Deconstructing complex engineering bottlenecks logically.', aliases: ['problem solving', 'logic'] },
  { skill_id: 'SK048', skill_name: 'Technical Communication & Documentation', category: 'Soft Skills', domain: 'Professional', description: 'Writing RFCs, architecture decision records (ADRs), and clear documentation.', aliases: ['communication', 'documentation', 'writing'] },
  { skill_id: 'SK049', skill_name: 'Agile & Scrum Methodologies', category: 'Soft Skills', domain: 'Workflow', description: 'Sprint planning, retrospectives, story points, and backlog grooming.', aliases: ['agile', 'scrum', 'kanban'] },
  { skill_id: 'SK050', skill_name: 'UI/UX Principles & Accessibility (a11y)', category: 'Frontend', domain: 'Design', description: 'WCAG standards, semantic elements, and intuitive visual hierarchies.', aliases: ['ui/ux', 'accessibility', 'a11y'] }
];

export const CAREER_ROLES: CareerRole[] = ALL_CAREER_ROLES;


import { TOPIC_ASSESSMENTS, createDynamicTopicAssessment } from './assessmentData.js';

export const ASSESSMENT_DATA = TOPIC_ASSESSMENTS;
export { createDynamicTopicAssessment };

export const ACADEMIC_PROGRAMS = [
  { program_code: 'BTECH', name: 'Bachelor of Technology (B.Tech)', duration_years: 4, description: 'Undergraduate engineering and technology degree program spanning 8 semesters.' },
  { program_code: 'BS', name: 'Bachelor of Science (B.S.)', duration_years: 4, description: 'Undergraduate scientific and computational degree program.' },
  { program_code: 'BCA', name: 'Bachelor of Computer Applications (BCA)', duration_years: 3, description: 'Undergraduate software and computer applications degree program.' }
];

export const BRANCHES = [
  { branch_code: 'CSE', program_id: 'BTECH', name: 'Computer Science & Engineering', category: 'Engineering', description: 'Core computer systems, software engineering, algorithms, architectures, and data platforms.' },
  { branch_code: 'CSE_AIML', program_id: 'BTECH', name: 'CSE (Artificial Intelligence & Machine Learning)', category: 'Engineering', description: 'Specialized curriculum focusing on intelligent systems, neural networks, deep learning, and NLP.' },
  { branch_code: 'IT', program_id: 'BTECH', name: 'Information Technology', category: 'Engineering', description: 'Enterprise software applications, web engineering, cloud infrastructure, and network administration.' }
];

export const SUBJECTS = [
  { id: 'SUB_CS201', branch_id: 'CSE', subject_code: 'CS201', name: 'Data Structures and Algorithms', semester: 3, credits: 4, category: 'Core', description: 'Analysis of linear and non-linear data structures, trees, graphs, sorting, searching, and algorithmic complexity.', learning_outcomes: ['Implement balanced trees', 'Analyze time and space complexity with Big-O', 'Design graph traversal algorithms (BFS, DFS)'] },
  { id: 'SUB_CS202', branch_id: 'CSE', subject_code: 'CS202', name: 'Database Management Systems', semester: 4, credits: 4, category: 'Core', description: 'Relational database model, SQL, normalization, concurrency control, transaction processing, and indexing.', learning_outcomes: ['Write complex SQL queries', 'Normalize database schemas up to BCNF', 'Understand ACID properties and transactions'] },
  { id: 'SUB_CS301', branch_id: 'CSE', subject_code: 'CS301', name: 'Operating Systems & Concurrency', semester: 5, credits: 4, category: 'Core', description: 'Process synchronization, thread scheduling, memory virtualization, paging, and file systems.', learning_outcomes: ['Solve mutual exclusion problems using semaphores', 'Understand virtual memory and TLB paging', 'Write multi-threaded programs'] },
  { id: 'SUB_CS302', branch_id: 'CSE', subject_code: 'CS302', name: 'Computer Networks & Protocols', semester: 5, credits: 4, category: 'Core', description: 'TCP/IP stack, socket programming, HTTP protocols, DNS, congestion control, and routing algorithms.', learning_outcomes: ['Implement socket client-server architectures', 'Analyze Wireshark packet captures', 'Understand TLS handshake and encryption'] },
  { id: 'SUB_CS401', branch_id: 'CSE', subject_code: 'CS401', name: 'Machine Learning & Predictive Modeling', semester: 7, credits: 4, category: 'Core', description: 'Supervised and unsupervised learning, gradient descent, regularized regression, decision trees, and model evaluation.', learning_outcomes: ['Train predictive models using scikit-learn', 'Evaluate bias-variance tradeoff', 'Build cross-validated feature pipelines'] }
];

export const PRACTICE_PROBLEMS = [
  {
    id: 'PRB_001',
    title: 'Two Sum Problem',
    difficulty: 'Easy',
    category: 'Algorithms',
    skill_id: 'SK040',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input would have exactly one solution.',
    starter_code: 'def two_sum(nums, target):\n    # Write your solution here\n    pass',
    sample_input: 'nums = [2, 7, 11, 15], target = 9',
    sample_output: '[0, 1]'
  },
  {
    id: 'PRB_002',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    category: 'Data Structures',
    skill_id: 'SK040',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    starter_code: 'def reverse_list(head):\n    # Write your solution here\n    pass',
    sample_input: 'head = [1, 2, 3, 4, 5]',
    sample_output: '[5, 4, 3, 2, 1]'
  },
  {
    id: 'PRB_003',
    title: 'Validate Binary Search Tree',
    difficulty: 'Medium',
    category: 'Trees & Graphs',
    skill_id: 'SK040',
    description: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).',
    starter_code: 'def is_valid_bst(root):\n    # Write your solution here\n    pass',
    sample_input: 'root = [2, 1, 3]',
    sample_output: 'True'
  }
];
