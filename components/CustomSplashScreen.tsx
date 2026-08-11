import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "../theme/colors";

const { width, height } = Dimensions.get("window");

interface CustomSplashScreenProps {
  onFinish: () => void;
}

export default function CustomSplashScreen({
  onFinish,
}: CustomSplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Exit animation after 2.5 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View style={styles.iconContainer}>
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
        <Text style={styles.appName}>KlickCard</Text>
        <Text style={styles.tagline}>Discover Amazing Deals</Text>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingProgress,
                {
                  width: new Animated.Value(100),
                },
              ]}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.purple.main,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 32,
  },
  loadingContainer: {
    width: 200,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  loadingBar: {
    height: "100%",
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  loadingProgress: {
    height: "100%",
    backgroundColor: colors.white,
  },
});
