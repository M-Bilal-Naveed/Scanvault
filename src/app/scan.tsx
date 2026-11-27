import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "../components/PressableScale";
import { imagesToPdf, normalize, Page } from "../services/pdf";
import { useLibrary } from "../store/library";
import { font, palette, radius } from "../theme/tokens";

export default function Scan() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [perm, request] = useCameraPermissions();
  const cam = useRef<CameraView>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [busy, setBusy] = useState(false);
  const [fit, setFit] = useState<"a4" | "image">("a4");
  const add = useLibrary((s) => s.add);

  const addUris = async (uris: string[]) => {
    try {
      const out: Page[] = [];
      for (const u of uris) out.push(await normalize(u));
      setPages((p) => [...p, ...out]);
    } catch (error: unknown) {
      Alert.alert(
        "Could not read image",
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  const shoot = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const picture = await cam.current?.takePictureAsync({ quality: 1 });
      if (picture?.uri) await addUris([picture.uri]);
    } catch (error: unknown) {
      Alert.alert(
        "Could not take photo",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setBusy(false);
    }
  };
  const pick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (!result.canceled) {
        await addUris(result.assets.map((asset) => asset.uri));
      }
    } catch (error: unknown) {
      Alert.alert(
        "Could not open gallery",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setBusy(false);
    }
  };
  const make = async () => {
    if (busy || pages.length === 0) return;
    setBusy(true);
    try {
      const name = `Scan ${new Date().toLocaleDateString().replace(/\//g, "-")}`;
      const res = await imagesToPdf(pages, "scan", fit);
      await add({ name, ...res });
      router.replace("/(tabs)/library");
    } catch (error: unknown) {
      Alert.alert(
        "PDF failed",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setBusy(false);
    }
  };

  if (!perm) return <View style={styles.dark}><StatusBar style="light" /></View>;
  if (!perm.granted) {
    return (
      <View style={[styles.dark, styles.center]}>
        <StatusBar style="light" />
        <Ionicons name="camera-outline" size={56} color={palette.teal} />
        <Text style={styles.big}>Allow camera access</Text>
        <Text style={styles.sub}>
          ScanVault needs the camera to scan pages. Photos stay on your phone.
        </Text>
        <PressableScale style={styles.cta} onPress={request}>
          <Text style={styles.ctaT}>Allow camera</Text>
        </PressableScale>
        <PressableScale
          style={[styles.cta, { backgroundColor: "#ffffff18" }]}
          onPress={pick}
        >
          <Text style={[styles.ctaT, { color: "#fff" }]}>
            Use gallery instead
          </Text>
        </PressableScale>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={[styles.permissionBack, { top: insets.top + 8 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={23} color="#fff" />
        </PressableScale>
      </View>
    );
  }

  return (
    <View style={styles.dark}>
      <StatusBar style="light" />
      <CameraView ref={cam} style={StyleSheet.absoluteFill} facing="back" />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.round}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </PressableScale>
        <PressableScale
          style={styles.pill}
          onPress={() => setFit(fit === "a4" ? "image" : "a4")}
        >
          <Text style={styles.pillT}>
            {fit === "a4" ? "A4 page" : "Fit to image"}
          </Text>
        </PressableScale>
      </View>
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
        {pages.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}
          >
            {pages.map((p, i) => (
              <View key={p.uri + i}>
                <Image source={{ uri: p.uri }} style={styles.thumb} />
                <PressableScale
                  style={styles.x}
                  onPress={() => setPages(pages.filter((_, k) => k !== i))}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </PressableScale>
              </View>
            ))}
          </ScrollView>
        )}
        <View style={styles.row}>
          <PressableScale style={styles.round} onPress={pick}>
            <Ionicons name="images" size={24} color="#fff" />
          </PressableScale>
          <PressableScale style={styles.shutter} onPress={shoot}>
            {busy ? (
              <ActivityIndicator color={palette.ink} />
            ) : (
              <View style={styles.shutterIn} />
            )}
          </PressableScale>
          <PressableScale
            style={[
              styles.round,
              pages.length
                ? { backgroundColor: palette.teal }
                : { opacity: 0.4 },
            ]}
            disabled={!pages.length || busy}
            onPress={make}
          >
            <Ionicons
              name="checkmark"
              size={28}
              color={pages.length ? palette.ink : "#fff"}
            />
          </PressableScale>
        </View>
        <Text style={styles.hint}>
          {pages.length
            ? `${pages.length} page${pages.length > 1 ? "s" : ""} · tap ✓ to create PDF`
            : "Snap each page, or pick from gallery"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dark: { flex: 1, backgroundColor: palette.ink },
  center: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 14,
  },
  permissionBack: { position: 'absolute', left: 20, zIndex: 1, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff26' },
  big: {
    fontFamily: font.heavy,
    fontSize: 26,
    color: "#fff",
    textAlign: "center",
  },
  sub: {
    fontFamily: font.medium,
    fontSize: 15,
    color: "#9AA3C4",
    textAlign: "center",
    lineHeight: 22,
  },
  cta: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: palette.teal,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaT: { fontFamily: font.bold, fontSize: 16, color: palette.ink },
  top: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    gap: 16,
    backgroundColor: "#0E1630B8",
    paddingTop: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 24,
  },
  round: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ffffff26",
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#ffffff26",
    justifyContent: "center",
  },
  pillT: { fontFamily: font.bold, color: "#fff", fontSize: 14 },
  shutter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterIn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: palette.ink,
  },
  thumb: {
    width: 56,
    height: 74,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: palette.teal,
  },
  x: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E5484D",
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    fontFamily: font.medium,
    color: "#9AA3C4",
    textAlign: "center",
    fontSize: 13,
  },
});
