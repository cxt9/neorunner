"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LablesListProvider = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
class LablesListProvider {
    constructor() { }
    /*
    async getLables() {
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
        .run(
          "MATCH(n) WITH LABELS(n) AS labels , KEYS(n) AS keys UNWIND labels AS label UNWIND keys AS key RETURN DISTINCT label, COLLECT(DISTINCT key) AS props ORDER BY label",
          {}
        )
        .then((result) => {
          let labels = [];
          for (let i = 0; i < result.records.length; i++) {
            labels.push(result.records[i]._fields[0]);
          }
  
          return labels;
        });
  
      return result;
    }
    */
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
            //Get children
            return Promise.resolve(this.getLabels(element.label));
        }
        else {
            //Get "Root"
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
            .run("MATCH(n) WITH LABELS(n) AS labels , KEYS(n) AS keys UNWIND labels AS label UNWIND keys AS key RETURN DISTINCT label, COLLECT(DISTINCT key) AS props ORDER BY label", {})
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
    getDepsInPackageJson(packageJsonPath) {
        if (this.pathExists(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
            const toDep = (moduleName, version) => {
                if (this.pathExists(path.join("/home/doron/Projects/neorunner", "node_modules", moduleName))) {
                    return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.Collapsed);
                }
                else {
                    return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.None);
                }
            };
            const deps = packageJson.dependencies
                ? Object.keys(packageJson.dependencies).map((dep) => toDep(dep, packageJson.dependencies[dep]))
                : [];
            const devDeps = packageJson.devDependencies
                ? Object.keys(packageJson.devDependencies).map((dep) => toDep(dep, packageJson.devDependencies[dep]))
                : [];
            return deps.concat(devDeps);
        }
        else {
            return [];
        }
    }
    pathExists(p) {
        try {
            fs.accessSync(p);
        }
        catch (err) {
            return false;
        }
        return true;
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
class Dependency extends vscode.TreeItem {
    constructor(label, version, collapsibleState) {
        super(label, collapsibleState);
        this.label = label;
        this.version = version;
        this.collapsibleState = collapsibleState;
        this.iconPath = {
            light: path.join(__filename, "..", "..", "resources", "light", "dependency.svg"),
            dark: path.join(__filename, "..", "..", "resources", "dark", "dependency.svg"),
        };
        this.tooltip = `${this.label}-${this.version}`;
        this.description = this.version;
    }
}
//# sourceMappingURL=labelsList%20copy.js.map