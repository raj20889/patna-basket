import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API = import.meta.env.VITE_API_BASE_URL;
const presets = { Today: 0, Yesterday: 1, 'Last 7 Days': 6, 'Last 30 Days': 29, 'This Month': null };

const dateText = (date) => date.toISOString().slice(0, 10);
const getPreset = (label) => {
  const now = new Date();
  if (label === 'This Month') return { start: dateText(new Date(now.getFullYear(), now.getMonth(), 1)), end: dateText(now) };
  const days = presets[label];
  const start = new Date(now);
  start.setDate(now.getDate() - days);
  return { start: dateText(start), end: dateText(now) };
};

const ProductInteractionAnalytics = () => {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ ...getPreset('Last 30 Days'), search: '', category: '', sort: 'viewed', page: 1 });
  const [paging, setPaging] = useState({ totalPages: 1, totalProducts: 0 });
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API}/analytics/products`, { params: filters, headers: { Authorization: `Bearer ${token}` } });
        setRows(response.data.products);
        setPaging(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load product interaction analytics.');
      }
    };
    load();
  }, [filters]);

  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? value : 1 }));
  const openDetail = async (product) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API}/analytics/products/${product._id}`, { params: filters, headers: { Authorization: `Bearer ${token}` } });
    setDetail(response.data);
  };

  return (
    <section className="bg-white rounded-xl shadow p-6 space-y-5">
      <div className="flex flex-wrap justify-between gap-3 items-center">
        <div><h3 className="text-xl font-bold">Product Interaction Analytics</h3><p className="text-sm text-gray-500">Events, unique visitors, conversion, and trusted order outcomes.</p></div>
        <select className="border rounded-lg px-3 py-2" value={filters.sort} onChange={(event) => update('sort', event.target.value)}>
          <option value="viewed">Most viewed</option><option value="clicked">Most clicked</option><option value="added">Most added to cart</option><option value="conversion">Highest conversion</option><option value="revenue">Highest revenue</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.keys(presets).map((label) => <button key={label} type="button" onClick={() => setFilters((current) => ({ ...current, ...getPreset(label), page: 1 }))} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">{label}</button>)}
        <input className="border rounded-lg px-3 py-2" placeholder="Search products" value={filters.search} onChange={(event) => update('search', event.target.value)} />
        <input className="border rounded-lg px-3 py-2" placeholder="Category" value={filters.category} onChange={(event) => update('category', event.target.value)} />
        <input type="date" className="border rounded-lg px-3 py-2" value={filters.start} onChange={(event) => update('start', event.target.value)} />
        <input type="date" className="border rounded-lg px-3 py-2" value={filters.end} onChange={(event) => update('end', event.target.value)} />
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-[1500px] w-full text-sm">
          <thead><tr className="text-left border-b text-gray-500"><th className="p-2">Product</th><th>Impressions</th><th>Detail views</th><th>Card clicks</th><th>Image/name clicks</th><th>Add cart</th><th>Remove cart</th><th>Wishlist</th><th>Checkout</th><th>Orders</th><th>Units</th><th>Revenue</th><th>Unique viewers</th><th>Guests</th><th>CTR</th><th>View to cart</th><th>View to order</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row._id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => openDetail(row)}><td className="p-2 flex items-center gap-2"><img src={row.image || '/placeholder-product.jpg'} alt="" className="w-10 h-10 object-cover rounded" /><span><strong>{row.name}</strong><small className="block text-gray-400">{row._id}</small></span></td><td>{row.impressions}</td><td>{row.detailViews}</td><td>{row.clicks}</td><td>{row.imageNameClicks}</td><td>{row.addToCart}</td><td>{row.removeFromCart}</td><td>{row.wishlist}</td><td>{row.checkoutStarted}</td><td>{row.orders}</td><td>{row.unitsSold}</td><td>₹{Math.round(row.revenue)}</td><td>{row.uniqueViewers}</td><td>{row.uniqueGuests}</td><td>{row.ctr.toFixed(2)}%</td><td>{row.viewToCartRate.toFixed(2)}%</td><td>{row.viewToOrderRate.toFixed(2)}%</td></tr>)}</tbody>
        </table>
      </div>
      <div className="flex justify-between items-center text-sm"><span>{paging.totalProducts || 0} products</span><div className="flex gap-2"><button disabled={filters.page <= 1} onClick={() => update('page', filters.page - 1)} className="px-3 py-1 border rounded disabled:opacity-40">Previous</button><span className="px-2 py-1">Page {filters.page} of {paging.totalPages || 1}</span><button disabled={filters.page >= (paging.totalPages || 1)} onClick={() => update('page', filters.page + 1)} className="px-3 py-1 border rounded disabled:opacity-40">Next</button></div></div>
      {detail && <ProductDetailDrawer detail={detail} onClose={() => setDetail(null)} />}
    </section>
  );
};

const ProductDetailDrawer = ({ detail, onClose }) => (
  <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose}>
    <aside className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white overflow-y-auto p-6" onClick={(event) => event.stopPropagation()}>
      <div className="flex justify-between items-start"><div><h3 className="text-2xl font-bold">{detail.product.name}</h3><p className="text-gray-500">{detail.product._id}</p></div><button type="button" onClick={onClose} className="px-3 py-1 border rounded">Close</button></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">{[['Impressions', detail.summary.impressions], ['Clicks', detail.summary.clicks], ['Detail views', detail.summary.detailViews], ['Unique visitors', detail.summary.uniqueVisitors], ['Add to cart', detail.summary.addToCart], ['Orders', detail.summary.orders], ['Units sold', detail.summary.unitsSold], ['Revenue', `₹${Math.round(detail.summary.revenue)}`], ['CTR', `${detail.summary.ctr.toFixed(2)}%`]].map(([label, value]) => <div key={label} className="border rounded-lg p-3"><span className="block text-xs text-gray-500">{label}</span><strong>{value}</strong></div>)}</div>
      <h4 className="font-semibold mb-2">Add-to-cart and order funnel</h4><div className="space-y-2 text-sm"><div className="bg-blue-100 p-2" style={{ width: '100%' }}>Views: {detail.summary.detailViews}</div><div className="bg-green-100 p-2" style={{ width: `${Math.max(detail.summary.detailViews ? (detail.summary.addToCart / detail.summary.detailViews) * 100 : 0, 8)}%` }}>Add to cart: {detail.summary.addToCart}</div><div className="bg-amber-100 p-2" style={{ width: `${Math.max(detail.summary.detailViews ? (detail.summary.orders / detail.summary.detailViews) * 100 : 0, 8)}%` }}>Orders: {detail.summary.orders}</div></div>
      <h4 className="font-semibold mb-2">Daily views and clicks</h4><ResponsiveContainer width="100%" height={240}><LineChart data={detail.daily}><XAxis dataKey="_id" /><YAxis /><Tooltip /><Legend /><Line dataKey="views" stroke="#2563eb" /><Line dataKey="clicks" stroke="#16a34a" /><Line dataKey="impressions" stroke="#f59e0b" /></LineChart></ResponsiveContainer>
      <h4 className="font-semibold mb-2 mt-5">Views by device and traffic source</h4><ResponsiveContainer width="100%" height={220}><BarChart data={detail.devices}><XAxis dataKey="_id" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#2563eb" /></BarChart></ResponsiveContainer>
      <div className="grid md:grid-cols-2 gap-5 mt-5"><div><h4 className="font-semibold">Traffic sources</h4>{detail.sources.map((item) => <p key={item._id} className="flex justify-between text-sm py-1"><span>{item._id}</span><span>{item.count}</span></p>)}</div><div><h4 className="font-semibold">Most active hours</h4>{detail.hourly.slice(0, 8).map((item) => <p key={item._id} className="flex justify-between text-sm py-1"><span>{item._id}:00</span><span>{item.count}</span></p>)}</div></div>
      <h4 className="font-semibold mt-5">Recent product events</h4>{detail.recent.slice(0, 20).map((event) => <p key={event._id} className="border-b py-2 text-xs"><strong>{event.eventType}</strong> · {event.eventSource} · {new Date(event.occurredAt).toLocaleString()} · {event.sessionId}</p>)}
    </aside>
  </div>
);

export default ProductInteractionAnalytics;