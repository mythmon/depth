#!/bin/bash
BUILD_DIR="build"

# Wrapper for git in the parent directory
function parent_git() {
  git --git-dir=../.git "$@"
  return $?
}


function main() {
  case ${1} in
    "build")
      build
      ;;
    "upload")
      upload
      ;;
    *)
      usage
      ;;
  esac
}


function usage() {
  echo "$0 command"
  echo
  echo "  build - Build the static directory."
  echo "  upload - Upload the static directory to gh-pages."
  echo
  exit -1
}


# Check for a build directory, and create it if it doesn't exist.
function init() {
  if [[ ! -d $BUILD_DIR ]]; then
    git clone . $BUILD_DIR > /dev/null

    pushd $BUILD_DIR > /dev/null
      git checkout -qf gh-pages
      ORIGIN=$(parent_git remote -v \
              |grep "push" \
              |grep "origin" \
              |awk '{print $2}' \
              )
      # the remote origin is currently pointed at the parent repo, which is
      # silly. Delete that and repoint it to Github
      git remote remove origin
      git remote add origin $ORIGIN
    popd > /dev/null
  fi
}


function build() {
  init

  # Make sure the parent is clean
  if [[ -n $(git status --porcelain) ]]; then
    echo "Error: You can only build from a clean repo."
    exit 1
  fi


  # Enter the build git directory
  pushd $BUILD_DIR > /dev/null
    # Only build from a new commit
    BUILD_FAKE_COMMIT=$(git show --oneline | head -n 1 | awk '{print $3}')
    PARENT_COMMIT=$(parent_git rev-parse HEAD)

    if [[ $BUILD_FAKE_COMMIT = $PARENT_COMMIT ]]; then
      echo "You already built this commit."
      exit 2
    fi

    # Reset, and rebuild
    rm -rf * .gitignore
    cp -r ../static/* ./

    # Compile Stylus
    stylus **/*.styl >/dev/null
    rm -f **/*.styl

    COMMIT=$(parent_git rev-parse HEAD)
    git add .
    git commit -m "Update ${COMMIT}" > /dev/null
  popd > /dev/null
}


function upload() {
  echo "upload"
  init
  pushd $BUILD_DIR > /dev/null
    # Push
    echo git push -fu origin gh-pages:gh-pages > /dev/null
  popd > /dev/null
}

main "$@"