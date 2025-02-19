import React from "react";

import IconGithub from "../icons/github";
import IconResume from "./resume";

const Icon = ({ name }) => {
    switch (name) {
        case 'Github':
            return <IconGithub/>;
        case 'Resume':
            return <IconResume/>;
    }
    
}

export default Icon;
