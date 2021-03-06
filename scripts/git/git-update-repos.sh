#/bin/bash

printBold() {
    local text=$1
    echo -e "\033[1m$text\033[0m"
}
printRed() {
    local text=$1
    echo -e "\033[31m$text\033[0m"
}
printGreen() {
    local text=$1
    echo -e "\033[32m$text\033[0m"
}
printBlueBold() {
    local text=$1
    echo -e "\033[1;36m$text\033[0m"
}
printYellow() {
    local text=$1
    echo -e "\033[33m$text\033[0m"
}
goBack() {
    printf " | ${runtime}"
    echo "--------------------"
    cd - > /dev/null
}

# Read process args

UPDATE_PREFIX=""
SHOULD_RESET=
IGNORE_NODE_MODULES=

while [[ $# -gt 0 ]]; do
    key="$1"
    
    case $key in
        -r|--reset)
            SHOULD_RESET="true"
            printBold "ARG: Activating Reset to master for all branches"
            shift # past argument
        ;;
        -im|--ignore-modules)
            IGNORE_NODE_MODULES="true"
            printBold "ARG: Ignore node modules"
            shift # past argument
        ;;
        -x|--prefix)
            UPDATE_PREFIX=$2
            shift # past argument
            shift # past value
        ;;
        *)    # unknown option
            printYellow "Unknown option: $key"
            shift # past argument
        ;;
    esac
done

printBold "PREFIX = ${UPDATE_PREFIX}"
# Create update method

SKIPPED=()
UPDATED=()
ERROR=()

runUpdate() {
    startin=$(date +%s)
    local repoName=$1
    cd $repoName
    # First check if Git
    if [ ! -d '.git' ]; then 
        echo "${repoName} is not a Git repository"
        SKIPPED+=("$repoName->Not a Git repository")
        goBack
        return 0
    fi

    # Check git
    branchName=$(git rev-parse --abbrev-ref HEAD)
    printBlueBold " -- $repoName ($branchName) --"
    
    # Only update master and develop branches    
    if [[ $branchName != "master" ]] && [[ $branchName != *develop ]]; then
        if [ -z $SHOULD_RESET ]; then
            echo "SKIP: Not on master or develop"
            SKIPPED+=("$repoName->$branchName")
            goBack
            return 0
        fi
        echo "-R $ Switching branches: ${branchName} -> 'master'"
        git stash
        git fetch
        git checkout master
    fi
    
    if [ -z ${SHOULD_RESET} ]; then
        # Stash anything
        printBold "$ Stashing '${branchName}' changes"
        WAS_STASHED=$(git stash)
    else
        # Reset branch
        printBold "$ Resetting '${branchName}' HEAD"
        git checkout HEAD .
    fi
    
    # Run the update
    if ! git pull --rebase; then
        local msg=$?
        printRed "ERROR: Could not update: $msg"
        ERROR+=("$repoName->$msg")
        goBack
        return 0
    fi
    
    if [ -z ${IGNORE_NODE_MODULES} ]; then
        if [ ! -z ${SHOULD_RESET} ]; then
            printBold "$ Removing node_modules && package-lock.json"
            rm -rf node_modules
            rm -rf package-lock.json
            npm i --package-lock-only
        fi
        # Change node and npm versions
        if [ -f ".nvmrc" ]; then
            printBold "$ Node version: from .nvmrc"
            nvm install
        else
            printBold "$ Node version: 10.*"
            nvm install 10
        fi
        
        # Install node_modules
        printBold "$ Running npm install"
        npm install
    fi
    
    # Successful
    endin=$(date +%s)
    local time="$((($endin-$startin) / 60))m $((($endin-$startin) % 60))s"
    UPDATED+=("$time: $repoName")
    printGreen "Update successful!"
    
    goBack
    return 0
}

start=$(date +%s)
# Loop through all dirs
echo "Updating repositories..."
for f in *; do
    if [[ -d $f ]] && [[ $f == ${UPDATE_PREFIX}* ]]; then
        # $f is a directory
        runUpdate $f
    fi
done

# Done
echo "======================"
if [ ! ${#UPDATED[@]} -eq 0 ]; then
    printBold "Updated repositories"
    for i in "${UPDATED[@]}"
    do
        printGreen "=> $i"
    done
fi

if [ ! ${#SKIPPED[@]} -eq 0 ]; then
    echo "----------------------"
    printBold "Skipped repositores"
    for i in "${SKIPPED[@]}"
    do
        printYellow "=> $i"
    done
fi

if [ ! ${#ERROR[@]} -eq 0 ]; then
    echo "----------------------"
    printBold "Error repositores. Scroll up for logs..."
    for i in "${ERROR[@]}"
    do
        printRed "=> $i"
    done
fi
echo "======================"

end=$(date +%s)
printBold "Total updatetime: $((($end-$start) / 60))m $((($end-$start) % 60))s"
