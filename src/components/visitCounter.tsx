import React, { useState, useEffect } from 'react';

const VisitCounter = (props: any) => {
    const [visits, setVisits] = useState(0);

    useEffect(
        () => {
            document.title = `You clicked ${visits} times`;
        },
        [visits]
    );

    return (
        <div>
            <p>This is a button</p>
            <button onClick={() => setVisits(visits + 1)}>I have been clicked {visits} times</button>    
        </div>
    );
};

export default VisitCounter;
