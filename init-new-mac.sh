#!/bin/bash

echoAll() {
  echo "### Homebrew"
  echo ">> ${BREW[@]}"
  echo ""
  echo "### Homebrew Cask"
  echo ">> ${CASK[@]}"
  echo ""
  echo "### Mac App Store"
  echo ">> ${MAS[@]}"
  echo ""
  echo "### Yarn Globals"
  echo ">> ${YARN_GLOBAL[@]}"
}

BREW=(
  zsh
  zsh-syntax-highlighting
  zsh-autosuggestions
  zsh-git-prompt
  nvm
  yarn
  git
  watchman
  mas # Mac App Store installation CLI
  jpeg
  imagemagick
  pngquant
)

CASK=(
  franz
  google-chrome
  firefox
  slack
  1password
  evernote
  dropbox
  sizeup
  atom
  iterm2
  sublime-text
  webstorm
  macdown
  skitch
  android-studio
  java
)

MAS=(
  "Xcode:497799835"
  "Boxy:1053031090"
  "Keynote:409183694"
  "Todoist:585829637"
)

YARN_GLOBAL=(
  create-react-app
  create-react-native-app
  react-native-cli
  grunt-cli
  nodemon
  webpack-dev-server
)

## Not avaliable
MANUAL=(
  "Outlook;https://webmail.netlight.com"
)

###############################
## INSTALL ALL APPLICATIONS

echo "# Setting up new Mac"
PREV_DIR=$(pwd)
DIRNAME=$(dirname $0)
cd ## Start in HOME dir

echo ">> Installing Homebrew"
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
echo ""

echo ">> Adding oh-my-zsh custom config"
echo "## Custom config from: https://github.com/smnielsen/term-configs" >> .zshrc
echo "export TERM_CONFIG_DIR=${DIRNAME}" >> .zshrc
echo "source ${DIRNAME}/zsh/.zshrc" >> .zshrc

echo ">> Setting git global config"
git config --global user.name "Simon Nielsen"
git config --global user.email "simonmtnielsen@gmail.com"

echo "## Homebrew - Terminal Apps"
for program in "${BREW[@]}"; do
  echo ">> $program"
  brew install $program
done
echo ""

echo ">> Installing zgen"
git clone https://github.com/tarjoilija/zgen.git "${HOME}/.zgen"

echo "## Homebrew Cask - Programs"
for program in "${CASK[@]}"; do
  echo ">> $program"
  brew cask install $program
done
echo ""

echo "## Mac App Store - Applications"
for program in "${MAS[@]}"; do
  split=(${program//:/ })
  name=${split[0]}
  id=${split[1]}
  printf "%-20s | %-20s" ">> $name" "$id"
  echo ""
  mas install $id
done
echo ""

echo "## Yarn - Global Apps"
for program in "${YARN_GLOBAL[@]}"; do
  echo ">> $program"
  yarn global add $program
done
echo ""

###############################
echo ">>>> Finilized setting up Mac <<<<"
echo "   Welcome to a new world Simon   "
echo ""
echo "## Installed:"
echoAll
echo ""
echo "## Requires Manual installation:"
for program in "${MANUAL[@]}"; do
  split=(${program//;/ })
  name=${split[0]}
  url=${split[1]}
  printf "%-20s | %-50s" ">> $name" "$url"
  echo ""
done
echo ""
echo "-- Add Custom Colors to terminal"
echo "   > iterm2 -> Preferences -> Profiles -> Colors -> Color Presets... -> Import"
echo "   > Choose iterm/netlight-colors.itermcolors"
echo "   > Color presets... -> netlight-colors"
echo "-- Set to always open previous dir"
echo "   > iterm2 -> Preferences -> Profiles -> General -> Working directory -> Reuse previous ..."
echo "--------------------"
echo "FYI: You should probly restart your terminal now..."
echo ""

cd ${PREV_DIR}
exit 0
