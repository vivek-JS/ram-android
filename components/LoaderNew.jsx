import React from "react";
import {
  View,
  ActivityIndicator,
  Modal,
  Text,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

// Simple Loader Component
export const SimpleLoader = ({ loading, color = "#0066FF" }) => {
  if (!loading) return null;

  return (
    <View style={styles.simpleContainer}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
};

// Full Screen Loader with Blur Background
export const FullScreenLoader = ({ visible, message }) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible}>
      <BlurView intensity={50} style={styles.fullScreenContainer}>
        <View style={styles.loaderCard}>
          <ActivityIndicator size="large" color="#0066FF" />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </BlurView>
    </Modal>
  );
};

// Spinner Animation Loader
export const SpinnerLoader = ({ visible, size = 40 }) => {
  const spinValue = new Animated.Value(0);

  React.useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [visible]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!visible) return null;

  return (
    <View style={styles.spinnerContainer}>
      <Animated.View
        style={[
          styles.spinner,
          {
            transform: [{ rotate: spin }],
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    </View>
  );
};

// Dots Loader
export const DotsLoader = ({ visible, color = "#0066FF" }) => {
  const [dot1] = React.useState(new Animated.Value(0));
  const [dot2] = React.useState(new Animated.Value(0));
  const [dot3] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      const animation = (value) =>
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]);

      Animated.loop(
        Animated.stagger(200, [
          animation(dot1),
          animation(dot2),
          animation(dot3),
        ])
      ).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.dotsContainer}>
      {[dot1, dot2, dot3].map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: color,
              transform: [
                {
                  scale: dot,
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

// Progress Loader
export const ProgressLoader = ({ visible, progress, message }) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible}>
      <BlurView intensity={50} style={styles.fullScreenContainer}>
        <View style={styles.progressCard}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          {message && <Text style={styles.progressMessage}>{message}</Text>}
          <Text style={styles.progressPercentage}>{progress}%</Text>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  simpleContainer: {
    padding: 20,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  loaderCard: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 120,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  spinnerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    borderWidth: 4,
    borderColor: "#f3f3f3",
    borderTopColor: "#0066FF",
    borderRightColor: "#0066FF",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 3,
  },
  progressCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: width * 0.8,
    alignItems: "center",
  },
  progressBarContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "#f3f3f3",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#0066FF",
  },
  progressMessage: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  progressPercentage: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: "#0066FF",
  },
});

export default {
  SimpleLoader,
  FullScreenLoader,
  SpinnerLoader,
  DotsLoader,
  ProgressLoader,
};
