export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">LMS Mapel</h1>
        <p className="text-slate-500 mt-2">Checking system status...</p>
        <a href="/dashboard" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-xl font-bold">
          Ke Dashboard
        </a>
      </div>
    </div>
  );
}
