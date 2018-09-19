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
JQL="\"Epic%20Link\"=${EPIC_ID}%20AND%20status!=Closed%20AND%20status!=Archive"
API_SEARCH_SED="${JIRA_API_SEARCH_URI}?jql=${JQL}&fields=${STORY_POINT_FIELD},status,subtasks"

echo ""
echo "Testing: ${JIRA_URL}/${API_SEARCH_SED}"
#SED=`curl ${API_HEADERS} -b JSESSIONID=${JIRA_SESSION_ID} ${API_HEADERS} ${JIRA_URL}/${API_SEARCH_SED}`
SED=`curl ${API_HEADERS} -u ${JIRA_LOGIN}:${JIRA_PASSWORD} ${API_HEADERS} ${JIRA_URL}/${API_SEARCH_SED}`
if [[ -z $SED ]]
then
    echo "not found or unknown error has occured!"
    exit 1
fi

echo ${SED} > issues.json
## Run node service
node jira-api.js --include-subtasks ${JIRA_LOGIN} ${JIRA_PASSWORD}
exit 0