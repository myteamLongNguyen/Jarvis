import { Image } from 'react-native';

interface Props {
  size?: number;
}

/** The Jarvis mark (the same artwork used for the app's home-screen icon), for in-app branding. */
export default function JarvisLogo({ size = 64 }: Props) {
  return (
    <Image
      source={require('../../assets/android-icon-foreground.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityLabel="Jarvis"
    />
  );
}
