import { useRef } from 'react';
import {
    useAnimatedScrollHandler,
    withTiming,
    useSharedValue,
} from 'react-native-reanimated';
import { useScroll } from '../contexts/ScrollContext';

export const useTabScroll = () => {
    const { tabBarTranslateY } = useScroll();
    const lastScrollY = useSharedValue(0);
    const scrollOffset = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            const currentY = event.contentOffset.y;
            const diff = currentY - lastScrollY.value;

            // Only hide if we've scrolled past a certain threshold
            if (currentY > 100) {
                if (diff > 5 && tabBarTranslateY.value === 0) {
                    // Scrolling down - hide
                    tabBarTranslateY.value = withTiming(120, { duration: 300 });
                } else if (diff < -5 && tabBarTranslateY.value > 0) {
                    // Scrolling up - show
                    tabBarTranslateY.value = withTiming(0, { duration: 300 });
                }
            } else if (currentY <= 0) {
                // At the top - always show
                tabBarTranslateY.value = withTiming(0, { duration: 300 });
            }

            lastScrollY.value = currentY;
        },
    });

    return scrollHandler;
};
