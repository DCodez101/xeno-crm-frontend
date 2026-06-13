import { useEffect, useState } from 'react';
import { getSegments, createSegment, previewSegment, deleteSegment, suggestSegment } from '../api';
import { Plus, Trash2, Sparkles, Users, ChevronDown, ChevronUp } from 'lucide-react';

const FIELDS = [
  { value: 'totalSpend',  label: 'Total Spend (₹)' },
  { value: 'orderCount',  label: 'Order Count' },
  { value: 'lastOrderAt', label: 'Last Order' },
  { value: 'city',        label: 'City' },
  { value: 'tags',        label: 'Tags' },
];

const OPERATORS = {
  totalSpend:  [{ v: 'gt', l: '>' }, { v: 'gte', l: '≥' }, { v: 'lt', l: '<' }, { v: 'lte', l: '≤' }],
  orderCount:  [{ v: 'gt', l: '>' }, { v: 'gte', l: '≥' }, { v: 'lt', l: '<' }, { v: 'lte', l: '≤' }],
  lastOrderAt: [{ v: 'days_ago_gt', l: 'inactive > N days' }, { v: 'days_ago_lt', l: 'active within N days' }],
  city:        [{ v: 'eq', l: 'is' }, { v: 'contains', l: 'contains' }],
  tags:        [{ v: 'in', l: 'includes' }, { v: 'not_in', l: 'excludes' }],
};

const emptyRule = () => ({ field: 'totalSpend', operator: 'gt', value: '' });

export default function Segments() {
  const [segments, setSegments]           = useState([]);
  const [showForm, setShowForm]           = useState(false);
  const [name, setName]                   = useState('');
  const [description, setDescription]    = useState('');
  const [rules, setRules]                 = useState([emptyRule()]);
  const [logic, setLogic]                 = useState('AND');
  const [preview, setPreview]             = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving]               = useState(false);
  const [aiInput, setAiInput]             = useState('');
  const [aiLoading, setAiLoading]         = useState(false);
  const [expandedId, setExpandedId]       = useState(null);

  const load = () => getSegments().then(r => setSegments(r.data));
  useEffect(() => { load(); }, []);

  const addRule    = () => setRules(r => [...r, emptyRule()]);
  const removeRule = (i) => setRules(r => r.filter((_, idx) => idx !== i));
  const updateRule = (i, key, val) => setRules(r => r.map((rule, idx) => idx === i ? { ...rule, [key]: val } : rule));
  const handleFieldChange = (i, field) => {
    const op = OPERATORS[field]?.[0]?.v || 'eq';
    setRules(r => r.map((rule, idx) => idx === i ? { field, operator: op, value: '' } : rule));
  };

  const handlePreview = async () => {
    if (!rules.every(r => r.value !== '')) return;
    setPreviewLoading(true);
    try {
      const res = await previewSegment({ rules, logic });
      setPreview(res.data);
    } catch (e) { alert(e.response?.data?.error || 'Preview failed'); }
    finally { setPreviewLoading(false); }
  };

  const handleSave = async () => {
    if (!name || !rules.length) return;
    setSaving(true);
    try {
      await createSegment({ name, description, rules, logic });
      setShowForm(false);
      setName(''); setDescription(''); setRules([emptyRule()]); setPreview(null);
      load();
    } catch (e) { alert(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleAI = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    try {
      const res = await suggestSegment(aiInput);
      setName(res.data.name || '');
      setDescription(res.data.description || '');
      setRules(res.data.rules || [emptyRule()]);
      setLogic(res.data.logic || 'AND');
      setShowForm(true);
    } catch { alert('AI suggestion failed. Check your Groq key.'); }
    finally { setAiLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this segment?')) return;
    await deleteSegment(id);
    load();
  };

  return (
    <div className="p-8 max-w-4xl">

      {/* Header */}
      <div className="flex items-end justify-between mb-7">
        <div>
          <p className="page-eyebrow">Audiences</p>
          <h1 className="page-title">Segments</h1>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setShowForm(v => !v)}
        >
          <Plus size={14} /> New Segment
        </button>
      </div>

      {/* AI Builder */}
      <div className="mb-5 card p-4" style={{borderColor:'#E8622A22', background:'#FDF1EB'}}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={13} className="text-fire" />
          <span className="text-[11px] font-medium text-fire uppercase tracking-[0.1em]">
            AI Segment Builder
          </span>
        </div>
        <div className="flex gap-2">
          <input
            className="input flex-1 text-[13px] bg-white"
            placeholder="e.g. high-value customers who haven't bought in 30 days"
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAI()}
          />
          <button
            className="btn-primary flex items-center gap-2 whitespace-nowrap text-[12px]"
            onClick={handleAI}
            disabled={aiLoading}
          >
            <Sparkles size={12} />
            {aiLoading ? 'Thinking…' : 'Suggest rules'}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card p-5 mb-5">
          <p className="section-label mb-4">Define Segment</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="section-label mb-1.5 block">Segment Name *</label>
              <input className="input" placeholder="e.g. Lapsed VIPs" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="section-label mb-1.5 block">Description</label>
              <input className="input" placeholder="Optional description" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>

          {/* Logic toggle */}
          <div className="flex items-center gap-2 mb-3 text-[12px]">
            <span className="text-muted">Match</span>
            {['AND', 'OR'].map(l => (
              <button
                key={l}
                onClick={() => setLogic(l)}
                className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                  logic === l
                    ? 'bg-fire text-white'
                    : 'bg-stone text-muted hover:bg-stone/80'
                }`}
              >
                {l}
              </button>
            ))}
            <span className="text-muted">of the following rules</span>
          </div>

          {/* Rules */}
          <div className="space-y-2 mb-4">
            {rules.map((rule, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select className="input w-40 text-[12px]" value={rule.field} onChange={e => handleFieldChange(i, e.target.value)}>
                  {FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <select className="input w-44 text-[12px]" value={rule.operator} onChange={e => updateRule(i, 'operator', e.target.value)}>
                  {(OPERATORS[rule.field] || []).map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
                <input
                  className="input w-28 text-[12px]"
                  placeholder="value"
                  value={rule.value}
                  onChange={e => updateRule(i, 'value', e.target.value)}
                />
                {rules.length > 1 && (
                  <button onClick={() => removeRule(i)} className="text-muted hover:text-danger transition-colors">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="btn-secondary flex items-center gap-1 text-[12px]"
              onClick={addRule}
            >
              <Plus size={12} /> Add rule
            </button>
            <button
              className="btn-secondary text-[12px]"
              onClick={handlePreview}
              disabled={previewLoading}
            >
              {previewLoading ? 'Counting…' : 'Preview audience'}
            </button>
            {preview && (
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-fire">
                <Users size={13} />
                <span style={{fontFamily:'Syne,sans-serif'}} className="font-700">
                  {preview.count}
                </span> customers match
              </span>
            )}
            <div className="ml-auto flex gap-2">
              <button className="btn-secondary text-[12px]" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button
                className="btn-primary text-[12px]"
                onClick={handleSave}
                disabled={saving || !name}
              >
                {saving ? 'Saving…' : 'Save Segment'}
              </button>
            </div>
          </div>

          {preview?.sample?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone">
              <p className="section-label mb-2">Sample matches</p>
              <div className="flex flex-wrap gap-2">
                {preview.sample.map(c => (
                  <span key={c._id} className="badge bg-stone text-ink/60 text-[11px]">
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Segments list */}
      <div className="space-y-2">
        {segments.length === 0 && (
          <div className="card p-12 text-center text-muted text-[13px]">
            No segments yet. Create one above.
          </div>
        )}
        {segments.map(s => (
          <div key={s._id} className="card">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-fire-light rounded-md flex items-center justify-center shrink-0">
                  <Users size={14} className="text-fire" />
                </div>
                <div>
                  <p className="font-medium text-[13px] text-ink">{s.name}</p>
                  {s.description && (
                    <p className="text-[11px] text-muted mt-0.5">{s.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  style={{fontFamily:'Syne,sans-serif'}}
                  className="text-fire font-700 text-[15px]"
                >
                  {s.audienceCount}
                  <span className="text-[11px] font-400 text-muted ml-1">customers</span>
                </span>
                <button
                  onClick={() => setExpandedId(expandedId === s._id ? null : s._id)}
                  className="text-muted hover:text-ink transition-colors"
                >
                  {expandedId === s._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="text-muted hover:text-danger transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            {expandedId === s._id && (
              <div className="px-5 pb-4 border-t border-stone/50">
                <div className="flex flex-wrap gap-2 mt-3">
                  {s.rules.map((r, i) => (
                    <span key={i} className="badge bg-fire-light text-fire font-mono text-[10px]">
                      {r.field} {r.operator} {r.value}
                    </span>
                  ))}
                  <span className="badge bg-stone text-muted text-[10px]">{s.logic}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
