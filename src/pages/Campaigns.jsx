import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCampaigns } from '../api';
import { Plus } from 'lucide-react';

const STATUS_STYLE = {
  draft:   { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
  sending: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  sent:    { bg: '#ECFDF5', text: '#065F46', dot: '#10B981' },
  failed:  { bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444' },
};

const CHANNEL_DOT = { whatsapp: '#25D366', sms: '#3B82F6', email: '#8B5CF6', rcs: '#F59E0B' };

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCampaigns().then(r => setCampaigns(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest mb-1" style={{ color: '#9A9589' }}>Outreach</p>
          <h1 className="text-3xl font-bold font-display tracking-tight" style={{ color: '#111210' }}>Campaigns</h1>
        </div>
        <Link to="/campaigns/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: '#E8622A' }}
        >
          <Plus size={15} /> New Campaign
        </Link>
      </div>

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E8E4DC' }}>
        {loading ? (
          <div className="py-16 text-center text-sm" style={{ color: '#9A9589' }}>Loading…</div>
        ) : campaigns.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm mb-2" style={{ color: '#9A9589' }}>No campaigns yet.</p>
            <Link to="/campaigns/new" className="text-sm font-medium hover:underline" style={{ color: '#E8622A' }}>Create your first campaign →</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #F0EBE3' }}>
                {['Campaign','Channel','Status','Total','Delivered','Opened','Failed','Delivery Rate'].map(h => (
                  <th key={h} className={`px-5 py-3.5 text-[10px] font-medium uppercase tracking-wider ${h==='Campaign'?'text-left':'text-right'}`} style={{ color: '#9A9589' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => {
                const s = STATUS_STYLE[c.status] ?? STATUS_STYLE.draft;
                const sent = c.stats?.total ?? 0;
                const delivered = c.stats?.delivered ?? 0;
                const rate = sent > 0 ? Math.round((delivered/sent)*100) : 0;
                const rateColor = rate >= 70 ? '#10B981' : rate >= 40 ? '#F59E0B' : '#EF4444';
                return (
                  <tr key={c._id} style={{ borderBottom: '1px solid #F5F0E8' }}
                    onMouseEnter={e => e.currentTarget.style.background='#FAFAF8'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <td className="px-5 py-4">
                      <Link to={`/campaigns/${c._id}`} className="font-medium transition-colors" style={{ color: '#111210' }}
                        onMouseEnter={e => e.currentTarget.style.color='#E8622A'}
                        onMouseLeave={e => e.currentTarget.style.color='#111210'}
                      >{c.name}</Link>
                      {c.segmentId && <p className="text-xs mt-0.5" style={{ color: '#9A9589' }}>{c.segmentId.name}</p>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex items-center justify-end gap-1.5 text-xs" style={{ color: '#9A9589' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: CHANNEL_DOT[c.channel] ?? '#9CA3AF' }} />
                        {c.channel === 'whatsapp' ? 'WhatsApp' : c.channel?.toUpperCase?.() ?? c.channel}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ background: s.bg, color: s.text }}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.status==='sending'?'animate-pulse':''}`} style={{ background: s.dot }} />
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-xs" style={{ color: '#9A9589' }}>{sent}</td>
                    <td className="px-5 py-4 text-right font-mono text-xs font-semibold" style={{ color: '#10B981' }}>{delivered}</td>
                    <td className="px-5 py-4 text-right font-mono text-xs" style={{ color: '#3B82F6' }}>{c.stats?.opened ?? 0}</td>
                    <td className="px-5 py-4 text-right font-mono text-xs" style={{ color: '#EF4444' }}>{c.stats?.failed ?? 0}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {sent > 0 ? (
                          <>
                            <div className="w-16 rounded-full h-1" style={{ background: '#F0EBE3' }}>
                              <div className="h-1 rounded-full" style={{ width: `${rate}%`, background: rateColor }} />
                            </div>
                            <span className="font-mono text-xs font-semibold" style={{ color: rateColor }}>{rate}%</span>
                          </>
                        ) : <span className="text-xs" style={{ color: '#D1D5DB' }}>—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
