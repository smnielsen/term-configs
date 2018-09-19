#/bin/bash

JIRA_URL="https://gutros.atlassian.net"
JIRA_AUTH_URI="/rest/auth/latest/session"
JIRA_API_URI="/rest/api/latest/"
JIRA_API_SEARCH_URI="/rest/api/2/search"

API_HEADERS="-s -H \"Content-Type: application/json\""

##
## Validate User to JIRA
##

# getting login fo JIRA
if [[ -z $JIRA_LOGIN ]]; then
	read -p "Enter your login for JIRA: " JIRA_LOGIN
fi
# getting password for JIRA
read -sp "Enter your password for JIRA: " JIRA_PASSWORD

# authentication in JIRA
SESSION_VALUE_REGEX='s/^.*"value":"\([^"]*\)".*$/\1/'
JIRA_SESSION_ID=`curl -s -H "Content-Type: application/json" -d "{\"username\":\"${JIRA_LOGIN}\",\"password\":\"${JIRA_PASSWORD}\"}" -X POST ${JIRA_URL}${JIRA_AUTH_URI} | sed -e ${SESSION_VALUE_REGEX}`

echo ""
if [[ -n $(echo $JIRA_SESSION_ID | grep error) ]]; then
	echo "ERROR: Wrong login or password!"
    exit 1
else
    echo "# JIRA: Session approved.."
fi

##
## Execute Search JQL Query for JIRA
##

EPIC_ID="SP-234"
STORY_POINT_FIELD="customfield_10005"
JQL_2="project%20%3D%20SP%20AND%20(issue%20in%20(SP-85%2CSP-48%2CSP-41%2CSP-273)%20OR%20\"Parent%20Link\"%20in%20(SP-85%2CSP-48%2CSP-41%2CSP-273))%20AND%20status%20!%3D%20Closed%20AND%20status%20!%3D%20Done%20AND%20status%20!%3D%20Archive%20ORDER%20BY%20type%20ASC"
JQL="project%20%3D%20SP%20AND%20(\"Link\"%20in%20(SP-699%2C%20SP-85)%20OR%20\"Parent%20Link\"%20in%20(SP-85%2C%20SP-39%2C%20SP-48%2C%20SP-273%2C%20SP-41%2C%20SP-596))%20AND%20status%20!%3D%20Closed%20AND%20status%20!%3D%20Done%20AND%20status%20!%3D%20Archive%20ORDER%20BY%20\"Story%20Points\"%20DESC"
API_SEARCH_SED="${JIRA_API_SEARCH_URI}?jql=${JQL_2}&fields=${STORY_POINT_FIELD},status,summary,parent"

echo ""
echo "Testing: ${JIRA_URL}/${API_SEARCH_SED}"
#SED=`curl ${API_HEADERS} -b JSESSIONID=${JIRA_SESSION_ID} ${API_HEADERS} ${JIRA_URL}/${API_SEARCH_SED}`
SED=`curl ${API_HEADERS} -u ${JIRA_LOGIN}:${JIRA_PASSWORD} ${API_HEADERS} ${JIRA_URL}/${API_SEARCH_SED}`
if [[ -z $SED ]]
then
    echo "not found or unknown error has occured!"
    exit 1
fi

echo ${SED} > burndown/issues.json
## Run node service
node jira-burndown.js --include-subtasks ${JIRA_LOGIN} ${JIRA_PASSWORD}
exit 0