#!/bin/bash
start=$(date +%s)
log() {
  local t=$1
  local end=$(date +%s)
  printf "#\033[34;1m $t:\033[0m$((($end-$start)%60))s\n"
}

success() {
  local t=$1
  local end=$(date +%s)
  printf "\r   \033[32;1m $t:\033[0m $((($end-$start)%60))s\n"
}

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
  kubectx # Kubernetes https://github.com/ahmetb/kubectx
  rabbitmq
  mongodb
  mysql
  maven
  mas # Mac App Store installation CLI
  jpeg
  imagemagick
  pngquant
  TomAnthony/brews/itermocil
  couchdb
  mongodb
  mongoose
  go
  glide
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
  mysqlworkbench
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
## PACKAGE EVALS
log "Verifying .zshrc..."
if [ ! -f ${HOME}/.zshrc ]; then
  log "Missing .zshrc!"
  log "Please use oh-my-zsh for this suite"
  log "Installation guide: https://github.com/robbyrussell/oh-my-zsh"
  exit 1
fi
success "oh-my-zsh is setup correctly"

log "Initialising new Mac"
PREV_DIR=$(pwd)
DIRNAME=$(dirname $0)
cd ## Start in HOME dir

log "Installing Homebrew"
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
success "Installed Homebrew"

log "Setting up oh-my-zsh"
echo "## Custom config from: https://github.com/smnielsen/config" >> .zshrc
echo "export SMN_CONFIG_DIR=${DIRNAME}" >> .zshrc
echo "source ${DIRNAME}/zsh/.zshrc" >> .zshrc
success "oh-my-zsh configured = .zshrc"
cat ${HOME}.zshrc
echo "-----"

###############################
## SETUP GIT CONFIG
log "GIT - Global Config"
git config --global user.name "Simon Nielsen"
git config --global user.email "simonmtnielsen@gmail.com"
git config --global core.ignorecase false

###############################
# SSH Creation and add
if [ ! -f "${HOME}/.ssh/id_rsa.pub" ]; then 
  log "Create SSH key"
  ssh-keygen
  ssh-add
  pbcopy < ~/.ssh/id_rsa.pub
  printf ""
  success "SSH done -> pubkey copied to clipboard"
fi

###############################
## INSTALL ALL APPLICATIONS
log "=== Homebrew - Terminal Apps ==="
for program in "${BREW[@]}"; do
  log "Installing $program..."
  brew install $program >> /dev/null
  success "$program installed"
done
echo ""

log "Installing zgen"
git clone https://github.com/tarjoilija/zgen.git "${HOME}/.zgen"
success "Installed zgen"

log "=== Homebrew Cask - Programs ==="
for program in "${CASK[@]}"; do
  log "Installing $program..."
  brew cask $program >> /dev/null
  success "$program installed"
done
echo ""

log "=== Mac App Store - Applications ==="
for program in "${MAS[@]}"; do
  split=(${program//:/ })
  name=${split[0]}
  id=${split[1]}

  log "max install $name: $id"
  mas install $id >> /dev/null
  success "Installed $name: $id"
done
echo ""

log "=== Yarn - Global Apps ==="
for program in "${YARN_GLOBAL[@]}"; do
  log "Yarn install $program..."
  yarn global add $program
  success "$program installed"
done
echo ""

###############################
# Load .zshrc
source ${HOME}.zshrc

###############################
# Setup dev dirs
mkdir -p ${HOME}/dev
mkdir -p ${HOME}/dev/go/src/github.com/smnielsen
mkdir -p ${HOME}/dev/private
mkdir -p ${HOME}/dev/netlight

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
