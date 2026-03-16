/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Mail, 
  Linkedin, 
  AlertCircle,
  Type as TypeIcon,
  FileText,
  X,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface NewsletterResult {
  subjectLine: string;
  intro: string;
  deepDive: string[];
  closingThought: string;
}

export default function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<NewsletterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleClear = () => {
    setInput('');
    setResult(null);
    setError(null);
  };

  const systemInstructions = `
    You are an expert Content Strategist and Ghostwriter. Your task is to transform high-performing, 'hooky' LinkedIn posts into professional, value-driven email newsletters.

    The Rules:
    1. De-LinkedIn: Remove all 'broetry' (excessive one-sentence paragraphs), hashtags, and engagement bait (e.g., 'Agree?', 'Thoughts?').
    2. Tone: Professional, insightful, and concise. Avoid 'AI-isms' like 'In the ever-evolving landscape' or 'In today's fast-paced world.'
    3. Output: You must provide a structured JSON response.

    Structure:
    - Subject Line: A compelling subject line.
    - Intro: An intro that sets the context.
    - Deep Dive: Exactly 3 clear bullet points.
    - Closing Thought: A closing thought that sounds like a human wrote it.
  `;

  const generateNewsletter = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const model = "gemini-3-flash-preview";
      const prompt = `Transform this LinkedIn post into a newsletter following your system instructions:\n\n${input}`;

      const response = await genAI.models.generateContent({
        model: model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction: systemInstructions,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              subjectLine: { type: "string" },
              intro: { type: "string" },
              deepDive: { 
                type: "array", 
                items: { type: "string" },
                minItems: 3,
                maxItems: 3
              },
              closingThought: { type: "string" }
            },
            required: ["subjectLine", "intro", "deepDive", "closingThought"]
          }
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text) as NewsletterResult;
        setResult(parsed);
      } else {
        throw new Error("No response from AI");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate newsletter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    
    const textToCopy = `
Subject: ${result.subjectLine}

${result.intro}

Deep Dive:
${result.deepDive.map(b => `• ${b}`).join('\n')}

${result.closingThought}
    `.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-slate-900 selection:bg-orange-100">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <TypeIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg">Ghostwriter AI</span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded">
            v1.0 Professional
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900">
            LinkedIn to <span className="text-orange-600 italic serif">Newsletter</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl">
            Transform hooky LinkedIn posts into professional, value-driven email newsletters in seconds.
          </p>
        </header>

        <div className="space-y-10">
          {/* Input Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Linkedin className="w-3 h-3" />
                Input: LinkedIn Post
              </label>
              <span className="text-[10px] text-slate-300 font-mono">{input.length} chars</span>
            </div>
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste the 'broetry' here..."
                className="w-full h-64 p-6 rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none outline-none text-slate-700 leading-relaxed text-base"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={generateNewsletter}
                disabled={loading || !input.trim()}
                className="group relative flex-1 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 overflow-hidden shadow-lg shadow-slate-200 disabled:shadow-none"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>AI is working...</span>
                  </div>
                ) : (
                  <>
                    <span>Generate Newsletter</span>
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>

              <button
                onClick={handleClear}
                disabled={loading || !input.trim()}
                className="px-6 py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear input"
              >
                <Trash2 className="w-4 h-4" />
                <span className="sm:hidden lg:inline">Clear</span>
              </button>
            </div>
          </div>

          {/* Error State */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Area */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    Output: Formatted Newsletter
                  </label>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all text-xs font-bold text-slate-600 active:scale-95"
                  >
                    {copied ? (
                      <><Check className="w-3 h-3 text-green-600" /> Copied</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy Text</>
                    )}
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
                  {/* Subject Line */}
                  <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subject Line</p>
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">
                      {result.subjectLine}
                    </h2>
                  </div>

                  {/* Content Body */}
                  <div className="p-8 space-y-8">
                    {/* Intro */}
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 leading-relaxed text-lg">
                        {result.intro}
                      </p>
                    </div>

                    {/* Deep Dive */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-4 h-px bg-orange-500"></span>
                        Deep Dive
                      </h3>
                      <ul className="space-y-4">
                        {result.deepDive.map((point, i) => (
                          <li key={i} className="flex gap-4 group">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:border-orange-100 transition-colors">
                              0{i + 1}
                            </span>
                            <p className="text-slate-600 leading-relaxed">
                              {point}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Closing */}
                    <div className="pt-8 border-t border-slate-50">
                      <p className="text-slate-500 italic leading-relaxed">
                        {result.closingThought}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="max-w-3xl mx-auto px-6 py-20 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-xs font-medium tracking-wide">
          PROFESSIONAL CONTENT STRATEGY ENGINE • POWERED BY GEMINI
        </p>
      </footer>
    </div>
  );
}
