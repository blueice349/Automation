projectDir=$HOME'/Projects/omadi_mobile/titanium_src'
  
b(){
    DISABLE_AUTO_TITLE="true"
 
    simulatorProgram=''
    simulator=''
  
    appc login --username $appcUsername --password $appcPassword --org-id 100000645
    appc ti clean --project-dir $projectDir
  
    if [ "$1" = 'a' ]
    then
        os='android'
        simulator='emulator'
        simulatorProgram='Genymotion Android'
    fi
   
    if [ "$1" = 'i' ]
    then
        os='ios'
        simulator='simulator'
        simulatorProgram='Apple IOS'
    fi
  
    if [ "$2" = 's' ]
    then
        echo -ne "\e]1;$simulatorProgram Simulator\a"
  
         if [ "$1" = 'i' ]
        then
            osascript -e 'tell app "Simulator" to quit'
        fi
 
        appc ti build --project-dir $projectDir --skip-js-minify -p $os -T $simulator --liveview --log-level $debugStyle
    else
        echo -ne "\e]1;$os Device\a"
  
        if [ "$os" = 'android' ]
        then
            appc ti build -f --project-dir $projectDir --skip-js-minify -p $os -T device --device-id --log-level $debugStyle
        else
            appc ti build -f --project-dir $projectDir --skip-js-minify -p $os -T device --developer-name "$appleDevName" --pp-uuid $appleDevCertId --log-level $debugStyle
        fi
    fi
}
