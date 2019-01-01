#!/bin/bash
start=$(date +%s)
log() {
  local t=$1
  printf "  \033[37;1m$t\033[0m\n"
}

STEP_COUNT=0
step() {
  local t=$1
  ((STEP_COUNT++))
  printf "# \033[34;1mStep ${STEP_COUNT}: $t\033[0m\n"
  start=$(date +%s)
}

success() {
  local t=$1
  local end=$(date +%s)
  printf "  \033[32;1mDone ${STEP_COUNT}: $t:\033[0m $((($end-$start)%60))s\n"
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
  unrar
  kubernetes-helm
  azure-cli
  python3
  mosquitto
  gnupg
  git-crypt
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
  minikube
  pgadmin4
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
  "Docker;https://hub.docker.com/editions/community/docker-ce-desktop-mac"
)

step "Installation of a new Mac OS X Computer"
log "Setup is done with no promise of success"
log "Continuing is done on your own risk. :)"
log "¯\_(ツ)_/¯"
while true; do
  read -p "Do you wish to continue (y/n)? " yn
  case $yn in
    [Yy]* ) echo "Continuing..."; break;;
    [Nn]* ) exit;;
    * ) echo "Please answer yes or no.";;
  esac
done

###############################
## PACKAGE EVALS
step "Verifying oh-my-zsh..."
if [ ! -f ${HOME}/.zshrc ]; then
  log "Missing .zshrc!"
  log "Please use oh-my-zsh for this suite"
  log "Installation guide: https://github.com/robbyrussell/oh-my-zsh"
  exit 1
fi
success "Found oh-my-zsh"

PREV_DIR=$(pwd)
DIRNAME=$(dirname $0)
cd ## Start in HOME dir

step "Configure oh-my-zsh"
if [ -z $(command -v ascii-dunno) ]; then
  echo "## Custom config from: https://github.com/smnielsen/config" >> .zshrc
  echo "export SMN_CONFIG_DIR=${DIRNAME}" >> .zshrc
  echo "source ${DIRNAME}/zsh/.zshrc" >> .zshrc
  success "oh-my-zsh configured = .zshrc"
else
  success "ZSH already configured"
fi

###############################
## SETUP GIT CONFIG
step "Git Configuration"
git config --global user.name "Simon Nielsen"
git config --global user.email "simonmtnielsen@gmail.com"
git config --global core.ignorecase false
success "Configured GIT"

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
# Homebrew
step "Install Homebrew"
if [ -z $(command -v brew) ]; then
  log "Installing Homebrew"
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  success "Installed Homebrew"
else
  success "Homebrew already installed"
fi

###############################
# Setup dev dirs
mkdir -p ${HOME}/dev
mkdir -p ${HOME}/dev/private

###############################
## INSTALL ALL APPLICATIONS
echo ""
log "All configuration steps done."
step "Install All Applications"
while true; do
  read -p "Do you wish to continue (y/n)? " yn
  case $yn in
    [Yy]* ) echo "Continuing with installation..."; break;;
    [Nn]* ) echo "Exiting installation!"; exit;;
    * ) echo "Please answer yes or no.";;
  esac
done


step "=== Homebrew - Terminal Apps ==="
for program in "${BREW[@]}"; do
  log "Installing $program..."
  brew install $program >> /dev/null
done
success "Terminal apps installed"
echo ""

step "Installing zgen"
git clone https://github.com/tarjoilija/zgen.git "${HOME}/.zgen"
success "Installed zgen"

step "=== Homebrew Cask - Programs ==="
for program in "${CASK[@]}"; do
  log "Installing $program..."
  brew cask $program >> /dev/null
done
success "Cask applications installed"
echo ""

step "=== Mac App Store - Applications ==="
for program in "${MAS[@]}"; do
  split=(${program//:/ })
  name=${split[0]}
  id=${split[1]}

  log "max install $name: $id"
  mas install $id >> /dev/null
done
success "Mac App Store applications installed"
echo ""

step "=== Yarn - Global Apps ==="
for program in "${YARN_GLOBAL[@]}"; do
  log "Yarn install $program..."
  yarn global add $program
done
success "Yarn/Npm apps installed"
echo ""

###############################
# Load .zshrc
source ${HOME}/.zshrc

###############################
step ">>>> Finilized setting up Mac <<<<"
log "   Welcome to a new world!   "
echo ""
log "## Installed:"
echoAll
echo ""
step "## Requires Manual installation:"
for program in "${MANUAL[@]}"; do
  split=(${program//;/ })
  name=${split[0]}
  url=${split[1]}
  printf "%-20s | %-50s" ">> $name" "$url"
  echo ""
done
echo ""
log "-- Add Custom Colors to terminal"
log "   > iterm2 -> Preferences -> Profiles -> Colors -> Color Presets... -> Import"
log "   > Choose iterm/netlight-colors.itermcolors"
log "   > Color presets... -> netlight-colors"
log "-- Set to always open previous dir"
log "   > iterm2 -> Preferences -> Profiles -> General -> Working directory -> Reuse previous ..."
echo "--------------------"
success "FYI: You should probly restart your terminal now..."
ascii-dunno
echo ""

cd ${PREV_DIR}
exit 0
