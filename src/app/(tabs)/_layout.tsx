import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "../../components/PressableScale";
import { font, palette, useTheme } from "../../theme/tokens";

const ICONS: Record<string, [string, string]> = {
  home: ["home", "home-outline"],
  tools: ["apps", "apps-outline"],
  library: ["folder", "folder-outline"],
  settings: ["settings", "settings-outline"],
};
const LABELS: Record<string, string> = {
  home: "Home",
  tools: "Tools",
  library: "Library",
  settings: "Settings",
};

function TabBar({ state, navigation }: any) {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const renderTab = (route: any) => {
    const i = state.routes.indexOf(route);
    const focused = state.index === i;
    const [on, off] = ICONS[route.name];
    return (
      <PressableScale
        key={route.key}
        style={styles.tab}
        onPress={() => router.push(route.name)}
      >
        <Ionicons
          name={(focused ? on : off) as any}
          size={23}
          color={focused ? t.accent : t.muted}
        />
        <Text style={[styles.label, { color: focused ? t.text : t.muted }]}>
          {LABELS[route.name]}
        </Text>
      </PressableScale>
    );
  };

  const r = state.routes;
  return (
    <View
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={60}
        tint={t.dark ? "dark" : "light"}
        style={[styles.bar, { borderColor: t.line }]}
      >
        {renderTab(r[0])}
        {renderTab(r[1])}
        <View style={styles.tab} />
        {renderTab(r[2])}
        {renderTab(r[3])}
      </BlurView>
      <PressableScale
        style={[styles.fab, { bottom: Math.max(insets.bottom, 12) + 18 }]}
        onPress={() => router.push("/scan")}
      >
        <Ionicons name="scan" size={28} color="#06241F" />
      </PressableScale>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(p) => <TabBar {...p} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="tools" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
  },
  bar: {
    flexDirection: "row",
    height: 68,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    alignItems: "center",
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  label: { fontFamily: font.medium, fontSize: 11 },
  fab: {
    position: "absolute",
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.teal,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: palette.teal,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
