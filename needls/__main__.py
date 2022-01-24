# --------------------------------------------------------------------------
# Licensed under the MIT license.
# See License.txt in the project root for further license information.
# --------------------------------------------------------------------------

############################################################################
# Based on pygls                                                           #
# See ThirdPartyNotices.txt in the project root for additional notices.    #
############################################################################

import argparse
import logging

from .server import needs_server

logging.basicConfig(filename="needls.log", level=logging.DEBUG, filemode="w")


def add_arguments(parser):
    parser.description = "simple Open-Needs language server implementing LSP"

    parser.add_argument(
        "--tcp", action="store_true", help="Use TCP server instead of stdio"
    )
    parser.add_argument("--host", default="127.0.0.1", help="Bind to this address")
    parser.add_argument("--port", type=int, default=2087, help="Bind to this port")


# initialization code is similar to pygls example:
# https://github.com/openlawlibrary/pygls/blob/bbf671f509b0d499a006daeeae8cdb78e3419fe5/examples/json-extension/server/__main__.py
def main():
    parser = argparse.ArgumentParser()
    add_arguments(parser)
    args = parser.parse_args()

    if args.tcp:
        needs_server.start_tcp(args.host, args.port)
    else:
        needs_server.start_io()


if __name__ == "__main__":
    main()
