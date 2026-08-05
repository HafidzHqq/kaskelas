export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-content flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">404</h1>
        <h2 className="text-xl font-semibold">Halaman Tidak Ditemukan</h2>
        <p className="text-muted">Maaf, halaman yang Anda cari tidak ada.</p>
        <a href="/" className="inline-block mt-4 px-6 py-2 bg-primary text-on-primary rounded-md font-medium hover:opacity-90 transition-opacity">
          Kembali ke Dashboard
        </a>
      </div>
    </div>
  );
}
