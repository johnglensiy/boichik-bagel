import { css } from 'styled-components';

import LatoBlack from '../fonts/Lato/Lato-Black.ttf';
import LatoBlackItalic from '../fonts/Lato/Lato-BlackItalic.ttf';
import LatoBold from '../fonts/Lato/Lato-Bold.ttf';
import LatoBoldItalic from '../fonts/Lato/Lato-BoldItalic.ttf';
import LatoItalic from '../fonts/Lato/Lato-Italic.ttf';
import LatoLight from '../fonts/Lato/Lato-Light.ttf';
import LatoLightItalic from '../fonts/Lato/Lato-LightItalic.ttf';
import LatoRegular from '../fonts/Lato/Lato-Regular.ttf';
import LatoThin from '../fonts/Lato/Lato-Thin.ttf';
import LatoThinItalic from '../fonts/Lato/Lato-ThinItalic.ttf';

const latoNormalWeights = {
    100: [LatoThin],
    300: [LatoLight],
    400: [LatoRegular],
    700: [LatoBold],
    900: [LatoBlack]
};

const latoItalicWeights = {
    100: [LatoThinItalic],
    300: [LatoLightItalic],
    400: [LatoItalic],
    700: [LatoBoldItalic],
    900: [LatoBlackItalic]
};

const lato = {
    name: 'Lato',
    normal: latoNormalWeights,
    italic: latoItalicWeights,
};

const createFontFaces = (family, style = 'normal') => {
    let styles = '';

    for (const [weight, formats] of Object.entries(family[style])) {
        const tff = formats[0];
        // const woff2 = formats[1];

        styles += `
        @font-face {
            font-family: '${family.name}';
            src: url(${tff}) format('woff');
            font-weight: ${weight};
            font-style: ${style};
            font-display: auto;
        }
        `;
    }
    return styles;
};

const latoNormal = createFontFaces(lato);
const latoItalic = createFontFaces(lato, 'italic');

const Fonts = css`
    ${latoNormal + latoItalic}
`;

export default Fonts;

