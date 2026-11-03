/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Thesis Theoretical Foundations, IEEE Literature Review, & Viva Voce Defense Simulator
 * Author: Monisha (M.E. Communication Systems, Mailam Engineering College / Anna University)
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Award,
  CheckCircle2,
  FileText,
  Search,
} from 'lucide-react';
import {
  ACADEMIC_INFO,
  IEEE_CITATIONS,
  VIVA_QUESTIONS,
  VivaQuestion,
} from '../data/thesisLiterature';

export const ThesisAndDefense: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'viva' | 'math' | 'literature'>('viva');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(1);

  const categories = ['All', 'Information Freshness', 'System Model', 'Fading Channels', 'DRL & MDP', 'Hardware Deployment'];

  const filteredQuestions = VIVA_QUESTIONS.filter((q) => {
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answerSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Thesis Header & Identity Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
              <GraduationCap className="w-4 h-4" />
              <span>Master of Engineering (M.E.) Thesis Defense Platform</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-1">
              {ACADEMIC_INFO.thesisTitle}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-2">
              <span className="text-slate-200 font-semibold">{ACADEMIC_INFO.candidateName}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{ACADEMIC_INFO.specialization}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{ACADEMIC_INFO.department}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{ACADEMIC_INFO.institution}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-cyan-400 font-medium">{ACADEMIC_INFO.university}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Academic Year {ACADEMIC_INFO.academicYear}</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('viva')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'viva'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Viva Voce Defense Simulator ({VIVA_QUESTIONS.length} Questions)</span>
          </button>

          <button
            onClick={() => setActiveTab('math')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'math'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Mathematical Formulations & Derivations</span>
          </button>

          <button
            onClick={() => setActiveTab('literature')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'literature'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>IEEE Literature Survey ({IEEE_CITATIONS.length} Papers)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: VIVA VOCE DEFENSE SIMULATOR */}
      {activeTab === 'viva' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-950'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search defense questions..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Question List Accordion */}
          <div className="space-y-3">
            {filteredQuestions.map((q) => {
              const isExpanded = expandedQuestionId === q.id;
              return (
                <div
                  key={q.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 hover:bg-slate-800/40 cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-cyan-400 font-bold">Q{q.id}.</span>
                        <span className="text-slate-400">[{q.category}]</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                        {q.question}
                      </h4>
                      <div className="text-xs text-slate-400 pt-0.5">
                        <strong className="text-amber-400/90 font-mono text-[11px] uppercase tracking-wider">Examiner Focus:</strong> {q.examinerFocus}
                      </div>
                    </div>
                    <div className="text-slate-400 mt-1 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-800/80 bg-slate-950/60 space-y-4">
                      {/* Summary Answer */}
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1 font-semibold">
                          Executive Answer (for oral presentation):
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">
                          {q.answerSummary}
                        </p>
                      </div>

                      {/* Detailed Mathematical Derivation */}
                      <div>
                        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
                          Rigorous Mathematical Derivation & Proof:
                        </div>
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                          {q.detailedDerivation}
                        </div>
                      </div>

                      {/* Authoritative Citations to Mention */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                        <span className="text-slate-400">Key IEEE References:</span>
                        {q.keyCitations.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800 text-[11px]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MATHEMATICAL FORMULATIONS */}
      {activeTab === 'math' && (
        <div className="space-y-5">
          {/* Formulation 1: AoI Dynamics */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-cyan-400 font-mono uppercase tracking-wider">
              1. Discrete-Time Age-of-Information (AoI) Dynamics
            </h3>
            <div className="mt-3 p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed space-y-2">
              <p>
                Let <span className="text-cyan-300 font-bold">t ∈ {`{0, 1, 2, ...}`}</span> denote the discrete time slot index. The instantaneous Age of Information (AoI) for sensor node <span className="text-cyan-300 font-bold">i ∈ {`{1, ..., N}`}</span> at time slot t is defined as:
              </p>
              <div className="py-2 text-center text-sm font-bold text-amber-300 bg-slate-900/60 rounded border border-slate-800">
                Δ_i(t) = t - U_i(t)
              </div>
              <p>
                where <span className="text-cyan-300">U_i(t)</span> is the generation timestamp of the freshest packet received by the central sink from node i up to slot t.
              </p>
              <p className="pt-1">
                The piecewise linear state evolution under single-packet transmission is:
              </p>
              <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-[11px] leading-loose">
                • If node i is successfully scheduled and delivers packet generated at G_i(t):<br />
                &nbsp;&nbsp;<strong className="text-emerald-400">Δ_i(t+1) = (t + 1) - G_i(t)</strong><br />
                • If node i is unscheduled, idle, or wireless transmission drops due to fading:<br />
                &nbsp;&nbsp;<strong className="text-rose-400">Δ_i(t+1) = Δ_i(t) + 1</strong>
              </div>
            </div>
          </div>

          {/* Formulation 2: Gilbert-Elliott Channel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-cyan-400 font-mono uppercase tracking-wider">
              2. Gilbert-Elliott 2-State Markov Fading Channel
            </h3>
            <div className="mt-3 p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed space-y-2">
              <p>
                Each sensor link transitions between two channel states: State 0 (Good Channel, PER = 0.05) and State 1 (Bad / Deep Fade, PER = 0.65).
              </p>
              <div className="py-2 text-center text-sm font-bold text-amber-300 bg-slate-900/60 rounded border border-slate-800">
                P = [ [ 1 - p, p ], [ q, 1 - q ] ] = [ [ 0.80, 0.20 ], [ 0.40, 0.60 ] ]
              </div>
              <p>
                where <span className="text-cyan-300">p = P(Good → Bad) = 0.20</span> and <span className="text-cyan-300">q = P(Bad → Good) = 0.40</span>.
              </p>
              <p className="pt-1">
                Solving the stationary distribution <span className="text-slate-300">π P = π</span> yields:
              </p>
              <div className="p-2 bg-slate-900/60 rounded border border-slate-800 text-[11px]">
                π_Good = q / (p + q) = 0.40 / 0.60 = <strong className="text-emerald-400">66.67%</strong><br />
                π_Bad = p / (p + q) = 0.20 / 0.60 = <strong className="text-rose-400">33.33%</strong>
              </div>
            </div>
          </div>

          {/* Formulation 3: Multi-Objective Reward & Energy */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-cyan-400 font-mono uppercase tracking-wider">
              3. Multi-Objective MDP Reward Formulation
            </h3>
            <div className="mt-3 p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed space-y-2">
              <p>
                The DRL agent optimizes the infinite-horizon discounted reward:
              </p>
              <div className="py-2 text-center text-sm font-bold text-rose-400 bg-slate-900/60 rounded border border-slate-800">
                {"R(s_t, a_t) = - [ ∑_{i=1}^N w_i Δ_i(t) + β · E_{total}(t) + ζ · 1_{Tx Failure} ]"}
              </div>
              <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-[11px] space-y-1">
                <div>• Priority weights: <strong className="text-cyan-300">w = [1.2, 1.0, 0.8]</strong> (DHT22 &gt; HC-SR04 &gt; LDR)</div>
                <div>• Energy penalty weight: <strong className="text-amber-300">β = 0.15</strong></div>
                <div>• Transmission failure penalty: <strong className="text-rose-400">ζ = 5.0</strong></div>
                <div>• Transmission Energy: <strong className="text-slate-200">E_tx = 15.0 mJ</strong> | Idle Energy: <strong className="text-slate-200">E_idle = 0.5 mJ</strong></div>
                <div>• Initial Battery: <strong className="text-slate-200">B_i(0) = 1000.0 mJ</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IEEE LITERATURE SURVEY */}
      {activeTab === 'literature' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-slate-100">Academic Literature Context:</span> Grounded strictly in peer-reviewed IEEE Transactions and INFOCOM publications establishing Age of Information, LCFS replacement queuing theory, and deep reinforcement learning in wireless fading channels.
          </div>

          <div className="space-y-3">
            {IEEE_CITATIONS.map((paper) => (
              <div
                key={paper.key}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 hover:text-cyan-400 transition-colors">
                      {paper.title}
                    </h4>
                    <div className="text-xs text-slate-400 mt-1">
                      {paper.authors}
                    </div>
                    <div className="text-xs font-mono text-cyan-400 mt-1">
                      {paper.journal}, {paper.volume}, {paper.year}
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono text-[11px] shrink-0 self-start">
                    DOI: {paper.doi}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-slate-400 font-mono text-[11px] uppercase">Thesis Relevance:</strong> {paper.relevance}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
