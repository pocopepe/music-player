import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

const TABS = ['Suggested', 'Songs', 'Artists', 'Albums', 'Folders'];

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function FilterTabs({ activeTab, onTabChange }: Props) {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onTabChange(tab)}
              style={styles.tab}
            >
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {tab}
              </Text>
              {isActive && <View style={styles.activeUnderline} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.fullBorder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 24,
  },
  tab: {
    paddingBottom: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 17,
    fontWeight: '500',
    color: Colors.light.subtext,
  },
  activeLabel: {
    color: Colors.accent,
    fontWeight: '700',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  fullBorder: {
    height: 1,
    backgroundColor: Colors.light.border,
  },
});
