document.addEventListener("DOMContentLoaded", function() {

    const searchButton = document.getElementById("searchButton");
    const usernameInput = document.getElementById("searchBar");
    const easyCicle = document.querySelector("#easyCircle");
    const mediumCircle = document.querySelector("#mediumCircle");
    const hardCircle = document.querySelector("#hardCircle");
    const easyLabel = document.getElementById("easyLabel");
    const mediumLabel = document.getElementById("mediumLabel");
    const hardLabel = document.getElementById("hardLabel");
    const statsCard = document.getElementById("stats-card");
    const statsContainer = document.getElementById('statsDiv');

    //check username & return true or false based on regEx 
    function validUsername(username) {
        if(username.trim() == "") {
            alert("username is empty");
            return false;
        }
        const regex = /^[A-Za-z][A-Za-z0-9_]{4,14}$/;
        const isMatching = regex.test(username);
        if(!isMatching) {
            alert("username is not valid");
        }
        return isMatching;
    }

    function userProgress(solved, total, label, circle) {
        const progress = (solved/total)*100;
        circle.style.setProperty("--progress-degree", `${progress}%`);
        label.textContent = `${solved}/${total}`;
    }

    function resetOrCreateStatementDiv(message) {
        const parentContainer = document.getElementById("topContainer");
        let statementDiv = document.getElementById("statement");

        // Check if the statementDiv already exists
        if (!statementDiv) {
            // If it doesn't exist, create it
            statementDiv = document.createElement("div");
            statementDiv.id = "statement";
            parentContainer.appendChild(statementDiv);
        }
        // Set or reset the text content of the statementDiv
        statementDiv.textContent = message;
    }

    function displayUserData(details) {

        //store total number os questions
        //const totalQues = details.data.allQuestionsCount[0].count;
        const easyQues = details.data.allQuestionsCount[1].count;
        const mediumQues = details.data.allQuestionsCount[2].count;
        const hardQues = details.data.allQuestionsCount[3].count;
        //console.log(hardQues);

        //const totalSolved = details.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const easySolved = details.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const mediumSolved = details.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const hardSolved = details.data.matchedUser.submitStats.acSubmissionNum[3].count;
        //console.log(hardSolved);

        userProgress(easySolved, easyQues, easyLabel, easyCicle);
        userProgress(mediumSolved, mediumQues, mediumLabel, mediumCircle);
        userProgress(hardSolved, hardQues, hardLabel, hardCircle);
        //console.log(easyQues);
        //userProgress(totalSolved, totalQues, totalLabel, totalPorgressCircle);

        const cardData = [
            {
                label: "Overall total submissions",
                value: details.data.matchedUser.submitStats.totalSubmissionNum[0].submissions
            },
            {
                label: "Overall easy submissions",
                value: details.data.matchedUser.submitStats.totalSubmissionNum[1].submissions
            },
            {
                label: "Overall medium submissions",
                value: details.data.matchedUser.submitStats.totalSubmissionNum[2].submissions
            },
            {
                label: "Overall hard submissions",
                value: details.data.matchedUser.submitStats.totalSubmissionNum[3].submissions
            },
        ];

        //console.log(cardData);

        statsCard.innerHTML = cardData.map(data =>
            `<div class="card">
                <h5>${data.label}</h5>
                <p>${data.value}</p>
            </div>`
        ).join(" ");
        
        resetOrCreateStatementDiv("Thanyou, Try another username");
    }

    async function fetchUserDetails(username) {

        try {
            searchButton.textContent = "Loading...";
            searchButton.style.backgroundColor = "#6f7272";
            searchButton.disabled = true;

            //const response = await fetch(url);
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const url = 'https://leetcode.com/graphql';
            //concatenate both the URLs
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const graphql = JSON.stringify({
                query: `\n    query userSessionProgress($username: String!) 
                {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  
                matchedUser(username: $username) {\n    submitStats {\n      
                acSubmissionNum {\n        difficulty\n        count\n        
                submissions\n      }\n      totalSubmissionNum {\n        
                difficulty\n        count\n        submissions\n      }\n    }
                \n  }\n}\n    `,
                variables: { "username": `${username}` }
            })

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect: "follow",
            };

            const response = await fetch(proxyUrl+url, requestOptions);

            if(!response.ok) {
                throw new Error("unable to fetch user details");
            }
            const details = await response.json();
            //console.log(details);

            displayUserData(details);
            //console.log(details);
        } 
        catch (error) { 
            statsContainer.innerHTML = `<p>No data found</p>`;
        } 
        finally {
            searchButton.textContent = "Enter";
            searchButton.disabled = false;
            searchButton.style.backgroundColor = "rgb(64, 63, 63)";
        }
    }

    searchButton.addEventListener('click', async function() {
        const username = usernameInput.value;
        //console.log("Logging usename", username);
        validUsername(username);
        if(validUsername(username)) {
            await fetchUserDetails(username);
            statsContainer.style.display = "grid";
        }     
    })

})