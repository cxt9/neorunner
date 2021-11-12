"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const ascii_data_table_1 = require("ascii-data-table");
const labelsList_1 = require("./labelsList");
const relationshipsList_1 = require("./relationshipsList");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
const output = vscode.window.createOutputChannel("neo4j query result");
const lablesListProvider = new labelsList_1.LablesListProvider();
const relationshipsListProvider = new relationshipsList_1.RelationshipsListProvider();
vscode.window.registerTreeDataProvider("labelsList", lablesListProvider);
vscode.commands.registerCommand("lablesListProvider.refreshEntry", () => {
    lablesListProvider.refresh();
    relationshipsListProvider.refresh();
});
vscode.window.registerTreeDataProvider("relationshipsList", relationshipsListProvider);
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let runquery = vscode.commands.registerCommand("neorunner.runquery", async () => {
        const server = vscode.workspace
            .getConfiguration()
            .get("neorunner.server");
        const user = vscode.workspace.getConfiguration().get("neorunner.user");
        const password = vscode.workspace
            .getConfiguration()
            .get("neorunner.password");
        const clearOutPut = vscode.workspace
            .getConfiguration()
            .get("neorunner.clearoutput");
        const neo4j = require("neo4j-driver");
        const driver = neo4j.driver("neo4j://" + server, neo4j.auth.basic(), {
            disableLosslessIntegers: true,
        });
        const session = driver.session();
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        const editor = vscode.window.activeTextEditor;
        const selection = editor?.selection;
        const text = editor?.document.getText(selection);
        //vscode.window.showInformationMessage("Running:" + text);
        output.show(true);
        try {
            if (clearOutPut) {
                output.clear();
            }
            output.appendLine(text);
            const result = await session.run(text, {});
            var items = [];
            items.push(result.records[0].keys);
            for (let i = 0; i < result.records.length; i++) {
                items.push(result.records[i]._fields);
            }
            output.appendLine(ascii_data_table_1.default.table(items));
        }
        catch (error) {
            vscode.window.showErrorMessage("Error while trying to run the query: " + error);
        }
        finally {
            await session.close();
        }
    });
    context.subscriptions.push(runquery);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map