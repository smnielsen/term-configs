
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

### Load nvm
export NVM_DIR="$HOME/.nvm"
. "/usr/local/opt/nvm/nvm.sh"

### Add local bin path
export PATH=/usr/local/bin:$PATH

### Add Python to PATH
export PATH=$PATH:~/Library/Python/3.6/bin

### Add RVM to PATH for scripting
export PATH="$PATH:$HOME/.rvm/bin"

################################
## LOAD HELPER CONFIGS
DIR=$(dirname $1)

### Load Helpers
source ${DIR}/.zsh-helpers

### Load ALIASES
source ${DIR}/.zsh-aliases

# Load Zgen
source ${DIR}/.zsh-zgen
