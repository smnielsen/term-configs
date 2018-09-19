start=$(date +%s)
##################################
## ZSH SETUP

# Path to your oh-my-zsh installation.
export ZSH=~/.oh-my-zsh

# Which plugins would you like to load? (plugins can be found in ~/.oh-my-zsh/plugins/*)
plugins=(git)

# Load zsh
source $ZSH/oh-my-zsh.sh

##################################
## SETUP ENVIRONMENT VARIABLES

### Set default Editor
export EDITOR=/usr/bin/nano

### Set java8 as default
export JAVA_HOME=`/usr/libexec/java_home -v 1.8`
export MAVEN_OPTS="-Xms512m -Xmx1024m"

### Load nvm
export NVM_DIR="$HOME/.nvm"
source $(brew --prefix nvm)/nvm.sh

### Add local bin path
export PATH=/usr/local/bin:$PATH

### Add sbin path
export PATH=$PATH:/usr/local/sbin

### Add Python to PATH
export PATH=$PATH:~/Library/Python/3.6/bin

### Add RVM to PATH for scripting
export PATH="$PATH:$HOME/.rvm/bin"

### GOlang
export GOPATH=$HOME/dev/go
export PATH=$PATH:$(go env GOPATH)/bin

### CouchDB
export PKG_CONFIG_PATH=${PKG_CONFIG_PATH}:/usr/local/lib/pkgconfig:/opt/X11/lib/pkgconfig

## Google Cloud
# The next line updates PATH for the Google Cloud SDK.
if [ -f "${HOME}/google-cloud-sdk/path.bash.inc" ]; then 
    source "${HOME}/google-cloud-sdk/path.zsh.inc"
fi

# The next line enables shell command completion for gcloud.
if [ -f "${HOME}/google-cloud-sdk/completion.bash.inc" ]; then 
    source "${HOME}/google-cloud-sdk/completion.zsh.inc"
fi

export PATH="/usr/lib/google-cloud-sdk/bin:$PATH"

################################
## LOAD HELPER CONFIGS

### Load Extensions
source ${SMN_CONFIG_DIR}/zsh/.zsh-extensions

# Load Cloud Shortcuts
source ${SMN_CONFIG_DIR}/zsh/.zsh-cloud

# Load Zgen
source ${SMN_CONFIG_DIR}/zsh/.zsh-zgen

# Load Zgen
source ${SMN_CONFIG_DIR}/zsh/.zsh-leo

end=$(date +%s)
echo "==> $((($end-$start) % 60))s"
