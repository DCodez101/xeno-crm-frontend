export default function StatCard({ label, value, sub, borderColor = '#E8622A', icon: Icon }) {
  return (
    <div
      className="relative bg-white rounded-xl p-5 group transition-shadow duration-200 hover:shadow-md"
      style={{ border: '1px solid #E8E4DC', borderTop: `3px solid ${borderColor}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest mb-2" style={{ color: '#9A9589' }}>{label}</p>
          <p className="text-[2rem] font-bold leading-none tracking-tight font-display" style={{ color: '#111210' }}>{value}</p>
          {sub && <p className="text-xs mt-2 leading-relaxed" style={{ color: '#9A9589' }}>{sub}</p>}
        </div>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: '#F7F4EF' }}>
            <Icon size={15} style={{ color: '#9A9589' }} strokeWidth={1.5} />
          </div>
        )}
      </div>
    </div>
  );
}
