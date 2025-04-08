#!/bin/bash

if [ ! -d node_modules ]; then
    clear

    if [ "$(which pnpm >/dev/null; echo $?)" -eq 0 ]; then
        pnpm install --prod
    elif [ "$(which yarn >/dev/null; echo $?)" -eq 0 ]; then
        yarn install --production=true
    else
        npm install --omit=dev --no-package-lock
    fi
fi

RESPONSE_PATH="$(mktemp)"

while true; do
    clear

    node main.js $RESPONSE_PATH
    if [ $? -ne 0 ]; then
        break
    fi

    SSH_ARGS="$(cat $RESPONSE_PATH)"
    if [ "$SSH_ARGS" == "" ]; then
        break
    fi

    SSH_NAME=$(echo "$SSH_ARGS" | cut -d'#' -f2 | cut -d'=' -f2)
    SSH_ARGS=$(echo "$SSH_ARGS" | cut -d'#' -f1)

    while true; do
        clear
        sleep 0.1

        unset PROMPT_COMMAND
        echo -ne "\033]1;$SSH_NAME\007"
        echo -ne "\033]2;$SSH_NAME\007"
        ssh -o ServerAliveInterval=60 $SSH_ARGS

        echo
        echo 'Press [Enter] to reconnect.'
        echo 'Press [Esc] to return to the SSH Library.'
        echo 'Press [Ctrl-C] to exit.'
        read -s -n1 key
        case $key in
            $'\e')
                break
                ;;
            *)
                echo
                ;;
        esac
    done
done
