#!/bin/bash
# Thanks to Robert Siemer for providing useful template for parsing arguments
# https://stackoverflow.com/a/29754866

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
OPTIONS=q:vpco
LONGOPTS=qmake:,verbose,nocpp,noclient,nooverseer

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
q=n v=n p=n c=n o=n QMAKE_PATH=""
# now enjoy the options in order and nicely split until we see --
while true 
do
  case "$1" in
  	-q|--qmake)
      QMAKE_PATH="$2"
      shift 2
      ;;
    -v|--verbose)
      v=y
      shift
      ;;
    -p|--nocpp)
      p=y
      shift
      ;;
    -c|--noclient)
      c=y
      shift
      ;;
    -o|--nooverseer)
      o=y
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

# In case of not verbose execution just throw most of informations into /dev/null
if [ "v" == "y" ]
then
  REDIRECT="> /dev/null"
else
  REDIRECT=""
fi

if [ "$p" == "n" ]
then

	echo "Building c++ applications"
	if [ -z "$QMAKE_PATH" ]
	then
		read -ep "Path to your QMake: " QMAKE_PATH
		#QMAKE_PATH=~/Qt/5.13.2/gcc_64/bin/qmake
		echo "QMake path: $QMAKE_PATH"
	fi

	# Create folders
	mkdir server/builds server/builds/gamehost server/builds/hostmanager

	echo "Build gamehost"
	cd $START_PATH/server/builds/gamehost
	
  $QMAKE_PATH $START_PATH/server/gamehost/gamehost.pro -Wall $REDIRECT
	if [ $? -ne 0 ]
	then
    echo "Qmake for gamehost failed"
  fi	

	make $REDIRECT
	if [ $? -ne 0 ]
	then
    echo "Make for gamehost failed"
  fi	

	echo; echo; # Just give me some of that space
	echo "Builds hostmanager"
	cd $START_PATH/server/builds/hostmanager
	$QMAKE_PATH $START_PATH/server/hostmanager/hostmanager.pro -Wall $REDIRECT
	make > /dev/null

fi

