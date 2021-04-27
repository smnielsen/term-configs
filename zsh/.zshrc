start=$(date +%s)
loadstart=
loadend=
loading() {
  local t=$1
  loadstart=$(date +%s)
  printf "Loading $t..."
}
loaded() {
  local t=$1
  loadend=$(date +%s)
  printf "\r\033[32;1m Loaded $t:\033[0m $((($loadend - $loadstart) % 60))s\n"
}
##################################
## ZSH SETUP
loading "oh-my-zsh"

# Path to your oh-my-zsh installation.
export ZSH=~/.oh-my-zsh

# Set default theme
# ZSH_THEME="tjkirch"
# Which plugins would you like to load? (plugins can be found in ~/.oh-my-zsh/plugins/*)
plugins=()
# plugins+=(history history-substring-search httpie sudo vagrant postgres)
# plugins+=(osx node npm )
# plugins+=(zsh-syntax-highlighting zsh-history-substring-search zsh-autosuggestions)
# plugins+=(zsh-completions alias-tips almostontop)

# Load zsh
source $ZSH/oh-my-zsh.sh

loaded "oh-my-zsh"
# Load Zgen
loading "zgen"
source ${SMN_CONFIG_DIR}/zsh/.zsh-zgen
loaded "zgen"

##################################
## SETUP ENVIRONMENT VARIABLES
loading "env-vars"
### Set default Editor
export EDITOR=/usr/bin/nano

### Set java8 as default
# export JAVA_HOME=`/usr/libexec/java_home -v 1.8`
# export MAVEN_OPTS="-Xms512m -Xmx1024m"

### User PATHS
export PATH=/Users/sini/.bin:$PATH

# Set PYTHONPATH
export PYTHONPATH=usr/bin

# Android
export PATH=/usr/local/android-platform-tools:$PATH

# Mosquitto MQTT Broker
export PATH=/usr/local/opt/mosquitto/bin:$PATH

### Add local bin path
export PATH=/usr/local/bin:$PATH

### Add sbin path
export PATH=$PATH:/usr/local/sbin

### Poetry for Python
export PATH="$PATH:$HOME/.poetry/bin"

### Add Python to PATH
export PATH="$PATH:$HOME/Library/Python/3.7/bin"
export PATH="$PATH:$HOME/Library/Python/2.7/bin"

### Add flutter to PATH
export PATH="$PATH:$HOME/dev/tools/flutter/bin"

### Add RVM to PATH for scripting
export PATH="$PATH:$HOME/.rvm/bin"

### GOlang
export PATH=$PATH:/usr/local/opt/go/libexec/bin
export GOPATH=$HOME/dev/go
export PATH=$PATH:${GOPATH}/bin

### CouchDB
export PKG_CONFIG_PATH=${PKG_CONFIG_PATH}:/usr/local/lib/pkgconfig:/opt/X11/lib/pkgconfig

loaded "env-vars"

loading "brew"
eval "$(/opt/homebrew/bin/brew shellenv)"
loaded "brew"

### Load nvm
loading "nvm"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# place this after nvm initialization!
autoload -U add-zsh-hook
load-nvmrc() {
  local node_version="$(nvm version)"
  local nvmrc_path="$(nvm_find_nvmrc)"

  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")

    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$node_version" ]; then
      nvm use
    fi
  elif [ "$node_version" != "$(nvm version default)" ]; then
    echo "Reverting to nvm default version"
    nvm use default
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc

loaded "nvm"

#### Load Fuzzy Finder
loading "Fuzzy Finder"
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
loaded "Fuzzy Finder"

# ## Google Cloud
# loading "google-cloud"
# # The next line updates PATH for the Google Cloud SDK.
# if [ -f "${HOME}/google-cloud-sdk/path.zsh.inc" ]; then
#     source "${HOME}/google-cloud-sdk/path.zsh.inc"
# fi

# # The next line enables shell command completion for gcloud.
# if [ -f "${HOME}/google-cloud-sdk/completion.bash.inc" ]; then
#     source "${HOME}/google-cloud-sdk/completion.zsh.inc"
# fi

# export PATH="/usr/lib/google-cloud-sdk/bin:$PATH"

# loaded "google-cloud"

### Load Kubernetes and Minikube
#loading "kubernetes"

#eval $(minikube docker-env)

#loaded "kubernetes"
################################
## LOAD HELPER CONFIGS

loading "zsh-sources"
### Load Extensions
source ${SMN_CONFIG_DIR}/zsh/.zsh-extensions

# Load Cloud bytes algorithms
source ${SMN_CONFIG_DIR}/zsh/.zsh-bytes

# Load Cloud Shortcuts
source ${SMN_CONFIG_DIR}/zsh/.zsh-cloud

# Load zsh golang shortcuts
source ${SMN_CONFIG_DIR}/zsh/.zsh-golang

# Custom aliases
source ${SMN_CONFIG_DIR}/zsh/.zsh-scripts

# Load sennder client scripts
source ${SMN_CONFIG_DIR}/zsh/.zsh-sennder

loaded "zsh-sources"

end=$(date +%s)
printf "\033[34;1m Loaded all: \033[0m $((($end - $start) % 60))s\n"
