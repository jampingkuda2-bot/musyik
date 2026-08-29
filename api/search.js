// Vercel Serverless Function
// URL-nya otomatis jadi: /api/search?q=...
// Key diambil dari Environment Variable "YOUTUBE_API_KEY" di dashboard Vercel,
// jadi TIDAK PERNAH dikirim ke browser / kelihatan di kode client.

export default async function handler(req, res) {
  const q = req.query.q;
  if (!q) {
    return res.status(400).json({ error: { message: 'Parameter q wajib diisi' } });
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return res.status(500).json({
      error: { message: 'YOUTUBE_API_KEY belum diset di Environment Variables Vercel' }
    });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=15&q=${encodeURIComponent(q)}&key=${key}`;
    const ytRes = await fetch(url);
    const data = await ytRes.json();
    // Cache ringan di edge Vercel selama 60 detik biar hemat kuota kalau ada query yang sama berkali-kali
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(ytRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: 'Gagal menghubungi YouTube API: ' + err.message } });
  }
}
