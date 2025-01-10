import React from "react";

import IconGithub from "../icons/github.tsx";

const Icon = ({ name }) => {
    switch (name) {
        case 'Github':
            return <IconGithub/>;
    }
}

export default Icon;
