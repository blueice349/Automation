die () {
        echo -e "\e[1;39;91mERROR\e[0m \e[1m$1\e[0m"
        exit 1;
}

wait () {
	for i in {$1..0}; do
	        echo -ne '$i\033[0K\r'
	        sleep 1;
	done
}

clear;
echo "Welcome, new Omadi Employee!"
echo ""
echo "This script will attempt to set up your environment for you.  Before we do this, please review the Environment Setup HOWTO at"
echo ""
echo "                      https://omadillc.atlassian.net/wiki/display/MOB/Environment+Setup"
echo ""
echo "before running this script.  By proceeding, you agree that you've read the documentation and installed the requisite software."
echo "Please press any key to agree, or CTRL-C to quit... "
read blah

test -d "$HOME/Library/Application Support/Titanium" || die "You lie, you did not get all dependancies!"

clear
echo "Step 1: Make an SSH key just for BitBucket."
echo "Please go to https://bitbucket.omadi.net/plugins/servlet/ssh/account/keys and be ready to add a key."

ssh-keygen -b 4096 -t rsa -f ~/.ssh/bitbucket -N -q || die "Could not make ssh key"

cat ~/.ssh/bitbucket.pub | pbcopy

echo ""
echo "DONE! Your SSH key is now in your clipboard, please paste it."
echo ""
echo "Here is your key in case you accidentally copied something over it:"
echo ""
cat ~/.ssh.bitbucket.pub
echo ""
echo "Press any key to continue..."
read blah

echo -e "Host omadi\n\tHostname bitbucket.omadi.net\n\tUser git\n\tPort 7999\n\tIdentityFile ~/.ssh/bitbucket" >> ~/.ssh/config
chmod 600 ~/.ssh/config

clear

echo "Step 2: Install Dependancies"
echo ""
echo "For this next step, we're going to install brew.sh (http://brew.sh) so we can install node, npm, git, etc."
echo ""
echo "Most of this should happen automatically, but please be ready to answer prompts."
echo ""
echo -n "CTRL-C to stop, otherwise starting in ";
wait 20;

echo "Installing brew..."
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"  || die "Failed to install brew"

brew update || die "Couldn't update brew"

echo "Installing node..."
brew install node || die "Failed to install node"

echo "Installing npm..."
brew install npm || die "Failed to install npm"

echo "Installing git..."
brew install git || die "Failed to install git"

echo "Installing appcelerator CLI..."
npm install -g appcelerator

mkdir ~/Projects
cd ~/Projects

echo "Checking out Mobile App Repository..."
# do /usr/local/bin/git so we're not asked to accept xcode license first
/usr/local/bin/git clone ssh://omadi/crm/omadi-mobile-crm.git ./omadi_mobile || die "Couldn't checkout repository"

echo "Checking out Mobile Automation Repository..."
/usr/local/bin/git clone ssh://omadi/crm/crm-mobile-test.git ./omadi_mobile_test || die "Couldn't checkout repository"

mkdir sdks sdks/ios
cp -R omadi_mobile/ios_src/StarIO.framework sdks/ios

echo "Checkout out dependant Modules..."
cd ~/Library/Application Support/Titanium/modules || die "You did not install Titanium yet! Liar!"

test -e iphone && rm -rf iphone
test -e android && rm -rf android

/usr/local/bin/git clone ssh://git@bitbucket.omadi.net/crm/crm-ios-modules.git ./iphone || die "Could not checkout iPhone module repo"
/usr/local/bin/git clone ssh://git@bitbucket.omadi.net/crm/crm-android-modules.git ./android || die "Could not checkout Android module repo"

appc ti config genymotion.executables.player /Applications/Genymotion.app/Contents/MacOS/player.app/Contents/MacOS/player || die "Could not run appc command line tool"
appc ti sdk install latest || die "Could not upgrade Titanium to latest sdk"
appc ti sdk use latest || die "Could not use latest Titanium sdk"
appc use latest || die "Could not update Appcelerator to latest CLI"

clear

target="$HOME/.bash_profile"
if [ -e "$HOME/.zshrc" ]; then
	target="$HOME/.zshrc"
fi

echo "Adding some stuff to your shell startup file ($target), you'll need to modify this afterwards."
echo -e "\n\n# Added by first-time-setup.sh\nexport appcUsername='Appcelerator Login'\nexport appcPassword='Appcelerator Password'\n\n# Get these after setting up your Apple Developer Account\nexport appleDevName='Your Name (12345)'\nexport appleDevCertId='(your apple device id)'\ndebugStyle='debug' #(trace/debug/info/warn)\n\n\nsource ~/Projects/omadi_mobile/scripts/commands.sh" >> $target

echo ""
echo "All done!  Please edit $target and fill in your login details."
echo ""
echo "Also, in case you havent' already, please run this command and accept license terms:  xcodebuild -license"
