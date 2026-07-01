const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;

export function extractYoutubeInput(input: string): { youtubeId: string; sourceUrl: string } | null {
  const value = input.trim();
  if (!value) return null;

  if (youtubeIdRegex.test(value)) {
    return {
      youtubeId: value,
      sourceUrl: `https://www.youtube.com/watch?v=${value}`,
    };
  }

  try {
    const url = new URL(value);
    const host = url.hostname.replace('www.', '');

    if (host === 'youtu.be') {
      const youtubeId = url.pathname.split('/').filter(Boolean)[0];
      if (youtubeId && youtubeIdRegex.test(youtubeId)) {
        return {
          youtubeId,
          sourceUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
        };
      }
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const watchId = url.searchParams.get('v');
      if (watchId && youtubeIdRegex.test(watchId)) {
        return {
          youtubeId: watchId,
          sourceUrl: `https://www.youtube.com/watch?v=${watchId}`,
        };
      }

      const segments = url.pathname.split('/').filter(Boolean);
      const shortsIndex = segments.indexOf('shorts');
      if (shortsIndex >= 0 && segments[shortsIndex + 1] && youtubeIdRegex.test(segments[shortsIndex + 1])) {
        const youtubeId = segments[shortsIndex + 1];
        return {
          youtubeId,
          sourceUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
        };
      }

      const embedIndex = segments.indexOf('embed');
      if (embedIndex >= 0 && segments[embedIndex + 1] && youtubeIdRegex.test(segments[embedIndex + 1])) {
        const youtubeId = segments[embedIndex + 1];
        return {
          youtubeId,
          sourceUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function embedYoutubeUrl(youtubeId: string) {
  return `https://www.youtube.com/embed/${youtubeId}`;
}
