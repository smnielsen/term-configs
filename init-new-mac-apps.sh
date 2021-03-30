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
BREW_ARCHIVE=(
  fzf
  rabbitmq
  mongodb
  maven
  jpeg
  imagemagick
  pngquant
  watchman
  couchdb
  mongoose
  go
  glide
  unrar
  mosquitto
  gnupg
  git-crypt
  hugo # Technical Documentation https://gohugo.io/getting-started/installing/
)

BREW=(
  mas # Mac App Store installation CLI
  yarn
  kubectx # Kubernetes https://github.com/ahmetb/kubectx
  TomAnthony/brews/itermocil
  kubernetes-helm
  azure-cli
  python3
  jesseduffield/lazygit/lazygit
  httpie  
  bat
)

CASK_ARCHIVE=(
  google-chrome
  pencil
  atom
  sublime-text
  mysqlworkbench
  iterm2
  android-studio
  webstorm
  macdown
  java
  minikube
  pgadmin4
  disk-inventory-x
)

CASK=(
  franz
  firefox
  slack
  1password
  evernote
  dropbox
  dbeaver-community
  sizeup
  skitch
  daisydisk
)

MAS=(
  "Xcode:497799835"
)

YARN_GLOBAL=(
  create-react-app
  create-react-native-app
  react-native-cli
  vue-cli
  nodemon
)

## Not avaliable
MANUAL=(
)

step "Installation of a new Mac OS X Computer"
log "Setup is run with no promise of success"
log "* Will reset applications"
log "* Will remove already set configs"
log "Make sure to follow progress when configuring system initially..."
bold "Continuing is on your own risk."

###############################
## INSTALL ALL APPLICATIONS
echo ""
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

###############################
# Homebrew
step "Install Homebrew"
if [ -z $(command -v brew) ]; then
  log "Installing Homebrew"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"  
  success "Installed Homebrew"
else
  success "Homebrew already installed"
fi
brew update

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
  installProgram "install --cask" $program
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
