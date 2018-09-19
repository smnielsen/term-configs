#!/usr/bin/env bash

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

UPDATE_PREFIX="leo"
SHOULD_RESET=
while [[ $# -gt 0 ]]; do
    key="$1"

    case $key in
        -r|--reset)
        SHOULD_RESET="true"
        printBold "ARG: Activating Reset to master for all branches"
        shift # past argument
        ;;
        -x|--prefix)
        UPDATE_PREFIX=$2
        printBold "PREFIX = ${UPDATE_PREFIX}"
        shift # past argument
        shift # past value
        ;;
        *)    # unknown option
        printYellow "Unknown option: $key"
        shift # past argument
        ;;
    esac
done

# Create update method

SKIPPED=()
UPDATED=()
ERROR=()

runUpdate() {
    startin=$(date +%s)
    local repoName=$1
    cd $repoName
    branchName=$(git rev-parse --abbrev-ref HEAD)
    printBold " -- $repoName ($branchName) --"

    # Only update master and develop branches
    
    if [[ $branchName != "master" ]] && [[ $branchName != *develop ]]; then
        if [ ! -z $SHOULD_RESET ]; then
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

    if [ ! -z $SHOULD_RESET ]; then
        # Stash anything
        echo "$ Stashing '${branchName}' changes"
        WAS_STASHED=$(git stash)
    else
        # Reset branch
        echo "-R $ Resetting '${branchName}' HEAD"
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

    if [ -z $SHOULD_RESET ]; then
        echo "-R $ Removing node_modules && package-lock.json"
        rm -rf node_modules
        rm -rf package-lock.json
    fi
    
    # Change node and npm versions
    printBold "$ Using node version from .nvmrc"
    nvm install

    # Install node_modules
    printBold "$ Running npm install"
    npm install

    # Reset stash if any
    if [[ $WAS_STASHED != "No local changes to save" ]]; then
        echo "$ Applying previous stash"
        git stash pop
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
