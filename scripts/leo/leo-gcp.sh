#!/bin/bash

LEO_GCP_SERVICES=(
  "lags:leo-api-gateway-service"
  "lffs:leo-fulcrum-frontend-service:npm run compile-gql-documents; npm run dev-build & npm run dev-ssr"
  "gql:leo-graphql"
  "lsgs:leo-sports-graphql-service"
  "lsprs:leo-sports-provider-service"
  "lsps:leo-sports-popularity-service"
  "lsds:leo-sports-discovery-service"
  "lses:leo-sports-event-service"
  "lss:leo-settings-service"
  "li18ns:leo-i18n-service"
  "lbcs:leo-blocked-countries-service"
  "lseos:leo-seo-service"
  "lpres:leo-payment-result-service"
  "llcs:leo-language-config-service"
  "lsc:leo-sports-client:npm run update-schema; npm run relay; npm run relay-watch & npm run dev"
  "couchbase:couchbase"
)

leo-gcp-start() {
  local shortname=$(get-npm-package-shortname)
  local script=$(private-leo-gcp-script $shortname)

  echo "# Service: '$shortname'"

  leo-gcp-envs -t "START" $@

  if [ ! -z "$script" ]; then
    echo "$ Command: $script"
    eval $script
  else
    echo "$ Default command: $defaultscript"
    eval $defaultscript
  fi
}

leo-gcp-envs() {
  local env=
  local type="DOT_ENV"
  local ignore=("none")

  while getopts ":e:t:i:f:" option; do
    case ${option} in
      e) env=${OPTARG} ;;
      t) type=${OPTARG} ;;
      i) ignore+=" ${OPTARG}";;
      \?) echo "Invalid option: -$OPTARG" ;;
    esac
  done
  local file="$(pwd)/.env"
  echo "# Environment: '${env}'"
  echo "# Ignore: '${ignore}'"

  if [ -z $env ]; then
    echo_warn "env= is not set. Use -e to set env (ex: -e dev94)"
    exit 1
  fi

  if [ -z $file ]; then
    file="$(pwd)/.env"
    echo_warn "file= is not set. Defaulting to: $file"
  fi

  private-leo-gcp-run $env $file ${type} "$ignore"
}

###################################################
## WARNING:
## EVERYTHING BELOW THIS LINE IS HELPERS
## IF YOU CHANGE ANYTHING, REMEMBER TO CHANGE EVERYWHERE!
###################################################

private-leo-gcp-run() {
  local env=$1
  local file=$2
  local type=${3:-DOT_ENV}
  local ignore=$4
  local prefix=

  if [[ $type == "DOT_ENV" ]]; then
    echo "## Below will be a complete .env file to replace the current one with."
    echo "-----------------------"
  elif [[ $type == "START" ]]; then
    prefix="export "
  fi

  if [ -f $file ]; then
    while IFS='' read -r line || [[ -n "$line" ]]; do
        name=$(echo $line | cut -d'=' -f 1)
        url=$(echo $line | cut -d'=' -f 2)
        shortname=$(echo $name | cut -d'_' -f 1 | awk '{print tolower($0)}')
        containsResult=$(contains $shortname "$ignore" )
        if [[ $containsResult == "y" ]]; then
          # Ignore these
          echo_warn "# Ignored '$shortname'. Using default URL."
          echo "$line"
          continue
        fi

        isURL=$(echo $name | cut -d'_' -f 2)
        if [[ $isURL == "URL" ]] || [[ $shortname == "couchbase" ]]; then
          GCP_URL=$(private-leo-gcp-env $env $shortname)
          if [ ! -z ${GCP_URL} ]; then
            echo "$GCP_URL"
            eval "$prefix$GCP_URL"
          elif [[ $type == "DOT_ENV" ]]; then
            echo_warn "# Missing '${shortname}' in service list. Using default URL."
            echo "$line"
          fi
        elif [[ $type == "DOT_ENV" ]];then
          echo "${line}"
        fi
    done < "$file"
  fi
}

echo_warn() {
  local text=$1
  echo -e "\033[33m$text\033[0m"
}

contains() {
  local search=$1
  local ignore="$2"

  for key in $ignore
  do
    if [[ $key == $search ]]; then
      echo "y"
    fi
  done
}

private-leo-gcp-longname() {
  local param=$1
  local result=
  for program in "${LEO_GCP_SERVICES[@]}"; do
    shortname=$(echo $program | cut -d':' -f 1)
    longname=$(echo $program | cut -d':' -f 2)
    if [[ $param == $shortname ]]; then
      result=$longname
    fi
  done
  echo $result
}

private-leo-gcp-script() {
  local param=$1
  local result=
  for program in "${LEO_GCP_SERVICES[@]}"; do
    shortname=$(echo $program | cut -d':' -f 1)
    if [[ $param == $shortname ]]; then
      script=$(echo $program | cut -d':' -f 3)
      result=$script
    fi
  done
  echo $result
}

private-leo-gcp-url() {
  local env=$1;
  local longname=$2;

  if [ $longname == "leo-sports-client" ]; then
    # We need to handle leo-sports-client differently
    echo "http://portal-frontend-sport.lb.test01.portal.rslon.int.leovegas.net/static/sports-client"
  elif [ $longname == "couchbase" ]; then
    echo "${env}-couchbase-ui.leo-dev-shared.lvg-tech.net:8091"
  else
    echo "http://localhost:8001/api/v1/namespaces/portal-${env}/services/${longname}/proxy/"
  fi
}

private-leo-gcp-env() {
  local env=$1
  local shortname=$2
  local longname=$(private-leo-gcp-longname $shortname)
  local uppershortname=$(echo $shortname | awk '{print toupper($0)}')
  if [ ! -z $longname ]; then
    if [[ $shortname == "couchbase" ]]; then
      echo "${uppershortname}=$(private-leo-gcp-url $env $longname)"
    else
      echo "${uppershortname}_URL=$(private-leo-gcp-url $env $longname)"
    fi
  fi
}

private-leo-gcp-print-services() {
  for program in "${LEO_GCP_SERVICES[@]}"; do
    name=$(echo $program | cut -d':' -f 1)
    url=$(echo $program | cut -d':' -f 2)
    printf "%-8s : %-50s" "# $name" "$url"
    echo ""
  done
}

get-npm-package-shortname() {
  # Version key/value should be on his own line
  PACKAGE_VERSION=$(cat package.json \
    | grep shortName \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g' \
    | sed -e 's/^[[:space:]]*//')

  echo $PACKAGE_VERSION
}

METHOD=
PARAMS=
echo "# Running leo-gcp helpers"
while [[ $# -gt 0 ]]
  do
  key="$1"
  case $key in
      -m|--method)
      METHOD="$2"
      shift # past argument
      shift # past value
      ;;
      *)    # unknown option
      PARAMS="${PARAMS}$1 " # save it in an array for later
      shift # past argument
      ;;
  esac
done

echo "METHOD=$METHOD"
echo "PARAMS=$PARAMS"

case "${METHOD}" in
  start) leo-gcp-start $PARAMS ;;
  envs) leo-gcp-envs $PARAMS ;;
esac

exit 0
## USAGE
### Prints a .env file with the updated URLS for k8s
# /leo-gcp.sh -m envs -e dev94 -i lsc -i lsqs -i lffs

## Starts the application with exported URLS for k8s
# /leo-gcp.sh -m start -e dev94 -i lsc -i lsqs -i lffs