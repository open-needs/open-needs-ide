# --------------------------------------------------------------------------
# Licensed under the MIT license.
# See License.txt in the project root for further license information.
# --------------------------------------------------------------------------

############################################################################
# Based on pygls                                                           #
# See ThirdPartyNotices.txt in the project root for additional notices.    #
############################################################################

import getpass
import os
import pathlib
import re
from hashlib import blake2b
from typing import List, Tuple

from pygls.features import (
    COMPLETION,
    COMPLETION_ITEM_RESOLVE,
    DEFINITION,
    HOVER,
    INITIALIZED,
    TEXT_DOCUMENT_DID_CHANGE,
    TEXT_DOCUMENT_DID_CLOSE,
    TEXT_DOCUMENT_DID_OPEN,
    WORKSPACE_DID_CHANGE_CONFIGURATION,
)
from pygls.server import LanguageServer
from pygls.types import (
    CompletionItem,
    CompletionItemKind,
    CompletionList,
    CompletionParams,
    ConfigurationItem,
    ConfigurationParams,
    DidChangeTextDocumentParams,
    DidCloseTextDocumentParams,
    DidOpenTextDocumentParams,
    Hover,
    InitializeParams,
    InsertTextFormat,
    Location,
    MarkupContent,
    MarkupKind,
    MessageType,
    Position,
    Range,
    TextEdit,
)

from needls.needs_store import NeedsStore


class NeedsLanguageServer(LanguageServer):
    CMD_UPDATE_SETTINGS = "needls.update_settings"

    CONFIGURATION_SECTION = "needls"

    def __init__(self):
        super().__init__()

        self.needs_store = NeedsStore()


needs_server = NeedsLanguageServer()


def _validate(ls, params):
    text_doc = ls.workspace.get_document(params.textDocument.uri)

    source = text_doc.source
    diagnostics = _validate_sphinx(source) if source else []

    ls.publish_diagnostics(text_doc.uri, diagnostics)


def _validate_sphinx(source):
    """TODO: Validates sphinx reST file."""
    diagnostics = []
    return diagnostics


def col_to_word_index(col: int, words: List[str]) -> int:
    """Return the index of a word in a list of words for a given line character column."""
    length = 0
    index = 0
    for word in words:
        length = length + len(word)
        if col <= length + index:
            return index
        index = index + 1
    return index - 1


def get_lines(ls, params) -> List[str]:
    """Get all text lines in the current document."""
    text_doc = ls.workspace.get_document(params.textDocument.uri)
    source = text_doc.source
    return source.splitlines()


def get_word(ls, params) -> str:
    """Return the word in a line of text at a character position."""
    line_no, col = params.position
    line = get_lines(ls, params)[line_no]
    words = line.split()
    index = col_to_word_index(col, words)
    return words[index]


def get_lines_and_word(ls, params) -> Tuple[List[str], str]:
    return (get_lines(ls, params), get_word(ls, params))


def get_need_type_and_id(ls, params) -> Tuple[str, str]:
    """Return tupel (need_type, need_id) for a given document position."""
    word = get_word(ls, params)
    for need in ls.needs_store.needs.values():
        if need["id"] in word:
            return (need["type"], need["id"])
    return (None, None)


def doc_completion_items(ls, docs: List[str], doc_pattern: str) -> List[CompletionItem]:
    """Return completion items for a given doc pattern."""

    # calc all doc paths that start with the given pattern
    all_paths = [doc for doc in docs if doc.startswith(doc_pattern)]

    if len(all_paths) == 0:
        return

    # leave if there is just one path
    if len(all_paths) == 1:
        insert_text = all_paths[0][len(doc_pattern) :]
        return [
            CompletionItem(
                label=insert_text,
                insert_text=insert_text,
                kind=CompletionItemKind.File,
                detail="needs doc",
            )
        ]

    # look at increasingly longer paths
    # stop if there are at least two options
    max_path_length = max(path.count("/") for path in all_paths)
    current_path_length = doc_pattern.count("/")

    if max_path_length == current_path_length == 0:
        sub_paths = all_paths
        return [
            CompletionItem(
                label=sub_path, kind=CompletionItemKind.File, detail="path to needs doc"
            )
            for sub_path in sub_paths
        ]

    # create list that contains only paths up to current path length
    sub_paths = []
    for path in all_paths:
        if path.count("/") >= current_path_length:
            new_path = "/".join(
                path.split("/")[current_path_length : current_path_length + 1]
            )
            if new_path not in sub_paths:
                sub_paths.append(new_path)
    sub_paths.sort()

    items = []
    for sub_path in sub_paths:
        if sub_path.find(".rst") > -1:
            kind = CompletionItemKind.File
        else:
            kind = 19  # Folder
        items.append(
            CompletionItem(label=sub_path, kind=kind, detail="path to needs doc")
        )
    return items


def complete_need_link(
    ls, params: CompletionParams, lines: List[str], line: str, word: str
):
    # specify the need type, e.g.,
    # ->req
    if word.count(">") == 1:
        return CompletionList(
            True,
            [
                CompletionItem(label=need_type, detail="need type")
                for need_type in ls.needs_store.types
            ],
        )

    word_parts = word.split(">")

    # specify doc in which need is specified, e.g.,
    # ->req>fusion/index.rst
    if word.count(">") == 2:
        requested_type = word_parts[1]  # e.g., req, test, ...
        if requested_type in ls.needs_store.types:
            return CompletionList(
                True,
                doc_completion_items(
                    ls, ls.needs_store.docs_per_type[requested_type], word_parts[2]
                ),
            )

    # specify the exact need, e.g.,
    # ->req>fusion/index.rst>REQ_001
    if word.count(">") == 3:
        requested_type = word_parts[1]  # e.g., req, test, ...
        requested_doc = word_parts[2]  # [0:-4]  # without `.rst` file extension
        if requested_doc in ls.needs_store.needs_per_doc:
            substitution = word[word.find("->") :]
            start_char = line.find(substitution)
            line_number = params.position[0]
            return CompletionList(
                False,
                [
                    CompletionItem(
                        label=need["id"],
                        insert_text=need["id"],
                        documentation=need["description"],
                        detail=need["title"],
                        additional_text_edits=[
                            TextEdit(
                                range=Range(
                                    start=Position(line_number, start_char),
                                    end=Position(
                                        line_number, start_char + len(substitution)
                                    ),
                                ),
                                new_text="",
                            )
                        ],
                    )
                    for need in ls.needs_store.needs_per_doc[requested_doc]
                    if need["type"] == requested_type
                ],
            )


def generate_hash(user_name, doc_uri, need_prefix, line_number):
    salt = os.urandom(blake2b.SALT_SIZE)  # pylint: disable=no-member
    return blake2b(
        f"{user_name}{doc_uri}{need_prefix}{line_number}".encode(),
        digest_size=4,
        salt=salt,
    ).hexdigest()


def generate_need_id(
    ls, params, lines: List[str], word: str, need_type: str = None
) -> str:
    """Generate a need ID including hash suffix."""

    user_name = getpass.getuser()
    doc_uri = params.textDocument.uri
    line_number = params.position[0]

    if not need_type:
        try:
            match = re.search(".. ([a-z]+)::", lines[line_number - 1])
            need_type = match.group(1)
        except AttributeError:
            return "ID"

    need_prefix = need_type.upper()
    hash_part = generate_hash(user_name, doc_uri, need_prefix, line_number)
    need_id = need_prefix + "_" + hash_part
    # re-generate hash if ID is already in use
    while need_id in ls.needs_store.needs:
        hash_part = generate_hash(user_name, doc_uri, need_prefix, line_number)
        need_id = need_prefix + "_" + hash_part
    return need_id


def complete_directive(ls, params, lines: List[str], word: str):
    # need_type ~ req, work, act, ...
    items = []
    for need_type, title in ls.needs_store.declared_types.items():
        text = (
            " " + need_type + ":: ${1:title}\n"
            "\t:id: ${2:"
            + generate_need_id(ls, params, lines, word, need_type=need_type)
            + "}\n"
            "\t:status: open\n\n"
            "\t${3:content}.\n$0"
        )
        label = f".. {need_type}::"
        items.append(
            CompletionItem(
                label=label,
                detail=title,
                insert_text=text,
                insert_text_format=InsertTextFormat.Snippet,
                kind=CompletionItemKind.Snippet,
            )
        )
    return CompletionList(False, items)


def complete_role_or_option(ls, params, lines: List[str], word: str):
    return CompletionList(
        False,
        [
            CompletionItem(
                label=":id:",
                detail="needs option",
                insert_text="id: ${1:"
                + generate_need_id(ls, params, lines, word)
                + "}\n$0",
                insert_text_format=InsertTextFormat.Snippet,
                kind=CompletionItemKind.Snippet,
            ),
            CompletionItem(
                label=":need:",
                detail="need role",
                insert_text="need:`${1:ID}` $0",
                insert_text_format=InsertTextFormat.Snippet,
                kind=CompletionItemKind.Snippet,
            ),
        ],
    )


@needs_server.feature(COMPLETION, trigger_characters=[">", "/", ":", "."])
def completions(ls, params: CompletionParams = None):
    """Returns completion items."""

    if not ls.needs_store.needs_initialized:
        return []

    lines, word = get_lines_and_word(ls, params)
    line_number = params.position[0]
    line = lines[line_number]

    if word.startswith("->") or word.startswith(":need:`->"):
        new_word = word.replace(":need:`->", "->")
        new_word = new_word.replace("`", "")  # in case need:`->...>...`
        return complete_need_link(ls, params, lines, line, new_word)

    if word.startswith(":"):
        return complete_role_or_option(ls, params, lines, word)

    if word.startswith(".."):
        return complete_directive(ls, params, lines, word)

    return []


@needs_server.feature(COMPLETION_ITEM_RESOLVE)
def completions_resolve(ls, item: CompletionItem):
    pass


@needs_server.feature(TEXT_DOCUMENT_DID_CHANGE)
def did_change(ls, params: DidChangeTextDocumentParams):
    """Text document did change notification."""
    _validate(ls, params)


@needs_server.feature(TEXT_DOCUMENT_DID_CLOSE)
def did_close(server: NeedsLanguageServer, params: DidCloseTextDocumentParams):
    """Text document did close notification."""
    return


@needs_server.feature(TEXT_DOCUMENT_DID_OPEN)
async def did_open(ls, params: DidOpenTextDocumentParams):
    """Text document did open notification."""
    _validate(ls, params)


@needs_server.feature(INITIALIZED)
def did_initialize(ls, params: InitializeParams):
    """Server was initialized."""
    ls.show_message("Initialized Open-Needs IDE Language Server")
    return True


@needs_server.feature(WORKSPACE_DID_CHANGE_CONFIGURATION)
async def did_change_workspace_config(ls, params):
    """Workspace was initialized."""
    ls.show_message("Workspace config changed")

    try:
        config = await ls.get_configuration_async(
            ConfigurationParams(
                [ConfigurationItem("", NeedsLanguageServer.CONFIGURATION_SECTION)]
            )
        )
        ls.needs_store.load_needs(os.path.abspath(config[0].needs_file))
        ls.needs_store.set_docs_root(os.path.abspath(config[0].docs_root))

        ls.show_message(
            "using needs in (from ws change): " + os.path.abspath(config[0].needs_file)
        )

    except Exception as e:
        ls.show_message_log(f"Error ocurred: {e}")


@needs_server.feature(DEFINITION)
async def did_definition(ls, params):
    """Return location of definition of a need."""

    if not ls.needs_store.is_setup():
        return

    need_type, need_id = get_need_type_and_id(ls, params)

    # get need defining doc
    try:
        need = ls.needs_store.needs[need_id]
    except KeyError:
        return None

    doc_path = os.path.join(ls.needs_store.docs_root, need["docname"])
    if os.path.exists(doc_path + ".rst"):
        doc_path = doc_path + ".rst"
    elif os.path.exists(doc_path + ".rest"):
        doc_path = doc_path + ".rest"
    else:
        return None
    doc_uri = pathlib.Path(doc_path).as_uri()

    # get the need definition position (line, col) from file
    with open(doc_path) as file:
        source_lines = file.readlines()
    # get the line number
    line_count = 0
    line_no = None
    pattern = f":id: {need_id}"
    for line in source_lines:
        if pattern in line:
            line_no = line_count
            break
        line_count = line_count + 1
    if not line_no:
        return None

    # get line of directive (e.g., .. req::)
    line_directive = None
    pattern = f".. {need_type}::"
    for line_count in range(line_no - 1, -1, -1):
        if pattern in source_lines[line_count]:
            line_directive = line_count
            break
    if not line_directive:
        return None

    pos = Position(line=line_directive)
    return Location(uri=doc_uri, range=Range(pos, pos))


@needs_server.feature(HOVER)
async def did_hover(ls, params):

    if not ls.needs_store.is_setup():
        return

    try:
        need_id = get_need_type_and_id(ls, params)[1]
    except IndexError:
        return None
    if not need_id:
        return None

    try:
        title = ls.needs_store.needs[need_id]["title"]
        description = ls.needs_store.needs[need_id]["description"]
        return Hover(
            contents=MarkupContent(
                kind=MarkupKind.Markdown,
                value=f"**{title}**\n\n```\n{description}\n```",
            )
        )
    except KeyError:
        # need is not in the database
        return None


@needs_server.command(NeedsLanguageServer.CMD_UPDATE_SETTINGS)
def update_settings(ls, *args):
    """ """
    docs_root = args[0][0]
    needs_file = os.path.join(args[0][1], "needs", "needs.json")
    ls.show_message_log("Update settings...")
    ls.show_message_log(f"Docs root: {docs_root}")
    ls.show_message_log(f"Needs file: {needs_file}")
    try:
        ls.needs_store.set_docs_root(docs_root)
        ls.needs_store.set_declared_types()
        ls.show_message_log(f"Declared need types: {ls.needs_store.declared_types}")
    except ValueError:
        ls.show_message(
            "Error setting document root! Are your settings correct?",
            msg_type=MessageType.Error,
        )
        return
    try:
        ls.needs_store.load_needs(needs_file)
    except ValueError:
        ls.show_message(
            "Error loading needs.json! Are your settings correct?",
            msg_type=MessageType.Error,
        )
        return
    ls.show_message("Using needs in: " + os.path.abspath(needs_file))
