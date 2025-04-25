import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Image } from 'react-native';

const Loader = () => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };

    pulse();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Image
          source={require('@/assets/logo.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // center horizontally
    backgroundColor: '#fff',
  },
  icon: {
    width: 60,
    height: 60,
  },
});

export default Loader;