#!/bin/sh
# wait-for-it.sh: wait for a host to be available before executing a command
#
# Usage:
#   wait-for-it.sh host:port [-s] [-t timeout] [-- command args...]
#
# Arguments:
#   host:port      Host or IP and port
#   -s             Strict mode. Any error will cause the script to exit.
#   -t timeout     Timeout in seconds, 0 for no timeout
#   -- command     Command to execute after the host is available
#
# Example:
#   wait-for-it.sh db:3306 -- echo "Database is up"

set -e

HOST=$(echo $1 | cut -d: -f1)
PORT=$(echo $1 | cut -d: -f2)
shift
CMD="$@"

TIMEOUT=15
STRICT=0

while [ $# -gt 0 ]
do
    case "$1" in
        -t)
        TIMEOUT="$2"
        shift 2
        ;;
        -s)
        STRICT=1
        shift
        ;;
        --)
        shift
        CMD="$@"
        break
        ;;
        *)
        echo "Unknown argument: $1"
        exit 1
        ;;
    esac
done

wait_for() {
    for i in `seq $TIMEOUT`; do
        nc -z $HOST $PORT > /dev/null 2>&1
        result=$?
        if [ $result -eq 0 ]; then
            if [ $# -gt 0 ]; then
                exec $CMD
            fi
            exit 0
        fi
        sleep 1
    done
    echo "Operation timed out" >&2
    exit 1
}

wait_for
exec $CMD
