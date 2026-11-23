import type { ImageSourcePropType } from "react-native";
import { Image, Pressable, Text, useWindowDimensions, View } from "react-native";
import { colors, s } from "./ui";

/**
 * The little mascot tiles that introduce what MyMuse can do. Artwork lives in
 * `assets/features` so the same illustrations appear in the app on every
 * platform.
 */
export type Feature = {
  id: string;
  title: string;
  detail: string;
  prompt: string;
  art: ImageSourcePropType;
};

export const features: Feature[] = [
  {
    id: "research",
    title: "Research",
    detail: "Read the web and bring back what matters.",
    prompt: "Research a topic for me and summarise what you find.",
    art: require("../assets/features/research.jpg"),
  },
  {
    id: "workflows",
    title: "Workflows",
    detail: "Turn a routine into a plan I can run again.",
    prompt: "Turn this routine into a workflow you can repeat for me.",
    art: require("../assets/features/workflows.jpg"),
  },
  {
    id: "memory",
    title: "Memory",
    detail: "Remember the people, places and preferences.",
    prompt: "Remember a preference so it carries into later work.",
    art: require("../assets/features/memory.jpg"),
  },
  {
    id: "browser",
    title: "Browser",
    detail: "Browse in a session that stays with me.",
    prompt: "Open a website and walk me through what you see.",
    art: require("../assets/features/browser.jpg"),
  },
  {
    id: "analytics",
    title: "Analytics",
    detail: "Track spending, progress and anything countable.",
    prompt: "Set up a simple tracker for something I want to watch.",
    art: require("../assets/features/analytics.jpg"),
  },
  {
    id: "docs",
    title: "Docs",
    detail: "Draft, fill in and keep documents tidy.",
    prompt: "Draft a document I can review and keep.",
    art: require("../assets/features/docs.jpg"),
  },
  {
    id: "design",
    title: "Design",
    detail: "Sketch ideas and organise your visual work.",
    prompt: "Help me shape a design idea into something concrete.",
    art: require("../assets/features/design.jpg"),
  },
  {
    id: "payment",
    title: "Payments",
    detail: "Prepare a payment for your approval, never behind it.",
    prompt: "Prepare a payment for me to review before anything happens.",
    art: require("../assets/features/payment.jpg"),
  },
  {
    id: "developer",
    title: "Developer",
    detail: "Read code, run commands and check the result.",
    prompt: "Look through a project and explain what I should change.",
    art: require("../assets/features/developer.jpg"),
  },
  {
    id: "planner",
    title: "Planner",
    detail: "Find time and build the week around it.",
    prompt: "Plan my week and leave room for what matters.",
    art: require("../assets/features/planner.jpg"),
  },
  {
    id: "spaces",
    title: "Spaces",
    detail: "Keep separate threads for separate parts of life.",
    prompt: "Start a space for a project I am working on.",
    art: require("../assets/features/spaces.jpg"),
  },
  {
    id: "audio",
    title: "Audio",
    detail: "Play, describe and organise sound.",
    prompt: "Help me organise the audio I am working with.",
    art: require("../assets/features/audio.jpg"),
  },
  {
    id: "vision",
    title: "Vision",
    detail: "Look at a picture and tell you what is in it.",
    prompt: "Look at an image I share and describe what matters in it.",
    art: require("../assets/features/vision.jpg"),
  },
  {
    id: "chat",
    title: "Chat",
    detail: "Talk it through and get a straight answer.",
    prompt: "Talk this through with me before we decide.",
    art: require("../assets/features/chat.jpg"),
  },
  {
    id: "code",
    title: "Code",
    detail: "Write the change and prove it works.",
    prompt: "Write the code change and verify it before you hand it back.",
    art: require("../assets/features/code.jpg"),
  },
  {
    id: "automation",
    title: "Automation",
    detail: "Hand over the steps you keep repeating.",
    prompt: "Automate the steps I keep repeating.",
    art: require("../assets/features/automation.jpg"),
  },
  {
    id: "meetings",
    title: "Meetings",
    detail: "Take notes, keep the decisions and follow up.",
    prompt: "Turn my meeting notes into decisions and next steps.",
    art: require("../assets/features/meetings.jpg"),
  },
  {
    id: "security",
    title: "Security",
    detail: "Ask before anything leaves or changes.",
    prompt: "Show me what you would need my approval for.",
    art: require("../assets/features/security.jpg"),
  },
];

export function matchingFeatures(query: string) {
  return features.filter((feature) =>
    `${feature.title} ${feature.detail}`.toLowerCase().includes(query.toLowerCase()),
  );
}

export function FeatureGrid({
  query = "",
  onPress,
}: {
  query?: string;
  onPress: (feature: Feature) => void;
}) {
  const { width } = useWindowDimensions();
  const columns = width >= 760 ? 3 : 2;
  const visible = matchingFeatures(query);
  if (!visible.length) return null;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
      {visible.map((feature) => (
        <Pressable
          key={feature.id}
          accessibilityRole="button"
          accessibilityLabel={`${feature.title}. ${feature.detail}`}
          onPress={() => onPress(feature)}
          style={({ pressed }) => ({
            width: columns === 3 ? "31%" : "47.5%",
            gap: 8,
            opacity: pressed ? 0.75 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          })}
        >
          <View
            style={{
              borderRadius: 22,
              overflow: "hidden",
              backgroundColor: colors.card,
              shadowColor: "#12303F",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.06,
              shadowRadius: 16,
              elevation: 2,
            }}
          >
            <Image
              source={feature.art}
              resizeMode="cover"
              accessible={false}
              style={{ width: "100%", aspectRatio: 420 / 349 }}
            />
          </View>
          <View style={{ paddingHorizontal: 4, gap: 2 }}>
            <Text style={[s.text, { fontSize: 13, fontWeight: "600", lineHeight: 18 }]}>
              {feature.title}
            </Text>
            <Text numberOfLines={2} style={[s.small, { lineHeight: 15 }]}>
              {feature.detail}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
