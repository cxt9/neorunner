"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LablesListProvider = void 0;
const vscode = require("vscode");
class LablesListProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        //Check if there is DB connection
        if (!"/home/doron/Projects/neorunner") {
            vscode.window.showInformationMessage("No dependency in empty workspace");
            return Promise.resolve([]);
        }
        if (element) {
            return Promise.resolve(this.getLabels(element.label));
        }
        else {
            return Promise.resolve(this.getLabels(""));
        }
    }
    async getLabels(label) {
        const server = vscode.workspace.getConfiguration().get("neorunner.server");
        const user = vscode.workspace.getConfiguration().get("neorunner.user");
        const password = vscode.workspace
            .getConfiguration()
            .get("neorunner.password");
        const neo4j = require("neo4j-driver");
        const driver = neo4j.driver("neo4j://" + server, neo4j.auth.basic(), {
            disableLosslessIntegers: true,
        });
        const session = driver.session();
        const result = await session
            .run("MATCH(n) WITH LABELS(n) AS labels , KEYS(n) AS keys UNWIND labels AS label UNWIND (CASE keys when [] then [null] else keys end) AS key RETURN DISTINCT label, COLLECT(DISTINCT key) AS props ORDER BY label", {})
            .then((result) => {
            let labels = [];
            for (let i = 0; i < result.records.length; i++) {
                if (label == "") {
                    labels.push(new Label(result.records[i]._fields[0], "", vscode.TreeItemCollapsibleState.Collapsed));
                }
                else {
                    if (result.records[i]._fields[0] == label) {
                        for (let j = 0; j < result.records[i]._fields[1].length; j++) {
                            labels.push(new Label(result.records[i]._fields[1][j], "", vscode.TreeItemCollapsibleState.None));
                        }
                    }
                }
            }
            return labels;
        });
        return result;
    }
}
exports.LablesListProvider = LablesListProvider;
class Label extends vscode.TreeItem {
    constructor(label, version, collapsibleState) {
        super(label, collapsibleState);
        this.label = label;
        this.version = version;
        this.collapsibleState = collapsibleState;
        this.tooltip = `${this.label}-${this.version}`;
        this.description = this.version;
    }
}
//# sourceMappingURL=labelsList.js.map