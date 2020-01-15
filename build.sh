#!/bin/bash
# Thanks to Robert Siemer for providing useful template for parsing arguments
# https://stackoverflow.com/a/29754866

function print_help() {
	echo 'Bomberman building script'
  echo 'Usage: ./build.sh -q path_to_your_qmake_file'
  echo 'Flags:'
  echo '-h --help         print help'
	echo '-q --qmake <PATH> path to qmake for building c++'
	echo '--nocpp           not building game host'
	echo '--noclient        not building client'
}

# saner programming env: these switches turn some bugs into errors
set -o errexit -o pipefail -o noclobber -o nounset

# -allow a command to fail with !’s side effect on errexit
# -use return value from ${PIPESTATUS[0]}, because ! hosed $?
! getopt --test > /dev/null 
if [[ ${PIPESTATUS[0]} -ne 4 ]]; then
    echo 'I’m sorry, `getopt --test` failed in this environment.'
    exit 1
fi

# ':' after option means that it will have an argument
OPTIONS=q:vpcoh
LONGOPTS=qmake:,nocpp,noclient,nooverseer,help

# -regarding ! and PIPESTATUS see above
# -temporarily store output to be able to check for errors
# -activate quoting/enhanced mode (e.g. by writing out “--options”)
# -pass arguments only via   -- "$@"   to separate them correctly
! PARSED=$(getopt --options=$OPTIONS --longoptions=$LONGOPTS --name "$0" -- "$@")
if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    # e.g. return value is 1
    #  then getopt has complained about wrong arguments to stdout
    exit 2
fi
# read getopt’s output this way to handle the quoting right:
eval set -- "$PARSED"

echo $PARSED
q=n h=n nocpp=n noclient=n nooverseer=n QMAKE_PATH=""
# now enjoy the options in order and nicely split until we see --
while true 
do
  case "$1" in
  	-q|--qmake)
      QMAKE_PATH="$2"
      shift 2
      ;;
    --nocpp)
      nocpp=y
      shift
      ;;
    --noclient)
      noclient=y
      shift
      ;;
    -h|--help)
      h=y
      shift
      ;;
    --)
      shift
      break
      ;;
    *)
      echo "Programming error"
	    exit 3
      ;;
  esac
done

# handle non-option arguments
#if [[ $# -ne 1 ]]; then
#    echo "$0: A single input file is required."
#    exit 4
#fi

# Set path of running build.sh file
START_PATH=`pwd`

if [ "$h" == "y" ]
then
	print_help
  exit 0
fi

if [ "$nocpp" == "n" ]
then

	echo "Building c++ applications"
	if [ -z "$QMAKE_PATH" ]
	then
		read -ep "Path to your QMake: " QMAKE_PATH
	fi

	echo "QMake path: $QMAKE_PATH"

	# Create folder
	mkdir -p server/hostmanager-build

	echo "Build hostmanager"
	cd $START_PATH/server/hostmanager-build
	
  $QMAKE_PATH $START_PATH/server/hostmanager/hostmanager.pro -Wall -config test_conf
	if [ $? -ne 0 ]
	then
    echo "Qmake for hostmanager failed"
		exit 1
  fi	

	make
	if [ $? -ne 0 ]
	then
    echo "Make for hostmanager failed"
		exit 2
  fi	

  $QMAKE_PATH $START_PATH/server/hostmanager/hostmanager.pro -Wall
	if [ $? -ne 0 ]
	then
    echo "Qmake for hostmanager_test failed"
		exit 1
  fi	

	make
	if [ $? -ne 0 ]
	then
    echo "Make for hostmanager_test failed"
		exit 2
  fi	

	echo "Execute test for hostmanager"
	$START_PATH/server/hostmanager-build/hostmanager_test
		if [ $? -ne 0 ]
	then
    echo "Qmake for hostmanager failed"
		exit 1
  fi	

	echo "Building hostmanager succesful"

	echo; echo; # Just give me some of that space
fi
#-config test_conf

if [ "$noclient" == "n" ]
then
	echo "Installing client dependencies"
	cd $START_PATH/client
  npm install
	echo; echo; # Just give me some of that space
fi

