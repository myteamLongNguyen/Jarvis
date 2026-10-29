import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Height the on-screen keyboard currently covers, for views positioned against the
 * bottom of the screen.
 *
 * Android is deliberately always 0: its default softInputMode resizes the window,
 * so a bottom-anchored view already moves up on its own and adding the height
 * again would push it twice as far. iOS overlays the keyboard instead, so there
 * the offset has to be applied by hand.
 */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    // `Will` events fire in step with the iOS animation, so the panel travels with
    // the keyboard rather than jumping once it has finished.
    const show = Keyboard.addListener('keyboardWillShow', (e) => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardWillHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
