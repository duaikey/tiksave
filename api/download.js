export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { url } = req.body;

  // Basic validation
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'No URL provided.' });
  }

  const isValidTikTok =
    url.includes('tiktok.com') ||
    url.includes('vm.tiktok') ||
    url.includes('vt.tiktok');

  if (!isValidTikTok) {
    return res.status(400).json({ error: 'Invalid TikTok URL.' });
  }

  try {
    const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res.status(502).json({ error: 'TikWM API request failed.' });
    }

    const data = await response.json();

    // TikWM returns code 0 on success
    if (data.code !== 0 || !data.data) {
      return res.status(422).json({
        error: data.msg || 'Could not fetch video. Check the URL and try again.',
      });
    }

    const { play, wmplay, music, cover, title, author } = data.data;

    return res.status(200).json({
      success: true,
      video: play,
      videoWm: wmplay,
      music: music,
      cover: cover,
      title: title || '',
      author: author?.nickname || '',
    });

  } catch (err) {
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
