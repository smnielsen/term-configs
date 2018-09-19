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
  printf "\r\033[32;1m Loaded $t:\033[0m $((($loadend-$loadstart)%60))s\n"
}
##################################
## ZSH SETUP
loading "oh-my-zsh"

# Path to your oh-my-zsh installation.
export ZSH=~/.oh-my-zsh

# Which plugins would you like to load? (plugins can be found in ~/.oh-my-zsh/plugins/*)
plugins=(git)

# Load zsh
source $ZSH/oh-my-zsh.sh

loaded "oh-my-zsh"
##################################
## SETUP ENVIRONMENT VARIABLES
loading "env-vars"
### Set default Editor
export EDITOR=/usr/bin/nano

### Set java8 as default
export JAVA_HOME=`/usr/libexec/java_home -v 1.8`
export MAVEN_OPTS="-Xms512m -Xmx1024m"

### Add local bin path
export PATH=/usr/local/bin:$PATH

### Add sbin path
export PATH=$PATH:/usr/local/sbin

### Add Python to PATH
export PATH=$PATH:~/Library/Python/3.6/bin

### Add RVM to PATH for scripting
export PATH="$PATH:$HOME/.rvm/bin"

### GOlang
export PATH=$PATH:/usr/local/opt/go/libexec/bin
export GOPATH=$HOME/dev/go
export PATH=$PATH:${GOPATH}/bin

### CouchDB
export PKG_CONFIG_PATH=${PKG_CONFIG_PATH}:/usr/local/lib/pkgconfig:/opt/X11/lib/pkgconfig

loaded "env-vars"

### Load nvm
loading "nvm"
export NVM_DIR="$HOME/.nvm"
source $(brew --prefix nvm)/nvm.sh

loaded "nvm"
## Google Cloud
loading "google-cloud"
# The next line updates PATH for the Google Cloud SDK.
if [ -f "${HOME}/google-cloud-sdk/path.bash.inc" ]; then 
    source "${HOME}/google-cloud-sdk/path.zsh.inc"
fi

# The next line enables shell command completion for gcloud.
if [ -f "${HOME}/google-cloud-sdk/completion.bash.inc" ]; then 
    source "${HOME}/google-cloud-sdk/completion.zsh.inc"
fi

export PATH="/usr/lib/google-cloud-sdk/bin:$PATH"

loaded "google-cloud"
################################
## LOAD HELPER CONFIGS

### Load Extensions
loading "zsh-sources"
source ${SMN_CONFIG_DIR}/zsh/.zsh-extensions

# Load Cloud Shortcuts
source ${SMN_CONFIG_DIR}/zsh/.zsh-cloud

# Load Cloud Shortcuts
source ${SMN_CONFIG_DIR}/zsh/.zsh-git

# Load Zgen
source ${SMN_CONFIG_DIR}/zsh/clients/.zsh-leo

loaded "zsh-sources"
# Load Zgen
loading "zgen"
source ${SMN_CONFIG_DIR}/zsh/.zsh-zgen
loaded "zgen"

end=$(date +%s)
printf "\033[34;1m Loaded all: \033[0m $((($end-$start) % 60))s\n"
