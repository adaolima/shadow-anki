import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { CardItem, listCards } from '../src/lib/db';
import { formatDueLabel } from '../src/lib/time';
import { colors, radius, spacing } from '../src/theme/colors';

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function CardRow({ card }: { card: CardItem }) {
  const dueLabel = useMemo(() => formatDueLabel(card.dueAt), [card.dueAt]);

  return (
    <Link href={`/practice/${card.id}`} asChild>
      <Pressable style={styles.card}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {card.title}
        </Text>
        <Text style={styles.cardMeta}>Due {dueLabel}</Text>
        <Text style={styles.cardMeta}>
          Segment {card.segmentStart}s → {card.segmentEnd}s
        </Text>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  const [cards, setCards] = useState<CardItem[]>([]);

  const refresh = useCallback(async () => {
    const next = await listCards();
    setCards(next);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const dueCards = cards.filter((c) => new Date(c.dueAt).getTime() <= Date.now());
  const laterCards = cards.filter((c) => new Date(c.dueAt).getTime() > Date.now());

  return (
    <View style={styles.container}>
      <Link href="/add" asChild>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>+ Add YouTube video</Text>
        </Pressable>
      </Link>

      <FlatList
        data={[...dueCards, ...laterCards]}
        keyExtractor={(item) => String(item.id)}
        onRefresh={() => void refresh()}
        refreshing={false}
        ListEmptyComponent={<Text style={styles.empty}>No cards yet. Add your first video.</Text>}
        renderItem={({ item, index }) => {
          const isDueBoundary = index === 0;
          const dueCount = dueCards.length;
          const isLaterBoundary = index === dueCount;

          return (
            <>
              {isDueBoundary && <SectionHeader title={`Due now (${dueCount})`} />}
              {isLaterBoundary && laterCards.length > 0 && <SectionHeader title="Upcoming" />}
              <CardRow card={item} />
            </>
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.text,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  primaryButtonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 16,
  },
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontSize: 13,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  cardMeta: {
    color: colors.muted,
    fontSize: 13,
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
