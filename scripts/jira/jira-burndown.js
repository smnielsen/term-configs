
const fetch = require('node-fetch');
const fs = require('fs');
const result = require('./burndown/issues.json');
const storedBurndownChart = require('./burndown/burndown.json');

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

const fetchSubtasks = (subTasks) => {
    const subTaskPromises = subTasks.map((subTask) => fetch(subTask.self));

    return Promise.all(subTaskPromises);
};

/*
const burndownChart = {
    "SP-85": {
        key: "SP-85",
        summary: "",
        storyPoints: 1,
        subtasks: {
            "2018-06-16": [
            ]
        }
    }
}
*/

const date = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth() < 10 ? `0${d.getMonth()}` : d.getMonth();
    const day = d.getDate();
    return `${year}-${month}-${day}`;
}

const addStatuses = [
    "Ready for Development",
    "In Development"
];

const reduceBurndownChart = async (issues) => {
    // Fetch Issues
    const burndownChart = issues.reduce((memo, issue, index) => {
        const { key, fields: { 
            customfield_10005: storyPoints, 
            summary,
            parent = {},
            status: { 
                name 
            }
        }} = issue;
        
        const dateStr = date();
        const isSubTask = parent.key !== undefined;
        let burndownTask = {
            key,
            summary,
            storyPoints: storyPoints || 0
        };

        if (addStatuses.includes(name)) {
            console.log(`${isSubTask ? `SUB_TASK(${parent.key})` : 'CONCEPT'} -> ${key}: ${burndownTask.storyPoints}. "${summary}" -> ${name}`);
            if (isSubTask) {
                const parentTask = memo[parent.key];
    
                if (!parentTask.subtasks[dateStr]) {
                    parentTask.subtasks[dateStr] = [];
                }
                
                parentTask.subtasks[dateStr].push(burndownTask);
    
                // Update Memo
                memo[parent.key] = parentTask;
            } else {
                const storedTask = memo[key];
                if (storedTask) {
                    console.info(`   -> Has Stored Task`);
                    burndownTask = {
                        ...storedTask,
                        ...burndownTask
                    };
                } else {
                    burndownTask.subtasks = {};
                }
    
                // Always clear today subtasks (it will be populated again)
                burndownTask.subtasks[dateStr] = [];
    
                // Add to Memo
                memo[key] = burndownTask;
            }
        } else {
            console.log(` --- IGNORING --- ${isSubTask ? `SUB_TASK(${parent.key})` : 'CONCEPT'} -> ${key}: ${burndownTask.storyPoints}. "${summary}" -> ${name}`);
        }
        
        
        return memo;
    }, storedBurndownChart || {});

    return burndownChart;
}

reduceBurndownChart(result.issues)
    .then((burndown) => {
        console.log('----------------------');
        console.log(`Tickets: ${result.issues.length}`);
        return burndown;
    })
    .then((burndown) => {
        console.log('-------------------------');
        const str = JSON.stringify(burndown);
        fs.writeFileSync('burndown/burndown.json', str, 'utf8');
        return burndown;
    })
    .then((burndown) => {
        console.log('================= Burndown Chart: ========================');

        Object.keys(burndown).forEach((parentKey) => {
            const conceptStory = burndown[parentKey];
            console.log(`## ${parentKey}: ${conceptStory.summary}`);

            let previousSubtask = null;
            Object.keys(conceptStory.subtasks).forEach((dateStr) => {
                const daySubtasks = conceptStory.subtasks[dateStr];
                const totalCount = daySubtasks.reduce((count, s) => count + s.storyPoints, 0);
                const previousCount = previousSubtask ? previousSubtask.count : 0;

                const diff = previousSubtask ? (totalCount - previousSubtask.count) : 0;
                if (previousSubtask) {
                    console.log(`    ${previousSubtask.dateStr} -> ${dateStr}. StoryPoints=${totalCount}. Burndown = ${diff > 0 ? `+${diff}` : diff}`)
                } else {
                    console.log(`    ${dateStr}. StoryPoints=${totalCount}.`)
                }

                previousSubtask = daySubtasks;
                previousSubtask.count = totalCount;
                previousSubtask.dateStr = dateStr;
            });

            console.log('');
        });
    })
    .catch((err) => {
        console.error(err.message, err);
    });
