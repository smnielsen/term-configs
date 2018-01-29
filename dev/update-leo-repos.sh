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
    echo "--------------------"
    cd - > /dev/null
}

SKIPPED=()
UPDATED=()
ERROR=()

runUpdate() {
    local repoName=$1
    printBold " -- $repoName --"
    cd $repoName

    # Check if branch is Master (only update master branches)
    branchName=$(git rev-parse --abbrev-ref HEAD)
    if [[ $branchName != "master" ]]; then
        printYellow "SKIP: Not on master"
        SKIPPED+=($repoName)
        goBack
        return 0
    fi

    # Stash anything
    WAS_STASHED=$(git stash)

    # Run the update
    if ! git pull --rebase; then
        printRed "ERROR: Could not update!"
        ERROR+=($repoName)
        goBack
        return 0
    fi

    # Reset stash if any
    if [[ $WAS_STASHED != "No local changes to save" ]]; then
        git stash pop
    fi

    # Successful
    UPDATED+=($repoName)
    printGreen "Update successful!"
    goBack
    return 0
}

# Loop through all dirs
echo "Updating repositories..."
for f in *; do
    if [[ -d $f ]] && [[ $f == leo* ]]; then
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

