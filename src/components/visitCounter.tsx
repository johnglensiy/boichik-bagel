import React, { useState, useEffect } from 'react';

const VisitCounter = (props: any) => {
    const [visits, setVisits] = useState(0);
    const counter = document.querySelector('.visitor-counter')

    const ordinalSuffix = (num: number) => {
        let ones = num % 10;
        let tens = num % 100;

        if (ones == 1 && tens != 11) {
            return "st"
        }
        else if (ones == 2 && tens != 12) {
            return "nd"
        }
        else if (ones == 3 && tens != 13) {
            return "rd"
        }
        else {
            return "th"
        }
    }

    useEffect(
        () => {
            // document.title = `You clicked ${visits} times`;
            
            
            // fetch number of visitors
            // check session storage if visited is true
            // if not visited then we have a new visitor (or at least within this browser session)
            //      set visited to true
            //      fetch visitors from database increment by 1 then post (handled by lambda function)
            // else
            //      fetch visitors from database
            // take visitors and set it to state 
            async function getVisitors() {
                let visitors;
                let data;

                let response = await fetch("https://dttj72l51d.execute-api.us-west-1.amazonaws.com/default/visitorCount");

                data = await response.json();
                console.log(data);
                visitors = data.visitorCount;
                setVisits(visitors);
            }

            getVisitors()
        },
        []
    );

    return (
        <div>
            <p className="visitor-counter">You are the {visits}{ordinalSuffix(visits)} viewer of this website!</p>
            {/* <button onClick={() => setVisits(visits + 1)}>I have been clicked {visits} times</button>     */}
        </div>
    );
};

export default VisitCounter;
