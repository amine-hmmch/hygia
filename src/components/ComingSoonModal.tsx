import React from 'react';
import { X, Sparkles, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';

export interface ComingSoonTopic {
  title: string;
  iconName: string;
  badge: string;
  guideChapter: string;
  description: string;
  keyPoints: string[];
  focusComponentId?: string;
}

interface ComingSoonModalProps {
  topic: ComingSoonTopic | null;
  onClose: () => void;
  onStartAuditWithFocus?: (componentId?: string) => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  topic,
  onClose,
  onStartAuditWithFocus,
}) => {
  if (!topic) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 p-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-700">
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60 mb-1">
              Bientôt disponible
            </span>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              {topic.title}
            </h3>
            <p className="text-xs text-teal-300 font-medium mt-0.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {topic.guideChapter}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            {topic.description}
          </p>

          <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-700/60">
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4" />
              Recommandations officielles (Guide 2021)
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {topic.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold shrink-0">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/40 text-xs text-teal-200">
            <p className="font-medium">
              💡 Le module complet dédié (fiches protocoles interactives et calculateurs) est en cours de déploiement. En attendant, tous les critères d'évaluation de ce domaine sont <strong>pleinement opérationnels</strong> dans le module Check-lists !
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 space-y-2">
          {onStartAuditWithFocus && (
            <button
              onClick={() => {
                onClose();
                onStartAuditWithFocus(topic.focusComponentId);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Évaluer ce domaine dans l'Audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
