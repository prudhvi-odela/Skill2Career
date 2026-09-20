"""
Skill2Career 2.0 Curriculum, Subjects, Practice Problems, and Verified Resources Seed Data
Seeds academic programs, branches, subjects, diagnostic questions, coding challenges, and verified learning resources.
"""

from typing import List, Dict, Any
from datetime import datetime, timezone
from pymongo.asynchronous.database import AsyncDatabase


def get_utc_now():
    return datetime.now(timezone.utc)


ACADEMIC_PROGRAMS = [
    {
        "program_code": "BTECH",
        "name": "Bachelor of Technology (B.Tech)",
        "duration_years": 4,
        "description": "Undergraduate engineering and technology degree program spanning 8 semesters."
    },
    {
        "program_code": "BS",
        "name": "Bachelor of Science (B.S.)",
        "duration_years": 4,
        "description": "Undergraduate scientific and computational degree program."
    },
    {
        "program_code": "BCA",
        "name": "Bachelor of Computer Applications (BCA)",
        "duration_years": 3,
        "description": "Undergraduate software and computer applications degree program."
    },
    {
        "program_code": "MS",
        "name": "Master of Science (M.S.)",
        "duration_years": 2,
        "description": "Postgraduate specialized computer science and engineering degree program."
    },
    {
        "program_code": "MCA",
        "name": "Master of Computer Applications (MCA)",
        "duration_years": 2,
        "description": "Postgraduate advanced software systems and application architecture program."
    }
]

BRANCHES = [
    {
        "branch_code": "CSE",
        "program_id": "BTECH",
        "name": "Computer Science & Engineering",
        "category": "Engineering",
        "description": "Core computer systems, software engineering, algorithms, architectures, and data platforms."
    },
    {
        "branch_code": "CSE_AIML",
        "program_id": "BTECH",
        "name": "CSE (Artificial Intelligence & Machine Learning)",
        "category": "Engineering",
        "description": "Specialized curriculum focusing on intelligent systems, neural networks, deep learning, and NLP."
    },
    {
        "branch_code": "CSE_DS",
        "program_id": "BTECH",
        "name": "CSE (Data Science)",
        "category": "Engineering",
        "description": "Statistical modeling, big data analytics, distributed data pipelines, and predictive algorithms."
    },
    {
        "branch_code": "IT",
        "program_id": "BTECH",
        "name": "Information Technology",
        "category": "Engineering",
        "description": "Enterprise software applications, web engineering, cloud infrastructure, and network administration."
    },
    {
        "branch_code": "ECE",
        "program_id": "BTECH",
        "name": "Electronics & Communication Engineering",
        "category": "Engineering",
        "description": "Digital signal processing, embedded systems, microcontrollers, VLSI, and communication theory."
    },
    {
        "branch_code": "EEE",
        "program_id": "BTECH",
        "name": "Electrical & Electronics Engineering",
        "category": "Engineering",
        "description": "Power systems, control theory, electric drives, smart grids, and analog/digital circuits."
    },
    {
        "branch_code": "MECH",
        "program_id": "BTECH",
        "name": "Mechanical Engineering",
        "category": "Engineering",
        "description": "Thermodynamics, fluid mechanics, robotics, CAD/CAM design, and manufacturing processes."
    },
    {
        "branch_code": "CIVIL",
        "program_id": "BTECH",
        "name": "Civil Engineering",
        "category": "Engineering",
        "description": "Structural analysis, geotechnical engineering, transportation systems, and environmental design."
    },
    {
        "branch_code": "BIOTECH",
        "program_id": "BTECH",
        "name": "Biotechnology",
        "category": "Science & Tech",
        "description": "Molecular biology, genetic engineering, bioprocess engineering, and bioinformatics."
    },
    {
        "branch_code": "BIOINFO",
        "program_id": "BTECH",
        "name": "Bioinformatics",
        "category": "Science & Tech",
        "description": "Computational genomics, biological database algorithms, protein structure modeling, and Biopython."
    },
    {
        "branch_code": "FOODTECH",
        "program_id": "BTECH",
        "name": "Food Technology",
        "category": "Technology",
        "description": "Food chemistry, preservation technologies, quality assurance, and bioprocess systems."
    }
]

# Verified real external resources (Zero hallucination)
VERIFIED_RESOURCES = [
    {
        "resource_id": "RES_PY_DOCS",
        "title": "Official Python 3 Documentation",
        "source": "Python Software Foundation",
        "url": "https://docs.python.org/3/",
        "description": "Comprehensive reference manuals, language tutorial, and standard library documentation.",
        "skills": ["SK001"],
        "topics": ["Python", "Programming", "Data Structures"],
        "resource_type": "Documentation",
        "domain": "Software Engineering"
    },
    {
        "resource_id": "RES_MDN_JS",
        "title": "MDN Web Docs - JavaScript Guide",
        "source": "Mozilla Developer Network",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        "description": "Authoritative guide to modern JavaScript syntax, async programming, closures, and DOM APIs.",
        "skills": ["SK003"],
        "topics": ["JavaScript", "Web Technologies", "Frontend"],
        "resource_type": "Documentation",
        "domain": "Web Development"
    },
    {
        "resource_id": "RES_REACT_DEV",
        "title": "React Official Documentation",
        "source": "React Core Team",
        "url": "https://react.dev",
        "description": "Modern React guides covering component architecture, hooks, state management, and effects.",
        "skills": ["SK004"],
        "topics": ["React", "Web Technologies", "Frontend"],
        "resource_type": "Documentation",
        "domain": "Web Development"
    },
    {
        "resource_id": "RES_FASTAPI_DOCS",
        "title": "FastAPI Framework Documentation",
        "source": "FastAPI",
        "url": "https://fastapi.tiangolo.com/",
        "description": "Interactive API development guide with Python type hints, Pydantic serialization, and async I/O.",
        "skills": ["SK015"],
        "topics": ["FastAPI", "Backend", "APIs", "Python"],
        "resource_type": "Documentation",
        "domain": "Backend Engineering"
    },
    {
        "resource_id": "RES_POSTGRES_DOCS",
        "title": "PostgreSQL Official Documentation",
        "source": "PostgreSQL Global Development Group",
        "url": "https://www.postgresql.org/docs/",
        "description": "Official relational database manual covering SQL queries, indexes, transactions, and performance tuning.",
        "skills": ["SK008"],
        "topics": ["SQL", "DBMS", "Database Systems"],
        "resource_type": "Documentation",
        "domain": "Database Engineering"
    },
    {
        "resource_id": "RES_DOCKER_DOCS",
        "title": "Docker Documentation & Guides",
        "source": "Docker Inc.",
        "url": "https://docs.docker.com/",
        "description": "Containerization fundamentals, Dockerfiles, multi-stage builds, and container networking.",
        "skills": ["SK034"],
        "topics": ["Docker", "DevOps", "Operating Systems", "Cloud"],
        "resource_type": "Documentation",
        "domain": "Cloud & DevOps"
    },
    {
        "resource_id": "RES_PYTORCH_TUTORIALS",
        "title": "PyTorch Official Deep Learning Tutorials",
        "source": "PyTorch / Linux Foundation",
        "url": "https://pytorch.org/tutorials/",
        "description": "End-to-end neural network guides, tensors, autograd, CNNs, transformers, and model deployment.",
        "skills": ["SK007", "SK009"],
        "topics": ["Machine Learning", "Deep Learning", "AI", "Neural Networks"],
        "resource_type": "Tutorial",
        "domain": "Artificial Intelligence"
    },
    {
        "resource_id": "RES_LEETCODE_STUDY",
        "title": "LeetCode Algorithmic Study Plan",
        "source": "LeetCode",
        "url": "https://leetcode.com/explore/",
        "description": "Interactive coding platform with hundreds of algorithmic challenges across arrays, trees, and dynamic programming.",
        "skills": ["SK040"],
        "topics": ["Data Structures", "Algorithms", "Problem Solving"],
        "resource_type": "Practice",
        "domain": "Computer Science"
    },
    {
        "resource_id": "RES_W3C_WEB",
        "title": "W3C Web Standards & Semantic HTML5",
        "source": "World Wide Web Consortium",
        "url": "https://www.w3.org/standards/",
        "description": "Official technical specifications for web protocols, accessibility, and modern semantic standards.",
        "skills": ["SK003", "SK004"],
        "topics": ["Web Technologies", "HTML", "CSS"],
        "resource_type": "Documentation",
        "domain": "Web Development"
    },
    {
        "resource_id": "RES_KAGGLE_LEARN",
        "title": "Kaggle Micro-Courses for Data Science",
        "source": "Kaggle",
        "url": "https://www.kaggle.com/learn",
        "description": "Hands-on micro-tutorials in Python, Pandas, Machine Learning, Data Visualization, and Feature Engineering.",
        "skills": ["SK001", "SK007", "SK010"],
        "topics": ["Data Science", "Machine Learning", "Statistics"],
        "resource_type": "Course",
        "domain": "Data Science"
    }
]

# Database-driven Curriculum Subjects
SUBJECTS_CATALOG = [
    # CSE Subjects
    {
        "subject_code": "CSE_PROG_101",
        "name": "Programming Fundamentals (Python / C)",
        "branch_id": "CSE",
        "program_id": "BTECH",
        "semester": 1,
        "academic_year": 1,
        "description": "Core programming syntax, variables, control flow, functions, recursion, and modular problem solving.",
        "is_core": True,
        "canonical_skills": ["SK001"],
        "prerequisites": [],
        "learning_resources": [
            {
                "title": "Python Official Tutorial",
                "source": "Python Docs",
                "url": "https://docs.python.org/3/tutorial/",
                "resource_type": "Documentation",
                "description": "Official step-by-step introduction to Python basics."
            }
        ],
        "diagnostic_questions": [
            {
                "id": "q_prog_1",
                "question_text": "What is the time complexity of searching for an element in an unsorted array of size N?",
                "options": ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
                "correct_option_index": 2,
                "skill_id": "SK001",
                "explanation": "Linear search across an unsorted array requires checking each element one by one in O(N) time."
            },
            {
                "id": "q_prog_2",
                "question_text": "In Python, which built-in data type is mutable?",
                "options": ["tuple", "str", "list", "int"],
                "correct_option_index": 2,
                "skill_id": "SK001",
                "explanation": "Lists in Python can be modified in-place, whereas tuples, strings, and integers are immutable."
            },
            {
                "id": "q_prog_3",
                "question_text": "What is the base case in a recursive function responsible for?",
                "options": ["Accelerating execution", "Terminating recursion to prevent stack overflow", "Allocating heap memory", "Generating return tuples"],
                "correct_option_index": 1,
                "explanation": "The base case defines the termination condition that stops further recursive calls."
            }
        ]
    },
    {
        "subject_code": "CSE_DSA_201",
        "name": "Data Structures & Algorithms",
        "branch_id": "CSE",
        "program_id": "BTECH",
        "semester": 3,
        "academic_year": 2,
        "description": "Linear and non-linear data structures: arrays, linked lists, stacks, queues, trees, graphs, sorting, and dynamic programming.",
        "is_core": True,
        "canonical_skills": ["SK040"],
        "prerequisites": ["CSE_PROG_101"],
        "learning_resources": [
            {
                "title": "Algorithms & Problem Solving Guide",
                "source": "LeetCode Explore",
                "url": "https://leetcode.com/explore/",
                "resource_type": "Practice",
                "description": "Structured curriculum on tree traversals, binary search, and graph algorithms."
            }
        ],
        "diagnostic_questions": [
            {
                "id": "q_dsa_1",
                "question_text": "What is the average time complexity of searching a balanced Binary Search Tree (BST)?",
                "options": ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
                "correct_option_index": 1,
                "skill_id": "SK040",
                "explanation": "In a balanced BST, each comparison halves the search space, yielding O(log N) average time."
            },
            {
                "id": "q_dsa_2",
                "question_text": "Which data structure follows the First-In, First-Out (FIFO) principle?",
                "options": ["Stack", "Queue", "Binary Heap", "Hash Table"],
                "correct_option_index": 1,
                "skill_id": "SK040",
                "explanation": "Queues operate strictly in FIFO order."
            },
            {
                "id": "q_dsa_3",
                "question_text": "Which sorting algorithm achieves O(N log N) worst-case time complexity guaranteed?",
                "options": ["Quick Sort", "Bubble Sort", "Merge Sort", "Insertion Sort"],
                "correct_option_index": 2,
                "skill_id": "SK040",
                "explanation": "Merge sort divides the array in half and merges sorted sub-arrays in O(N log N) time in all cases."
            },
            {
                "id": "q_dsa_4",
                "question_text": "What data structure is typically used for Breadth-First Search (BFS) on a graph?",
                "options": ["Stack", "Queue", "Priority Queue", "Disjoint Set"],
                "correct_option_index": 1,
                "skill_id": "SK040",
                "explanation": "BFS uses a FIFO queue to visit neighbor vertices level by level."
            }
        ]
    },
    {
        "subject_code": "CSE_DBMS_202",
        "name": "Database Management Systems (DBMS)",
        "branch_id": "CSE",
        "program_id": "BTECH",
        "semester": 4,
        "academic_year": 2,
        "description": "Relational data model, SQL queries, normalization, ACID transactions, indexing, and concurrency control.",
        "is_core": True,
        "canonical_skills": ["SK008"],
        "prerequisites": [],
        "learning_resources": [
            {
                "title": "PostgreSQL Relational Manual",
                "source": "PostgreSQL Docs",
                "url": "https://www.postgresql.org/docs/",
                "resource_type": "Documentation",
                "description": "Official documentation covering SQL syntax, joins, transactions, and indexing."
            }
        ],
        "diagnostic_questions": [
            {
                "id": "q_db_1",
                "question_text": "What does the 'A' stand for in ACID properties of database transactions?",
                "options": ["Availability", "Atomicity", "Accuracy", "Asynchronous"],
                "correct_option_index": 1,
                "skill_id": "SK008",
                "explanation": "Atomicity guarantees that all statements in a transaction either complete entirely or are fully rolled back."
            },
            {
                "id": "q_db_2",
                "question_text": "Which normal form requires eliminating partial functional dependencies on a composite primary key?",
                "options": ["1NF", "2NF", "3NF", "BCNF"],
                "correct_option_index": 1,
                "skill_id": "SK008",
                "explanation": "Second Normal Form (2NF) enforces that all non-key attributes are fully functionally dependent on the primary key."
            },
            {
                "id": "q_db_3",
                "question_text": "Which SQL JOIN returns all rows from the left table and matched rows from the right table?",
                "options": ["INNER JOIN", "LEFT OUTER JOIN", "CROSS JOIN", "RIGHT OUTER JOIN"],
                "correct_option_index": 1,
                "skill_id": "SK008",
                "explanation": "LEFT JOIN returns all rows from the left table regardless of whether a matching row exists in the right table."
            }
        ]
    },
    {
        "subject_code": "CSE_OS_301",
        "name": "Operating Systems & System Programming",
        "branch_id": "CSE",
        "program_id": "BTECH",
        "semester": 5,
        "academic_year": 3,
        "description": "Processes, threads, CPU scheduling algorithms, synchronization, deadlocks, virtual memory management, and file systems.",
        "is_core": True,
        "canonical_skills": ["SK015", "SK034"],
        "prerequisites": ["CSE_PROG_101"],
        "learning_resources": [
            {
                "title": "Linux Kernel & OS Architecture",
                "source": "Kernel.org Docs",
                "url": "https://docs.kernel.org/",
                "resource_type": "Documentation",
                "description": "Process management and virtual memory subsystems."
            }
        ],
        "diagnostic_questions": [
            {
                "id": "q_os_1",
                "question_text": "Which of the following is NOT one of the 4 Coffman conditions required for a deadlock?",
                "options": ["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"],
                "correct_option_index": 2,
                "explanation": "The condition is 'No Preemption'. If preemption is allowed, deadlocks can be avoided."
            },
            {
                "id": "q_os_2",
                "question_text": "What is thrashing in an operating system?",
                "options": ["CPU overclocking", "Excessive page swapping between RAM and disk", "Thread deadlocking", "Stack overflow in kernel mode"],
                "correct_option_index": 1,
                "explanation": "Thrashing occurs when the OS spends more time paging memory than executing user instructions."
            }
        ]
    },
    {
        "subject_code": "CSE_NET_302",
        "name": "Computer Networks & Protocols",
        "branch_id": "CSE",
        "program_id": "BTECH",
        "semester": 5,
        "academic_year": 3,
        "description": "OSI & TCP/IP stack, routing protocols, transport layer (TCP/UDP), application layer (HTTP/DNS/TLS), and network security.",
        "is_core": True,
        "canonical_skills": ["SK034", "SK015"],
        "prerequisites": [],
        "learning_resources": [
            {
                "title": "MDN Networking & HTTP Overview",
                "source": "MDN Web Docs",
                "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP",
                "resource_type": "Documentation",
                "description": "Comprehensive HTTP protocol, headers, status codes, and TLS handshake guide."
            }
        ],
        "diagnostic_questions": [
            {
                "id": "q_net_1",
                "question_text": "Which layer of the OSI model does the TCP protocol operate at?",
                "options": ["Network Layer", "Transport Layer", "Data Link Layer", "Session Layer"],
                "correct_option_index": 1,
                "explanation": "TCP is a reliable, connection-oriented Transport Layer protocol."
            },
            {
                "id": "q_net_2",
                "question_text": "What is the three-way handshake sequence in TCP connection establishment?",
                "options": ["SYN -> SYN-ACK -> ACK", "ACK -> SYN -> ACK", "FIN -> ACK -> FIN-ACK", "REQ -> RES -> ACK"],
                "correct_option_index": 0,
                "explanation": "TCP connects using SYN, SYN-ACK, and ACK."
            }
        ]
    },
    {
        "subject_code": "CSE_WEB_303",
        "name": "Web Technologies & Full Stack Development",
        "branch_id": "CSE",
        "program_id": "BTECH",
        "semester": 6,
        "academic_year": 3,
        "description": "Modern frontend (React, TypeScript), backend APIs (REST, async microservices), authentication, and responsive design.",
        "is_core": True,
        "canonical_skills": ["SK003", "SK004", "SK015"],
        "prerequisites": ["CSE_PROG_101"],
        "learning_resources": [
            {
                "title": "React Official Documentation",
                "source": "React.dev",
                "url": "https://react.dev",
                "resource_type": "Documentation",
                "description": "Component design, state management, and modern React patterns."
            }
        ],
        "diagnostic_questions": [
            {
                "id": "q_web_1",
                "question_text": "In React, what hook is used to perform side effects like data fetching or subscriptions?",
                "options": ["useState", "useEffect", "useCallback", "useRef"],
                "correct_option_index": 1,
                "skill_id": "SK004",
                "explanation": "useEffect runs side-effect logic after component rendering."
            },
            {
                "id": "q_web_2",
                "question_text": "What is the primary benefit of TypeScript over vanilla JavaScript?",
                "options": ["Direct execution in browser without compilation", "Static type checking at compile time", "Faster runtime memory allocation", "Automated SQL generation"],
                "correct_option_index": 1,
                "skill_id": "SK003",
                "explanation": "TypeScript introduces compile-time static type analysis, catching errors early."
            }
        ]
    },
    # AI/ML Subjects
    {
        "subject_code": "AIML_ML_301",
        "name": "Machine Learning & Pattern Recognition",
        "branch_id": "CSE_AIML",
        "program_id": "BTECH",
        "semester": 5,
        "academic_year": 3,
        "description": "Supervised & unsupervised learning, classification, regression, clustering, ensemble models, cross-validation, and metrics.",
        "is_core": True,
        "canonical_skills": ["SK007", "SK010"],
        "prerequisites": ["CSE_PROG_101"],
        "learning_resources": [
            {
                "title": "Scikit-Learn Machine Learning Guide",
                "source": "Scikit-Learn Docs",
                "url": "https://scikit-learn.org/stable/",
                "resource_type": "Documentation",
                "description": "Standard documentation for classification, regression, and model evaluation metrics."
            }
        ],
        "diagnostic_questions": [
            {
                "id": "q_ml_1",
                "question_text": "What metric is best suited for evaluating a highly imbalanced classification dataset?",
                "options": ["Accuracy", "ROC-AUC / Precision-Recall F1-Score", "Mean Squared Error", "R-Squared"],
                "correct_option_index": 1,
                "skill_id": "SK007",
                "explanation": "When classes are heavily skewed, accuracy is misleading; F1-score and PR-AUC evaluate true positives against false predictions."
            },
            {
                "id": "q_ml_2",
                "question_text": "What technique helps mitigate overfitting in machine learning models?",
                "options": ["Increasing model parameters", "L1 / L2 Regularization and Cross-Validation", "Removing test data", "Training for infinite epochs"],
                "correct_option_index": 1,
                "skill_id": "SK007",
                "explanation": "Regularization penalizes overly large weights, enforcing simpler, more generalizable decision boundaries."
            }
        ]
    },
    {
        "subject_code": "AIML_DL_401",
        "name": "Deep Learning & Neural Architectures",
        "branch_id": "CSE_AIML",
        "program_id": "BTECH",
        "semester": 7,
        "academic_year": 4,
        "description": "Multi-layer perceptrons, backpropagation, CNNs, RNNs, transformers, attention mechanisms, and PyTorch implementations.",
        "is_core": True,
        "canonical_skills": ["SK009", "SK007"],
        "prerequisites": ["AIML_ML_301"],
        "learning_resources": [
            {
                "title": "PyTorch Neural Network Tutorials",
                "source": "PyTorch.org",
                "url": "https://pytorch.org/tutorials/",
                "resource_type": "Tutorial",
                "description": "Step-by-step guides for training neural networks with GPU acceleration."
            }
        ],
        "diagnostic_questions": [
            {
                "id": "q_dl_1",
                "question_text": "What problem does the Attention mechanism solve in sequence-to-sequence neural architectures?",
                "options": ["GPU memory exhaustion", "Information bottleneck of compressing entire sequences into a single fixed vector", "High compilation latency", "Vanishing gradients in output layers"],
                "correct_option_index": 1,
                "skill_id": "SK009",
                "explanation": "Attention allows the decoder to dynamically attend to relevant input tokens across arbitrary context distances."
            }
        ]
    },
    # ECE Subjects
    {
        "subject_code": "ECE_DIGITAL_201",
        "name": "Digital Electronics & Logic Design",
        "branch_id": "ECE",
        "program_id": "BTECH",
        "semester": 3,
        "academic_year": 2,
        "description": "Boolean algebra, combinational circuits, flip-flops, sequential finite state machines, and FPGA/Verilog foundations.",
        "is_core": True,
        "canonical_skills": ["SK028"],
        "prerequisites": [],
        "learning_resources": [
            {
                "title": "Digital Logic & Computer Architecture",
                "source": "AllAboutCircuits",
                "url": "https://www.allaboutcircuits.com/",
                "resource_type": "Tutorial",
                "description": "Guides to logic gates, Karnaugh maps, and timing diagrams."
            }
        ],
        "diagnostic_questions": [
            {
                "id": "q_ece_1",
                "question_text": "Which logic gate outputs 1 only when an odd number of inputs are 1?",
                "options": ["AND", "OR", "XOR", "NAND"],
                "correct_option_index": 2,
                "explanation": "The XOR (Exclusive OR) gate yields 1 for odd parity."
            }
        ]
    },
    {
        "subject_code": "ECE_EMBEDDED_301",
        "name": "Embedded Systems & Microcontrollers",
        "branch_id": "ECE",
        "program_id": "BTECH",
        "semester": 6,
        "academic_year": 3,
        "description": "ARM Cortex architecture, RTOS, GPIO/UART/SPI/I2C communication protocols, hardware interrupts, and real-time firmware.",
        "is_core": True,
        "canonical_skills": ["SK001", "SK028"],
        "prerequisites": ["ECE_DIGITAL_201"],
        "learning_resources": [
            {
                "title": "ARM Developer Resources",
                "source": "ARM",
                "url": "https://developer.arm.com/",
                "resource_type": "Documentation",
                "description": "Cortex-M microcontroller documentation and embedded C firmware guides."
            }
        ],
        "diagnostic_questions": [
            {
                "id": "q_emb_1",
                "question_text": "Which serial communication protocol uses two wires: SDA (data) and SCL (clock)?",
                "options": ["UART", "SPI", "I2C", "CAN"],
                "correct_option_index": 2,
                "explanation": "I2C (Inter-Integrated Circuit) uses a 2-wire synchronous bidirectional bus."
            }
        ]
    }
]

# Coding Practice Challenges Catalog (Python, JavaScript, TypeScript, C, C++, Java)
PRACTICE_PROBLEMS = [
    {
        "problem_code": "PROB_001_TWO_SUM",
        "title": "Two Sum Problem",
        "difficulty": "Easy",
        "category": "Arrays & Hashing",
        "canonical_skills": ["SK040", "SK001"],
        "supported_languages": ["python", "javascript", "typescript", "cpp", "java", "c"],
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "constraints": [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists."
        ],
        "starter_code": {
            "python": "def two_sum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass\n",
            "javascript": "function twoSum(nums, target) {\n    // Write your solution here\n}\n",
            "typescript": "function twoSum(nums: number[], target: number): number[] {\n    // Write your solution here\n    return [];\n}\n",
            "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}\n",
            "java": "public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[0];\n    }\n}\n",
            "c": "#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* result = (int*)malloc(2 * sizeof(int));\n    return result;\n}\n"
        },
        "sample_test_cases": [
            {
                "id": "tc_1",
                "input_data": "nums = [2,7,11,15], target = 9",
                "expected_output": "[0, 1]",
                "is_hidden": False,
                "explanation": "nums[0] + nums[1] == 2 + 7 == 9, so we return [0, 1]."
            },
            {
                "id": "tc_2",
                "input_data": "nums = [3,2,4], target = 6",
                "expected_output": "[1, 2]",
                "is_hidden": False,
                "explanation": "nums[1] + nums[2] == 2 + 4 == 6, so we return [1, 2]."
            },
            {
                "id": "tc_3",
                "input_data": "nums = [3,3], target = 6",
                "expected_output": "[0, 1]",
                "is_hidden": True
            }
        ],
        "hints": [
            "A brute force search takes O(N^2) time. Can you use a hash map to look up complements in O(1) time?",
            "Store each number's index as you iterate through the array."
        ]
    },
    {
        "problem_code": "PROB_002_VALID_PALINDROME",
        "title": "Valid Palindrome",
        "difficulty": "Easy",
        "category": "Strings & Two Pointers",
        "canonical_skills": ["SK040", "SK001"],
        "supported_languages": ["python", "javascript", "typescript", "cpp", "java", "c"],
        "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
        "constraints": [
            "1 <= s.length <= 2 * 10^5",
            "s consists only of printable ASCII characters."
        ],
        "starter_code": {
            "python": "def is_palindrome(s: str) -> bool:\n    # Write your solution here\n    pass\n",
            "javascript": "function isPalindrome(s) {\n    // Write your solution here\n}\n",
            "typescript": "function isPalindrome(s: string): boolean {\n    // Write your solution here\n    return false;\n}\n"
        },
        "sample_test_cases": [
            {
                "id": "tc_pal_1",
                "input_data": 's = "A man, a plan, a canal: Panama"',
                "expected_output": "true",
                "is_hidden": False,
                "explanation": '"amanaplanacanalpanama" is a palindrome.'
            },
            {
                "id": "tc_pal_2",
                "input_data": 's = "race a car"',
                "expected_output": "false",
                "is_hidden": False,
                "explanation": '"raceacar" is not a palindrome.'
            }
        ],
        "hints": [
            "Consider using two pointers: one starting from the beginning and one from the end.",
            "Skip non-alphanumeric characters using isalnum() or regex."
        ]
    },
    {
        "problem_code": "PROB_003_BINARY_SEARCH",
        "title": "Binary Search",
        "difficulty": "Easy",
        "category": "Searching Algorithms",
        "canonical_skills": ["SK040"],
        "supported_languages": ["python", "javascript", "typescript", "cpp", "java", "c"],
        "description": "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.\nYou must write an algorithm with `O(log n)` runtime complexity.",
        "constraints": [
            "1 <= nums.length <= 10^4",
            "-10^4 < nums[i], target < 10^4",
            "All the integers in nums are unique.",
            "nums is sorted in ascending order."
        ],
        "starter_code": {
            "python": "def search(nums: list[int], target: int) -> int:\n    # Implement binary search in O(log N)\n    pass\n",
            "javascript": "function search(nums, target) {\n    // Implement binary search in O(log N)\n}\n"
        },
        "sample_test_cases": [
            {
                "id": "tc_bs_1",
                "input_data": "nums = [-1,0,3,5,9,12], target = 9",
                "expected_output": "4",
                "is_hidden": False,
                "explanation": "9 exists in nums and its index is 4."
            },
            {
                "id": "tc_bs_2",
                "input_data": "nums = [-1,0,3,5,9,12], target = 2",
                "expected_output": "-1",
                "is_hidden": False,
                "explanation": "2 does not exist in nums so return -1."
            }
        ],
        "hints": [
            "Maintain left and right pointers. Compute mid = left + (right - left) // 2.",
            "Narrow the window depending on whether nums[mid] is less than or greater than target."
        ]
    }
]


async def seed_curriculum_catalog(db: AsyncDatabase) -> Dict[str, int]:
    """Seeds all programs, branches, subjects, practice challenges, and resources."""
    now = get_utc_now()
    counts = {}

    # 1. Academic Programs
    programs_seeded = 0
    for prog in ACADEMIC_PROGRAMS:
        res = await db.academic_programs.update_one(
            {"program_code": prog["program_code"]},
            {"$set": {**prog, "updated_at": now}, "$setOnInsert": {"created_at": now}},
            upsert=True
        )
        if res.upserted_id or res.modified_count:
            programs_seeded += 1
    counts["academic_programs"] = programs_seeded

    # 2. Branches
    branches_seeded = 0
    for br in BRANCHES:
        res = await db.branches.update_one(
            {"branch_code": br["branch_code"]},
            {"$set": {**br, "updated_at": now}, "$setOnInsert": {"created_at": now}},
            upsert=True
        )
        if res.upserted_id or res.modified_count:
            branches_seeded += 1
    counts["branches"] = branches_seeded

    # 3. Learning Resources
    resources_seeded = 0
    for r in VERIFIED_RESOURCES:
        res = await db.learning_resources.update_one(
            {"resource_id": r["resource_id"]},
            {"$set": {**r, "updated_at": now}, "$setOnInsert": {"created_at": now}},
            upsert=True
        )
        if res.upserted_id or res.modified_count:
            resources_seeded += 1
    counts["learning_resources"] = resources_seeded

    # 4. Subjects
    subjects_seeded = 0
    for s in SUBJECTS_CATALOG:
        res = await db.subjects.update_one(
            {"subject_code": s["subject_code"]},
            {"$set": {**s, "updated_at": now}, "$setOnInsert": {"created_at": now}},
            upsert=True
        )
        if res.upserted_id or res.modified_count:
            subjects_seeded += 1
    counts["subjects"] = subjects_seeded

    # 5. Practice Problems
    problems_seeded = 0
    for p in PRACTICE_PROBLEMS:
        res = await db.practice_problems.update_one(
            {"problem_code": p["problem_code"]},
            {"$set": {**p, "updated_at": now}, "$setOnInsert": {"created_at": now}},
            upsert=True
        )
        if res.upserted_id or res.modified_count:
            problems_seeded += 1
    counts["practice_problems"] = problems_seeded

    print(f"[Seed Curriculum] Catalog seeding completed: {counts}")
    return counts


if __name__ == "__main__":
    import asyncio
    from backend.database.mongodb import connect_to_mongo, close_mongo_connection

    async def _main():
        db = await connect_to_mongo()
        await seed_curriculum_catalog(db)
        await close_mongo_connection()

    asyncio.run(_main())
