import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSegments, createCampaign, sendCampaign, draftMessage, getSegmentPreview } from '../api';
import { Sparkles, Send, Users, ArrowRight } from 'lucide-react';

const CHANNELS = ['whatsapp', 'sms', 'email', 'rcs'];
const CHANNEL_META = {
  whatsapp: { label: 'WhatsApp', color: '#25D366' },
  sms:      { label: 'SMS',      color: '#888'    },
  email:    { label: 'Email',    color: '#4285F4' },
  rcs:      { label: 'RCS',      color: '#E8622A' },
};

const STEPS = ['Details', 'Message', 'Review'];

export default function NewCampaign() {
  const navigate = useNavigate();
  const [segments, setSegments]           = useState([]);
  const [name, setName]                   = useState('');
  const [segmentId, setSegmentId]         = useState('');
  const [channel, setChannel]             = useState('whatsapp');
  const [message, setMessage]             = useState('');
  const [audiencePreview, setAudiencePreview] = useState(null);
  const [aiLoading, setAiLoading]         = useState(false);
  const [saving, setSaving]               = useState(false);
  const [step, setStep]                   = useState(1);

  useEffect(() => { getSegments().then(r => setSegments(r.data)); }, []);

  useEffect(() => {
    if (!segmentId) { setAudiencePreview(null); return; }
    getSegmentPreview(segmentId).then(r => setAudiencePreview(r.data)).catch(() => {});
  }, [segmentId]);

  const selectedSegment = segments.find(s => s._id === segmentId);

  const handleDraftAI = async () => {
    if (!selectedSegment) return;
    setAiLoading(true);
    try {
      const res = await draftMessage({
        segmentName: selectedSegment.name,
        segmentDescription: selectedSegment.description,
        channel,
      });
      setMessage(res.data.message);
    } catch { alert('AI drafting failed. Check your Groq key.'); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async (andSend = false) => {
    if (!name || !segmentId || !message) return;
    setSaving(true);
    try {
      const res = await createCampaign({ name, segmentId, message, channel });
      const campaignId = res.data._id;
      if (andSend) await sendCampaign(campaignId);
      navigate(`/campaigns/${campaignId}`);
    } catch (e) { alert(e.response?.data?.error || 'Failed to create campaign'); }
    finally { setSaving(false); }
  };

  const canNext1 = name && segmentId && channel;
  const canNext2 = message.trim().length > 0;

  return (
    <div className="p-8 max-w-2xl">

      {/* Header */}
      <div className="mb-7">
        <p className="page-eyebrow">Create</p>
        <h1 className="page-title">New Campaign</h1>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-7">
        {STEPS.map((label, idx) => {
          const s = idx + 1;
          const active = step === s;
          const done   = step > s;
          return (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium transition-all ${
                    done    ? 'bg-fire text-white'    :
                    active  ? 'bg-ink text-white'     :
                              'bg-stone text-muted'
                  }`}
                  style={active ? {fontFamily:'Syne,sans-serif'} : {}}
                >
                  {done ? '✓' : s}
                </div>
                <span className={`text-[12px] font-medium ${active ? 'text-ink' : 'text-muted'}`}>
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`mx-3 h-px w-8 ${step > s ? 'bg-fire' : 'bg-stone'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1 — Details */}
      {step === 1 && (
        <div className="card p-6 space-y-5">
          <div>
            <label className="section-label mb-1.5 block">Campaign Name *</label>
            <input
              className="input"
              placeholder="e.g. Win-back Lapsed VIPs"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="section-label mb-1.5 block">Target Segment *</label>
            <select className="input" value={segmentId} onChange={e => setSegmentId(e.target.value)}>
              <option value="">Select a segment…</option>
              {segments.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.audienceCount} customers)
                </option>
              ))}
            </select>
            {audiencePreview && (
              <div className="mt-2 flex items-center gap-1.5 text-[12px] text-fire">
                <Users size={12} />
                <span style={{fontFamily:'Syne,sans-serif'}} className="font-700">
                  {audiencePreview.count}
                </span> customers will receive this
              </div>
            )}
          </div>

          <div>
            <label className="section-label mb-2 block">Channel *</label>
            <div className="flex gap-2 flex-wrap">
              {CHANNELS.map(c => (
                <button
                  key={c}
                  onClick={() => setChannel(c)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-[12px] font-medium border transition-all ${
                    channel === c
                      ? 'border-fire bg-fire-light text-fire'
                      : 'border-stone text-muted hover:border-ink/30'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: CHANNEL_META[c].color }}
                  />
                  {CHANNEL_META[c].label}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={!canNext1}
            onClick={() => setStep(2)}
          >
            Continue <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Step 2 — Message */}
      {step === 2 && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="section-label">Message *</label>
            <button
              className="flex items-center gap-1.5 text-[12px] text-fire font-medium hover:underline"
              onClick={handleDraftAI}
              disabled={aiLoading || !selectedSegment}
            >
              <Sparkles size={12} />
              {aiLoading ? 'Drafting…' : 'Draft with AI'}
            </button>
          </div>
          <textarea
            className="input resize-none h-36 font-sans text-[13px]"
            placeholder={`Write your ${channel} message… Use {{name}} for personalisation`}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <p className="text-[11px] text-muted">
            Tip: <code className="bg-stone px-1.5 py-0.5 rounded text-ink/70">{'{{name}}'}</code> is replaced with each customer's first name.
          </p>
          <div className="flex gap-2 pt-1">
            <button className="btn-secondary text-[12px]" onClick={() => setStep(1)}>← Back</button>
            <button
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={!canNext2}
              onClick={() => setStep(3)}
            >
              Review <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Review */}
      {step === 3 && (
        <div className="card p-6 space-y-4">
          <p className="section-label">Review & Send</p>

          <div className="space-y-0 divide-y divide-stone/50 text-[13px]">
            {[
              ['Campaign',  name],
              ['Segment',   selectedSegment?.name],
              ['Audience',  `${audiencePreview?.count ?? selectedSegment?.audienceCount} customers`],
              ['Channel',   CHANNEL_META[channel]?.label],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-3">
                <span className="text-muted">{label}</span>
                <span className={`font-medium ${label === 'Audience' ? 'text-fire' : 'text-ink'}`}>
                  {val}
                </span>
              </div>
            ))}
            <div className="py-3">
              <p className="text-muted mb-2">Message preview</p>
              <div className="bg-canvas rounded-md p-3 text-[12px] font-mono whitespace-pre-wrap text-ink/80 border border-stone">
                {message}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button className="btn-secondary text-[12px]" onClick={() => setStep(2)}>← Back</button>
            <button
              className="btn-secondary flex-1 text-[12px]"
              onClick={() => handleSubmit(false)}
              disabled={saving}
            >
              Save Draft
            </button>
            <button
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-[12px]"
              onClick={() => handleSubmit(true)}
              disabled={saving}
            >
              <Send size={13} />
              {saving ? 'Sending…' : 'Send Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
