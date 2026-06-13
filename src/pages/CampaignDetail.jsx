import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCampaign, getCampaignStats, sendCampaign } from '../api';
import { ArrowLeft, Send, RefreshCw, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

const STATUS_STYLE = {
  draft:   'bg-stone text-ink/50',
  sending: 'bg-warn-light text-warn',
  sent:    'bg-success-light text-success',
  failed:  'bg-danger-light text-danger',
};

const STAT_BARS = [
  { key: 'sent',      label: 'Sent',      color: '#111210' },
  { key: 'delivered', label: 'Delivered', color: '#2D7A4F' },
  { key: 'opened',    label: 'Opened',    color: '#E8622A' },
  { key: 'clicked',   label: 'Clicked',   color: '#B07B1A' },
  { key: 'failed',    label: 'Failed',    color: '#C13B3B' },
];

const KPI_CONFIG = [
  { key: 'sent',      label: 'Sent',      color: 'text-ink',    bg: 'bg-stone/30',      edge: '#E8E3DA' },
  { key: 'delivered', label: 'Delivered', color: 'text-success',bg: 'bg-success-light', edge: '#2D7A4F' },
  { key: 'opened',    label: 'Opened',    color: 'text-fire',   bg: 'bg-fire-light',    edge: '#E8622A' },
  { key: 'clicked',   label: 'Clicked',   color: 'text-warn',   bg: 'bg-warn-light',    edge: '#B07B1A' },
  { key: 'failed',    label: 'Failed',    color: 'text-danger', bg: 'bg-danger-light',  edge: '#C13B3B' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone rounded-md px-3 py-2 text-[12px] shadow-sm">
      <p className="text-muted">{label}</p>
      <p style={{ fontFamily: 'Syne, sans-serif' }} className="font-bold text-ink text-[16px]">
        {payload[0].value}
      </p>
    </div>
  );
};

function buildInsight(s, name) {
  if (!s || !s.sent) return null;
  // Use sent as base for delivery rate, delivered as base for open/click rates
  const deliveryRate = s.sent > 0     ? Math.min(100, Math.round((s.delivered / s.sent)     * 100)) : 0;
  const openRate     = s.delivered > 0 ? Math.min(100, Math.round((s.opened    / s.delivered) * 100)) : 0;
  const tone = deliveryRate >= 75 ? '✦ Strong performance.'
    : deliveryRate >= 50 ? '→ Moderate reach.'
    : '⚠ Below average delivery.';
  return `${name} reached ${s.sent.toLocaleString()} shoppers. ${s.delivered} messages delivered (${deliveryRate}% delivery rate), ${s.opened} opened (${openRate}% open rate). ${tone}`;
}

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign]     = useState(null);
  const [liveStats, setLiveStats]   = useState(null);
  const [sending, setSending]       = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef(null);

  const load = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [cRes, sRes] = await Promise.all([
        getCampaign(id),
        getCampaignStats(id)
      ]);
      setCampaign(cRes.data);
      // sRes.data = { campaign: { ...stats }, stats: {...} }
      setLiveStats(sRes.data.stats || sRes.data.campaign?.stats || {});
    } finally {
      if (showSpinner) setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (campaign?.status === 'sending') {
      intervalRef.current = setInterval(() => load(), 3000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [campaign?.status]);

  const handleSend = async () => {
    if (!confirm('Send this campaign now?')) return;
    setSending(true);
    try { await sendCampaign(id); await load(); }
    catch (e) { alert(e.response?.data?.error || 'Send failed'); }
    finally { setSending(false); }
  };

  if (!campaign) return (
    <div className="p-8 text-muted text-[13px]">Loading…</div>
  );

  const s = liveStats || campaign.stats || {};

  // Cap all rates at 100% — delivery based on sent, open/click based on delivered
  const deliveryRate = s.sent > 0      ? Math.min(100, Math.round((s.delivered / s.sent)      * 100)) : 0;
  const openRate     = s.delivered > 0 ? Math.min(100, Math.round((s.opened    / s.delivered) * 100)) : 0;
  const clickRate    = s.delivered > 0 ? Math.min(100, Math.round((s.clicked   / s.delivered) * 100)) : 0;

  const chartData = STAT_BARS.map(b => ({
    name:  b.label,
    value: s[b.key] ?? 0,
    color: b.color,
  }));

  const sentAt = campaign.sentAt
    ? new Date(campaign.sentAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    : null;

  const insight = buildInsight(s, campaign.name);

  return (
    <div className="p-8 max-w-4xl">

      <Link
        to="/campaigns"
        className="inline-flex items-center gap-1.5 text-muted text-[12px] mb-6 hover:text-ink transition-colors"
      >
        <ArrowLeft size={12} /> All Campaigns
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="page-eyebrow">Campaign</p>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="page-title">{campaign.name}</h1>
            <span className={`badge ${STATUS_STYLE[campaign.status]}`}>
              {campaign.status}
            </span>
          </div>
          <p className="text-[12px] text-muted mt-1.5">
            {campaign.channel}
            {campaign.segmentId?.name && ` · ${campaign.segmentId.name}`}
            {sentAt && ` · Sent ${sentAt}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-1.5 text-[12px]"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          {campaign.status === 'draft' && (
            <button
              onClick={handleSend}
              disabled={sending}
              className="btn-primary flex items-center gap-2 text-[12px]"
            >
              <Send size={13} /> {sending ? 'Sending…' : 'Send Now'}
            </button>
          )}
        </div>
      </div>

      {/* AI Insight strip */}
      {insight && campaign.status !== 'draft' && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-lg mb-5 text-[12px] leading-relaxed"
          style={{ background: '#FDF1EB', border: '1px solid #E8622A22' }}
        >
          <TrendingUp size={14} className="text-fire shrink-0 mt-0.5" />
          <p className="text-ink/75">{insight}</p>
        </div>
      )}

      {/* KPI row — now shows Sent instead of Total */}
      <div className="grid grid-cols-5 gap-2.5 mb-4">
        {KPI_CONFIG.map(k => (
          <div
            key={k.key}
            className={`rounded-lg border border-stone ${k.bg} relative overflow-hidden`}
            style={{ borderLeft: `3px solid ${k.edge}` }}
          >
            <div className="px-4 py-3.5 text-center">
              <p
                style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '26px', lineHeight: 1 }}
                className={k.color}
              >
                {s[k.key] ?? 0}
              </p>
              <p className="section-label mt-1.5">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rate cards */}
      {campaign.status !== 'draft' && (
        <div className="flex gap-3 mb-4">
          {[
            { label: 'Delivery rate', value: `${deliveryRate}%`, color: '#2D7A4F', bg: '#EAF4EE', barVal: deliveryRate },
            { label: 'Open rate',     value: `${openRate}%`,     color: '#E8622A', bg: '#FDF1EB', barVal: openRate },
            { label: 'Click rate',    value: `${clickRate}%`,    color: '#B07B1A', bg: '#FDF4E0', barVal: clickRate },
          ].map(r => (
            <div key={r.label}
              className="card px-4 py-3 flex-1"
              style={{ background: r.bg, borderColor: `${r.color}22` }}
            >
              <p className="section-label mb-1.5">{r.label}</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '22px', color: r.color, lineHeight: 1 }}>
                {r.value}
              </p>
              <div className="mt-2 h-1 bg-white/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(r.barVal, 100)}%`, background: r.color }}
                />
              </div>
            </div>
          ))}

          {campaign.status === 'sending' && (
            <div className="card px-4 py-3 flex items-center gap-2.5 self-stretch"
              style={{ borderColor: '#B07B1A44', background: '#FDF4E0' }}>
              <div className="w-2 h-2 bg-warn rounded-full animate-pulse shrink-0" />
              <div>
                <p className="text-[11px] text-warn font-medium">Live</p>
                <p className="text-[10px] text-warn/70">Callbacks arriving…</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      {campaign.status !== 'draft' && (
        <div className="card p-5 mb-4">
          <p className="section-label mb-4">Delivery Breakdown</p>
          {s.sent > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barSize={36} barCategoryGap="25%">
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#9A9589', fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9A9589', fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F7F4EF' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-muted text-[12px]">
              Waiting for delivery data… hit Refresh in a few seconds.
            </div>
          )}
        </div>
      )}

      {/* Message preview */}
      <div className="card p-5">
        <p className="section-label mb-3">Message</p>
        <div className="bg-canvas border border-stone rounded-md p-4 text-[13px] font-mono whitespace-pre-wrap text-ink/75 leading-relaxed">
          {campaign.message}
        </div>
      </div>
    </div>
  );
}