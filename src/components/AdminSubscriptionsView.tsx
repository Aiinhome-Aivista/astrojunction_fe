import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, CheckCircle, XCircle, Wallet, List } from 'lucide-react';
import { adminApi, SubscriptionPlan } from '../services/adminApi';
import { AdminRevenueView } from './AdminRevenueView';

interface AdminSubscriptionsViewProps {
  theme: 'dark' | 'light';
}

export const AdminSubscriptionsView: React.FC<AdminSubscriptionsViewProps> = ({ theme }) => {
  const [activeSubTab, setActiveSubTab] = useState<'plans' | 'revenue'>('plans');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<SubscriptionPlan> | null>(null);
  const [featuresInput, setFeaturesInput] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSubscriptionPlans();
      setPlans(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentPlan) return;
    
    // Parse features from text area (one per line)
    const features = featuresInput.split('\n').filter(f => f.trim() !== '');
    const payload = { ...currentPlan, features_json: features };

    try {
      if (payload.id && isEditing) {
        await adminApi.updateSubscriptionPlan(payload.id, payload);
      } else {
        await adminApi.createSubscriptionPlan(payload);
      }
      setCurrentPlan(null);
      setIsEditing(false);
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      await adminApi.deleteSubscriptionPlan(id);
      fetchPlans();
    }
  };

  const toggleActive = async (plan: SubscriptionPlan) => {
    try {
      await adminApi.updateSubscriptionPlan(plan.id, { ...plan, is_active: plan.is_active ? 0 : 1 });
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  };

  const openEditor = (plan?: SubscriptionPlan) => {
    if (plan) {
      setCurrentPlan(plan);
      setFeaturesInput(plan.features_json?.join('\n') || '');
      setIsEditing(true);
    } else {
      setCurrentPlan({ is_active: 1, price_inr: 0, price_usd: 0 });
      setFeaturesInput('');
      setIsEditing(false);
    }
  };

  return (
    <div className={`max-w-7xl mx-auto space-y-6 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-gray-900'}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-serif font-bold">Subscription <span className="text-[#C9A050]">Management</span></h2>
          <p className="text-sm opacity-70 mt-1">Manage pricing plans and track user purchases.</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-gray-500/20 mb-6">
        <button
          onClick={() => setActiveSubTab('plans')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeSubTab === 'plans' ? 'border-[#C9A050] text-[#C9A050]' : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          <List className="w-4 h-4" /> Manage Plans
        </button>
        <button
          onClick={() => setActiveSubTab('revenue')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeSubTab === 'revenue' ? 'border-[#C9A050] text-[#C9A050]' : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          <Wallet className="w-4 h-4" /> Revenue Ledger
        </button>
      </div>

      {activeSubTab === 'revenue' ? (
        <AdminRevenueView theme={theme} />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => openEditor()}
              className="px-4 py-2 bg-[#C9A050] text-black font-semibold rounded-lg flex items-center gap-2 hover:bg-[#D4AF37] transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Plan
            </button>
          </div>

          {currentPlan && (
        <div 
          style={{ backgroundColor: theme === 'dark' ? '#141418' : '#FFFFFF' }}
          className={`p-6 rounded-2xl border-2 shadow-xl relative z-10 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}
        >
          <h3 className="text-lg font-bold mb-4">{isEditing ? 'Edit Plan' : 'New Plan'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold mb-1">Plan Code / ID (e.g., VEDIC_99)</label>
              <input 
                type="text" 
                value={currentPlan.id || ''} 
                onChange={e => setCurrentPlan({...currentPlan, id: e.target.value})} 
                disabled={isEditing} 
                style={{ backgroundColor: theme === 'dark' ? '#0D0D0F' : '#FFFFFF' }}
                className={`w-full p-2.5 rounded-xl border-2 ${theme === 'dark' ? 'border-[#2A2A2E] text-white' : 'border-gray-300 text-black'}`} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Plan Type (e.g., VEDIC_SYNTHESIS, MATCHMAKING)</label>
              <input 
                type="text" 
                value={currentPlan.plan_type || ''} 
                onChange={e => setCurrentPlan({...currentPlan, plan_type: e.target.value})} 
                style={{ backgroundColor: theme === 'dark' ? '#0D0D0F' : '#FFFFFF' }}
                className={`w-full p-2.5 rounded-xl border-2 ${theme === 'dark' ? 'border-[#2A2A2E] text-white' : 'border-gray-300 text-black'}`} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Plan Title</label>
              <input 
                type="text" 
                value={currentPlan.plan_name || ''} 
                onChange={e => setCurrentPlan({...currentPlan, plan_name: e.target.value})} 
                style={{ backgroundColor: theme === 'dark' ? '#0D0D0F' : '#FFFFFF' }}
                className={`w-full p-2.5 rounded-xl border-2 ${theme === 'dark' ? 'border-[#2A2A2E] text-white' : 'border-gray-300 text-black'}`} 
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold mb-1">Price (INR)</label>
                <input 
                  type="number" 
                  value={currentPlan.price_inr || ''} 
                  onChange={e => setCurrentPlan({...currentPlan, price_inr: parseFloat(e.target.value)})} 
                  style={{ backgroundColor: theme === 'dark' ? '#0D0D0F' : '#FFFFFF' }}
                  className={`w-full p-2.5 rounded-xl border-2 ${theme === 'dark' ? 'border-[#2A2A2E] text-white' : 'border-gray-300 text-black'}`} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Price (USD)</label>
                <input 
                  type="number" 
                  value={currentPlan.price_usd || ''} 
                  onChange={e => setCurrentPlan({...currentPlan, price_usd: parseFloat(e.target.value)})} 
                  style={{ backgroundColor: theme === 'dark' ? '#0D0D0F' : '#FFFFFF' }}
                  className={`w-full p-2.5 rounded-xl border-2 ${theme === 'dark' ? 'border-[#2A2A2E] text-white' : 'border-gray-300 text-black'}`} 
                />
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-bold mb-1">Subtitle / Description</label>
            <input 
              type="text" 
              value={currentPlan.description || ''} 
              onChange={e => setCurrentPlan({...currentPlan, description: e.target.value})} 
              style={{ backgroundColor: theme === 'dark' ? '#0D0D0F' : '#FFFFFF' }}
              className={`w-full p-2.5 rounded-xl border-2 ${theme === 'dark' ? 'border-[#2A2A2E] text-white' : 'border-gray-300 text-black'}`} 
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold mb-1">Features (One per line)</label>
            <textarea 
              rows={4} 
              value={featuresInput} 
              onChange={e => setFeaturesInput(e.target.value)} 
              style={{ backgroundColor: theme === 'dark' ? '#0D0D0F' : '#FFFFFF' }}
              className={`w-full p-2.5 rounded-xl border-2 ${theme === 'dark' ? 'border-[#2A2A2E] text-white' : 'border-gray-300 text-black'}`} 
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={() => setCurrentPlan(null)} className="px-4 py-2 font-bold opacity-70 hover:opacity-100 cursor-pointer">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2.5 bg-[#C9A050] text-black font-black rounded-xl hover:bg-[#D4AF37] shadow-md cursor-pointer">Save Plan</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-10"><div className="w-8 h-8 border-2 border-[#C9A050] border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {plans.map(plan => (
            <div 
              key={plan.id} 
              style={{ backgroundColor: theme === 'dark' ? '#141418' : '#FFFFFF' }}
              className={`p-6 rounded-2xl border-2 flex flex-col justify-between shadow-lg ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'} ${plan.is_active ? 'border-t-4 border-t-[#C9A050]' : 'opacity-85'}`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-[#C9A050]/20 text-[#C9A050]">{plan.plan_type}</span>
                  <button onClick={() => toggleActive(plan)} className="cursor-pointer">
                    {plan.is_active ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 opacity-50" />}
                  </button>
                </div>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{plan.plan_name}</h3>
                <p className={`text-xs mt-1 mb-4 h-8 overflow-hidden font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{plan.description}</p>
                <div className="text-2xl font-serif text-[#C9A050] font-bold mb-4">
                  ₹{plan.price_inr} <span className="text-sm opacity-60 text-current font-sans font-normal">/ ~${plan.price_usd}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features_json?.slice(0, 3).map((f, i) => (
                    <li key={i} className="text-xs flex gap-2 items-start"><CheckCircle className="w-3 h-3 mt-0.5 text-[#C9A050] shrink-0" /> <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700 font-medium'}>{f}</span></li>
                  ))}
                  {plan.features_json && plan.features_json.length > 3 && (
                    <li className="text-xs opacity-60 italic text-gray-500">+ {plan.features_json.length - 3} more benefits</li>
                  )}
                </ul>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-500/20">
                <button onClick={() => openEditor(plan)} className={`flex-1 py-1.5 flex justify-center items-center gap-2 text-sm rounded cursor-pointer font-bold ${theme === 'dark' ? 'bg-[#1C1C22] text-white hover:bg-[#25252D]' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}><Edit2 className="w-4 h-4" /> Edit</button>
                <button onClick={() => handleDelete(plan.id)} className="flex-1 py-1.5 flex justify-center items-center gap-2 text-sm bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 cursor-pointer font-bold"><Trash2 className="w-4 h-4" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
};
