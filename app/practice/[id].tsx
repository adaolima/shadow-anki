import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { CardItem, getCardById, reviewCard } from '../../src/lib/db';
import { embedYoutubeUrl } from '../../src/lib/youtube';
import { colors, radius, spacing } from '../../src/theme/colors';

const reviewChoices: Array<{ label: string; quality: number }> = [
  { label: 'Again', quality: 1 },
  { label: 'Hard', quality: 3 },
  { label: 'Good', quality: 4 },
  { label: 'Easy', quality: 5 },
];

export default function PracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [card, setCard] = useState<CardItem | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    void getCardById(Number(id)).then(setCard);
  }, [id]);

  const playerUrl = useMemo(() => {
    if (!card) return '';

    const params = new URLSearchParams({
      autoplay: '1',
      controls: '1',
      playsinline: '1',
      start: String(card.segmentStart),
      end: String(card.segmentEnd),
      rel: '0',
    });

    return `${embedYoutubeUrl(card.youtubeId)}?${params.toString()}`;
  }, [card, reloadKey]);

  if (!card) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Card not found.</Text>
      </View>
    );
  }

  const onReview = async (quality: number) => {
    await reviewCard(card, quality);
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{card.title}</Text>
      <Text style={styles.meta}>
        Segment {card.segmentStart}s → {card.segmentEnd}s
      </Text>

      <View style={styles.playerBox}>
        <WebView
          key={`${card.id}-${reloadKey}`}
          source={{ uri: playerUrl }}
          javaScriptEnabled
          allowsFullscreenVideo
        />
      </View>

      <Pressable style={styles.secondaryButton} onPress={() => setReloadKey((v) => v + 1)}>
        <Text style={styles.secondaryButtonText}>Replay segment</Text>
      </Pressable>

      <View style={styles.reviewRow}>
        {reviewChoices.map((choice) => (
          <Pressable key={choice.label} style={styles.chip} onPress={() => void onReview(choice.quality)}>
            <Text style={styles.chipText}>{choice.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: colors.muted,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  meta: {
    color: colors.muted,
    marginVertical: spacing.sm,
  },
  playerBox: {
    height: 220,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#000',
  },
  secondaryButton: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  reviewRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: 999,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    color: colors.text,
    fontWeight: '600',
  },
});
