import React, { useState, useEffect } from 'react';
import {
  CheckCircle, Circle, Clock, Award, BookOpen, Terminal,
  ExternalLink, Sparkles, ChevronRight, Zap, Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';

interface TaskItem {
  id: string;
  title: string;
  duration: string;
  type: 'concept' | 'project' | 'assessment' | 'lab';
  completed: boolean;
  link?: string;
}

interface MilestonePhase {
  id: string;
  number: number;
  title: string;
  badge: string;
  estimatedHours: number;
  description: string;
  tasks: TaskItem[];
}

const DEFAULT_PHASES: MilestonePhase[] = [
  {
    id: 'p1',
    number: 1,
    title: 'Core Foundations & Critical Deficit Resolution',
    badge: 'Immediate Priority',
    estimatedHours: 14,
    description: 'Bridge high-severity deficits in primary programming syntax, asynchronous data pipelines, and core algorithmic data structures.',
    tasks: [
      { id: 't1_1', title: 'Deep dive into TypeScript Generics, Utility Types & Type Narrowing', duration: '3.5 hrs', type: 'concept', completed: true },
      { id: 't1_2', title: 'Complete Hands-on Async/Await & Event Loop Lab in Branch Compiler', duration: '4.0 hrs', type: 'lab', completed: true, link: '/app/compiler' },
      { id: 't1_3', title: 'Solve 5 High-Impact LeetCode-style tree & graph problems', duration: '4.0 hrs', type: 'project', completed: false },
      { id: 't1_4', title: 'Take Foundation Diagnostic Verification Exam', duration: '2.5 hrs', type: 'assessment', completed: false, link: '/app/assessments' },
    ],
  },
  {
    id: 'p2',
    number: 2,
    title: 'Framework Architecture & Full-Stack Implementation',
    badge: 'Domain Mastery',
    estimatedHours: 22,
    description: 'Construct real-world production modules using modern component lifecycles, global caching, state machines, and relational ORM integrations.',
    tasks: [
      { id: 't2_1', title: 'Build Full-Stack REST & gRPC API server with Express/Node', duration: '6.0 hrs', type: 'project', completed: false },
      { id: 't2_2', title: 'Implement PostgreSQL transactional queries and index optimization', duration: '5.0 hrs', type: 'lab', completed: false, link: '/app/compiler' },
      { id: 't2_3', title: 'Configure client-side TanStack React Query cache invalidation', duration: '4.5 hrs', type: 'concept', completed: false },
      { id: 't2_4', title: 'Pass Intermediate Full-Stack Assessment Module', duration: '3.0 hrs', type: 'assessment', completed: false, link: '/app/assessments' },
    ],
  },
  {
    id: 'p3',
    number: 3,
    title: 'Cloud DevOps, Containerization & Microservice Ops',
    badge: 'Production Systems',
    estimatedHours: 18,
    description: 'Containerize multi-tier applications, configure automated GitHub Actions CI/CD pipelines, and implement container health orchestration.',
    tasks: [
      { id: 't3_1', title: 'Dockerize frontend, backend, and PostgreSQL services with Docker Compose', duration: '4.5 hrs', type: 'lab', completed: false },
      { id: 't3_2', title: 'Setup GitHub Actions CI/CD with automated linting & test runner', duration: '4.0 hrs', type: 'project', completed: false },
      { id: 't3_3', title: 'Kubernetes Pod deployments, Service ingress, and ConfigMaps', duration: '5.5 hrs', type: 'concept', completed: false },
      { id: 't3_4', title: 'Production Reliability & Monitoring Diagnostic', duration: '2.0 hrs', type: 'assessment', completed: false, link: '/app/assessments' },
    ],
  },
  {
    id: 'p4',
    number: 4,
    title: 'Technical Interview Simulation & Placement Clearance',
    badge: 'Final Placement Bridge',
    estimatedHours: 12,
    description: 'Simulate high-pressure technical whiteboard interviews, live system architecture design, and STAR behavioral leadership questions.',
    tasks: [
      { id: 't4_1', title: 'Conduct AI Copilot Mock System Design: Distributed URL Shortener', duration: '3.5 hrs', type: 'lab', completed: false, link: '/app/ai-copilot' },
      { id: 't4_2', title: 'Live Coding Speed Drill under 45-minute countdown clock', duration: '3.0 hrs', type: 'assessment', completed: false, link: '/app/assessments' },
      { id: 't4_3', title: 'Optimize resume ATS keywords using Resume AI Analyzer', duration: '2.0 hrs', type: 'concept', completed: false, link: '/app/resume-ai' },
      { id: 't4_4', title: 'Official Skill2Career Placement Eligibility Certification Check', duration: '2.5 hrs', type: 'assessment', completed: false, link: '/app/job-readiness' },
    ],
  },
];

export const InteractiveLearningPath: React.FC<{ targetRole?: string }> = ({
  targetRole = 'Senior Full Stack Software Engineer',
}) => {
  const [phases, setPhases] = useState<MilestonePhase[]>(() => {
    const saved = localStorage.getItem('skillbridge_learning_phases');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_PHASES;
      }
    }
    return DEFAULT_PHASES;
  });

  useEffect(() => {
    localStorage.setItem('skillbridge_learning_phases', JSON.stringify(phases));
  }, [phases]);

  const toggleTask = (phaseId: string, taskId: string) => {
    setPhases((prevPhases) => {
      const next = prevPhases.map((phase) => {
        if (phase.id !== phaseId) return phase;
        const updatedTasks = phase.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const nextCompleted = !task.completed;
          if (nextCompleted) {
            confetti({
              particleCount: 25,
              spread: 45,
              origin: { y: 0.8 },
            });
          }
          return { ...task, completed: nextCompleted };
        });

        // If all tasks in this phase just became completed, big celebration
        const allDone = updatedTasks.every((t) => t.completed);
        const wasAllDone = phase.tasks.every((t) => t.completed);
        if (allDone && !wasAllDone) {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.6 },
          });
        }

        return { ...phase, tasks: updatedTasks };
      });
      return next;
    });
  };

  // Calculations
  const allTasks = phases.flatMap((p) => p.tasks);
  const completedTasks = allTasks.filter((t) => t.completed);
  const overallPercentage = Math.round((completedTasks.length / Math.max(1, allTasks.length)) * 100);

  const totalHours = phases.reduce((acc, p) => acc + p.estimatedHours, 0);
  const completedHours = phases.reduce((acc, p) => {
    const phaseDone = p.tasks.filter((t) => t.completed).length;
    const ratio = phaseDone / p.tasks.length;
    return acc + Math.round(p.estimatedHours * ratio);
  }, 0);

  return (
    <div className="skillbridge-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header & Meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              SkillBridge Learning Roadmap
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Step-by-Step Milestone Engine</span>
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Structured Learning Path for {targetRole}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px', marginBottom: 0 }}>
            Curated sequence of deliberate practice, branch compilers, and real diagnostic assessments designed to systematically eliminate your critical skill deficits.
          </p>
        </div>

        {/* Action button to reset or sync */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => {
              if (window.confirm('Reset learning milestones to initial state?')) {
                setPhases(DEFAULT_PHASES);
              }
            }}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.775rem',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            Reset Progress
          </button>
        </div>
      </div>

      {/* High-Impact Progress Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
          borderRadius: '12px',
          padding: '20px 24px',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(30, 64, 175, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Overall Roadmap Completion
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px' }}>
              {completedTasks.length} of {allTasks.length} Milestones Achieved ({overallPercentage}%)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 700 }}>HOURS INVESTED</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{completedHours} / {totalHours} hrs</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 700 }}>REMAINING TIME</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>~{Math.max(0, totalHours - completedHours)} hrs</div>
            </div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${overallPercentage}%`,
              height: '100%',
              background: '#34d399',
              borderRadius: '4px',
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 0 10px rgba(52, 211, 153, 0.6)',
            }}
          />
        </div>
      </div>

      {/* Interactive Milestone Phases */}
      <div className="milestone-track">
        {phases.map((phase) => {
          const phaseCompletedTasks = phase.tasks.filter((t) => t.completed).length;
          const isPhaseDone = phaseCompletedTasks === phase.tasks.length;
          const isPhaseActive = !isPhaseDone && phase.number === 1 || (phases[phase.number - 2]?.tasks.every((t) => t.completed) && !isPhaseDone);

          return (
            <div key={phase.id} className="milestone-item">
              {/* Node Indicator */}
              <div
                className={`milestone-node ${isPhaseDone ? 'completed' : isPhaseActive ? 'active' : ''}`}
              >
                {isPhaseDone ? <CheckCircle size={20} color="#059669" /> : `0${phase.number}`}
              </div>

              {/* Phase Content Box */}
              <div className="milestone-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          background: isPhaseDone ? '#ecfdf5' : '#eff6ff',
                          color: isPhaseDone ? '#065f46' : '#1d4ed8',
                          border: isPhaseDone ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                        }}
                      >
                        {phase.badge}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Phase {phase.number} · ~{phase.estimatedHours} Hours Required
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {phase.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isPhaseDone ? '#16a34a' : '#2563eb' }}>
                      {phaseCompletedTasks}/{phase.tasks.length} Completed
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.825rem', color: '#475569', margin: '0 0 14px 0' }}>
                  {phase.description}
                </p>

                {/* Task Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {phase.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(phase.id, task.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: task.completed ? '#f8fafc' : '#ffffff',
                        border: task.completed ? '1px solid #e2e8f0' : '1px solid #cbd5e1',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {task.completed ? (
                          <CheckCircle size={18} color="#16a34a" />
                        ) : (
                          <Circle size={18} color="#94a3b8" />
                        )}
                        <span
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: task.completed ? '#64748b' : '#0f172a',
                            textDecoration: task.completed ? 'line-through' : 'none',
                          }}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {task.duration}
                        </span>
                        {task.link && (
                          <Link
                            to={task.link}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#2563eb',
                              background: '#eff6ff',
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            Launch <ChevronRight size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
