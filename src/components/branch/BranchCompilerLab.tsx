import React, { useState } from 'react';
import { Play, Terminal, Cpu, Layers, Activity, Copy, Check } from 'lucide-react';
import type { BranchDefinition } from '../../data/engineeringBranches';

interface BranchCompilerLabProps {
  branch: BranchDefinition;
}

export const BranchCompilerLab: React.FC<BranchCompilerLabProps> = ({ branch }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(branch.primaryLanguage || 'python');
  const [code, setCode] = useState<string>(() => {
    if (branch.challenges && branch.challenges.length > 0) {
      return branch.challenges[0].initialCode;
    }
    return `# Skill2Career ${branch.shortName} Practice Sandbox
def solve():
    print("Welcome to ${branch.name} Engineering Practice Lab")
    return True

solve()`;
  });
  const [stdin, setStdin] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number | null>(null);

  // Specific state for Electrical / Circuit Logic simulator
  const [logicA, setLogicA] = useState<number>(1);
  const [logicB, setLogicB] = useState<number>(0);
  const [logicGate, setLogicGate] = useState<'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR'>('XOR');

  // Specific state for Mechanical / Robotics Kinematics simulator
  const [theta1, setTheta1] = useState<number>(45);
  const [theta2, setTheta2] = useState<number>(30);
  const [link1, setLink1] = useState<number>(120);
  const [link2, setLink2] = useState<number>(90);

  // Specific state for Civil Structural Calculator
  const [beamLength, setBeamLength] = useState<number>(6); // meters
  const [beamUDL, setBeamUDL] = useState<number>(15); // kN/m
  const [pointLoad, setPointLoad] = useState<number>(25); // kN at midspan

  // Specific state for Chemical Reaction Kinetics
  const [temperatureK, setTemperatureK] = useState<number>(350); // Kelvin
  const [activationEnergy, setActivationEnergy] = useState<number>(75); // kJ/mol

  // Specific state for Aerospace
  const [angleAttack, setAngleAttack] = useState<number>(6); // degrees
  const [aspectRatio, setAspectRatio] = useState<number>(8.5);

  // Specific state for Quantum
  const [qubitAlpha, setQubitAlpha] = useState<number>(1.0);
  const [qubitBeta, setQubitBeta] = useState<number>(0.0);

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/v1/compiler/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
          input: stdin,
          branch: branch.code,
          toolType: branch.compilerType,
        }),
      });
      const data = await res.json();
      if (data.status === 'error') {
        setOutput(`[Execution Error]\n${data.stderr}`);
      } else {
        setOutput(data.stdout);
      }
      setExecTime(data.durationMs);
    } catch (err: any) {
      setOutput(`[Connection Error]\n${err.message || 'Could not communicate with compilation engine.'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute logic gate output
  const computeLogicGate = () => {
    switch (logicGate) {
      case 'AND': return logicA & logicB;
      case 'OR': return logicA | logicB;
      case 'XOR': return logicA ^ logicB;
      case 'NAND': return (logicA & logicB) ? 0 : 1;
      case 'NOR': return (logicA | logicB) ? 0 : 1;
      default: return 0;
    }
  };

  // Compute 2-link robotic arm end-effector
  const rad1 = (theta1 * Math.PI) / 180;
  const rad2 = ((theta1 + theta2) * Math.PI) / 180;
  const elbowX = 150 + link1 * Math.cos(rad1);
  const elbowY = 200 - link1 * Math.sin(rad1);
  const endEffectorX = elbowX + link2 * Math.cos(rad2);
  const endEffectorY = elbowY - link2 * Math.sin(rad2);

  // Compute beam bending moment: M_max = (w*L^2)/8 + (P*L)/4
  const maxMoment = ((beamUDL * (beamLength ** 2)) / 8) + ((pointLoad * beamLength) / 4);
  const maxShear = (beamUDL * beamLength) / 2 + pointLoad / 2;

  // Compute Arrhenius rate constant k = A * exp(-Ea / (R*T))
  const R = 8.314;
  const kRate = 1e11 * Math.exp(-(activationEnergy * 1000) / (R * temperatureK));
  const conversionPct = Math.min(99.9, Math.max(1, (1 - Math.exp(-kRate * 10)) * 100));

  // Compute Aerodynamic Lift & Induced Drag
  const cl = Math.min(1.6, Math.max(-0.4, 0.1 * angleAttack + 0.2));
  const cdi = (cl ** 2) / (Math.PI * aspectRatio * 0.85);
  const totalCd = 0.02 + cdi;
  const liftToDrag = cl > 0 ? (cl / totalCd).toFixed(1) : '0.0';

  // Apply Quantum Gates
  const applyHadamard = () => {
    const factor = 1 / Math.sqrt(2);
    const newA = factor * (qubitAlpha + qubitBeta);
    const newB = factor * (qubitAlpha - qubitBeta);
    setQubitAlpha(Number(newA.toFixed(4)));
    setQubitBeta(Number(newB.toFixed(4)));
  };

  const applyPauliX = () => {
    // NOT gate swaps alpha and beta
    const temp = qubitAlpha;
    setQubitAlpha(qubitBeta);
    setQubitBeta(temp);
  };

  const resetQubit = () => {
    setQubitAlpha(1.0);
    setQubitBeta(0.0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Branch Tool Header Banner */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '20px' }}>{branch.categoryEmoji}</span>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {branch.shortName} Specialized Practice Engine & Compiler
            </h3>
            <span style={{ fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              {branch.compilerType.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
            Curated simulation tools and real-time execution environments strictly tailored for <strong>{branch.name}</strong> students.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {branch.toolsAndTech.slice(0, 4).map((tech) => (
            <span
              key={tech}
              style={{
                fontSize: '11px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#334155',
                padding: '3px 8px',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* DOMAIN SPECIFIC SIMULATOR TIER */}
      {branch.compilerType === 'circuit_logic' && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Cpu size={18} color="#006EFF" />
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Digital Circuit & Logic Gate Waveform Simulator
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {/* Interactive Inputs */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>Select Logic Gate & Input Signals</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                {(['AND', 'OR', 'XOR', 'NAND', 'NOR'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setLogicGate(g)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: '1px solid',
                      borderColor: logicGate === g ? '#006EFF' : '#cbd5e1',
                      background: logicGate === g ? '#006EFF' : '#ffffff',
                      color: logicGate === g ? '#ffffff' : '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <button
                  type="button"
                  onClick={() => setLogicA(logicA === 1 ? 0 : 1)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: logicA === 1 ? '#ecfdf5' : '#f8fafc',
                    color: logicA === 1 ? '#047857' : '#64748b',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Pin A: <strong>{logicA}</strong> ({logicA ? 'HIGH' : 'LOW'})
                </button>
                <button
                  type="button"
                  onClick={() => setLogicB(logicB === 1 ? 0 : 1)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: logicB === 1 ? '#ecfdf5' : '#f8fafc',
                    color: logicB === 1 ? '#047857' : '#64748b',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Pin B: <strong>{logicB}</strong> ({logicB ? 'HIGH' : 'LOW'})
                </button>
              </div>
            </div>

            {/* Output Visualizer */}
            <div style={{ background: '#0f172a', color: '#ffffff', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Simulated Output (Q = A {logicGate} B)
              </div>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: computeLogicGate() === 1 ? '#22c55e' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 900,
                  boxShadow: computeLogicGate() === 1 ? '0 0 20px rgba(34, 197, 94, 0.6)' : 'none',
                  transition: 'all 0.2s ease',
                  marginBottom: '8px',
                }}
              >
                {computeLogicGate()}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: computeLogicGate() === 1 ? '#86efac' : '#fca5a5' }}>
                Logic State: {computeLogicGate() === 1 ? 'VCC HIGH (3.3V)' : 'GND LOW (0V)'}
              </div>
            </div>
          </div>
        </div>
      )}

      {branch.compilerType === 'kinematics_sim' && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Activity size={18} color="#006EFF" />
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              2-DOF Robotic Arm Forward Kinematics & Linkage Canvas
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* SVG Canvas */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'center' }}>
              <svg width="300" height="240" viewBox="0 0 300 240" style={{ overflow: 'visible' }}>
                {/* Grid */}
                <line x1="0" y1="200" x2="300" y2="200" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="150" y1="0" x2="150" y2="240" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />

                {/* Base Anchor */}
                <polygon points="140,200 160,200 150,185" fill="#475569" />
                <circle cx="150" cy="200" r="6" fill="#0f172a" />

                {/* Link 1 */}
                <line x1="150" y1="200" x2={elbowX} y2={elbowY} stroke="#006EFF" strokeWidth="6" strokeLinecap="round" />
                <circle cx={elbowX} cy={elbowY} r="6" fill="#2563eb" />

                {/* Link 2 */}
                <line x1={elbowX} y1={elbowY} x2={endEffectorX} y2={endEffectorY} stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
                <circle cx={endEffectorX} cy={endEffectorY} r="7" fill="#ef4444" />
              </svg>
            </div>

            {/* Sliders & Coordinate Readout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Joint 1 Angle (θ1):</span>
                  <span style={{ color: '#006EFF' }}>{theta1}°</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={theta1}
                  onChange={(e) => setTheta1(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Joint 2 Relative Angle (θ2):</span>
                  <span style={{ color: '#10b981' }}>{theta2}°</span>
                </label>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={theta2}
                  onChange={(e) => setTheta2(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>End-Effector Cartesian Coordinates:</div>
                <div style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>
                  X: {((endEffectorX - 150) / 10).toFixed(2)} cm | Y: {((200 - endEffectorY) / 10).toFixed(2)} cm
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {branch.compilerType === 'structural_calc' && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Layers size={18} color="#006EFF" />
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Beam Bending Moment & Structural Deflection Analyzer
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Span Length (L): <strong>{beamLength} meters</strong>
              </label>
              <input
                type="range"
                min="2"
                max="15"
                value={beamLength}
                onChange={(e) => setBeamLength(Number(e.target.value))}
                style={{ width: '100%' }}
              />

              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginTop: '6px' }}>
                Uniform Distributed Load (w): <strong>{beamUDL} kN/m</strong>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={beamUDL}
                onChange={(e) => setBeamUDL(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Structural Analysis Results</div>
              <div style={{ fontSize: '13px', color: '#0f172a' }}>
                Max Bending Moment: <strong style={{ color: '#006EFF', fontSize: '16px' }}>{maxMoment.toFixed(2)} kNm</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#0f172a' }}>
                Max Support Shear Force: <strong style={{ color: '#10b981', fontSize: '16px' }}>{maxShear.toFixed(2)} kN</strong>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                Governing formula: M_max = (wL²)/8 + (PL)/4
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CODE EDITOR & COMPILER RUNNER */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        {/* Editor Controls Bar */}
        <div
          style={{
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Language / Engine:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
              }}
            >
              <option value="python">Python 3.12 (Standard DSA & Math)</option>
              <option value="javascript">JavaScript (ES2024 / Node)</option>
              <option value="verilog">Verilog HDL (Digital Synthesizer)</option>
              <option value="c">Embedded C / C++</option>
              <option value="sql">SQL Relational Engine</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={copyCode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              type="button"
              onClick={handleRunCode}
              disabled={isRunning}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                padding: '6px 16px',
                borderRadius: '6px',
                border: 'none',
                background: isRunning ? '#93c5fd' : '#006EFF',
                color: '#ffffff',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 3px rgba(0, 110, 255, 0.2)',
              }}
            >
              <Play size={14} fill="#ffffff" />
              <span>{isRunning ? 'Compiling...' : 'Run & Compile'}</span>
            </button>
          </div>
        </div>

        {/* Textarea Code Editor */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          rows={12}
          style={{
            width: '100%',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '13px',
            lineHeight: '1.6',
            padding: '16px',
            border: 'none',
            background: '#0f172a',
            color: '#f8fafc',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {/* Console Stdout Terminal */}
        <div style={{ background: '#020617', borderTop: '1px solid #1e293b', padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={14} color="#38bdf8" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Compiler Output & Terminal Execution
              </span>
            </div>
            {execTime !== null && (
              <span style={{ fontSize: '11px', color: '#10b981', fontFamily: 'monospace' }}>
                Completed in {execTime}ms
              </span>
            )}
          </div>

          <pre
            style={{
              margin: 0,
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '12px',
              color: output.includes('[Execution Error]') ? '#f87171' : '#4ade80',
              whiteSpace: 'pre-wrap',
              maxHeight: '180px',
              overflowY: 'auto',
            }}
          >
            {output || '[Terminal Ready] Click "Run & Compile" to execute script in the Skill2Career environment.'}
          </pre>
        </div>
      </div>
    </div>
  );
};
