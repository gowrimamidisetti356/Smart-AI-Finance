import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  PiggyBank,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import AddGoalModal from './AddGoalModal';
import ContributeGoalModal from './ContributeGoalModal';
import { useCurrency } from '../../context/CurrencyContext';

export default function GoalsView({
  goals = [],
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal
}) {
  const { formatCurrency } = useCurrency();
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contributeTargetGoal, setContributeTargetGoal] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Overall Goal metrics
  const { totalTarget, totalSaved, completedCount } = useMemo(() => {
    let targetSum = 0;
    let savedSum = 0;
    let completed = 0;

    goals.forEach((g) => {
      const target = parseFloat(g.target_amount || g.target || 0);
      const saved = parseFloat(g.current_amount || g.saved || 0);
      targetSum += target;
      savedSum += saved;
      if (g.status === 'completed' || (target > 0 && saved >= target)) {
        completed += 1;
      }
    });

    return { totalTarget: targetSum, totalSaved: savedSum, completedCount: completed };
  }, [goals]);

  // Filtered Goals list
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      const target = parseFloat(g.target_amount || g.target || 0);
      const saved = parseFloat(g.current_amount || g.saved || 0);
      const isCompleted = g.status === 'completed' || (target > 0 && saved >= target);

      if (filter === 'active') return !isCompleted;
      if (filter === 'completed') return isCompleted;
      return true;
    });
  }, [goals, filter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Goal Targets</span>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-2">
            {formatCurrency(totalTarget)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Across all planned milestones</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Funds Saved</span>
            <PiggyBank className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold font-display text-emerald-500 mt-2">
            {formatCurrency(totalSaved)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {totalTarget > 0 ? `${((totalSaved / totalTarget) * 100).toFixed(1)}% of total targets reached` : 'No targets set'}
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Milestones Achieved</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <h3 className="text-2xl font-bold font-display text-purple-500 mt-2">
            {completedCount} <span className="text-sm font-normal text-slate-400">/ {goals.length} Goals</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Completed financial goals</p>
        </div>
      </div>

      {/* Control Bar: Filter Tabs & New Goal Trigger */}
      <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs font-semibold">
          {[
            { id: 'all', label: 'All Goals' },
            { id: 'active', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No Goals Found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {filter === 'completed'
              ? 'No completed goals yet. Keep saving toward your targets!'
              : 'Create a savings target to start tracking progress.'}
          </p>
          {filter !== 'completed' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700 transition-all"
            >
              Create First Goal
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => {
            const target = parseFloat(goal.target_amount || goal.target || 0);
            const current = parseFloat(goal.current_amount || goal.saved || 0);
            const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
            const isCompleted = goal.status === 'completed' || (target > 0 && current >= target);

            let daysLeft = 0;
            if (goal.deadline) {
              const diffMs = new Date(goal.deadline).getTime() - new Date().getTime();
              daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
            }

            return (
              <div
                key={goal.id}
                className={`glass-card p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isCompleted ? 'border-emerald-500/40 bg-emerald-500/5' : 'hover:border-indigo-500/40'
                }`}
              >
                <div>
                  {/* Top Row: Title & Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-snug">
                        {goal.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Due {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {isCompleted ? 'Completed' : `${daysLeft} days left`}
                    </span>
                  </div>

                  {/* Amounts & Progress Bar */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-400">Progress</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-bold text-emerald-500">
                        {formatCurrency(current)} saved
                      </span>
                      <span className="text-slate-400 font-medium">
                        Target: {formatCurrency(target)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                  {deleteConfirmId === goal.id ? (
                    <div className="flex items-center gap-2 w-full animate-fadeIn">
                      <span className="text-xs text-rose-500 font-semibold">Delete?</span>
                      <button
                        onClick={() => {
                          onDeleteGoal(goal.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setDeleteConfirmId(goal.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setContributeTargetGoal(goal)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Contribute Funds</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGoal={onAddGoal}
      />

      <ContributeGoalModal
        isOpen={!!contributeTargetGoal}
        goal={contributeTargetGoal}
        onClose={() => setContributeTargetGoal(null)}
        onContribute={onUpdateGoal}
      />
    </div>
  );
}
