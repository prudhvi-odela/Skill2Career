"""
Skill2Career Dataset Generator
Generates statistical, realistic benchmark datasets for ML training and database seeding:
1. skills_taxonomies.csv
2. career_roles_skills.csv
3. student_profiles_training.csv (5,000+ benchmark profiles)
4. learning_trajectory_training.csv (Time-series trajectory samples)
"""

import os
import json
import random
import numpy as np
import pandas as pd

# Set deterministic seed for reproducibility
np.random.seed(42)
random.seed(42)

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

SKILLS_DATA = [
    # Programming Languages
    ("SK001", "Python", "Languages", "General", "High-level versatile programming language", "python,py,python3"),
    ("SK002", "JavaScript", "Languages", "Web Development", "Dynamic scripting language for web development", "javascript,js,es6"),
    ("SK003", "TypeScript", "Languages", "Web Development", "Typed superset of JavaScript", "typescript,ts"),
    ("SK004", "Java", "Languages", "Enterprise & Backend", "Object-oriented language for enterprise applications", "java,core java,java8"),
    ("SK005", "C++", "Languages", "Systems & High Performance", "General-purpose language with low-level memory control", "cpp,c++,c plus plus"),
    ("SK006", "Go", "Languages", "Cloud & Backend", "Concurrent compiled language developed by Google", "golang,go"),
    ("SK007", "Rust", "Languages", "Systems & Security", "Memory-safe systems programming language", "rust,rustlang"),
    ("SK008", "SQL", "Languages", "Databases", "Standard query language for relational databases", "sql,postgres,mysql,ansi-sql"),

    # Frontend Development
    ("SK009", "React", "Frontend", "Web Development", "Component-based declarative UI library", "react,reactjs,react.js"),
    ("SK010", "Vue.js", "Frontend", "Web Development", "Progressive JavaScript framework for UI", "vue,vuejs,vue3"),
    ("SK011", "Next.js", "Frontend", "Web Development", "React framework for production SSR and SSG", "nextjs,next.js,next"),
    ("SK012", "HTML5 & CSS3", "Frontend", "Web Development", "Core markup and styling standards of the web", "html,css,html5,css3,responsive design"),
    ("SK013", "Tailwind CSS", "Frontend", "Web Development", "Utility-first CSS framework for rapid UI", "tailwind,tailwindcss"),
    ("SK014", "Redux / State Management", "Frontend", "Web Development", "Predictable state container for JavaScript apps", "redux,zustand,recoil,mobx"),

    # Backend & API Development
    ("SK015", "FastAPI", "Backend", "Backend & APIs", "Modern high-performance Python web framework", "fastapi,fast-api"),
    ("SK016", "Node.js & Express", "Backend", "Backend & APIs", "JavaScript runtime and minimalist web framework", "nodejs,node,express,expressjs"),
    ("SK017", "Django", "Backend", "Backend & APIs", "Full-featured batteries-included Python framework", "django,django rest framework,drf"),
    ("SK018", "Spring Boot", "Backend", "Enterprise & Backend", "Production-grade Java framework for microservices", "spring,springboot,spring-boot"),
    ("SK019", "RESTful API Design", "Backend", "System Architecture", "Standard architectural principles for REST APIs", "rest,rest api,http api,api design"),
    ("SK020", "GraphQL", "Backend", "APIs & Integration", "Query language for APIs and runtime for fulfilling queries", "graphql,apollo"),

    # Databases & Storage
    ("SK021", "PostgreSQL", "Databases", "Relational Databases", "Advanced open-source relational database system", "postgres,postgresql,psql"),
    ("SK022", "MySQL", "Databases", "Relational Databases", "Widely deployed open-source relational database", "mysql,mariadb"),
    ("SK023", "MongoDB", "Databases", "NoSQL", "Document-based distributed NoSQL database", "mongodb,mongo,nosql"),
    ("SK024", "Redis", "Databases", "Caching & In-Memory", "In-memory data structure store used as cache/broker", "redis,caching"),
    ("SK025", "Elasticsearch", "Databases", "Search & Analytics", "Distributed search and analytics engine", "elastic,elasticsearch,elk"),

    # AI, Machine Learning & Data Science
    ("SK026", "Pandas & NumPy", "AI & ML", "Data Analysis", "Foundational Python libraries for data wrangling and math", "pandas,numpy,data analysis"),
    ("SK027", "Scikit-Learn", "AI & ML", "Machine Learning", "Classical machine learning algorithms in Python", "scikit-learn,sklearn,ml"),
    ("SK028", "PyTorch", "AI & ML", "Deep Learning", "Dynamic neural network and deep learning framework", "pytorch,torch,deep learning"),
    ("SK029", "TensorFlow / Keras", "AI & ML", "Deep Learning", "End-to-end open-source machine learning platform", "tensorflow,tf,keras"),
    ("SK030", "Natural Language Processing (NLP)", "AI & ML", "AI Specialization", "Processing and analyzing natural language text", "nlp,spacy,nltk,huggingface"),
    ("SK031", "Computer Vision (CV)", "AI & ML", "AI Specialization", "Visual recognition and image processing", "cv,opencv,vision models,cnn"),
    ("SK032", "LLMs & RAG Architecture", "AI & ML", "Generative AI", "Large language models, prompt engineering, and vector retrieval", "rag,llm,langchain,llamaindex,genai"),
    ("SK033", "MLOps & Model Deployment", "AI & ML", "ML Infrastructure", "Continuous integration, tracking, and deployment of ML models", "mlops,mlflow,dvc,triton,bento"),

    # Cloud, DevOps & Infrastructure
    ("SK034", "Docker & Containers", "DevOps", "Containers & Virtualization", "Standard platform for containerizing applications", "docker,containers,containerization"),
    ("SK035", "Kubernetes", "DevOps", "Orchestration", "Automated container orchestration and scaling", "k8s,kubernetes"),
    ("SK036", "AWS (Amazon Web Services)", "Cloud", "Cloud Computing", "Leading cloud computing service platform", "aws,ec2,s3,lambda,iam"),
    ("SK037", "GCP (Google Cloud Platform)", "Cloud", "Cloud Computing", "Suite of cloud computing services by Google", "gcp,google cloud"),
    ("SK038", "CI/CD Pipelines", "DevOps", "Automation & CI/CD", "Continuous integration and continuous deployment automation", "ci/cd,github actions,gitlab ci,jenkins"),
    ("SK039", "Linux & Shell Scripting", "Systems", "Operating Systems", "UNIX command-line navigation, bash scripting, and administration", "linux,bash,shell,unix"),

    # Core Computer Science & Architecture
    ("SK040", "Data Structures & Algorithms", "Core CS", "Fundamentals", "Efficient algorithms, complexity analysis, and data modeling", "dsa,algorithms,data structures,leetcode"),
    ("SK041", "System Design & Architecture", "Core CS", "System Architecture", "Designing scalable, fault-tolerant distributed systems", "system design,hld,lld,scalability,microservices"),
    ("SK042", "Object-Oriented Programming (OOP)", "Core CS", "Software Engineering", "Encapsulation, inheritance, polymorphism, and design patterns", "oop,solid principles,design patterns"),
    ("SK043", "Git & Version Control", "Software Tools", "Collaboration", "Distributed version control and branch workflows", "git,github,version control"),
    ("SK044", "Software Testing & QA", "Software Tools", "Quality Assurance", "Unit testing, integration testing, and test automation", "unit testing,pytest,jest,tdd,qa"),

    # Cybersecurity
    ("SK045", "Web Security & OWASP", "Security", "Cybersecurity", "Protection against top web vulnerabilities like XSS, CSRF, Injection", "owasp,security,appsec,xss,csrf"),
    ("SK046", "Cryptography & PKI", "Security", "Cybersecurity", "Encryption algorithms, SSL/TLS, and public key infrastructure", "crypto,encryption,pki,tls"),

    # Soft Skills & Leadership
    ("SK047", "Problem Solving & Critical Thinking", "Soft Skills", "General", "Structured breakdown of complex challenges and logic", "problem solving,critical thinking,analytical skills"),
    ("SK048", "Technical Communication", "Soft Skills", "General", "Clear written and verbal explanation of technical concepts", "communication,documentation,teamwork"),
    ("SK049", "Agile & Scrum Methodologies", "Soft Skills", "Project Management", "Iterative sprint planning, user stories, and team collaboration", "agile,scrum,jira,kanban"),
    ("SK050", "Product Mindset & UX Empathy", "Soft Skills", "Product Design", "Understanding user requirements and product business value", "product sense,ux,user experience")
]

CAREERS_DATA = [
    {
        "career_id": "CR001",
        "career_title": "Full-Stack Software Engineer",
        "domain": "Software Engineering",
        "description": "Designs, builds, and deploys scalable web applications across the complete stack from frontend to backend databases.",
        "min_exp_years": 0.5,
        "avg_salary_usd": 105000,
        "required_skills": [
            ("SK001", 3, 0.7), ("SK002", 4, 0.9), ("SK003", 4, 0.8), ("SK008", 4, 0.8),
            ("SK009", 4, 0.9), ("SK012", 4, 0.8), ("SK015", 3, 0.7), ("SK016", 4, 0.8),
            ("SK019", 4, 0.9), ("SK021", 3, 0.8), ("SK034", 3, 0.7), ("SK040", 4, 0.9),
            ("SK041", 3, 0.8), ("SK043", 4, 0.9), ("SK044", 3, 0.7), ("SK047", 4, 0.8)
        ]
    },
    {
        "career_id": "CR002",
        "career_title": "Frontend Engineer",
        "domain": "Web Development",
        "description": "Specializes in building responsive, accessible, high-performance web user interfaces and client-side web architectures.",
        "min_exp_years": 0.0,
        "avg_salary_usd": 98000,
        "required_skills": [
            ("SK002", 5, 1.0), ("SK003", 4, 0.9), ("SK009", 5, 1.0), ("SK011", 4, 0.8),
            ("SK012", 5, 1.0), ("SK013", 4, 0.8), ("SK014", 4, 0.8), ("SK019", 3, 0.7),
            ("SK040", 3, 0.7), ("SK043", 4, 0.8), ("SK044", 3, 0.7), ("SK050", 4, 0.8)
        ]
    },
    {
        "career_id": "CR003",
        "career_title": "Backend Engineer",
        "domain": "Backend & Cloud",
        "description": "Engineers distributed server systems, high-throughput APIs, data pipelines, and microservice infrastructure.",
        "min_exp_years": 0.5,
        "avg_salary_usd": 110000,
        "required_skills": [
            ("SK001", 4, 0.8), ("SK004", 4, 0.8), ("SK006", 3, 0.6), ("SK008", 5, 1.0),
            ("SK015", 4, 0.8), ("SK016", 4, 0.8), ("SK019", 5, 1.0), ("SK021", 5, 1.0),
            ("SK024", 4, 0.8), ("SK034", 4, 0.8), ("SK039", 4, 0.8), ("SK040", 5, 1.0),
            ("SK041", 4, 0.9), ("SK043", 4, 0.8), ("SK044", 4, 0.8), ("SK045", 3, 0.7)
        ]
    },
    {
        "career_id": "CR004",
        "career_title": "Machine Learning Engineer",
        "domain": "Artificial Intelligence",
        "description": "Translates mathematical ML models into scalable production services, feature stores, and automated training pipelines.",
        "min_exp_years": 1.0,
        "avg_salary_usd": 125000,
        "required_skills": [
            ("SK001", 5, 1.0), ("SK005", 3, 0.6), ("SK008", 4, 0.8), ("SK015", 3, 0.7),
            ("SK026", 5, 1.0), ("SK027", 5, 1.0), ("SK028", 4, 0.9), ("SK029", 4, 0.8),
            ("SK033", 4, 0.9), ("SK034", 4, 0.8), ("SK036", 3, 0.7), ("SK039", 4, 0.8),
            ("SK040", 4, 0.9), ("SK041", 3, 0.8), ("SK043", 4, 0.8), ("SK047", 5, 1.0)
        ]
    },
    {
        "career_id": "CR005",
        "career_title": "Data Scientist",
        "domain": "Data & Analytics",
        "description": "Applies statistical modeling, exploratory data analysis, and predictive algorithms to discover business insights and build models.",
        "min_exp_years": 0.5,
        "avg_salary_usd": 115000,
        "required_skills": [
            ("SK001", 5, 1.0), ("SK008", 5, 1.0), ("SK021", 4, 0.8), ("SK026", 5, 1.0),
            ("SK027", 5, 1.0), ("SK028", 3, 0.7), ("SK030", 3, 0.6), ("SK040", 3, 0.7),
            ("SK043", 3, 0.7), ("SK047", 5, 1.0), ("SK048", 5, 1.0)
        ]
    },
    {
        "career_id": "CR006",
        "career_title": "DevOps & Cloud Engineer",
        "domain": "Infrastructure & Cloud",
        "description": "Automates cloud deployments, manages container orchestration, implements CI/CD, and ensures high availability of systems.",
        "min_exp_years": 1.0,
        "avg_salary_usd": 118000,
        "required_skills": [
            ("SK001", 3, 0.7), ("SK006", 3, 0.6), ("SK008", 3, 0.6), ("SK034", 5, 1.0),
            ("SK035", 5, 1.0), ("SK036", 5, 1.0), ("SK037", 4, 0.8), ("SK038", 5, 1.0),
            ("SK039", 5, 1.0), ("SK041", 4, 0.8), ("SK043", 5, 1.0), ("SK045", 4, 0.8)
        ]
    },
    {
        "career_id": "CR007",
        "career_title": "AI & GenAI Solutions Engineer",
        "domain": "Artificial Intelligence",
        "description": "Architects enterprise generative AI workflows, RAG pipelines, LLM fine-tuning, and semantic search systems.",
        "min_exp_years": 0.5,
        "avg_salary_usd": 130000,
        "required_skills": [
            ("SK001", 5, 1.0), ("SK003", 3, 0.6), ("SK008", 4, 0.8), ("SK015", 4, 0.8),
            ("SK024", 4, 0.7), ("SK025", 4, 0.8), ("SK026", 4, 0.8), ("SK027", 4, 0.8),
            ("SK028", 4, 0.8), ("SK030", 5, 1.0), ("SK032", 5, 1.0), ("SK033", 4, 0.8),
            ("SK034", 3, 0.7), ("SK040", 4, 0.8), ("SK048", 4, 0.8)
        ]
    },
    {
        "career_id": "CR008",
        "career_title": "Cybersecurity Analyst & Engineer",
        "domain": "Security",
        "description": "Protects organizational assets by identifying vulnerabilities, conducting threat modeling, and securing networks and software.",
        "min_exp_years": 1.0,
        "avg_salary_usd": 112000,
        "required_skills": [
            ("SK001", 3, 0.7), ("SK005", 3, 0.6), ("SK008", 3, 0.6), ("SK034", 3, 0.7),
            ("SK036", 4, 0.8), ("SK039", 5, 1.0), ("SK041", 3, 0.7), ("SK043", 3, 0.7),
            ("SK045", 5, 1.0), ("SK046", 5, 1.0), ("SK047", 5, 1.0)
        ]
    },
    {
        "career_id": "CR009",
        "career_title": "Data Engineer",
        "domain": "Data & Analytics",
        "description": "Builds robust batch and real-time data pipelines, data warehouses, ETL processes, and large-scale analytical storage systems.",
        "min_exp_years": 0.5,
        "avg_salary_usd": 116000,
        "required_skills": [
            ("SK001", 4, 0.9), ("SK004", 4, 0.8), ("SK008", 5, 1.0), ("SK021", 5, 1.0),
            ("SK022", 4, 0.8), ("SK023", 4, 0.8), ("SK024", 4, 0.8), ("SK026", 4, 0.8),
            ("SK034", 4, 0.8), ("SK036", 4, 0.8), ("SK038", 4, 0.8), ("SK039", 4, 0.8),
            ("SK040", 4, 0.9), ("SK041", 4, 0.9)
        ]
    },
    {
        "career_id": "CR010",
        "career_title": "Systems & Embedded Software Engineer",
        "domain": "Systems & Embedded",
        "description": "Develops low-level system software, drivers, memory-constrained applications, and real-time operating system components.",
        "min_exp_years": 1.0,
        "avg_salary_usd": 120000,
        "required_skills": [
            ("SK005", 5, 1.0), ("SK007", 4, 0.9), ("SK034", 3, 0.7), ("SK039", 5, 1.0),
            ("SK040", 5, 1.0), ("SK041", 5, 1.0), ("SK042", 4, 0.8), ("SK043", 4, 0.8),
            ("SK044", 4, 0.8), ("SK047", 5, 1.0)
        ]
    }
]


def generate_skills_csv():
    skills_df = pd.DataFrame(SKILLS_DATA, columns=[
        "skill_id", "skill_name", "category", "domain", "description", "aliases"
    ])
    csv_path = os.path.join(DATA_DIR, "skills_taxonomies.csv")
    skills_df.to_csv(csv_path, index=False)
    print(f"[OK] Generated {csv_path} with {len(skills_df)} skills.")
    return skills_df


def generate_careers_csv():
    records = []
    for c in CAREERS_DATA:
        records.append({
            "career_id": c["career_id"],
            "career_title": c["career_title"],
            "domain": c["domain"],
            "description": c["description"],
            "min_exp_years": c["min_exp_years"],
            "avg_salary_usd": c["avg_salary_usd"],
            "required_skills_json": json.dumps([
                {"skill_id": s[0], "required_level": s[1], "importance": s[2]}
                for s in c["required_skills"]
            ])
        })
    careers_df = pd.DataFrame(records)
    csv_path = os.path.join(DATA_DIR, "career_roles_skills.csv")
    careers_df.to_csv(csv_path, index=False)
    print(f"[OK] Generated {csv_path} with {len(careers_df)} career roles.")
    return careers_df


def generate_student_profiles_training_csv(num_samples=5000):
    """
    Generates 5,000 statistically consistent student profiles for ML training.
    Prevents data leakage and creates grounded target readiness scores:
    Target Readiness Score (0-100) = weighted combination of:
      - Skill proficiency coverage against target career
      - Core CS fundamentals (DSA/OOP/System Design)
      - Project portfolio depth and complexity
      - Verified certifications & assessment performance
      - Active study velocity
      + controlled gaussian noise
    """
    degrees = ["B.Tech Computer Science", "B.Tech Information Technology", "B.S. Data Science", "B.Tech Electronics", "M.S. Computer Science", "BCA / MCA"]
    institution_tiers = [1, 2, 3]  # Tier 1 (top univs), Tier 2, Tier 3
    
    career_lookup = {c["career_id"]: c for c in CAREERS_DATA}
    career_ids = list(career_lookup.keys())
    
    records = []
    
    for i in range(1, num_samples + 1):
        student_id = f"STU_{i:05d}"
        degree = random.choice(degrees)
        tier = random.choices(institution_tiers, weights=[0.2, 0.5, 0.3])[0]
        gpa = round(np.clip(np.random.normal(loc=7.8, scale=1.1), 5.0, 10.0), 2)
        target_career_id = random.choice(career_ids)
        target_career = career_lookup[target_career_id]
        
        # Student skill assignment: bias toward target career's required skills + general noise
        target_req_skills = {s[0]: (s[1], s[2]) for s in target_career["required_skills"]}
        
        # Student proficiency distribution based on preparation level (Beginner / Intermediate / Advanced)
        prep_profile = random.choices(["beginner", "intermediate", "advanced", "career_ready"], weights=[0.25, 0.40, 0.25, 0.10])[0]
        
        if prep_profile == "beginner":
            base_skill_level = np.random.uniform(1.0, 2.2)
            projects_count = random.randint(0, 2)
            avg_proj_complexity = round(np.random.uniform(1.0, 2.5), 1)
            certs_count = random.randint(0, 1)
            assessments_passed_pct = round(np.random.uniform(20.0, 50.0), 1)
            weekly_study_hours = round(np.random.uniform(4.0, 10.0), 1)
            learning_velocity = round(np.random.uniform(0.6, 1.0), 2)
        elif prep_profile == "intermediate":
            base_skill_level = np.random.uniform(2.2, 3.4)
            projects_count = random.randint(2, 4)
            avg_proj_complexity = round(np.random.uniform(2.5, 3.8), 1)
            certs_count = random.randint(1, 3)
            assessments_passed_pct = round(np.random.uniform(50.0, 75.0), 1)
            weekly_study_hours = round(np.random.uniform(8.0, 18.0), 1)
            learning_velocity = round(np.random.uniform(1.0, 1.4), 2)
        elif prep_profile == "advanced":
            base_skill_level = np.random.uniform(3.4, 4.3)
            projects_count = random.randint(3, 6)
            avg_proj_complexity = round(np.random.uniform(3.8, 4.6), 1)
            certs_count = random.randint(2, 5)
            assessments_passed_pct = round(np.random.uniform(75.0, 90.0), 1)
            weekly_study_hours = round(np.random.uniform(14.0, 25.0), 1)
            learning_velocity = round(np.random.uniform(1.3, 1.8), 2)
        else: # career_ready
            base_skill_level = np.random.uniform(4.2, 5.0)
            projects_count = random.randint(5, 8)
            avg_proj_complexity = round(np.random.uniform(4.4, 5.0), 1)
            certs_count = random.randint(3, 6)
            assessments_passed_pct = round(np.random.uniform(88.0, 98.0), 1)
            weekly_study_hours = round(np.random.uniform(18.0, 32.0), 1)
            learning_velocity = round(np.random.uniform(1.6, 2.2), 2)
            
        # Calculate skill coverage score against target career
        req_weights = []
        cov_scores = []
        for s_id, (req_lvl, imp) in target_req_skills.items():
            # Individual skill rating with variance
            student_lvl = np.clip(np.random.normal(loc=base_skill_level, scale=0.6), 0.0, 5.0)
            # Coverage is min(1.0, student_lvl / req_lvl)
            cov = min(1.0, student_lvl / max(1.0, req_lvl))
            cov_scores.append(cov * imp)
            req_weights.append(imp)
            
        career_skill_match_pct = round((sum(cov_scores) / sum(req_weights)) * 100.0, 2)
        
        total_skills_count = int(np.clip(np.random.normal(loc=base_skill_level * 4 + 3, scale=3), 2, 35))
        avg_skill_proficiency = round(np.clip(base_skill_level + np.random.normal(0, 0.2), 1.0, 5.0), 2)
        
        # Core CS Score (DSA, OOP, System Design)
        core_cs_score = round(np.clip((base_skill_level / 5.0) * 100.0 + np.random.normal(0, 5), 10.0, 100.0), 1)
        
        # Ground Truth Readiness Calculation (Ground Truth Function)
        # 45% Skill Match + 15% Core CS + 15% Projects + 10% Assessments + 10% Certs + 5% Velocity
        proj_score = min(100.0, (projects_count / 5.0) * 50.0 + (avg_proj_complexity / 5.0) * 50.0)
        cert_score = min(100.0, (certs_count / 4.0) * 100.0)
        
        raw_readiness = (
            0.45 * career_skill_match_pct +
            0.15 * core_cs_score +
            0.15 * proj_score +
            0.10 * assessments_passed_pct +
            0.08 * cert_score +
            0.07 * (min(100.0, (weekly_study_hours / 20.0) * 70.0 + (learning_velocity / 1.5) * 30.0))
        )
        
        # Add slight natural realistic variation
        noise = np.random.normal(loc=0, scale=2.5)
        readiness_score = round(float(np.clip(raw_readiness + noise, 5.0, 99.5)), 2)
        is_job_ready = 1 if readiness_score >= 75.0 else 0
        
        records.append({
            "student_id": student_id,
            "degree": degree,
            "institution_tier": tier,
            "gpa": gpa,
            "target_career_id": target_career_id,
            "career_skill_match_pct": career_skill_match_pct,
            "total_skills_count": total_skills_count,
            "avg_skill_proficiency": avg_skill_proficiency,
            "core_cs_score": core_cs_score,
            "projects_count": projects_count,
            "avg_project_complexity": avg_proj_complexity,
            "certifications_count": certs_count,
            "assessments_passed_pct": assessments_passed_pct,
            "weekly_study_hours": weekly_study_hours,
            "learning_velocity_index": learning_velocity,
            "readiness_score": readiness_score,
            "is_job_ready": is_job_ready
        })
        
    df = pd.DataFrame(records)
    csv_path = os.path.join(DATA_DIR, "student_profiles_training.csv")
    df.to_csv(csv_path, index=False)
    print(f"[OK] Generated {csv_path} with {len(df)} student profiles.")
    return df


def generate_learning_trajectory_training_csv(num_students=800):
    """
    Generates longitudinal trajectory data tracking students across weeks [0, 4, 8, 12, 16, 20, 24].
    Used to train the Future Readiness Forecaster model.
    """
    records = []
    timepoints = [0, 4, 8, 12, 16, 20, 24]
    
    for i in range(1, num_students + 1):
        student_id = f"TRJ_{i:04d}"
        initial_readiness = round(np.random.uniform(15.0, 55.0), 2)
        weekly_hours = round(np.random.uniform(5.0, 30.0), 1)
        consistency = round(np.random.uniform(0.7, 1.3), 2)
        
        current_readiness = initial_readiness
        cum_hours = 0
        milestones_done = 0
        
        for t in timepoints:
            if t > 0:
                hours_in_step = 4 * weekly_hours * np.random.uniform(0.85, 1.15)
                cum_hours += int(hours_in_step)
                milestones_done += random.randint(1, 3)
                
                # Diminishing returns curve: Delta R = rate * (100 - R) * (hours / 100) * consistency
                growth_rate = 0.08 * consistency
                gain = (100.0 - current_readiness) * (1.0 - np.exp(-growth_rate * (hours_in_step / 40.0)))
                current_readiness = min(99.0, current_readiness + gain)
                
            records.append({
                "student_id": student_id,
                "week": t,
                "initial_readiness": initial_readiness,
                "weekly_study_hours": weekly_hours,
                "learning_consistency": consistency,
                "cumulative_hours": cum_hours,
                "milestones_completed": milestones_done,
                "readiness_at_week": round(current_readiness, 2)
            })
            
    df = pd.DataFrame(records)
    csv_path = os.path.join(DATA_DIR, "learning_trajectory_training.csv")
    df.to_csv(csv_path, index=False)
    print(f"[OK] Generated {csv_path} with {len(df)} trajectory records.")
    return df


if __name__ == "__main__":
    print("Generating Skill2Career Datasets...")
    generate_skills_csv()
    generate_careers_csv()
    generate_student_profiles_training_csv(5000)
    generate_learning_trajectory_training_csv(800)
    print("All datasets generated successfully.")
