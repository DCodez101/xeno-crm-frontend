import { useEffect, useState } from 'react';
import { getCustomers } from '../api';
import { Search } from 'lucide-react';

function daysAgo(date) {
  if (!date) return '—';
  const d = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d}d ago`;
}

export default function Customers() {
  const [data, setData]       = useState({ customers: [], total: 0, pages: 1 });
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      getCustomers({ search, page, limit: 20 })
        .then(r => setData(r.data))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search, page]);

  const maxSpend = Math.max(...(data.customers.map(c => c.totalSpend ?? 0)), 1);

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest mb-1" style={{ color: '#9A9589' }}>Database</p>
          <h1 className="text-3xl font-bold font-display tracking-tight" style={{ color: '#111210' }}>Customers</h1>
        </div>
        <span className="text-sm font-semibold mt-2" style={{ color: '#E8622A' }}>
          {data.total.toLocaleString('en-IN')} shoppers total
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9A9589' }} />
        <input
          className="w-full max-w-sm pl-9 pr-4 py-2.5 text-sm rounded-lg outline-none bg-white"
          style={{ border: '1px solid #E8E4DC' }}
          onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(232,98,42,0.12)'}
          onBlur={e => e.target.style.boxShadow = 'none'}
          placeholder="Search name or email…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E8E4DC' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #F0EBE3' }}>
              {['Customer','City','Orders','Total Spend','Last Order'].map(h => (
                <th key={h} className={`px-5 py-3.5 text-[10px] font-medium uppercase tracking-wider ${h==='Customer'?'text-left':'text-right'}`} style={{ color: '#9A9589' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F5F0E8' }}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-3 rounded animate-pulse" style={{ background: '#F0EBE3', width: j===0?'60%':'40%', marginLeft: j===0?0:'auto' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.customers.map(c => {
              const pct = maxSpend > 0 ? Math.min(((c.totalSpend??0)/maxSpend)*100,100) : 0;
              return (
                <tr key={c._id} style={{ borderBottom: '1px solid #F5F0E8' }}
                  onMouseEnter={e => e.currentTarget.style.background='#FAFAF8'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <td className="px-5 py-4">
                    <p className="font-medium" style={{ color: '#111210' }}>{c.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9A9589' }}>{c.email}</p>
                  </td>
                  <td className="px-5 py-4 text-right text-xs" style={{ color: '#9A9589' }}>{c.city || '—'}</td>
                  <td className="px-5 py-4 text-right font-mono text-xs" style={{ color: '#111210' }}>{c.orderCount}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-12 rounded-full h-1" style={{ background: '#F0EBE3' }}>
                        <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: '#E8622A' }} />
                      </div>
                      <span className="font-mono text-xs font-medium" style={{ color: '#111210' }}>
                        ₹{Number(c.totalSpend).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right text-xs" style={{ color: '#9A9589' }}>{daysAgo(c.lastOrderAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-xs" style={{ color: '#9A9589' }}>Page {page} of {data.pages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={page===1
                ? { background:'#F3F4F6', color:'#D1D5DB', cursor:'not-allowed' }
                : { background:'#fff', color:'#111210', border:'1px solid #E8E4DC', cursor:'pointer' }
              }>← Previous</button>
            <button onClick={() => setPage(p => Math.min(data.pages, p+1))} disabled={page===data.pages}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={page===data.pages
                ? { background:'#F3F4F6', color:'#D1D5DB', cursor:'not-allowed' }
                : { background:'#fff', color:'#111210', border:'1px solid #E8E4DC', cursor:'pointer' }
              }>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
