import React from "react";

import {IconGithub} from "../components/icons";

const Icon = ({ name }) => {
    switch (name) {
        case 'Github':
            return <IconGithub/>;
    }
}
