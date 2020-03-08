import * as vscode from 'vscode';

import { getJsonFromYaml, getYamlFromJson, showError } from './helpers';

export function selectionReplaceHandler(fromType: 'yaml' | 'json') {
	const converter = {
		json: getYamlFromJson,
		yaml: getJsonFromYaml
	}[fromType];

	return async () => {
		try {
			const editor = vscode.window.activeTextEditor;

			if (!editor) {
				return;
			}
			const { selection, document } = editor;
			const text = document.getText(selection);
			const newText = converter(text);

			const range = getSelectionRange(selection);

			await replaceSelection(document, range, newText);
			const { end } = selection;
			editor.selection = new vscode.Selection(end, end);
		} catch (error) {
			console.error(error);
			showError(error.message);
		}
	};
}

function getSelectionRange(selection: vscode.Selection) {
	const { start, end } = selection;
	const range = new vscode.Range(start, end);

	return range;
}

async function replaceSelection(document: vscode.TextDocument, range: vscode.Range, replacement: string) {
	const { uri } = document;

	const edit = new vscode.WorkspaceEdit();

	try {
		edit.replace(uri, range, replacement);
		await vscode.workspace.applyEdit(edit);
	} catch (error) {
		console.error(error);
		showError(error.message);
	}
}