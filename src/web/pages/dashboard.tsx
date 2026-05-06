import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, Users, Film, Calendar, Eye, ArrowUp } from 'lucide-react';

export function DashboardPage() {
  const [clicks, setClicks] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    week: 0,
    topMovie: '',
    users: 0,
    avgClicks: 0
  });
  const [chartData, setChartData] = useState([]);
  const [movieStats, setMovieStats] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const stored = localStorage.getItem('streamflix_clicks');
    const data = stored ? JSON.parse(stored) : [];
    setClicks(data);
    updateStats(data);
  };

  const updateStats = (data: any[]) => {
    const now = new Date();
    const today = now.toDateString();
    const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayClicks = data.filter(c => new Date(c.timestamp).toDateString() === today);
    const weekClicks = data.filter(c => new Date(c.timestamp) >= week);

    const movieCounts: any = {};
    data.forEach(c => {
      movieCounts[c.movie] = (movieCounts[c.movie] || 0) + 1;
    });

    const topMovie = Object.entries(movieCounts).sort((a: any, b: any) => b[1] - a[1])[0];

    setStats({
      total: data.length,
      today: todayClicks.length,
      week: weekClicks.length,
      topMovie: topMovie ? String(topMovie[0]) : 'N/A',
      users: new Set(data.map(c => c.userAgent)).size,
      avgClicks: data.length > 0 ? Math.round(data.length / (new Set(data.map(c => c.userAgent)).size || 1)) : 0
    });

    // Dados por dia
    const dayData: any = {};
    data.forEach(c => {
      const day = new Date(c.timestamp).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
      dayData[day] = (dayData[day] || 0) + 1;
    });
    setChartData(Object.entries(dayData).map(([day, count]) => ({ day, cliques: count })));

    // Top 10 filmes
    const topMovies = Object.entries(movieCounts)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
    setMovieStats(topMovies);
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#ff6b6b', '#ffd93d', '#6bcf7f', '#ff6b9d', '#c44569'];

  const StatCard = ({ icon: Icon, label, value, subtext, trend }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtext && <p className="text-gray-500 text-xs mt-1">{subtext}</p>}
        </div>
        <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
          <Icon className="w-6 h-6 text-purple-600" />
        </div>
      </div>
      {trend && <div className="mt-3 flex items-center text-green-600 text-sm font-semibold">
        <ArrowUp className="w-4 h-4 mr-1" /> {trend}
      </div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">🎬 Streamflix Admin</h1>
              <p className="text-purple-100 mt-2">Dashboard de Analytics em Tempo Real</p>
            </div>
            <div className="text-right">
              <div className="text-4xl">👤</div>
              <p className="text-purple-100 text-sm mt-1">Admin</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Activity} label="Total de Cliques" value={stats.total} subtext="Visualizações registradas" trend={`+${stats.today} hoje`} />
          <StatCard icon={Eye} label="Cliques Hoje" value={stats.today} subtext="Nas últimas 24 horas" />
          <StatCard icon={Calendar} label="Esta Semana" value={stats.week} subtext="Últimos 7 dias" />
          <StatCard icon={Users} label="Usuários Únicos" value={stats.users} subtext={`${stats.avgClicks} cliques/usuário`} />
        </div>

        {/* Top Movie e Trending */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">🏆 Filme Top</h3>
              <Film className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">{stats.topMovie}</p>
            <p className="text-gray-500 text-sm">Mais visualizado no período</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">📊 Tendência</h3>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Crescimento hoje</span>
                <span className="text-lg font-bold text-green-600">+{stats.today}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{ width: `${Math.min((stats.today / stats.total * 100) || 0, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Line Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">📈 Cliques por Dia</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                  <Line type="monotone" dataKey="cliques" stroke="#667eea" strokeWidth={2} dot={{ fill: '#667eea', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">Sem dados para exibir</div>
            )}
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">🎯 Top 10 Filmes</h3>
            {movieStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={movieStats} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={false}>
                    {movieStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">Sem dados para exibir</div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        {movieStats.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">🎬 Ranking de Filmes</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={movieStats} margin={{ top: 5, right: 30, left: 200, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#888" />
                <YAxis dataKey="name" type="category" width={190} stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="value" fill="#667eea" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Clicks Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">📋 Cliques Recentes</h3>
            <button onClick={() => { localStorage.removeItem('streamflix_clicks'); loadData(); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold">
              🗑️ Limpar Dados
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Filme</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data/Hora</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Dispositivo</th>
                </tr>
              </thead>
              <tbody>
                {clicks.slice().reverse().slice(0, 20).map((click, idx) => (
                  <tr key={click.id} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">🎬 {click.movie}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{new Date(click.timestamp).toLocaleString('pt-BR')}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 truncate">{click.userAgent}</td>
                  </tr>
                ))}
                {clicks.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 px-4 text-center text-gray-500">
                      Aguardando cliques... Configure a URL deste painel no app!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
