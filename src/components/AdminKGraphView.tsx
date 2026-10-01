import React, { useState, useEffect } from 'react';
import {
  Network,
  Play,
  Plus,
  Search,
  Users,
  Terminal,
  Sparkles,
  Clock,
  Activity,
  RefreshCw,
  Cpu,
  Trash2,
  X
} from 'lucide-react';
import { KGraphNode, KGraphEdge, RunbookConfig, UserProfile } from '../types';
import { kgraphApi } from '../services/kgraphApi';

interface AdminKGraphViewProps {
  theme?: 'dark' | 'light';
  nodes: KGraphNode[];
  setNodes: React.Dispatch<React.SetStateAction<KGraphNode[]>>;
  edges: KGraphEdge[];
  setEdges: React.Dispatch<React.SetStateAction<KGraphEdge[]>>;
  runbooks: RunbookConfig[];
  setRunbooks: React.Dispatch<React.SetStateAction<RunbookConfig[]>>;
  profiles: UserProfile[];
}

const DEFAULT_LLM_TOPICS = [
  "Planets and their Own Signs (Lordships)",
  "Planets and their Exaltation (Ucha) and Debilitation (Neecha) signs",
  "Permanent Friendship, Enmity, and Neutral relationships between the 9 planets",
  "The 27 Nakshatras and their ruling planets"
];

export const AdminKGraphView: React.FC<AdminKGraphViewProps> = ({
  theme = 'dark',
  nodes,
  setNodes,
  edges,
  setEdges,
  runbooks,
  setRunbooks,
  profiles,
}) => {
  const isDark = theme === 'dark';
  const cardBg = isDark ? '#141418' : '#FFFFFF';
  const subCardBg = isDark ? '#1A1A1E' : '#FFFFFF';
  const innerBg = isDark ? '#08080A' : '#F9F7F1';
  const borderCol = isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]';
  const textMain = isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]';
  const textMuted = isDark ? 'text-[#9E9A90]' : 'text-gray-700';

  const [activeTab, setActiveTab] = useState<'graph' | 'runbooks' | 'llm_extractor' | 'users' | 'telemetry'>('graph');
  const [selectedNode, setSelectedNode] = useState<KGraphNode | null>(nodes[0] || null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // LLM Knowledge Extractor State
  const [isLLMModalOpen, setIsLLMModalOpen] = useState(false);
  const [llmTopics, setLlmTopics] = useState<string[]>(DEFAULT_LLM_TOPICS);
  const [newCustomTopic, setNewCustomTopic] = useState('');
  const [isGeneratingLLM, setIsGeneratingLLM] = useState(false);
  const [llmMessage, setLlmMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStats, setDbStats] = useState<{ nodes: number; relationships: number; active_profiles: number } | null>(null);

  // Runbook execution state
  const [executingRunbookId, setExecutingRunbookId] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([
    '[INIT] Knowledge Graph Engine v2.5 initialized.',
    `[INFO] Loaded ${nodes.length} core ontology nodes and ${edges.length} astrological relationships.`,
    '[READY] LLM Knowledge Extractor Pipeline endpoint active: /api/knowledge/generate-from-llm'
  ]);

  // New Runbook modal
  const [isAddingRunbook, setIsAddingRunbook] = useState(false);
  const [newRunbookTitle, setNewRunbookTitle] = useState('');
  const [newRunbookDesc, setNewRunbookDesc] = useState('');
  const [newRunbookType, setNewRunbookType] = useState<RunbookConfig['type']>('user_session_ingestion');

  // Fetch real MySQL Knowledge Graph Nodes & Stats on mount
  const fetchKnowledgeGraphFromDB = async () => {
    setIsSyncing(true);
    try {
      const [nodesData, statsData] = await Promise.all([
        kgraphApi.getNodes().catch(() => null),
        kgraphApi.getStats().catch(() => null),
      ]);

      if (nodesData && Array.isArray(nodesData.nodes) && nodesData.nodes.length > 0) {
        const dbNodes: KGraphNode[] = nodesData.nodes.map((n: any) => ({
          id: n.id,
          label: n.title,
          category: (n.type || 'other').toLowerCase(),
          sanskritName: n.title_native,
          description: n.description || 'Vedic ontology node.',
          properties: n.properties || {},
          sanskritSutra: n.properties?.sanskrit_sutra || ''
        }));

        const dbEdges: KGraphEdge[] = [];
        nodesData.nodes.forEach((n: any) => {
          if (Array.isArray(n.relationships)) {
            n.relationships.forEach((rel: any, idx: number) => {
              dbEdges.push({
                id: `rel-${n.id}-${rel.target}-${idx}`,
                source: n.id,
                target: rel.target,
                relation: rel.label,
                weight: 1
              });
            });
          }
        });

        setNodes(dbNodes);
        setEdges(dbEdges);
        if (!selectedNode && dbNodes.length > 0) {
          setSelectedNode(dbNodes[0]);
        }

        setExecutionLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [SYNC] Successfully loaded ${dbNodes.length} nodes & ${dbEdges.length} relationships from MySQL database.`
        ]);
      }

      if (statsData) {
        setDbStats(statsData);
      }
    } catch (e: any) {
      console.warn('Backend sync note:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeGraphFromDB();
  }, []);

  // Trigger LLM Direct Knowledge Generation (/api/knowledge/generate-from-llm)
  const handleGenerateFromLLM = async () => {
    if (llmTopics.length === 0) return;
    setIsGeneratingLLM(true);
    setLlmMessage(null);
    const timeStr = new Date().toLocaleTimeString();
    
    setExecutionLogs(prev => [
      ...prev,
      `[${timeStr}] [LLM PIPELINE] Dispatched request to /api/knowledge/generate-from-llm`,
      ...llmTopics.map((t, idx) => `  [Topic ${idx + 1}] "${t}"`)
    ]);

    try {
      const data = await kgraphApi.generateFromLlm(llmTopics);
      if (data && data.message) {
        setLlmMessage(`✅ ${data.message}`);
        setExecutionLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [LLM SUCCESS] ${data.message}`,
          `[INFO] Background extraction running. Fact entities and relationships are being stored in MySQL.`
        ]);

        setTimeout(() => {
          fetchKnowledgeGraphFromDB();
        }, 5000);
        setTimeout(() => {
          fetchKnowledgeGraphFromDB();
        }, 12000);
      } else {
        setLlmMessage(`❌ Failed to start generation`);
      }
    } catch (err: any) {
      setLlmMessage(`❌ ${err?.message || 'Error executing LLM generation pipeline'}`);
      setExecutionLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [ERROR] LLM generation call failed: ${err?.message}`
      ]);
    } finally {
      setIsGeneratingLLM(false);
    }
  };

  const handleAddTopic = () => {
    if (!newCustomTopic.trim()) return;
    if (!llmTopics.includes(newCustomTopic.trim())) {
      setLlmTopics(prev => [...prev, newCustomTopic.trim()]);
    }
    setNewCustomTopic('');
  };

  const handleRemoveTopic = (indexToRemove: number) => {
    setLlmTopics(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Filtered nodes
  const filteredNodes = nodes.filter((n) => {
    const matchCat = categoryFilter === 'all' || n.category === categoryFilter;
    const matchSearch =
      searchQuery === '' ||
      n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.sanskritName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleExecuteRunbook = async (runbook: RunbookConfig) => {
    setExecutingRunbookId(runbook.id);
    const logTimestamp = new Date().toLocaleTimeString();
    setExecutionLogs((prev) => [
      ...prev,
      `[${logTimestamp}] STARTING Runbook: "${runbook.name}" (Type: ${runbook.type})...`,
    ]);

    try {
      const res = await fetch('/api/admin/runbooks/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runbookId: runbook.id,
          runbookType: runbook.type,
        }),
      });
      const data = await res.json();

      if (data.newNodes && data.newNodes.length > 0) {
        setNodes((prev) => [...prev, ...data.newNodes]);
      }
      if (data.newEdges && data.newEdges.length > 0) {
        setEdges((prev) => [...prev, ...data.newEdges]);
      }

      setRunbooks((prev) =>
        prev.map((r) =>
          r.id === runbook.id
            ? {
                ...r,
                lastRun: new Date().toISOString(),
                entitiesExtracted: r.entitiesExtracted + (data.entitiesCount || 5),
                status: 'idle',
              }
            : r
        )
      );

      setExecutionLogs((prev) => [
        ...prev,
        `[${logTimestamp}] SUCCESS: Extracted ${data.entitiesCount || 5} nodes & mapped new relationships into K-Graph.`,
      ]);
    } catch (e) {
      console.error(e);
      setExecutionLogs((prev) => [
        ...prev,
        `[${logTimestamp}] ERROR during runbook execution: ${e}`,
      ]);
    } finally {
      setExecutingRunbookId(null);
    }
  };

  const handleCreateRunbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRunbookTitle.trim()) return;

    const newR: RunbookConfig = {
      id: `rb-${Date.now()}`,
      name: newRunbookTitle.trim(),
      description: newRunbookDesc.trim() || 'Ingests domain corpora into Jyotish ontology.',
      type: newRunbookType,
      targetNodes: ['graha', 'bhava', 'yoga'],
      lastRun: 'Never',
      entitiesExtracted: 0,
      status: 'idle',
    };

    setRunbooks((prev) => [...prev, newR]);
    setIsAddingRunbook(false);
    setNewRunbookTitle('');
    setNewRunbookDesc('');
    setExecutionLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Registered new Runbook pipeline: "${newR.name}".`,
    ]);
  };

  const getNodeColor = (category: string) => {
    if (!isDark) {
      switch (category) {
        case 'planet':
        case 'graha':
          return 'bg-amber-50 text-amber-950 border-amber-300';
        case 'sign':
        case 'rashi':
          return 'bg-orange-50 text-orange-950 border-orange-300';
        case 'nakshatra':
          return 'bg-purple-50 text-purple-950 border-purple-300';
        case 'house':
        case 'bhava':
          return 'bg-blue-50 text-blue-950 border-blue-300';
        case 'yoga':
          return 'bg-emerald-50 text-emerald-950 border-emerald-300';
        case 'dosha':
          return 'bg-rose-50 text-rose-950 border-rose-300';
        case 'treatise':
          return 'bg-[#FBF6EC] text-[#6A4E17] border-[#C9A050]/50';
        default:
          return 'bg-white text-gray-950 border-gray-300';
      }
    }
    switch (category) {
      case 'planet':
      case 'graha':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'sign':
      case 'rashi':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/40';
      case 'nakshatra':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/40';
      case 'house':
      case 'bhava':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/40';
      case 'yoga':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      case 'dosha':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
      case 'treatise':
        return 'bg-[#C9A050]/15 text-[#C9A050] border-[#C9A050]/40';
      default:
        return 'bg-[#1A1A1E] text-[#9E9A90] border-[#2A2A2E]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div 
        style={{ backgroundColor: cardBg }}
        className={`border-2 ${borderCol} rounded-2xl p-6 shadow-xl relative z-10`}
      >
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b ${isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
          <div>
            <div className="flex items-center space-x-2 text-xs font-sans font-bold tracking-widest text-[#C9A050] uppercase mb-1">
              <Network className="w-4 h-4" />
              <span>Administrative Knowledge Graph &amp; Astrological Pipelines</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-serif font-bold ${textMain}`}>
              Vedic Knowledge Graph &amp; Pure Astrological Extractor
            </h1>
            <p className={`text-xs font-sans ${textMuted} mt-1 leading-relaxed max-w-3xl font-medium`}>
              Extract astrological nodes, lordship rules, and planetary relationships directly from LLM or classical texts into the MySQL Knowledge Graph.
            </p>
          </div>

          {/* Action Buttons & Counters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 font-sans">
            <button
              onClick={() => setIsLLMModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#A37B2F] hover:from-[#D4AF37] hover:to-[#B58B35] text-[#0D0D0F] font-bold text-xs shadow-lg shadow-[#C9A050]/20 flex items-center justify-center space-x-2 transition cursor-pointer hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-[#0D0D0F]" />
              <span>✨ Generate via LLM</span>
            </button>

            <button
              onClick={fetchKnowledgeGraphFromDB}
              disabled={isSyncing}
              style={{ backgroundColor: subCardBg }}
              className={`px-3 py-2.5 rounded-xl text-[#C9A050] border ${borderCol} font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-50 shadow-sm`}
              title="Sync fresh data from MySQL database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync DB'}</span>
            </button>

            <div className="flex items-center space-x-2">
              <div 
                style={{ backgroundColor: subCardBg }}
                className={`border ${borderCol} px-3.5 py-1.5 rounded-xl text-center min-w-[70px] shadow-sm`}
              >
                <div className={`text-[9px] ${textMuted} uppercase font-bold tracking-wider`}>Nodes</div>
                <div className="text-base font-serif font-bold text-[#C9A050]">
                  {dbStats?.nodes ?? nodes.length}
                </div>
              </div>
              <div 
                style={{ backgroundColor: subCardBg }}
                className={`border ${borderCol} px-3.5 py-1.5 rounded-xl text-center min-w-[70px] shadow-sm`}
              >
                <div className={`text-[9px] ${textMuted} uppercase font-bold tracking-wider`}>Edges</div>
                <div className="text-base font-serif font-bold text-[#C9A050]">
                  {dbStats?.relationships ?? edges.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex flex-nowrap md:flex-wrap items-center gap-2 pt-4 font-sans overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'graph'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm'
                : isDark
                ? 'bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] border border-[#2A2A2E]'
                : 'bg-white text-gray-800 hover:text-black border border-gray-300'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Interactive Knowledge Graph ({nodes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('llm_extractor')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'llm_extractor'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm'
                : isDark
                ? 'bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] border border-[#2A2A2E]'
                : 'bg-white text-gray-800 hover:text-black border border-gray-300'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>LLM Knowledge Generator</span>
          </button>
          <button
            onClick={() => setActiveTab('runbooks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'runbooks'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm'
                : isDark
                ? 'bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] border border-[#2A2A2E]'
                : 'bg-white text-gray-800 hover:text-black border border-gray-300'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Runbooks Engine ({runbooks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm'
                : isDark
                ? 'bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] border border-[#2A2A2E]'
                : 'bg-white text-gray-800 hover:text-black border border-gray-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Profiles ({profiles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'telemetry'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm'
                : isDark
                ? 'bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] border border-[#2A2A2E]'
                : 'bg-white text-gray-800 hover:text-black border border-gray-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry &amp; Live Terminal</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Knowledge Graph */}
      {activeTab === 'graph' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Node Explorer & Canvas */}
          <div 
            style={{ backgroundColor: cardBg }}
            className={`lg:col-span-8 border-2 ${borderCol} rounded-2xl p-6 shadow-xl space-y-4 font-sans relative z-10`}
          >
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
              <div className="flex items-center space-x-2">
                <Search className={`w-4 h-4 ${textMuted}`} />
                <input
                  type="text"
                  placeholder="Search Sanskrit sutras, grahas, yogas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ backgroundColor: subCardBg }}
                  className={`px-3 py-1.5 rounded-lg text-xs border ${borderCol} focus:outline-none focus:border-[#C9A050] w-64 ${textMain}`}
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-1 text-xs">
                {['all', 'planet', 'house', 'rashi', 'yoga', 'dosha', 'treatise'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-[#C9A050] text-[#0D0D0F]'
                        : isDark
                        ? 'bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] border border-[#2A2A2E]'
                        : 'bg-[#F9F7F1] text-gray-700 hover:text-black border border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Nodes Grid Canvas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[480px] overflow-y-auto p-1 custom-scrollbar">
              {filteredNodes.map((n) => {
                const isSelected = selectedNode?.id === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                      isSelected
                        ? 'bg-[#C9A050]/20 border-[#C9A050] ring-2 ring-[#C9A050]'
                        : `${getNodeColor(n.category)} hover:shadow-md`
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-bold tracking-wider opacity-90">{n.category}</span>
                        {n.sanskritName && <span className="text-[10px] text-[#C9A050] font-serif font-bold">{n.sanskritName}</span>}
                      </div>
                      <h4 className={`text-xs font-serif font-bold mt-1 ${isDark ? 'text-[#F0ECE1]' : 'text-gray-950'}`}>{n.label}</h4>
                    </div>
                    <span className={`text-[10px] mt-2 block font-mono ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                      Connections: {edges.filter((e) => e.source === n.id || e.target === n.id).length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 4 Cols: Active Node Inspector */}
          <div 
            style={{ backgroundColor: cardBg }}
            className={`lg:col-span-4 border-2 ${borderCol} rounded-2xl p-6 shadow-xl space-y-4 relative z-10`}
          >
            {selectedNode ? (
              <div className="space-y-4 font-sans">
                <div className={`pb-3 border-b ${isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold text-[#C9A050] tracking-wider">
                      {selectedNode.category} Node
                    </span>
                    <span className={`text-xs font-mono ${textMuted}`}>{selectedNode.id}</span>
                  </div>
                  <h3 className={`text-base font-serif font-bold mt-1 ${textMain}`}>
                    {selectedNode.label} {selectedNode.sanskritName && `(${selectedNode.sanskritName})`}
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className={`text-[9px] uppercase font-bold ${textMuted} block mb-1 tracking-wider`}>Classical Description</span>
                    <p 
                      style={{ backgroundColor: subCardBg }}
                      className={`p-3 rounded-xl border ${borderCol} leading-relaxed font-medium ${textMain}`}
                    >
                      {selectedNode.description}
                    </p>
                  </div>

                  {selectedNode.sanskritSutra && (
                    <div 
                      style={{ backgroundColor: subCardBg }}
                      className={`p-3 rounded-xl border border-[#C9A050]/50`}
                    >
                      <span className="text-[9px] uppercase font-bold text-[#C9A050] block mb-1 tracking-wider">Original Sanskrit Sutra</span>
                      <p className={`font-serif text-xs leading-relaxed font-medium ${textMain}`}>{selectedNode.sanskritSutra}</p>
                    </div>
                  )}

                  <div>
                    <span className={`text-[9px] uppercase font-bold ${textMuted} block mb-1 tracking-wider`}>Ontological Node Properties</span>
                    <div 
                      style={{ backgroundColor: innerBg }}
                      className={`p-3 rounded-xl border ${borderCol} font-mono text-[11px] space-y-1 ${textMain}`}
                    >
                      {Object.entries(selectedNode.properties || {}).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className={textMuted}>{k}:</span>
                          <span className="text-[#C9A050] font-semibold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Connected Edges */}
                  <div>
                    <span className={`text-[9px] uppercase font-bold ${textMuted} block mb-1 tracking-wider`}>Associated Relationships</span>
                    <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                      {edges
                        .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                        .map((edge) => (
                          <div
                            key={edge.id}
                            style={{ backgroundColor: subCardBg }}
                            className={`p-2 rounded-lg border ${borderCol} flex justify-between text-[11px]`}
                          >
                            <span className="text-[#C9A050] font-bold">{edge.relation}</span>
                            <span className={textMuted}>
                              {edge.source === selectedNode.id ? `→ ${edge.target}` : `← ${edge.source}`}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`text-center py-12 ${textMuted} text-xs font-sans font-medium`}>
                Select a knowledge graph node to inspect ontological sutras.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: LLM Knowledge Generator Studio */}
      {activeTab === 'llm_extractor' && (
        <div className="space-y-6 font-sans">
          <div 
            style={{ backgroundColor: cardBg }}
            className={`border-2 ${borderCol} rounded-2xl p-6 shadow-xl space-y-5 relative z-10`}
          >
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
              <div>
                <div className="flex items-center space-x-2 text-[#C9A050] text-xs font-bold uppercase tracking-wider mb-1">
                  <Cpu className="w-4 h-4" />
                  <span>Direct LLM Knowledge Extractor Pipeline</span>
                </div>
                <h3 className={`text-xl font-serif font-bold ${textMain}`}>
                  Vedic Fact Extraction (No PDFs Required)
                </h3>
                <p className={`text-xs ${textMuted} mt-1 font-medium`}>
                  Query the LLM directly via <code className={`px-1.5 py-0.5 rounded text-[#C9A050] font-mono ${isDark ? 'bg-[#08080A]' : 'bg-[#FAF7F0] border border-[#E5E1D8]'}`}>/api/knowledge/generate-from-llm</code> to automatically populate MySQL nodes and relationships.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleGenerateFromLLM}
                  disabled={isGeneratingLLM || llmTopics.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#8C6B28] hover:from-[#D4AF37] hover:to-[#A37B2F] text-[#0D0D0F] font-bold text-xs shadow-lg shadow-[#C9A050]/25 transition cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isGeneratingLLM ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingLLM ? 'Generating Facts in Background...' : 'Launch LLM Extraction'}</span>
                </button>
              </div>
            </div>

            {/* Status Message Banner */}
            {llmMessage && (
              <div className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between ${
                llmMessage.startsWith('✅') 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}>
                <span>{llmMessage}</span>
                <button 
                  onClick={() => setLlmMessage(null)} 
                  className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Topic Management Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A050]">
                  Active Topics for Extraction ({llmTopics.length})
                </h4>
                <button
                  onClick={() => setLlmTopics(DEFAULT_LLM_TOPICS)}
                  className={`text-[11px] ${textMuted} hover:text-[#C9A050] transition cursor-pointer font-semibold`}
                >
                  Reset Default Topics
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {llmTopics.map((topic, index) => (
                  <div
                    key={index}
                    style={{ backgroundColor: subCardBg }}
                    className={`p-3.5 border ${borderCol} hover:border-[#C9A050]/50 rounded-xl flex items-center justify-between gap-3 text-xs transition shadow-xs`}
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      <span className="w-5 h-5 rounded-full bg-[#C9A050]/20 text-[#C9A050] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className={`font-semibold truncate ${textMain}`}>{topic}</span>
                    </div>

                    <button
                      onClick={() => handleRemoveTopic(index)}
                      className={`${textMuted} hover:text-rose-500 transition p-1 cursor-pointer shrink-0`}
                      title="Remove Topic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Topic Bar */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newCustomTopic}
                  onChange={(e) => setNewCustomTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                  placeholder="Add custom topic (e.g. 'Planetary Yogas for Wealth and Raj Yoga combinations')..."
                  style={{ backgroundColor: subCardBg }}
                  className={`flex-1 border ${borderCol} rounded-xl px-4 py-2.5 text-xs ${textMain} placeholder:text-gray-400 focus:outline-none focus:border-[#C9A050]`}
                />
                <button
                  onClick={handleAddTopic}
                  className="px-4 py-2.5 bg-[#C9A050] text-[#0D0D0F] font-bold text-xs rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-sm hover:bg-[#D4AF37]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Topic</span>
                </button>
              </div>
            </div>

            {/* Pipeline Configuration Specs */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t ${isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'} text-xs`}>
              <div 
                style={{ backgroundColor: innerBg }}
                className={`p-3 rounded-xl border ${borderCol}`}
              >
                <span className={`text-[10px] ${textMuted} uppercase font-bold block mb-1`}>API Target</span>
                <span className="font-mono text-[#C9A050] text-[11px] font-bold">POST /api/knowledge/generate-from-llm</span>
              </div>
              <div 
                style={{ backgroundColor: innerBg }}
                className={`p-3 rounded-xl border ${borderCol}`}
              >
                <span className={`text-[10px] ${textMuted} uppercase font-bold block mb-1`}>Knowledge Source</span>
                <span className={`font-mono ${textMain} text-[11px] font-bold`}>LLM_Internal_Knowledge</span>
              </div>
              <div 
                style={{ backgroundColor: innerBg }}
                className={`p-3 rounded-xl border ${borderCol}`}
              >
                <span className={`text-[10px] ${textMuted} uppercase font-bold block mb-1`}>Execution Mode</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">Background Daemon Thread</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Runbooks Engine */}
      {activeTab === 'runbooks' && (
        <div className="space-y-6 font-sans">
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`text-lg font-serif font-bold ${textMain}`}>Automated Vedic Runbooks</h3>
              <p className={`text-xs ${textMuted} font-medium`}>Execute pipelines to parse Sanskrit treatises or ingest anonymized user queries</p>
            </div>
            <button
              onClick={() => setIsAddingRunbook(true)}
              className="px-3.5 py-2 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs shadow-md cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Runbook</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {runbooks.map((rb) => {
              const isExecuting = executingRunbookId === rb.id;
              return (
                <div
                  key={rb.id}
                  style={{ backgroundColor: cardBg }}
                  className={`border-2 ${borderCol} rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between relative z-10`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <span className="p-2 rounded-xl bg-[#C9A050]/20 text-[#C9A050]">
                          <Play className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className={`text-sm font-serif font-bold ${textMain}`}>{rb.name}</h4>
                          <span className="text-[10px] text-[#C9A050] font-mono font-semibold">{rb.type}</span>
                        </div>
                      </div>
                      <span 
                        style={{ backgroundColor: subCardBg }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${textMuted} border ${borderCol}`}
                      >
                        {rb.entitiesExtracted} Extracted
                      </span>
                    </div>
                    <p className={`text-xs ${textMuted} mt-2.5 leading-relaxed font-medium`}>{rb.description}</p>
                  </div>

                  <div className={`pt-3 border-t ${isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'} flex items-center justify-between`}>
                    <span className={`text-[11px] ${textMuted} flex items-center space-x-1 font-medium`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Last Run: {rb.lastRun}</span>
                    </span>

                    <button
                      onClick={() => handleExecuteRunbook(rb)}
                      disabled={isExecuting}
                      style={{ backgroundColor: subCardBg }}
                      className={`px-3.5 py-1.5 rounded-xl text-[#C9A050] font-bold text-xs border ${borderCol} hover:bg-[#C9A050] hover:text-[#0D0D0F] transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50 shadow-xs`}
                    >
                      <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
                      <span>{isExecuting ? 'Executing Pipeline...' : 'Execute Runbook'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal to Create Runbook */}
          {isAddingRunbook && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div 
                style={{ backgroundColor: cardBg }}
                className={`border-2 ${borderCol} rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-sans`}
              >
                <h3 className={`text-lg font-serif font-bold ${textMain}`}>Create New Knowledge Runbook</h3>
                <form onSubmit={handleCreateRunbook} className="space-y-3 text-xs">
                  <div>
                    <label className={`block ${textMuted} font-bold mb-1`}>Runbook Name</label>
                    <input
                      type="text"
                      required
                      value={newRunbookTitle}
                      onChange={(e) => setNewRunbookTitle(e.target.value)}
                      placeholder="e.g. Bhrigu Samhita Karma Extractor"
                      style={{ backgroundColor: subCardBg }}
                      className={`w-full px-3 py-2 border ${borderCol} rounded-xl ${textMain} focus:outline-none focus:border-[#C9A050]`}
                    />
                  </div>
                  <div>
                    <label className={`block ${textMuted} font-bold mb-1`}>Pipeline Type</label>
                    <select
                      value={newRunbookType}
                      onChange={(e: any) => setNewRunbookType(e.target.value)}
                      style={{ backgroundColor: subCardBg }}
                      className={`w-full px-3 py-2 border ${borderCol} rounded-xl ${textMain} focus:outline-none focus:border-[#C9A050]`}
                    >
                      <option value="text_corpus_ingestion">Classical Text Corpus Ingestion</option>
                      <option value="user_session_ingestion">User Session Query Extractor</option>
                      <option value="ontology_enrichment">Ontology &amp; Edge Enricher</option>
                      <option value="remedy_synthesizer">Remedy Synthesis Pipeline</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block ${textMuted} font-bold mb-1`}>Description</label>
                    <textarea
                      rows={2}
                      value={newRunbookDesc}
                      onChange={(e) => setNewRunbookDesc(e.target.value)}
                      placeholder="e.g. Ingests karmic conjunctions from ancient manuscripts..."
                      style={{ backgroundColor: subCardBg }}
                      className={`w-full px-3 py-2 border ${borderCol} rounded-xl ${textMain} focus:outline-none focus:border-[#C9A050]`}
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingRunbook(false)}
                      style={{ backgroundColor: subCardBg }}
                      className={`px-3.5 py-2 rounded-xl ${textMuted} border ${borderCol} font-semibold`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold shadow-md"
                    >
                      Save Runbook
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: User Profiles & Recorded Data */}
      {activeTab === 'users' && (
        <div 
          style={{ backgroundColor: cardBg }}
          className={`border-2 ${borderCol} rounded-2xl p-6 shadow-xl space-y-4 font-sans relative z-10`}
        >
          <div className={`flex justify-between items-center pb-3 border-b ${isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
            <div>
              <h3 className={`text-lg font-serif font-bold ${textMain}`}>Stored User Birth Charts &amp; Data Records</h3>
              <p className={`text-xs ${textMuted} font-medium`}>All registered profiles with geographic coordinates and consultation preferences</p>
            </div>
            <span className="text-xs text-[#C9A050] font-bold">{profiles.length} Active Records</span>
          </div>

          <div className={`divide-y ${isDark ? 'divide-[#2A2A2E]' : 'divide-[#E5E1D8]'}`}>
            {profiles.map((p) => (
              <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-serif font-bold text-sm ${textMain}`}>{p.fullName}</span>
                    <span 
                      style={{ backgroundColor: subCardBg }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] text-[#C9A050] uppercase font-bold border ${borderCol}`}
                    >
                      {p.gender}
                    </span>
                    {p.isPremium && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40 font-bold">
                        PREMIUM
                      </span>
                    )}
                  </div>
                  <p className={`${textMuted} text-[11px] mt-0.5 font-sans font-medium`}>
                    Born: {p.birthDate} at {p.birthTime} • {p.birthPlace} (Lat: {p.latitude.toFixed(2)}°, Lng: {p.longitude.toFixed(2)}°)
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 sm:justify-end">
                  {p.focusAreas.map((f, i) => (
                    <span 
                      key={i} 
                      style={{ backgroundColor: subCardBg }}
                      className={`px-2 py-0.5 rounded-lg ${textMuted} text-[10px] font-semibold border ${borderCol}`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Telemetry & Live Terminal */}
      {activeTab === 'telemetry' && (
        <div 
          style={{ backgroundColor: cardBg }}
          className={`border-2 ${borderCol} rounded-2xl p-6 shadow-xl space-y-4 font-sans relative z-10`}
        >
          <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-[#C9A050]" />
              <h3 className={`text-sm font-bold ${textMain}`}>Live Execution Terminal &amp; Telemetry</h3>
            </div>
            <button
              onClick={() => setExecutionLogs([])}
              className={`text-[11px] ${textMuted} hover:text-black dark:hover:text-white cursor-pointer font-semibold`}
            >
              Clear Logs
            </button>
          </div>

          <div 
            style={{ backgroundColor: isDark ? '#08080A' : '#141418' }}
            className="p-4 rounded-xl border border-[#2A2A2E] font-mono text-xs text-[#C9A050] space-y-1.5 max-h-96 overflow-y-auto custom-scrollbar"
          >
            {executionLogs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick LLM Generation Modal */}
      {isLLMModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            style={{ backgroundColor: cardBg }}
            className={`border-2 ${borderCol} rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 font-sans animate-in fade-in zoom-in-95 duration-200`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#C9A050]/20 text-[#C9A050]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-lg font-serif font-bold ${textMain}`}>
                    Generate Knowledge via AstroEngine
                  </h3>
                  <span className={`text-[11px] ${textMuted} font-medium`}>
                    Direct extraction into MySQL Knowledge Graph
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsLLMModalOpen(false)}
                style={{ backgroundColor: subCardBg }}
                className={`p-1.5 rounded-lg ${textMuted} hover:text-black dark:hover:text-white cursor-pointer border ${borderCol}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {llmMessage && (
              <div className={`p-3 rounded-xl border text-xs font-medium ${
                llmMessage.startsWith('✅') 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}>
                {llmMessage}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C9A050] uppercase tracking-wider">
                  Select / Review Topics ({llmTopics.length})
                </span>
                <button
                  onClick={() => setLlmTopics(DEFAULT_LLM_TOPICS)}
                  className={`text-[10px] ${textMuted} hover:text-[#C9A050] cursor-pointer font-semibold`}
                >
                  Reset Defaults
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {llmTopics.map((topic, idx) => (
                  <div
                    key={idx}
                    style={{ backgroundColor: subCardBg }}
                    className={`p-2.5 border ${borderCol} rounded-xl flex items-center justify-between text-xs shadow-xs`}
                  >
                    <span className={`font-semibold truncate mr-2 ${textMain}`}>
                      {idx + 1}. {topic}
                    </span>
                    <button
                      onClick={() => handleRemoveTopic(idx)}
                      className={`${textMuted} hover:text-rose-500 p-1 cursor-pointer`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newCustomTopic}
                  onChange={(e) => setNewCustomTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                  placeholder="Add custom topic..."
                  style={{ backgroundColor: subCardBg }}
                  className={`flex-1 border ${borderCol} rounded-xl px-3 py-2 text-xs ${textMain} placeholder:text-gray-400 focus:outline-none focus:border-[#C9A050]`}
                />
                <button
                  onClick={handleAddTopic}
                  className="px-3.5 py-2 bg-[#C9A050] text-[#0D0D0F] text-xs font-bold rounded-xl cursor-pointer shadow-sm hover:bg-[#D4AF37]"
                >
                  Add
                </button>
              </div>
            </div>

            <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
              <button
                onClick={() => setIsLLMModalOpen(false)}
                style={{ backgroundColor: subCardBg }}
                className={`px-4 py-2 rounded-xl ${textMuted} hover:text-black dark:hover:text-white text-xs font-bold cursor-pointer border ${borderCol}`}
              >
                Close
              </button>

              <button
                onClick={handleGenerateFromLLM}
                disabled={isGeneratingLLM || llmTopics.length === 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#8C6B28] hover:from-[#D4AF37] hover:to-[#A37B2F] text-[#0D0D0F] font-bold text-xs shadow-lg shadow-[#C9A050]/30 transition cursor-pointer flex items-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingLLM ? 'animate-spin' : ''}`} />
                <span>{isGeneratingLLM ? 'Generating...' : 'Start Extraction'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
