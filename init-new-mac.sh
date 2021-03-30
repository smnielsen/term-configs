#/bin/bash
start=$(date +%s)
log() {
  local t=$1
  printf "  \033[97;m$t\033[0m\n"
}

bold() {
  local t=$1
  echo -e "\033[1m$t\033[0m"
}

STEP_COUNT=0
step() {
  local t=$1
  ((STEP_COUNT++))
  printf "#\033[34;1m Step ${STEP_COUNT}: $t\033[0m\n"
  start=$(date +%s)
}

success() {
  local t=$1
  local end=$(date +%s)
  printf "  \033[32;1mDone ${STEP_COUNT}: $t:\033[0m $((($end - $start) % 60))s\n"
}

echoAll() {
  echo "### Required Apps"
  echo ">> ${ZSH_REQ[@]}"
  echo ""
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

finishUp() {
  log ""
  success "Initialization Completed! :)"
  log "===== MANUAL STEPS ========"
  log ""
  step "Add custom colors to terminal"
  log "1. iterm2 -> Preferences"
  log "  -> Profiles -> Colors -> Color Presets... -> Import"
  log "2. Choose iterm/netlight-colors.itermcolors"
  log "3. Color presets... -> netlight-colors"
  log ""
  step "Enable always open previous dir for new tabs"
  log "1. iterm2 -> Preferences -> Profiles"
  log "   -> General -> Working directory -> Reuse previous"
  log ""
  step "Restart Terminal"
  log "You should probably restart your terminal now..."
  echo ""

  cd ${PREV_DIR}
  log "Finished init-new-mac!"
}

installProgram() {
  local command=$1
  local program=$2
  if brew ls --versions $program >/dev/null; then
    log "=> $program already installed"
  else
    brew $command $program >>/dev/null
  fi
}

ZSH_REQ=(
  zsh
  zsh-syntax-highlighting
  zsh-autosuggestions
  zsh-git-prompt
  nvm
  git
)

BREW=(
  mas # Mac App Store installation CLI
  yarn
  watchman
  kubectx # Kubernetes https://github.com/ahmetb/kubectx
  fzf
  rabbitmq
  mongodb
  maven
  jpeg
  imagemagick
  pngquant
  TomAnthony/brews/itermocil
  couchdb
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
  jesseduffield/lazygit/lazygit
  hugo # Technical Documentation https://gohugo.io/getting-started/installing/
  httpie  
  bat
)

CASK=(
  franz
  google-chrome
  firefox
  slack
  pencil
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
  disk-inventory-x
  daisydisk
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
log "Setup is run with no promise of success"
log "* Will reset applications"
log "* Will remove already set configs"
log "Make sure to follow progress when configuring system initially..."
bold "Continuing is on your own risk."
log "    ¯\_(ツ)_/¯      "
while true; do
  read -p "Do you wish to continue (y/n)? " yn
  case $yn in
  [Yy]*)
    echo "Continuing..."
    break
    ;;
  [Nn]*) exit ;;
  *) echo "Please answer yes or no." ;;
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
  echo "## Custom config from: https://github.com/smnielsen/config" >.zshrc
  echo "export SMN_CONFIG_DIR=${HOME}/${DIRNAME}" >>.zshrc
  echo "source ${HOME}/${DIRNAME}/zsh/.zshrc" >>.zshrc
  success "oh-my-zsh configured = .zshrc"
else
  success "ZSH already configured"
fi

###############################
## SETUP GIT CONFIG
step "Git Configuration"
read -p "Git Name (Default=\"Simon Nielsen\"): " gn
read -p "Git Email (Default=\"simonnielsen@live.se\"): " ge
GITHUB_NAME=${gn:-"Simon Nielsen"}
GITHUB_EMAIL=${ge:-"simonnielsen@live.se"}
git config --global user.name ${GITHUB_NAME}
git config --global user.email ${GITHUB_EMAIL}
git config --global core.ignorecase false
success "Configured GIT"

###############################
# Install Xcode deps & Git
step "Install Xcode deps and Git"
xcode-select --install
success "Xcode setup"

###############################
# SSH Creation and add
if [ ! -f "${HOME}/.ssh/id_rsa.pub" ]; then
  log "Create SSH key"
  ssh-keygen
  ssh-add
  pbcopy <~/.ssh/id_rsa.pub
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
# Install zgen and required apps
step "Installing zgen"
if [ ! -d "${HOME}/.zgen" ]; then
  git clone https://github.com/tarjoilija/zgen.git "${HOME}/.zgen"
  success "Installed zgen"
else
  success "Already installed zgen"
fi

step "Install required apps"
for program in "${ZSH_REQ[@]}"; do
  log "Installing $program..."
  installProgram install $program
done
success "Required apps installed"
echo ""

###############################
# Setup dev dirs
mkdir -p ${HOME}/dev

###############################
## INSTALL ALL APPLICATIONS
echo ""
log "All configuration steps done."
step "Install All Applications"
while true; do
  read -p "Do you wish to continue (y/n)? " yn
  case $yn in
  [Yy]*)
    echo "Continuing with installation..."
    break
    ;;
  [Nn]*)
    finishUp
    exit
    ;;
  *) echo "Please answer yes or no." ;;
  esac
done

step "Install Terminal Apps"
for program in "${BREW[@]}"; do
  log "Installing $program..."
  installProgram install $program
done
success "Terminal apps installed"
echo ""

step "Install Cask Programs"
for program in "${CASK[@]}"; do
  log "Installing $program..."
  installProgram cask $program
done
success "Cask Programs installed"
echo ""

step "Mac App Store - Applications"
for program in "${MAS[@]}"; do
  split=(${program//:/ })
  name=${split[0]}
  id=${split[1]}

  if [ -z "$(mas list | grep $id)" ]; then
    log "mas install $name: $id"
    mas install $id >>/dev/null
  else
    log "=> $name:$id Already installed"
  fi
done
success "Mac App Store applications installed"
echo ""

step "Yarn - Install Global Apps"
for program in "${YARN_GLOBAL[@]}"; do
  log "Yarn install $program..."
  if [ -z "$(command -v $program)" ]; then
    yarn global add $program
  else
    log "=> $program already installed"
  fi
done
success "Yarn/Npm apps installed"
echo ""

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
finishUp

exit 0
