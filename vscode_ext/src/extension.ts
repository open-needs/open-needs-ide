/*---------------------------------------------------------------------------------------------
 *  Licensed under the MIT license.
 *  See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


import * as path from 'path';
import * as fs from 'fs';

import {
	workspace,
	commands,
	ExtensionContext,
	window,
	OutputChannel,
} from 'vscode';

import {
	Executable,
	LanguageClient,
	LanguageClientOptions,
	ServerOptions
} from 'vscode-languageclient/node';


import { exec, ExecException } from 'child_process';


let client: LanguageClient;
const log_prefix = "Extension Open-Needs: ";


function exec_py(pythonPath: string, outChannel: OutputChannel, ...args: string[]): Promise<string> {
	const cmd = [pythonPath, ...args];
	return new Promise<string>((resolve, reject) => {
		outChannel.appendLine(`Running cmd: ${cmd.join(' ')}`);
		exec(
		cmd.join(' '),
		(error: ExecException | null, stdout: string, stderr: string) => {
			if (error) {
				const errorMessage: string = [
					error.name,
					error.message,
					error.stack,
					'',
					stderr.toString()
				].join('\n');
				outChannel.appendLine(errorMessage);
				reject(errorMessage);
			} else {
				outChannel.appendLine('Successful exec');
				resolve(stdout.toString());
			}
		}
		);
	});
}

async function checkAndValidatePythonPath(pythonPath:string, outChannel: OutputChannel): Promise<boolean> {
	// check pythonPath if empty, ask user to config; if not, use the pythonPath from workspace setting
	if (!pythonPath) {
		return false
	}
	// check if pythonPath exists: run cmd to check python version to confirm
	try {
		const currentWorkspaceFolderPath = workspace.getWorkspaceFolder(window.activeTextEditor.document.uri)?.uri.fsPath
		pythonPath = pythonPath.replace('${workspaceFolder}', currentWorkspaceFolderPath)
		await exec_py(pythonPath, outChannel, '--version');
	} catch (error) {
		console.log(error)
		outChannel.appendLine(error);

		return false
	}
	return true
}

async function getUserInputPythonPath(pythonPathProposal: string, outChannel: OutputChannel): Promise<string> {
	window.showInformationMessage(`${log_prefix} please specify python path.`);

	let pythonPath = ""
	while(await checkAndValidatePythonPath(pythonPath, outChannel) == false) {
		// prompting window to ask user to config
		const user_input_pythonPath = await window.showInputBox({
			placeHolder: "Python path for Extension Open-Needs",
			prompt: "Example: ${workspaceFolder}/.venv/bin/python",
			value: pythonPathProposal,
			ignoreFocusOut: true,
		});

		if (user_input_pythonPath) {
			pythonPath = user_input_pythonPath

			// update pythonPathProposal for inputbox
			pythonPathProposal = pythonPath
		} else {
			// user canceled
			pythonPath = undefined
			break;
		}
	}

	return pythonPath
}

async function installNeedls(pythonPath: string, outChannel: OutputChannel, version: string): Promise<boolean> {
	await exec_py(
		pythonPath,
		outChannel,
		'-m',
		'pip',
		'install',
		'pip',
		'--upgrade'
	);
	await exec_py(
		pythonPath,
		outChannel,
		'-m',
		'pip',
		'uninstall',
		'open-needs-ls',
		'-y'
	);
	await exec_py(
		pythonPath,
		outChannel,
		'-m',
		'pip',
		'install',
		`open-needs-ls==${version}`
	);
	window.showInformationMessage("Needls successfully installed.");
	return true;
}

async function checkForNeedls(pythonPath: string, outChannel: OutputChannel, ext_version: string): Promise<boolean> {
    try {
		let needls_version = await exec_py(
			pythonPath,
			outChannel,
			'-c',
			'"from needls.version import __version__; print(__version__)"'
		);
		needls_version = needls_version.trim();
		if (ext_version != needls_version) {
			return false;
		}
	} catch (e) {
		console.warn(e)
		outChannel.appendLine(e);
		return false
	}


	try {
		await exec_py(
			pythonPath,
			outChannel,
			'-c',
			'"import needls.server"'
		);
	} catch (e) {
		console.warn(e)
		outChannel.appendLine(e);
		return false
	}

	return true;
}

async function read_settings(_outChannel: OutputChannel) {
	let docs_root = workspace.getConfiguration('needls').get('docsRoot').toString();
	let build_path = workspace.getConfiguration('needls').get('buildPath').toString();
	let pythonPath = workspace.getConfiguration('needls').get('pythonPath').toString();
	let confPath = workspace.getConfiguration('needls').get('confPath').toString();
	
	const currentWorkspaceFolderPath = workspace.getWorkspaceFolder(window.activeTextEditor.document.uri)?.uri.fsPath

	docs_root = docs_root.replace('${workspaceFolder}', currentWorkspaceFolderPath)
	build_path = build_path.replace('${workspaceFolder}', currentWorkspaceFolderPath)
	pythonPath = pythonPath.replace('${workspaceFolder}', currentWorkspaceFolderPath)
	confPath = confPath.replace('${workspaceFolder}', currentWorkspaceFolderPath)

	commands.executeCommand('needls.update_settings', docs_root, build_path, pythonPath, confPath);
}

async function make_needs(pythonPath: string, outChannel: OutputChannel) {
	// only build if auto build setting is switched on
	const auto_build = workspace.getConfiguration('needls').get('autoBuild');
	if (auto_build === false) {
		return;
	}
	
	let source_dir = workspace.getConfiguration('needls').get('docsRoot').toString();
	let build_dir = workspace.getConfiguration('needls').get('buildPath').toString();

	const currentWorkspaceFolderPath = workspace.getWorkspaceFolder(window.activeTextEditor.document.uri)?.uri.fsPath

	source_dir = source_dir.replace('${workspaceFolder}', currentWorkspaceFolderPath)
	build_dir = build_dir.replace('${workspaceFolder}', currentWorkspaceFolderPath)

	// location of created needs.json
	const needs_json_dir = path.join(build_dir, "needs")

	if (source_dir) {
		// run sphinx build: python -m sphinx.cmd.build source_dir build_dir
		await exec_py(
			pythonPath,
			outChannel,
			'-m',
			'sphinx.cmd.build',
			'-b needs',
			source_dir,
			needs_json_dir
		);
	}
}

export async function activate(context: ExtensionContext): Promise<void> {

	console.log('Activating Open-Needs IDE')

	// Get current version of extension
	const extensionPath = path.join(context.extensionPath, "package.json");
    const packageFile = JSON.parse(fs.readFileSync(extensionPath, 'utf8'));
	const ext_version = packageFile.version;
	console.log(`Extension version: ${ext_version}`)

	const disposable = commands.registerCommand('open-needs-ide.load', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const manual_welcome = 'Manual loaded open-needs-ide'
		console.log(manual_welcome)
		window.showInformationMessage(manual_welcome);
	});
	context.subscriptions.push(disposable);
	
	//Create oversionutput channel for logging
	const outChannel = window.createOutputChannel("Open-Needs IDE");

	const cwd = path.join(__dirname, "..", "..");
	outChannel.appendLine("CWD: " + cwd);

	//
	// PYTHON PATH AND USER CONF HANDLING
	//

	// get pythonPath from workspace setting
	const wk_pythonPath = workspace.getConfiguration('needls').get('pythonPath').toString();

	let pythonPath = ""
	let sysPythonPath = ""
	if (wk_pythonPath == "") {
		try {
			sysPythonPath = await exec_py('python', outChannel, '-c', '"import sys; print(sys.executable)"');
		} catch {
			sysPythonPath = await exec_py('python3', outChannel, '-c', '"import sys; print(sys.executable)"');
		}
		sysPythonPath = sysPythonPath.trim();
		pythonPath = await getUserInputPythonPath(sysPythonPath, outChannel);
	}else if (!checkAndValidatePythonPath(wk_pythonPath, outChannel)){
		pythonPath = await getUserInputPythonPath(wk_pythonPath, outChannel);
	}else{
		pythonPath = wk_pythonPath
	}

	if (pythonPath === undefined) {
		window.showErrorMessage(`Python path not given. ${log_prefix} can not be loaded.`);
		return 
	}

	outChannel.appendLine("Python path: " + pythonPath);

	// update pythonPath for workspace setting
	workspace.getConfiguration('needls').update('pythonPath', pythonPath, false);

	const currentWorkspaceFolderPath = workspace.getWorkspaceFolder(window.activeTextEditor.document.uri)?.uri.fsPath
	pythonPath = pythonPath.replace('${workspaceFolder}', currentWorkspaceFolderPath)

	// Check for needls
	let needls_installed = await checkForNeedls(pythonPath, outChannel, ext_version);

	// Ask for needls installation
	if ( !needls_installed ) {
		window.showWarningMessage("Invalid Open-Needs Server installation. Please reinstall...");
		const install = await window.showInformationMessage(
			`Install needls==${ext_version} from PyPI?`,
			'Yes',
			'No'
		).then( (item) => {
		if ( item === 'Yes' ) {
			return true;
		} else {
			return false
		}
		});
		if (install) {
			try {
				needls_installed = await installNeedls(pythonPath, outChannel, ext_version);
			} catch (e){
				console.log(e)
				window.showInformationMessage(`Needls could not be installed. Error: ${e}`);
				return
			}
		}
	}

	if ( !needls_installed ) {
		window.showErrorMessage("Python module needls not found! Needs extension can't start.");
	}

	//
	// REGISTER INTERNAL HANDLERS 
	//

	// listen for changes of settings
	workspace.onDidChangeConfiguration( (_event) => {
		read_settings(outChannel);
	});

	// listen for save event of rst files
	workspace.onDidSaveTextDocument( (event) => {
		outChannel.appendLine("Saved text doc of type: " + event.languageId);
		if (event.languageId === 'restructuredtext') {
			make_needs(pythonPath, outChannel).then( () => {
				read_settings(outChannel); // trigger re-load needs.json in needls
			});
		}
	});

	const serverOptions: ServerOptions = {
		run: {
			command: pythonPath,
			args: ["-m", "needls"],
			options: { cwd: cwd }
		} as Executable,
		debug: {
			command: pythonPath,
			args: ["-m", "needls"],
			options: { cwd: cwd }
		} as Executable
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [
			{ scheme: "file", language: "restructuredtext" },
			{ scheme: "untitled", language: "restructuredtext" },
		],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'open-needs-ls',
		'Open-Needs LS',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();

	// set doc root and needs.json file
	client.onReady().then(async () => {
		// get buildPath from workspace setting
		let wk_buildPath = workspace.getConfiguration('needls').get('buildPath').toString();
		const currentWorkspaceFolderPath = workspace.getWorkspaceFolder(window.activeTextEditor.document.uri)?.uri.fsPath
		wk_buildPath = wk_buildPath.replace('${workspaceFolder}', currentWorkspaceFolderPath)

		// check if needs.json exists, if not, create one
		const needs_json_path = path.join(wk_buildPath, 'needs', 'needs.json')
		if (fs.existsSync(needs_json_path)) {
			await read_settings(outChannel);
		} else {
			make_needs(pythonPath, outChannel).then( () => {
				read_settings(outChannel); // trigger load needs.json in needls
			});
		}
	})
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}

