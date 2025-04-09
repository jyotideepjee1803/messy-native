import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, View, StyleSheet, Image } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const Loader = () => {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = () => {
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: screenWidth - 80, // padding from right (60 icon + ~20 margin)
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => bounce());
    };

    bounce();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateX }] }}>
        <Image
          source={require('../../assets/logo.png')}
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
      alignItems: 'flex-start',
      backgroundColor: '#fff',
    },
    icon: {
      width: 60,
      height: 60,
      marginLeft: 10,
    },
});

export default Loader;
