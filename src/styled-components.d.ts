import 'styled-components';
import { StyledTheme } from './theme';

declare module 'styled-components' {
  export interface DefaultTheme extends StyledTheme {}
}
