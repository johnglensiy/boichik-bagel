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

import MontserratBlack from '../fonts/Montserrat/Montserrat-Black.ttf';
import MontserratBlackItalic from '../fonts/Montserrat/Montserrat-BlackItalic.ttf';
import MontserratBold from '../fonts/Montserrat/Montserrat-Bold.ttf';
import MontserratBoldItalic from '../fonts/Montserrat/Montserrat-BoldItalic.ttf';
import MontserratItalic from '../fonts/Montserrat/Montserrat-Italic.ttf';
import MontserratLight from '../fonts/Montserrat/Montserrat-Light.ttf';
import MontserratLightItalic from '../fonts/Montserrat/Montserrat-LightItalic.ttf';
import MontserratRegular from '../fonts/Montserrat/Montserrat-Regular.ttf';
import MontserratMedium from '../fonts/Montserrat/Montserrat-Medium.ttf';
import MontserratMediumItalic from '../fonts/Montserrat/Montserrat-MediumItalic.ttf';
import MontserratThin from '../fonts/Montserrat/Montserrat-Thin.ttf';
import MontserratThinItalic from '../fonts/Montserrat/Montserrat-ThinItalic.ttf';

import UrbanistBlack from '../fonts/Urbanist/Urbanist-Black.ttf';
import UrbanistBlackItalic from '../fonts/Urbanist/Urbanist-BlackItalic.ttf';
import UrbanistBold from '../fonts/Urbanist/Urbanist-Bold.ttf';
import UrbanistBoldItalic from '../fonts/Urbanist/Urbanist-BoldItalic.ttf';
import UrbanistItalic from '../fonts/Urbanist/Urbanist-Italic.ttf';
import UrbanistLight from '../fonts/Urbanist/Urbanist-Light.ttf';
import UrbanistLightItalic from '../fonts/Urbanist/Urbanist-LightItalic.ttf';
import UrbanistRegular from '../fonts/Urbanist/Urbanist-Regular.ttf';
import UrbanistMedium from '../fonts/Urbanist/Urbanist-Medium.ttf';
import UrbanistMediumItalic from '../fonts/Urbanist/Urbanist-MediumItalic.ttf';
import UrbanistThin from '../fonts/Urbanist/Urbanist-Thin.ttf';
import UrbanistThinItalic from '../fonts/Urbanist/Urbanist-ThinItalic.ttf';

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

const montserratNormalWeights = {
    100: [MontserratThin],
    300: [MontserratLight],
    400: [MontserratRegular],
    500: [MontserratMedium],
    700: [MontserratBold],
    900: [MontserratBlack]
};

const montserratItalicWeights = {
    100: [MontserratThinItalic],
    300: [MontserratLightItalic],
    400: [MontserratItalic],
    500: [MontserratMediumItalic],
    700: [MontserratBoldItalic],
    900: [MontserratBlackItalic]
};

const urbanistNormalWeights = {
    100: [UrbanistThin],
    300: [UrbanistLight],
    400: [UrbanistRegular],
    500: [UrbanistMedium],
    700: [UrbanistBold],
    900: [UrbanistBlack]
};

const urbanistItalicWeights = {
    100: [UrbanistThinItalic],
    300: [UrbanistLightItalic],
    400: [UrbanistItalic],
    500: [UrbanistMediumItalic],
    700: [UrbanistBoldItalic],
    900: [UrbanistBlackItalic]
};

const lato = {
    name: 'Lato',
    normal: latoNormalWeights,
    italic: latoItalicWeights,
};

const montserrat = {
    name: 'Montserrat',
    normal: montserratNormalWeights,
    italic: montserratItalicWeights
}

const urbanist = {
    name: 'Urbanist',
    normal: urbanistNormalWeights,
    italic: urbanistItalicWeights
}

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
const montserratNormal = createFontFaces(montserrat);
const montserratItalic = createFontFaces(montserrat, 'italic');
const urbanistNormal = createFontFaces(urbanist);
const urbanistItalic = createFontFaces(urbanist, 'italic');

const Fonts = css`
    ${latoNormal + latoItalic}
    ${montserratNormal + montserratItalic}
    ${urbanistNormal + urbanistItalic}
`;

export default Fonts;

