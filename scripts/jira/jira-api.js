const result = require('./issues.json');
const fetch = require('node-fetch');

const args = process.argv.slice(2);

let includeSubtasks = false;
let jiraLogin, jiraPassword;
if (args[0] === '--include-subtasks') {
    [jiraLogin, jiraPassword] = args.slice(1);
    console.log(`Jira Login:   ${jiraLogin} \nJira Password: ${jiraPassword !== undefined}`)
    if (jiraLogin && jiraPassword) {
        includeSubtasks = true;
    }
}

if (!result || !result.issues) {
    console.error('Could not get issues');
    return;
}

console.log(`Number of tickets left: ${result.issues.length}`);


const doneDev = [
    'Ready for QA',
    'Ready for Deploy',
    'Archived'
];
// Counter method
let countTicket = (counters, name, storyPoint) => {
    if (name === 'In Review') {
        counters.inReview += storyPoint || 0;
    } else if (doneDev.indexOf(name) !== -1) {
        counters.done += storyPoint || 0;
    } else {
        counters.toDevelop += storyPoint || 0;
    }
    return counters;
};

const fetchSubtasks = (subTasks) => {
    const subTaskPromises = subTasks.map((subTask) => fetch(subTask.self));

    return Promise.all(subTaskPromises);
};

const reduceIssue = async (issue) => {

};

const reduceIssues = async (issues) => {
    // Fetch Issues
    const issuesResult = issues.reduce((counters, issue, index) => {
        const { key, fields: { customfield_10005, status: { name } }} = issue;
        const storyPoint = customfield_10005;
        console.log(`${key} = ${storyPoint | 'not defined'}. (${name})`);
    
        return countTicket(counters, name, storyPoint);
    }, { inReview: 0, done: 0, toDevelop: 0 });

    return issuesResult;
}

reduceIssues(result.issues)
    .then(({ toDevelop, inReview, done }) => {
        console.log('----------------------');
        console.log(`Done: ${done}`);
        console.log(`In Review: ${inReview}`);
        console.log(`Left to develop: ${toDevelop}`);
        console.log(`Total: ${toDevelop + inReview + done}`);
    })
    .catch((err) => {
        console.error(err.message, err);
    });
