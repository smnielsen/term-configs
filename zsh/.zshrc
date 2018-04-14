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

### CouchDB
export PKG_CONFIG_PATH=${PKG_CONFIG_PATH}:/usr/local/lib/pkgconfig:/opt/X11/lib/pkgconfig

################################
## LOAD HELPER CONFIGS

### Load Dev Scripts
source ${SMN_CONFIG_DIR}/zsh/.zsh-dev

### Load Extensions
source ${SMN_CONFIG_DIR}/zsh/.zsh-extensions

# Load Zgen
source ${SMN_CONFIG_DIR}/zsh/.zsh-zgen

end=$(date +%s)
echo "==> $((($end-$start) % 60))s"
