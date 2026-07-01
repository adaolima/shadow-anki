import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { createCard } from '../src/lib/db';
import { extractYoutubeInput } from '../src/lib/youtube';
import { colors, radius, spacing } from '../src/theme/colors';

function getUrlFromIncoming(incomingUrl: string): string | null {
  const parsed = Linking.parse(incomingUrl);

  if (parsed.queryParams?.url && typeof parsed.queryParams.url === 'string') {
    return decodeURIComponent(parsed.queryParams.url);
  }

  if (incomingUrl.includes('youtube.com') || incomingUrl.includes('youtu.be')) {
    return incomingUrl;
  }

  return null;
}

export default function AddScreen() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [segmentStart, setSegmentStart] = useState('0');
  const [segmentEnd, setSegmentEnd] = useState('30');

  useEffect(() => {
    let mounted = true;

    const hydrateFromInitial = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (!mounted || !initialUrl) return;
      const extracted = getUrlFromIncoming(initialUrl);
      if (extracted) setUrl(extracted);
    };

    const sub = Linking.addEventListener('url', (event) => {
      const extracted = getUrlFromIncoming(event.url);
      if (extracted) setUrl(extracted);
    });

    void hydrateFromInitial();

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const parsed = useMemo(() => extractYoutubeInput(url), [url]);

  const onSave = async () => {
    if (!parsed) {
      Alert.alert('Invalid URL', 'Paste a valid YouTube URL or video ID.');
      return;
    }

    const start = Number(segmentStart || 0);
    const end = Number(segmentEnd || 30);

    if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || end <= start) {
      Alert.alert('Invalid segment', 'End must be greater than start.');
      return;
    }

    await createCard({
      sourceUrl: parsed.sourceUrl,
      youtubeId: parsed.youtubeId,
      title: title.trim() || `YouTube ${parsed.youtubeId}`,
      segmentStart: start,
      segmentEnd: end,
    });

    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>YouTube URL or ID</Text>
      <TextInput
        placeholder="https://youtu.be/..."
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.hint}>
        Share from YouTube with link: shadowanki://add?url=&lt;encoded-youtube-url&gt;
      </Text>

      <Text style={styles.label}>Title</Text>
      <TextInput placeholder="Optional" style={styles.input} value={title} onChangeText={setTitle} />

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Start (s)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={segmentStart}
            onChangeText={setSegmentStart}
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>End (s)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={segmentEnd}
            onChangeText={setSegmentEnd}
          />
        </View>
      </View>

      {!!parsed && <Text style={styles.preview}>Video ID: {parsed.youtubeId}</Text>}

      <Pressable style={styles.button} onPress={() => void onSave()}>
        <Text style={styles.buttonText}>Save card</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  hint: {
    color: colors.muted,
    marginBottom: spacing.md,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  col: {
    flex: 1,
  },
  preview: {
    color: colors.muted,
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.md,
    backgroundColor: colors.text,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 16,
  },
});
