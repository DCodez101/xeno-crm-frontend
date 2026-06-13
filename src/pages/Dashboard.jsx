import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerStats, getCampaigns } from '../api';
import StatCard from '../components/StatCard';
import { Users, Activity, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STATUS_STYLE = {
  draft:   { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
  sending: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  sent:    { bg: '#ECFDF5', text: '#065F46', dot: '#10B981' },
  failed:  { bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444' },
};

const CHANNEL_LABEL = { whatsapp: 'WhatsApp', sms: 'SMS', email: 'Email', rcs: 'RCS' };

function CustomTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="text-white text-xs px-3 py-2 rounded-lg shadow-lg" style={{ background: '#111210' }}>
        <p className="font-medium">{label}</p>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>{payload[0].value} shoppers</p>
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const [stats, setStats]         = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([getCustomerStats(), getCampaigns()])
      .then(([s, c]) => { setStats(s.data); setCampaigns(c.data); })
      .finally(() => setLoading(false));
  }, []);

  const totalSent      = campaigns.reduce((a, c) => a + (c.stats?.total     ?? 0), 0);
  const totalDelivered = campaigns.reduce((a, c) => a + (c.stats?.delivered ?? 0), 0);
  const deliveryRate   = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
  const recentCampaigns = campaigns.slice(0, 5);

  const cityData = stats?.byCity
    ? Object.entries(stats.byCity).sort((a,b) => b[1]-a[1]).slice(0,6).map(([name,count]) => ({ name, count }))
    : [];

  const AMBER_SHADES = ['#E8622A','#EB7440','#EE8756','#F19A6C','#F4AD82','#F7C098'];

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <p className="text-[10px] font-medium uppercase tracking-widest mb-1" style={{ color: '#9A9589' }}>Overview</p>
        <h1 className="text-3xl font-bold font-display tracking-tight" style={{ color: '#111210' }}>Dashboard</h1>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Shoppers" value={loading ? '—' : (stats?.total ?? 0).toLocaleString('en-IN')} sub="in your database" borderColor="#E8622A" icon={Users} />
        <StatCard label="Active (30d)"   value={loading ? '—' : (stats?.active30d ?? 0).toLocaleString('en-IN')} sub="recent purchasers" borderColor="#10B981" icon={Activity} />
        <StatCard label="Avg. Spend"     value={loading ? '—' : `₹${Number(stats?.avgSpend ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} sub="per customer" borderColor="#F59E0B" icon={TrendingUp} />
        <StatCard label="Top Spend"      value={loading ? '—' : `₹${Number(stats?.topSpend ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} sub="highest customer" borderColor="#6366F1" icon={Award} />
      </div>

      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: '1fr 340px' }}>
        {/* City chart */}
        <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E8E4DC' }}>
          <p className="text-[10px] font-medium uppercase tracking-widest mb-1" style={{ color: '#9A9589' }}>Shoppers by City</p>
          <p className="text-xs mb-5" style={{ color: '#9A9589' }}>Top 6 markets</p>
          {cityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={cityData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9A9589' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F7F4EF' }} />
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {cityData.map((_, i) => <Cell key={i} fill={AMBER_SHADES[i] ?? '#E8622A'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-sm" style={{ color: '#9A9589' }}>Loading…</div>
          )}
        </div>

        {/* Campaign health */}
        <div className="bg-white rounded-xl p-6 flex flex-col" style={{ border: '1px solid #E8E4DC' }}>
          <p className="text-[10px] font-medium uppercase tracking-widest mb-5" style={{ color: '#9A9589' }}>Campaign Health</p>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-3xl font-bold font-display" style={{ color: '#111210' }}>{deliveryRate}%</span>
            <span className="text-sm mb-1 ml-1" style={{ color: '#9A9589' }}>delivery</span>
          </div>
          <div className="w-full rounded-full h-1.5 mb-6" style={{ background: '#F0EBE3' }}>
            <div className="h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${deliveryRate}%`, background: deliveryRate > 70 ? '#10B981' : deliveryRate > 40 ? '#F59E0B' : '#EF4444' }} />
          </div>
          <div className="space-y-3 flex-1">
            {[
              { label: 'Total campaigns', value: campaigns.length },
              { label: 'Messages sent',   value: totalSent.toLocaleString('en-IN') },
              { label: 'Delivered',       value: totalDelivered.toLocaleString('en-IN') },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#9A9589' }}>{label}</span>
                <span className="text-sm font-semibold font-mono" style={{ color: '#111210' }}>{value}</span>
              </div>
            ))}
          </div>
          <Link to="/campaigns/new"
            className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ border: '1px solid #E8622A', color: '#E8622A' }}
            onMouseEnter={e => { e.currentTarget.style.background='#E8622A'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#E8622A'; }}
          >
            New Campaign <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent campaigns */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E8E4DC' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F0EBE3' }}>
          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: '#9A9589' }}>Recent Campaigns</p>
          <Link to="/campaigns" className="text-xs flex items-center gap-1 hover:underline" style={{ color: '#E8622A' }}>
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #F5F0E8' }}>
              {['Campaign','Channel','Status','Sent','Delivered','Rate'].map(h => (
                <th key={h} className={`px-6 py-3 text-[10px] font-medium uppercase tracking-wider ${h==='Campaign'?'text-left':'text-right'}`} style={{ color: '#9A9589' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentCampaigns.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-sm" style={{ color: '#9A9589' }}>
                No campaigns yet. <Link to="/campaigns/new" className="hover:underline" style={{ color: '#E8622A' }}>Create one →</Link>
              </td></tr>
            ) : recentCampaigns.map(c => {
              const s = STATUS_STYLE[c.status] ?? STATUS_STYLE.draft;
              const sent = c.stats?.total ?? 0;
              const delivered = c.stats?.delivered ?? 0;
              const rate = sent > 0 ? Math.round((delivered/sent)*100) : 0;
              return (
                <tr key={c._id} className="transition-colors duration-150" style={{ borderBottom: '1px solid #F5F0E8' }}
                  onMouseEnter={e => e.currentTarget.style.background='#FAFAF8'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <td className="px-6 py-3.5">
                    <Link to={`/campaigns/${c._id}`} className="font-medium transition-colors" style={{ color: '#111210' }}
                      onMouseEnter={e => e.currentTarget.style.color='#E8622A'}
                      onMouseLeave={e => e.currentTarget.style.color='#111210'}
                    >{c.name}</Link>
                    {c.segmentId && <p className="text-xs mt-0.5" style={{ color: '#9A9589' }}>{c.segmentId.name}</p>}
                  </td>
                  <td className="px-6 py-3.5 text-right text-xs" style={{ color: '#9A9589' }}>{CHANNEL_LABEL[c.channel] ?? c.channel}</td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium" style={{ background: s.bg, color: s.text }}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status==='sending'?'animate-pulse':''}`} style={{ background: s.dot }} />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono text-xs" style={{ color: '#9A9589' }}>{sent}</td>
                  <td className="px-6 py-3.5 text-right font-mono text-xs font-semibold" style={{ color: '#10B981' }}>{delivered}</td>
                  <td className="px-6 py-3.5 text-right font-mono text-xs font-semibold" style={{ color: rate>=70?'#10B981':rate>=40?'#F59E0B':'#9CA3AF' }}>
                    {sent > 0 ? `${rate}%` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
