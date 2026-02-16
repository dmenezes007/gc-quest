"use client";

import { useState } from 'react';
import { createKnowledgeWithNotifications } from '@/modules/knowledge';

type KnowledgeTypeInput = 'ARTICLE' | 'GUIDE' | 'VIDEO' | 'TEMPLATE' | 'POLICY' | 'FAQ';
type CriticalityInput = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface RegisterFormState {
  title: string;
  category: KnowledgeTypeInput;
  description: string;
  criticality: CriticalityInput;
  scope: 'Individual' | 'Team' | 'Organization';
  tags: string;
}

const initialForm: RegisterFormState = {
  title: '',
  category: 'GUIDE',
  description: '',
  criticality: 'MEDIUM',
  scope: 'Individual',
  tags: 'CRM, Negotiation, B2B',
};

export default function KnowledgePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<RegisterFormState>(initialForm);

  function updateField<Key extends keyof RegisterFormState>(key: Key, value: RegisterFormState[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function openModal() {
    setSubmitError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setForm(initialForm);
    setSubmitError(null);
  }

  async function handlePublish() {
    setSubmitError(null);

    if (form.title.trim().length < 3) {
      setSubmitError('Informe um título com pelo menos 3 caracteres.');
      return;
    }

    if (form.description.trim().length < 10) {
      setSubmitError('Informe uma descrição com pelo menos 10 caracteres.');
      return;
    }

    const tags = form.tags
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    try {
      setIsSubmitting(true);

      await createKnowledgeWithNotifications({
        title: form.title,
        content: form.description,
        summary: `${form.scope} scope`,
        type: form.category,
        criticality: form.criticality,
        tags,
      });

      closeModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível publicar o conhecimento.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="kq-heading text-4xl font-extrabold text-slate-100">Knowledge Base</h1>
          <p className="mt-1 text-sm text-slate-400">Map, share and evolve organizational wisdom.</p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="kq-heading rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-5 py-2 text-sm font-bold text-cyan-200"
        >
          + Register Knowledge
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="kq-panel p-4">
          <div className="flex items-center justify-between text-[10px] uppercase">
            <span className="rounded bg-rose-500/20 px-2 py-0.5 text-rose-300">Critical</span>
            <span className="text-slate-500">Processos</span>
          </div>
          <h2 className="mt-3 text-3xl leading-tight font-semibold text-slate-100">Customer Success Onboarding Flow v2</h2>
          <p className="mt-2 text-sm text-slate-400">Updated steps for new enterprise clients after the 2024 CRM migration.</p>
          <p className="mt-4 text-xs font-semibold text-cyan-300">+400 XP • Validated</p>
        </article>

        <article className="kq-panel p-4">
          <div className="flex items-center justify-between text-[10px] uppercase">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300">Essential</span>
            <span className="text-slate-500">Tecnologia</span>
          </div>
          <h2 className="mt-3 text-3xl leading-tight font-semibold text-slate-100">Kubernetes Autoscaling Best Practices</h2>
          <p className="mt-2 text-sm text-slate-400">Guidelines for setting up HPA and VPA in production clusters.</p>
          <p className="mt-4 text-xs font-semibold text-cyan-300">+200 XP • Validate</p>
        </article>

        <article className="kq-panel p-4">
          <div className="flex items-center justify-between text-[10px] uppercase">
            <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-cyan-300">Normal</span>
            <span className="text-slate-500">Soft Skills</span>
          </div>
          <h2 className="mt-3 text-3xl leading-tight font-semibold text-slate-100">Remote Feedback Framework</h2>
          <p className="mt-2 text-sm text-slate-400">A set of soft skills for giving empathetic and direct feedback.</p>
          <p className="mt-4 text-xs font-semibold text-cyan-300">+100 XP • Validate</p>
        </article>
      </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02061b]/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[420px] rounded-2xl border border-[#20335e] bg-[#101a35] p-5 shadow-2xl shadow-cyan-950/20">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="kq-heading text-2xl font-bold text-slate-100">Register Knowledge</h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-500 transition hover:text-slate-300"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="kq-heading text-[10px] text-slate-500">Knowledge title</span>
                  <input
                    value={form.title}
                    onChange={(event) => updateField('title', event.target.value)}
                    placeholder="e.g. Sales Negotiation Tactics"
                    className="w-full rounded-lg border border-[#23365f] bg-[#071127] px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                  />
                </label>

                <label className="space-y-1">
                  <span className="kq-heading text-[10px] text-slate-500">Category</span>
                  <select
                    value={form.category}
                    onChange={(event) => updateField('category', event.target.value as KnowledgeTypeInput)}
                    className="w-full rounded-lg border border-[#23365f] bg-[#071127] px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400/50"
                  >
                    <option value="GUIDE">Guide</option>
                    <option value="ARTICLE">Article</option>
                    <option value="TEMPLATE">Template</option>
                    <option value="POLICY">Policy</option>
                    <option value="FAQ">FAQ</option>
                    <option value="VIDEO">Video</option>
                  </select>
                </label>
              </div>

              <label className="space-y-1">
                <span className="kq-heading text-[10px] text-slate-500">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  rows={4}
                  placeholder="Detail the knowledge..."
                  className="w-full resize-none rounded-lg border border-[#23365f] bg-[#071127] px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                />
              </label>

              <div className="grid grid-cols-3 gap-3">
                <label className="space-y-1">
                  <span className="kq-heading text-[10px] text-slate-500">Criticality</span>
                  <select
                    value={form.criticality}
                    onChange={(event) => updateField('criticality', event.target.value as CriticalityInput)}
                    className="w-full rounded-lg border border-[#23365f] bg-[#071127] px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400/50"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="kq-heading text-[10px] text-slate-500">Scope</span>
                  <select
                    value={form.scope}
                    onChange={(event) => updateField('scope', event.target.value as RegisterFormState['scope'])}
                    className="w-full rounded-lg border border-[#23365f] bg-[#071127] px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400/50"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Team">Team</option>
                    <option value="Organization">Organization</option>
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="kq-heading text-[10px] text-slate-500">Tags</span>
                  <input
                    value={form.tags}
                    onChange={(event) => updateField('tags', event.target.value)}
                    className="w-full rounded-lg border border-[#23365f] bg-[#071127] px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                  />
                </label>
              </div>

              {submitError && <p className="text-sm text-rose-400">{submitError}</p>}

              <div className="mt-1 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 transition hover:bg-[#162449] hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting}
                  className="kq-heading rounded-lg border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-sm font-bold text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish & Earn XP'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
