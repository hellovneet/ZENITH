import React, { useState } from 'react';
import { 
  Compass, Sparkles, Sliders 
} from 'lucide-react';
import { BlochSphere3D } from './BlochSphere3D';
import { BlochState } from '../../types/quantum';
import { useLanguage } from '../../i18n/LanguageContext';

interface BlochPlaygroundProps {
  onAskAI?: (prompt: string) => void;
}

export const BlochPlayground: React.FC<BlochPlaygroundProps> = ({ onAskAI }) => {
  const { t, isHindi } = useLanguage();
  const copy = t.bloch;
  const [theta, setTheta] = useState(1.5708); // pi / 2 (|+> state)
  const [phi, setPhi] = useState(0);

  // Derive Cartesian coordinates
  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(theta);

  const prob0 = Math.pow(Math.cos(theta / 2), 2);
  const prob1 = Math.pow(Math.sin(theta / 2), 2);

  const blochState: BlochState & { x: number; y: number; z: number; p0: number; p1: number } = {
    theta,
    phi,
    x,
    y,
    z,
    purity: 1.0,
    prob0,
    prob1,
    p0: prob0,
    p1: prob1,
  };

  // Preset states
  const setPreset = (presetKey: string) => {
    switch (presetKey) {
      case '0':
        setTheta(0);
        setPhi(0);
        break;
      case '1':
        setTheta(Math.PI);
        setPhi(0);
        break;
      case '+x': // |+>
        setTheta(Math.PI / 2);
        setPhi(0);
        break;
      case '-x': // |->
        setTheta(Math.PI / 2);
        setPhi(Math.PI);
        break;
      case '+y': // |+i>
        setTheta(Math.PI / 2);
        setPhi(Math.PI / 2);
        break;
      case '-y': // |-i>
        setTheta(Math.PI / 2);
        setPhi((3 * Math.PI) / 2);
        break;
    }
  };

  // Apply Gate rotations
  const applyGate = (gate: string) => {
    if (gate === 'X') {
      setTheta((t) => Math.PI - t);
      setPhi((p) => (2 * Math.PI - p) % (2 * Math.PI));
    } else if (gate === 'Z') {
      setPhi((p) => (p + Math.PI) % (2 * Math.PI));
    } else if (gate === 'H') {
      if (Math.abs(theta) < 0.1) {
        setTheta(Math.PI / 2);
        setPhi(0);
      } else if (Math.abs(theta - Math.PI) < 0.1) {
        setTheta(Math.PI / 2);
        setPhi(Math.PI);
      } else if (Math.abs(theta - Math.PI / 2) < 0.1 && Math.abs(phi) < 0.1) {
        setTheta(0);
        setPhi(0);
      } else {
        setTheta(Math.PI / 2);
        setPhi(0);
      }
    } else if (gate === 'S') {
      setPhi((p) => (p + Math.PI / 2) % (2 * Math.PI));
    } else if (gate === 'T') {
      setPhi((p) => (p + Math.PI / 4) % (2 * Math.PI));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#091124] border border-[#dfff3f]/25 rounded-2xl p-5 shadow-xl shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#dfff3f]/10 text-[#dfff3f] border border-[#dfff3f]/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              {copy.title}
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#dfff3f]/15 text-[#e9ff8a]">
                {copy.subtitle}
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              {copy.description}
            </p>
          </div>
        </div>

        {onAskAI && (
          <button
            onClick={() => onAskAI(isHindi ? "ब्लॉक स्फीयर की ज्यामितीय व्याख्या और एकल-क्यूबिट गेट 3D रोटेशन के रूप में कैसे कार्य करते हैं, विस्तार से समझाइए।" : "Explain the geometric meaning of the Bloch Sphere and how single-qubit gates act as 3D rotations.")}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {copy.explainGeometry}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 3D Bloch sphere */}
        <div className="lg:col-span-7 bg-[#050914] border border-[#dfff3f]/30 rounded-2xl p-6 shadow-2xl shadow-black/60 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-[#dfff3f] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              {isHindi ? '3D ब्लॉक स्फीयर सिमुलेशन' : '3D Bloch Sphere'}
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              {isHindi ? 'घुमाने के लिए लेफ्ट क्लिक + ड्रैग • ज़ूम के लिए स्क्रॉल' : 'Left Click + Drag to Orbit • Scroll to Zoom'}
            </span>
          </div>

          <BlochSphere3D
            qubitState={blochState}
            qubitIndex={0}
            label={isHindi ? 'इंटरैक्टिव एकल क्यूबिट अवस्था |ψ⟩' : 'Interactive Single Qubit State |ψ⟩'}
            size={360}
            interactive={true}
          />

          {/* Quick Presets */}
          <div className="w-full mt-6 pt-4 border-t border-white/10">
            <span className="text-xs font-mono text-zinc-400 block mb-2 font-semibold">
              {copy.canonicalPresets}:
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { key: '0', label: '|0⟩ (North)' },
                { key: '1', label: '|1⟩ (South)' },
                { key: '+x', label: '|+⟩ (+X)' },
                { key: '-x', label: '|–⟩ (–X)' },
                { key: '+y', label: '|+i⟩ (+Y)' },
                { key: '-y', label: '|–i⟩ (–Y)' },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPreset(p.key)}
                  className="py-1.5 px-2 rounded-lg bg-white/[.05] hover:bg-white/[.08] border border-white/10 hover:border-[#dfff3f]/40 text-[11px] font-mono text-zinc-300 hover:text-[#e9ff8a] transition-colors text-center"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mathematical Readout & Gate Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Coordinate Sliders */}
          <div className="bg-[#080d1e] border border-[#dfff3f]/20 rounded-2xl p-5 shadow-xl shadow-black/40 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#dfff3f] font-mono flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              {copy.controls}
            </h4>

            {/* Theta slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300">{copy.polarAngle}:</span>
                <span className="text-[#dfff3f] font-bold">
                  {((theta * 180) / Math.PI).toFixed(1)}° ({(theta / Math.PI).toFixed(2)}π)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.PI}
                step="0.02"
                value={theta}
                onChange={(e) => setTheta(Number(e.target.value))}
                className="w-full h-1.5 bg-white/[.08] rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Phi slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300">{copy.azimuthalAngle}:</span>
                <span className="text-purple-400 font-bold">
                  {((phi * 180) / Math.PI).toFixed(1)}° ({(phi / Math.PI).toFixed(2)}π)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={2 * Math.PI}
                step="0.02"
                value={phi}
                onChange={(e) => setPhi(Number(e.target.value))}
                className="w-full h-1.5 bg-white/[.08] rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>
          </div>

          {/* Unitary Gate Rotation Triggers */}
          <div className="bg-[#080d1e] border border-[#dfff3f]/20 rounded-2xl p-5 shadow-xl shadow-black/40 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
              {copy.applyGates}
            </h4>
            <p className="text-[11px] text-zinc-400">
              {isHindi ? 'ब्लॉक सदिश पर तुरंत भौतिक घूर्णन (rotation) करने के लिए किसी गेट पर क्लिक करें:' : 'Click a gate to perform an instantaneous physical rotation on the Bloch vector:'}
            </p>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {[
                { gate: 'H', label: 'H' },
                { gate: 'X', label: 'X (π_x)' },
                { gate: 'Z', label: 'Z (π_z)' },
                { gate: 'S', label: 'S (π/2_z)' },
                { gate: 'T', label: 'T (π/4_z)' },
              ].map((g) => (
                <button
                  key={g.gate}
                  onClick={() => applyGate(g.gate)}
                  className="py-2 rounded-lg bg-white/[.05] hover:bg-white/[.08] border border-white/10 hover:border-[#dfff3f] text-xs font-mono font-bold text-zinc-200 hover:text-[#e9ff8a] transition-colors"
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vector & Density Matrix Details */}
          <div className="bg-[#080d1e] border border-[#dfff3f]/20 rounded-2xl p-5 shadow-xl shadow-black/40 font-mono text-xs space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#dfff3f] block font-mono">
              {copy.cartesianCoordinates}
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded bg-black/55 border border-white/10 text-center">
                <span className="text-zinc-400 block text-[10px]">x = sinθ cosφ</span>
                <span className="text-[#e9ff8a] font-bold">{x.toFixed(3)}</span>
              </div>
              <div className="p-2 rounded bg-black/55 border border-white/10 text-center">
                <span className="text-zinc-400 block text-[10px]">y = sinθ sinφ</span>
                <span className="text-purple-300 font-bold">{y.toFixed(3)}</span>
              </div>
              <div className="p-2 rounded bg-black/55 border border-white/10 text-center">
                <span className="text-zinc-400 block text-[10px]">z = cosθ</span>
                <span className="text-indigo-300 font-bold">{z.toFixed(3)}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black/55 border border-white/10 flex justify-between">
              <span className="text-zinc-400">{copy.measurementProbabilities}:</span>
              <span className="text-zinc-200">
                P(0)={(prob0 * 100).toFixed(1)}% | P(1)={(prob1 * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
