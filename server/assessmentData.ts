export interface AssessmentQuestion {
  id: string;
  question_text: string;
  options_json: string[];
  correct_option_index: number;
  explanation: string;
}

export interface LearningResource {
  title: string;
  url: string;
  category: string;
  description: string;
}

export interface TopicAssessment {
  id: string;
  skill_id: string;
  title: string;
  category: string;
  domain: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  time_limit_minutes: number;
  pass_score: number;
  is_active: boolean;
  branch_code?: string;
  branch_name?: string;
  role?: string;
  subject?: string;
  topic?: string;
  learning_resources: LearningResource[];
  questions: AssessmentQuestion[];
}

export const TOPIC_ASSESSMENTS: TopicAssessment[] = [
  {
    id: 'ASM_SK001',
    skill_id: 'SK001',
    title: 'Python Core & OOP Proficiency Assessment',
    category: 'Languages',
    domain: 'General',
    difficulty: 'Intermediate',
    time_limit_minutes: 10,
    pass_score: 70.0,
    is_active: true,
    learning_resources: [
      { title: 'Official Python Documentation', url: 'https://docs.python.org/3/tutorial/', category: 'Documentation', description: 'Core Python syntax, data structures, and standard library.' },
      { title: 'Real Python Tutorials', url: 'https://realpython.com/', category: 'Tutorials', description: 'In-depth Python guides, OOP patterns, and concurrency.' },
      { title: 'LeetCode Python Practice', url: 'https://leetcode.com/problemset/all/?difficulty=EASY&topicSlugs=python', category: 'Coding Drills', description: 'Algorithm and problem-solving practice in Python.' }
    ],
    questions: [
      {
        id: 'Q_PY_01',
        question_text: 'What is the average-case time complexity of looking up a key in a standard Python dictionary?',
        options_json: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
        correct_option_index: 0,
        explanation: 'Python dictionaries utilize optimized hash tables, providing O(1) average lookup and insertion time.'
      },
      {
        id: 'Q_PY_02',
        question_text: 'What is the key advantage of using a Python generator over returning a full list?',
        options_json: [
          'Generators execute multi-threaded code automatically',
          'Generators yield elements lazily one-at-a-time, consuming minimal memory (O(1) auxiliary space)',
          'Generators bypass the Global Interpreter Lock (GIL)',
          'Generators guarantee faster CPU single-core sorting'
        ],
        correct_option_index: 1,
        explanation: 'Generators compute and yield items on-the-fly via iterator protocols without loading entire datasets into RAM.'
      },
      {
        id: 'Q_PY_03',
        question_text: 'What does the `*args` and `**kwargs` syntax in a Python function definition allow?',
        options_json: [
          'Pointer referencing and dereferencing',
          'Passing variable positional arguments as a tuple, and variable keyword arguments as a dict',
          'Type checking at compile time',
          'Exporting functions across modules'
        ],
        correct_option_index: 1,
        explanation: '`*args` gathers extra positional arguments into a tuple, while `**kwargs` gathers key-value parameters into a dictionary.'
      },
      {
        id: 'Q_PY_04',
        question_text: 'In Python OOP, what is the purpose of the `@property` decorator?',
        options_json: [
          'It makes a class method asynchronous',
          'It allows accessing a method like an attribute with custom getter and setter logic',
          'It protects the class from being inherited',
          'It overrides operator overloading'
        ],
        correct_option_index: 1,
        explanation: 'The `@property` decorator creates managed getter/setter attributes while maintaining clean syntax.'
      }
    ]
  },
  {
    id: 'ASM_SK002',
    skill_id: 'SK002',
    title: 'JavaScript ES6+ & Asynchronous Architecture',
    category: 'Languages',
    domain: 'Web Development',
    difficulty: 'Intermediate',
    time_limit_minutes: 10,
    pass_score: 70.0,
    is_active: true,
    learning_resources: [
      { title: 'MDN Web Docs: JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', category: 'Documentation', description: 'Comprehensive guide covering JS fundamentals, event loop, and modern syntax.' },
      { title: 'JavaScript.info Modern Tutorial', url: 'https://javascript.info/', category: 'Tutorials', description: 'From basic fundamentals to advanced closures, prototypes, and async/await.' },
      { title: 'Frontend Masters: JavaScript Visualized', url: 'https://github.com/lydiahallie/javascript-questions', category: 'Cheat Sheets', description: 'Visual explanations for the event loop, scope chain, and hoisting.' }
    ],
    questions: [
      {
        id: 'Q_JS_01',
        question_text: 'In the JavaScript Event Loop, which queue has the highest priority execution after the current call stack clears?',
        options_json: ['Macrotask Queue (setTimeout)', 'Microtask Queue (Promises / queueMicrotask)', 'UI Rendering Queue', 'Web Workers Thread'],
        correct_option_index: 1,
        explanation: 'Microtasks (resolved Promise callbacks, queueMicrotask) are always drained completely before the event loop pulls the next macrotask.'
      },
      {
        id: 'Q_JS_02',
        question_text: 'What is a JavaScript Closure?',
        options_json: [
          'A method to terminate memory leaks in garbage collection',
          'A function bundled together with references to its lexical surrounding state',
          'A DOM event listener removal mechanism',
          'An encrypted web socket connection'
        ],
        correct_option_index: 1,
        explanation: 'A closure gives an inner function access to its outer enclosing scope even after the outer function has finished executing.'
      },
      {
        id: 'Q_JS_03',
        question_text: 'What happens when `Promise.all([p1, p2, p3])` is executed and one promise rejects?',
        options_json: [
          'It waits for the others and returns null for the failed one',
          'It immediately rejects with the error of the first rejected promise (fail-fast)',
          'It retries the failed promise 3 times',
          'It throws an unhandled synchronous syntax error'
        ],
        correct_option_index: 1,
        explanation: '`Promise.all` fails fast and immediately rejects as soon as any input promise rejects. Use `Promise.allSettled` to wait for all results regardless.'
      }
    ]
  },
  {
    id: 'ASM_SK003',
    skill_id: 'SK003',
    title: 'TypeScript & Type Safety Engineering',
    category: 'Languages',
    domain: 'Web Development',
    difficulty: 'Intermediate',
    time_limit_minutes: 10,
    pass_score: 70.0,
    is_active: true,
    learning_resources: [
      { title: 'TypeScript Official Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', category: 'Documentation', description: 'Official reference for generics, conditional types, and interfaces.' },
      { title: 'Total TypeScript Interactive', url: 'https://www.totaltypescript.com/tutorials', category: 'Tutorials', description: 'Interactive type challenges and type transformation mastery.' }
    ],
    questions: [
      {
        id: 'Q_TS_01',
        question_text: 'What is the key difference between `unknown` and `any` in TypeScript?',
        options_json: [
          '`unknown` disables all type checks permanently',
          '`unknown` is type-safe: you cannot perform operations on it without narrowing or type checking first',
          '`any` requires explicit casting before invocation',
          'There is no functional difference'
        ],
        correct_option_index: 1,
        explanation: '`unknown` is the type-safe counterpart of `any`. The compiler forces you to verify the type before performing operations on an `unknown` variable.'
      },
      {
        id: 'Q_TS_02',
        question_text: 'What does the `Partial<T>` utility type do in TypeScript?',
        options_json: [
          'Deletes half the properties of T',
          'Constructs a type with all properties of T set to optional (`?`)',
          'Makes all properties of T readonly',
          'Extracts only function members from T'
        ],
        correct_option_index: 1,
        explanation: '`Partial<T>` maps over all properties in interface T and marks them optional.'
      }
    ]
  },
  {
    id: 'ASM_SK008',
    skill_id: 'SK008',
    title: 'SQL & Relational Database Architecture',
    category: 'Languages',
    domain: 'Databases',
    difficulty: 'Intermediate',
    time_limit_minutes: 10,
    pass_score: 70.0,
    is_active: true,
    learning_resources: [
      { title: 'PostgreSQL Tutorial & Reference', url: 'https://www.postgresqltutorial.com/', category: 'Documentation', description: 'In-depth SQL queries, joins, window functions, and indexing.' },
      { title: 'Use The Index, Luke (SQL Indexing Guide)', url: 'https://use-the-index-luke.com/', category: 'Performance', description: 'Database performance and B-tree index engineering.' },
      { title: 'LeetCode Database Practice', url: 'https://leetcode.com/problemset/database/', category: 'Practice', description: 'SQL aggregation, subqueries, and window functions problems.' }
    ],
    questions: [
      {
        id: 'Q_SQL_01',
        question_text: 'What is the fundamental difference between the `WHERE` and `HAVING` clauses in SQL?',
        options_json: [
          '`WHERE` filters rows before aggregation; `HAVING` filters groups after `GROUP BY` aggregation',
          '`HAVING` runs before `JOIN` operations',
          '`WHERE` can only be used with primary keys',
          '`HAVING` cannot contain arithmetic expressions'
        ],
        correct_option_index: 0,
        explanation: '`WHERE` filters individual records before aggregation. `HAVING` filters aggregated grouped results (e.g. `HAVING COUNT(*) > 5`).'
      },
      {
        id: 'Q_SQL_02',
        question_text: 'What data structure is standard for primary key indexing in relational databases like PostgreSQL and MySQL InnoDB?',
        options_json: ['Binary Search Tree', 'B+ Tree', 'Linked List', 'Bloom Filter'],
        correct_option_index: 1,
        explanation: 'B+ Trees provide high fan-out, shallow depth, and linked leaf nodes optimal for both single-key lookups and range scans on disk.'
      },
      {
        id: 'Q_SQL_03',
        question_text: 'In database ACID properties, what does "Isolation" guarantee?',
        options_json: [
          'All transactions are saved to disk instantly',
          'Concurrent execution of transactions leaves the database in the same state as if executed sequentially',
          'Data is isolated into separate server partitions',
          'Primary keys cannot be duplicated'
        ],
        correct_option_index: 1,
        explanation: 'Isolation prevents dirty reads, non-repeatable reads, and phantom reads when multiple transactions execute concurrently.'
      }
    ]
  },
  {
    id: 'ASM_SK009',
    skill_id: 'SK009',
    title: 'React Architecture & Hooks Assessment',
    category: 'Frontend',
    domain: 'Web Development',
    difficulty: 'Intermediate',
    time_limit_minutes: 10,
    pass_score: 70.0,
    is_active: true,
    learning_resources: [
      { title: 'React Official Documentation (react.dev)', url: 'https://react.dev/learn', category: 'Documentation', description: 'Modern React hooks, component lifecycle, and state management principles.' },
      { title: 'React Patterns & Best Practices', url: 'https://reactpatterns.js.org/', category: 'Design Patterns', description: 'Composition, custom hooks, and memoization patterns.' }
    ],
    questions: [
      {
        id: 'Q_RCT_01',
        question_text: 'What is the main purpose of the useEffect hook with an empty dependency array `[]`?',
        options_json: [
          'Runs after every render',
          'Runs only once when the component mounts',
          'Runs whenever any state changes',
          'Prevents the component from rendering'
        ],
        correct_option_index: 1,
        explanation: 'An empty dependency array specifies that the effect does not depend on any props or state, running only on mount.'
      },
      {
        id: 'Q_RCT_02',
        question_text: 'Why should React state not be mutated directly (e.g. `state.count = 5`)?',
        options_json: [
          'It will cause syntax errors',
          'React relies on reference equality to trigger re-renders; mutating state directly bypasses reactivity',
          'Direct mutation slows down JavaScript',
          'Browsers do not support object mutation'
        ],
        correct_option_index: 1,
        explanation: 'React compares previous and next state references. Mutating directly fails shallow comparison checks, causing missed UI re-renders.'
      },
      {
        id: 'Q_RCT_03',
        question_text: 'When should you use the `useMemo` hook in React?',
        options_json: [
          'To replace all regular variables for speed',
          'To cache the result of an expensive calculation between re-renders when dependencies change',
          'To fetch data from backend servers',
          'To manipulate the browser DOM directly'
        ],
        correct_option_index: 1,
        explanation: '`useMemo` memoizes CPU-intensive calculations to prevent unnecessary re-computations during re-renders.'
      }
    ]
  },
  {
    id: 'ASM_SK015',
    skill_id: 'SK015',
    title: 'FastAPI & Async High-Performance APIs',
    category: 'Backend',
    domain: 'Backend & APIs',
    difficulty: 'Intermediate',
    time_limit_minutes: 10,
    pass_score: 70.0,
    is_active: true,
    learning_resources: [
      { title: 'FastAPI Official Documentation', url: 'https://fastapi.tiangolo.com/tutorial/', category: 'Documentation', description: 'FastAPI tutorial user guide, async endpoints, and Pydantic validation.' },
      { title: 'Pydantic V2 Documentation', url: 'https://docs.pydantic.dev/latest/', category: 'Data Validation', description: 'Rust-powered data validation and serialization.' }
    ],
    questions: [
      {
        id: 'Q_FA_01',
        question_text: 'How does FastAPI manage automatic request validation and JSON schema documentation?',
        options_json: [
          'Using Django ORM models',
          'Using Pydantic models and Python type hints',
          'Using raw regex parsers in C',
          'By reading manual Swagger YAML files'
        ],
        correct_option_index: 1,
        explanation: 'FastAPI relies on Pydantic schemas and Python 3.10+ type hints to automatically validate inputs and generate OpenAPI specs.'
      },
      {
        id: 'Q_FA_02',
        question_text: 'What is the purpose of `Depends()` in FastAPI route function arguments?',
        options_json: [
          'It marks a route as deprecated',
          'It provides a dependency injection framework for database sessions, auth checks, and shared logic',
          'It blocks thread execution synchronously',
          'It installs external pip packages automatically'
        ],
        correct_option_index: 1,
        explanation: '`Depends()` implements a hierarchical Dependency Injection system in FastAPI.'
      },
      {
        id: 'Q_FA_03',
        question_text: 'When defining route handlers in FastAPI, when should you use `async def` versus standard `def`?',
        options_json: [
          'Always use `def` because async is unsafe in Python',
          'Use `async def` when performing non-blocking I/O (e.g. async db drivers, httpx); use `def` for CPU-bound tasks or blocking libraries to run on external threadpools',
          'FastAPI ignores `async def` entirely',
          'Use `async def` only for WebSocket connections'
        ],
        correct_option_index: 1,
        explanation: 'FastAPI runs standard `def` routes in a threadpool to prevent blocking the event loop, while `async def` runs directly on the asyncio loop.'
      }
    ]
  },
  {
    id: 'ASM_SK016',
    skill_id: 'SK016',
    title: 'Node.js & Express Backend Architecture',
    category: 'Backend',
    domain: 'Backend & APIs',
    difficulty: 'Intermediate',
    time_limit_minutes: 10,
    pass_score: 70.0,
    is_active: true,
    learning_resources: [
      { title: 'Node.js Official Documentation', url: 'https://nodejs.org/en/docs/guides', category: 'Documentation', description: 'Event loop architecture, streams, buffers, and cluster module.' },
      { title: 'Express.js Guide', url: 'https://expressjs.com/en/guide/routing.html', category: 'Guide', description: 'Routing, middleware chains, and error handling.' }
    ],
    questions: [
      {
        id: 'Q_NODE_01',
        question_text: 'Why is `fs.readFile` preferred over `fs.readFileSync` in production Express servers?',
        options_json: [
          '`fs.readFileSync` blocks the single-threaded Node.js event loop, preventing all concurrent HTTP requests from processing',
          '`fs.readFile` is deprecated',
          '`fs.readFile` uses more memory',
          '`fs.readFileSync` corrupts binary data'
        ],
        correct_option_index: 0,
        explanation: 'Synchronous file I/O blocks the entire V8 thread, halting request processing across all connected clients.'
      },
      {
        id: 'Q_NODE_02',
        question_text: 'What are the 4 parameters required in Express to define an error-handling middleware?',
        options_json: [
          '(req, res, next, error)',
          '(err, req, res, next)',
          '(error, next, req, res)',
          '(req, res, err)'
        ],
        correct_option_index: 1,
        explanation: 'Express distinguishes error handlers by their function arity (4 arguments: `(err, req, res, next)`).'
      }
    ]
  },
  {
    id: 'ASM_SK021',
    skill_id: 'SK021',
    title: 'PostgreSQL Deep Dive & Performance Tuning',
    category: 'Databases',
    domain: 'Relational Databases',
    difficulty: 'Advanced',
    time_limit_minutes: 10,
    pass_score: 70.0,
    is_active: true,
    learning_resources: [
      { title: 'PostgreSQL Official Documentation', url: 'https://www.postgresql.org/docs/current/', category: 'Documentation', description: 'MVCC, indexing techniques, query execution planner, and configuration.' }
    ],
    questions: [
      {
        id: 'Q_PG_01',
        question_text: 'How does PostgreSQL handle row concurrency without locking read queries against write queries?',
        options_json: [
          'Using Table-level exclusive locks',
          'Using Multi-Version Concurrency Control (MVCC) with tuple versioning (`xmin`/`xmax`)',
          'Using Redis caching internally',
          'By serializing all queries single-threaded'
        ],
        correct_option_index: 1,
        explanation: 'MVCC maintains multiple version snapshots of rows, allowing readers to view consistent snapshots without blocking writers.'
      },
      {
        id: 'Q_PG_02',
        question_text: 'Which index type in PostgreSQL is best suited for searching JSONB document keys and array contains operators (`@>`)?',
        options_json: ['B-Tree Index', 'GIN (Generalized Inverted Index)', 'Hash Index', 'BRIN Index'],
        correct_option_index: 1,
        explanation: 'GIN indexes are engineered for multi-key composite structures like JSONB, full-text search, and array containment.'
      }
    ]
  },
  {
    id: 'ASM_SK024',
    skill_id: 'SK024',
    title: 'Redis In-Memory Architecture & Caching Strategies',
    category: 'Databases',
    domain: 'Caching & In-Memory',
    difficulty: 'Intermediate',
    time_limit_minutes: 10,
    pass_score: 70.0,
    is_active: true,
    learning_resources: [
      { title: 'Redis Official Documentation', url: 'https://redis.io/docs/', category: 'Documentation', description: 'Redis data structures, TTL, Lua scripting, Redis Streams, and clustering.' }
    ],
    questions: [
      {
        id: 'Q_RDS_01',
        question_text: 'What happens when Redis reaches its configured `maxmemory` limit under the `allkeys-lru` eviction policy?',
        options_json: [
          'Redis crashes with Out of Memory error',
          'It evicts the least recently used keys across all keys to make room for new data',
          'It writes excess keys to disk synchronously',
          'It refuses all subsequent write and read commands'
        ],
        correct_option_index: 1,
        explanation: '`allkeys-lru` evicts the least recently accessed keys across the entire keyspace regardless of whether a TTL expiration was set.'
      },
      {
        id: 'Q_RDS_02',
        question_text: 'Which Redis data structure is optimal for maintaining a real-time leaderboard sorted by user score?',
        options_json: ['Redis List', 'Redis Sorted Set (ZSET)', 'Redis Hash', 'Redis Bitmap'],
        correct_option_index: 1,
        explanation: 'Sorted Sets (ZSET) maintain elements ordered by a floating-point score using a combination of a hash table and a skip list.'
      }
    ]
  },
  {
    id: 'ASM_SK027',
    skill_id: 'SK027',
    title: 'Machine Learning & Scikit-Learn Pipelines',
    category: 'AI & ML',
    domain: 'Machine Learning',
    difficulty: 'Intermediate',
    time_limit_minutes: 12,
    pass_score: 75.0,
    is_active: true,
    learning_resources: [
      { title: 'Scikit-Learn User Guide', url: 'https://scikit-learn.org/stable/user_guide.html', category: 'Documentation', description: 'Cross-validation, pipeline creation, ensemble methods, and hyperparameter tuning.' },
      { title: 'Google Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', category: 'Course', description: 'Fundamental ML concepts, loss functions, classification metrics, and embeddings.' }
    ],
    questions: [
      {
        id: 'Q_ML_01',
        question_text: 'Why must feature preprocessing transformers (e.g. StandardScaler) be fitted strictly on training data only?',
        options_json: [
          'To save CPU computation time',
          'To prevent data leakage from validation/test distributions into model training',
          'Because test data cannot be represented as float arrays',
          'Scikit-learn syntax raises a TypeError if fitted on test splits'
        ],
        correct_option_index: 1,
        explanation: 'Fitting transformations on test or validation data leaks statistical parameters (mean, standard deviation), producing over-optimistic evaluation metrics.'
      },
      {
        id: 'Q_ML_02',
        question_text: 'When dealing with a heavily imbalanced binary classification dataset (e.g. 99% Class 0, 1% Class 1), which metric is LEAST informative?',
        options_json: ['Precision-Recall AUC', 'F1-Score', 'Raw Accuracy', 'ROC-AUC'],
        correct_option_index: 2,
        explanation: 'A naive baseline predicting only the majority class achieves 99% raw accuracy while failing completely to detect the minority class.'
      },
      {
        id: 'Q_ML_03',
        question_text: 'What is the primary difference between L1 (Lasso) and L2 (Ridge) regularization?',
        options_json: [
          'L1 drives less important feature coefficients to absolute zero (sparse feature selection); L2 shrinks coefficients toward zero without making them zero',
          'L2 is only used in neural networks',
          'L1 increases model variance',
          'L2 cannot be used with gradient descent'
        ],
        correct_option_index: 0,
        explanation: 'L1 regularization adds the absolute magnitude of coefficients as penalty, producing sparse models where uninformative feature weights become 0.'
      }
    ]
  },
  {
    id: 'ASM_SK028',
    skill_id: 'SK028',
    title: 'PyTorch & Deep Neural Network Architecture',
    category: 'AI & ML',
    domain: 'Deep Learning',
    difficulty: 'Intermediate',
    time_limit_minutes: 12,
    pass_score: 75.0,
    is_active: true,
    learning_resources: [
      { title: 'PyTorch Deep Learning Tutorials', url: 'https://pytorch.org/tutorials/', category: 'Documentation', description: 'Tensor operations, autograd engine, custom nn.Module, and training loops.' },
      { title: 'Deep Learning with PyTorch Book', url: 'https://pytorch.org/deep-learning-with-pytorch', category: 'Book', description: 'Free comprehensive deep learning textbook from the PyTorch team.' }
    ],
    questions: [
      {
        id: 'Q_PT_01',
        question_text: 'In PyTorch, why must `optimizer.zero_grad()` be called before `loss.backward()` in a typical training loop?',
        options_json: [
          'To free GPU memory cache',
          'Because PyTorch accumulates gradients on `.backward()` calls by default; zeroing resets gradients for the new batch',
          'To reset weights to random initializations',
          'To normalize learning rates'
        ],
        correct_option_index: 1,
        explanation: 'Gradients accumulate across successive `.backward()` calls (useful in RNNs/gradient accumulation). They must be cleared before computing new gradients.'
      },
      {
        id: 'Q_PT_02',
        question_text: 'What is the effect of calling `model.eval()` before running validation in PyTorch?',
        options_json: [
          'It compiles the model to C++ bytecode',
          'It disables dropout layers and switches batch normalization to use running statistics instead of batch statistics',
          'It turns off tensor gradient calculations permanently',
          'It deletes optimizer state'
        ],
        correct_option_index: 1,
        explanation: '`model.eval()` sets evaluation mode, deactivating stochastic behavior in Dropout layers and fixing BatchNorm stats.'
      }
    ]
  },
  {
    id: 'ASM_SK032',
    skill_id: 'SK032',
    title: 'Generative AI, RAG & Large Language Models',
    category: 'AI & ML',
    domain: 'Generative AI',
    difficulty: 'Intermediate',
    time_limit_minutes: 10,
    pass_score: 70.0,
    is_active: true,
    learning_resources: [
      { title: 'LangChain Concept Guides & Docs', url: 'https://python.langchain.com/docs/get_started/introduction', category: 'Documentation', description: 'Retrieval Augmented Generation, embeddings, document loaders, and chains.' },
      { title: 'Hugging Face LLM Course', url: 'https://huggingface.co/learn/nlp-course/chapter1/1', category: 'Course', description: 'Transformers, attention mechanisms, tokenizers, and prompt tuning.' }
    ],
    questions: [
      {
        id: 'Q_RAG_01',
        question_text: 'In a Retrieval Augmented Generation (RAG) pipeline, what is the purpose of the Vector Store retrieval step?',
        options_json: [
          'To fine-tune the LLM weights on every user query',
          'To retrieve semantically relevant context chunks from private documentation and inject them into the LLM prompt',
          'To translate prompts to binary machine code',
          'To compress the prompt tokens'
        ],
        correct_option_index: 1,
        explanation: 'RAG retrieves relevant external text embeddings via similarity search and grounds the LLM response with factual source context.'
      },
      {
        id: 'Q_RAG_02',
        question_text: 'What does "Temperature" parameter regulate in LLM text generation?',
        options_json: [
          'Hardware GPU thermal throttling',
          'The degree of randomness/entropy in next-token probability distribution (lower = deterministic; higher = creative)',
          'The maximum context window size in tokens',
          'The cost in API credits'
        ],
        correct_option_index: 1,
        explanation: 'Temperature scales the logits before the softmax layer. Lower temperatures make the model pick greedy high-probability tokens.'
      }
    ]
  },
  {
    id: 'ASM_SK034',
    skill_id: 'SK034',
    title: 'Docker & Containerization Infrastructure',
    category: 'DevOps & Cloud',
    domain: 'Containers',
    difficulty: 'Intermediate',
    time_limit_minutes: 10,
    pass_score: 70.0,
    is_active: true,
    learning_resources: [
      { title: 'Docker Official Documentation', url: 'https://docs.docker.com/get-started/', category: 'Documentation', description: 'Dockerfile syntax, multi-stage builds, networking, and volumes.' },
      { title: 'Docker Best Practices Guide', url: 'https://docs.docker.com/develop/develop-images/dockerfile_best-practices/', category: 'Best Practices', description: 'Writing lean, secure production Docker containers.' }
    ],
    questions: [
      {
        id: 'Q_DKR_01',
        question_text: 'Why are Docker Multi-Stage builds recommended for production deployments?',
        options_json: [
          'They allow containers to run on multiple operating systems simultaneously',
          'They separate the build environment (compilers, devDependencies) from the lean runtime image, minimizing final image size and attack surface',
          'They bypass Docker layer caching',
          'They run containers without root privileges automatically'
        ],
        correct_option_index: 1,
        explanation: 'Multi-stage builds allow copying only compiled artifacts into a lightweight base image (like Alpine or distroless), reducing image sizes by 80-90%.'
      },
      {
        id: 'Q_DKR_02',
        question_text: 'What is the key difference between Docker `CMD` and `ENTRYPOINT` in a Dockerfile?',
        options_json: [
          '`ENTRYPOINT` defines the fixed executable command; `CMD` provides default arguments that can be overridden at runtime',
          '`CMD` runs during image build time; `ENTRYPOINT` runs during container start',
          '`ENTRYPOINT` only works on Linux containers',
          'There is no functional difference'
        ],
        correct_option_index: 0,
        explanation: '`ENTRYPOINT` sets the base command to run, and `CMD` supplies default parameters that can be easily replaced via `docker run <image> [args]`.'
      }
    ]
  },
  {
    id: 'ASM_SK035',
    skill_id: 'SK035',
    title: 'Kubernetes Cluster & Orchestration Engineering',
    category: 'DevOps & Cloud',
    domain: 'Orchestration',
    difficulty: 'Advanced',
    time_limit_minutes: 12,
    pass_score: 70.0,
    is_active: true,
    learning_resources: [
      { title: 'Kubernetes Official Documentation', url: 'https://kubernetes.io/docs/home/', category: 'Documentation', description: 'Core concepts: Pods, Deployments, Services, Ingress, and ConfigMaps.' },
      { title: 'Kubernetes The Hard Way (GitHub)', url: 'https://github.com/kelseyhightower/kubernetes-the-hard-way', category: 'Deep Dive', description: 'Understanding cluster control planes, kubelet, and etcd.' }
    ],
    questions: [
      {
        id: 'Q_K8S_01',
        question_text: 'In Kubernetes, what is the primary role of a Service with type `ClusterIP`?',
        options_json: [
          'It exposes the pods to the public internet via an external load balancer',
          'It provides an internal stable IP address and DNS name for service-to-service communication within the cluster',
          'It provisions persistent storage volumes',
          'It restarts failing worker nodes'
        ],
        correct_option_index: 1,
        explanation: '`ClusterIP` is the default service type that assigns a stable internal virtual IP accessible only within the cluster.'
      },
      {
        id: 'Q_K8S_02',
        question_text: 'What component of the Kubernetes Control Plane is the single source of truth for all cluster state?',
        options_json: ['kube-scheduler', 'etcd (distributed key-value store)', 'kube-proxy', 'kubelet'],
        correct_option_index: 1,
        explanation: '`etcd` is a consistent, highly-available key-value store used as Kubernetes’ backing store for all cluster data.'
      }
    ]
  },
  {
    id: 'ASM_SK040',
    skill_id: 'SK040',
    title: 'Data Structures, Algorithms & Problem Solving',
    category: 'Core CS',
    domain: 'Fundamentals',
    difficulty: 'Intermediate',
    time_limit_minutes: 15,
    pass_score: 70.0,
    is_active: true,
    learning_resources: [
      { title: 'NeetCode 150 Algorithms Roadmap', url: 'https://neetcode.io/roadmap', category: 'Interactive Roadmaps', description: 'Structured visual roadmap for Arrays, Two Pointers, Trees, Graphs, and DP.' },
      { title: 'LeetCode Core 75 Blind Problems', url: 'https://leetcode.com/studyplan/blind-75/', category: 'Practice', description: 'Standard high-frequency technical interview questions.' }
    ],
    questions: [
      {
        id: 'Q_DSA_01',
        question_text: 'What is the time complexity of searching in a balanced Binary Search Tree (e.g. AVL or Red-Black Tree) with n elements?',
        options_json: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correct_option_index: 1,
        explanation: 'Balanced BSTs maintain height proportional to log2(n), yielding O(log n) search, insertion, and deletion.'
      },
      {
        id: 'Q_DSA_02',
        question_text: 'Which graph traversal algorithm is guaranteed to find the shortest path in an unweighted graph?',
        options_json: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Pre-order Traversal', 'Topological Sort'],
        correct_option_index: 1,
        explanation: 'BFS explores neighbor nodes level-by-level, ensuring the first time a target vertex is reached is along the shortest path.'
      },
      {
        id: 'Q_DSA_03',
        question_text: 'In dynamic programming, what is the distinction between Memoization and Tabulation?',
        options_json: [
          'Memoization is top-down using recursion and caching; Tabulation is bottom-up iterative using an array or table',
          'Memoization uses more CPU than Tabulation',
          'Tabulation cannot solve knapsack problems',
          'Memoization only works in Python'
        ],
        correct_option_index: 0,
        explanation: 'Memoization solves recursively from the main problem down, caching subproblem results. Tabulation iteratively computes subproblems starting from base cases.'
      }
    ]
  },
  {
    id: 'ASM_SK041',
    skill_id: 'SK041',
    title: 'System Design & Scalable Distributed Systems',
    category: 'Core CS',
    domain: 'Architecture',
    difficulty: 'Advanced',
    time_limit_minutes: 15,
    pass_score: 70.0,
    is_active: true,
    learning_resources: [
      { title: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer', category: 'Study Guide', description: 'Comprehensive guide to high availability, caching, sharding, and microservices.' },
      { title: 'ByteByteGo System Design Newsletter', url: 'https://bytebytego.com/', category: 'Visual Architecture', description: 'Clear diagrams and architecture breakdowns of real-world scalable systems.' }
    ],
    questions: [
      {
        id: 'Q_SD_01',
        question_text: 'According to the CAP Theorem, what tradeoff must a distributed data store make in the presence of a network Partition (P)?',
        options_json: [
          'It can have both high speed and zero cost',
          'It must choose between Consistency (C - every read receives most recent write) and Availability (A - non-failing node returns non-error response)',
          'It must disable all read replicas',
          'It can achieve all three (C, A, and P) simultaneously'
        ],
        correct_option_index: 1,
        explanation: 'When network partitions occur, distributed systems must trade off strong consistency (blocking writes) versus availability (returning stale reads).'
      },
      {
        id: 'Q_SD_02',
        question_text: 'What problem does Consistent Hashing solve in distributed caching and database partitioning?',
        options_json: [
          'It encrypts passwords securely with salt',
          'It minimizes key remapping when cache nodes are added or removed (only K/N keys remapped on average)',
          'It replaces SQL relational databases',
          'It guarantees zero latency over satellite connections'
        ],
        correct_option_index: 1,
        explanation: 'Consistent Hashing maps both keys and servers to a virtual ring, ensuring adding or removing a node only redistributes adjacent keys.'
      }
    ]
  },
  {
    id: 'ASM_SK043',
    skill_id: 'SK043',
    title: 'Git & Professional Version Control',
    category: 'Software Tools',
    domain: 'Collaboration',
    difficulty: 'Intermediate',
    time_limit_minutes: 10,
    pass_score: 70.0,
    is_active: true,
    learning_resources: [
      { title: 'Pro Git Book (Free Online)', url: 'https://git-scm.com/book/en/v2', category: 'Book', description: 'The official complete reference for Git internals, branch strategies, and plumbing commands.' },
      { title: 'Learn Git Branching (Interactive Visualizer)', url: 'https://learngitbranching.js.org/', category: 'Interactive', description: 'Visual interactive sandbox for rebasing, cherry-picking, and branch management.' }
    ],
    questions: [
      {
        id: 'Q_GIT_01',
        question_text: 'What is the primary difference between `git merge` and `git rebase`?',
        options_json: [
          '`git merge` creates a new merge commit combining histories; `git rebase` rewrites history by replaying commits sequentially on top of the target base branch',
          '`git rebase` deletes remote branches permanently',
          '`git merge` cannot resolve conflicts',
          'There is no difference'
        ],
        correct_option_index: 0,
        explanation: 'Rebasing linearizes history by moving your feature commits onto the tip of the target branch, while merging retains explicit branch topology with a merge commit.'
      },
      {
        id: 'Q_GIT_02',
        question_text: 'What does `git stash pop` do?',
        options_json: [
          'Permanently deletes your unstaged files',
          'Restores the most recently stashed changes and removes them from the stash stack',
          'Pushes your stash to the remote GitHub repository',
          'Reverts the last commit'
        ],
        correct_option_index: 1,
        explanation: '`git stash pop` applies saved work from top of stash list and drops it from the stash history.'
      }
    ]
  },
  {
    id: 'ASM_SK045',
    skill_id: 'SK045',
    title: 'Cybersecurity, Cryptography & Auth Architecture',
    category: 'Security',
    domain: 'Cybersecurity',
    difficulty: 'Intermediate',
    time_limit_minutes: 10,
    pass_score: 70.0,
    is_active: true,
    learning_resources: [
      { title: 'OWASP Top 10 Security Risks', url: 'https://owasp.org/www-project-top-ten/', category: 'Security Standard', description: 'Standard awareness document for developers and web application security.' },
      { title: 'Auth0 JWT Handbook', url: 'https://auth0.com/resources/ebooks/jwt-handbook', category: 'Authentication', description: 'Token-based authentication, symmetric/asymmetric signatures, and refresh patterns.' }
    ],
    questions: [
      {
        id: 'Q_SEC_01',
        question_text: 'Why should passwords NEVER be hashed with fast cryptographic algorithms like SHA-256 or MD5?',
        options_json: [
          'Because SHA-256 is deprecated by browsers',
          'Because fast hashes allow attackers to compute billions of guesses per second via GPUs/ASICs; slow adaptive key-derivation functions (bcrypt/Argon2) are required',
          'Because SHA-256 cannot hash long passwords',
          'Because MD5 is an asymmetric cipher'
        ],
        correct_option_index: 1,
        explanation: 'Passwort hashing requires computationally expensive, memory-hard key derivation functions like Argon2id or bcrypt with configurable work factors to defeat brute force.'
      },
      {
        id: 'Q_SEC_02',
        question_text: 'In JSON Web Tokens (JWT), what part ensures the token payload was not modified by an unauthorized party?',
        options_json: [
          'The base64-encoded Header',
          'The Cryptographic Signature verified using the secret or public key',
          'The expiration timestamp in Payload',
          'The browser cookie domain attribute'
        ],
        correct_option_index: 1,
        explanation: 'The signature is computed over `base64(header) + "." + base64(payload)` using a secret or private key. Any tampering invalidates the signature.'
      }
    ]
  }
];

import { MULTI_BRANCH_ASSESSMENTS, createDynamicTopicAssessment } from './multiBranchAssessments.js';

// Combine base CSE assessments with all Multi-Branch engineering assessments
TOPIC_ASSESSMENTS.push(...MULTI_BRANCH_ASSESSMENTS);

export { createDynamicTopicAssessment };
