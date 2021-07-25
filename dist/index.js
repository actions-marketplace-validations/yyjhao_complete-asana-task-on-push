"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const asana = __importStar(require("asana"));
const regex = /https:\/\/app.asana.com\/(\d+)\/(?<project>\d+)\/(?<task>\d+)/g;
function taskIdsFromBody(body) {
    return [...new Set([...body.matchAll(regex)].map((m) => m.groups.task))];
}
(async () => {
    core.debug(`action ${JSON.stringify(github.context.payload)}`);
    const client = asana.Client.create({
        defaultHeaders: { "asana-enable": "string_ids" },
    }).useAccessToken(core.getInput("asana-access-token"));
    const projectId = core.getInput("project-id");
    const taskCommentStart = core.getInput("task-comment");
    const commits = github.context.payload.commits;
    for (let commit of commits) {
        const taskComment = `${taskCommentStart} ${commit.url}`;
        const taskIds = taskIdsFromBody(commit.message);
        if (taskIds.length === 0) {
            core.info("No asana link detected.");
            continue;
        }
        core.debug(`${JSON.stringify(taskIds)}`);
        await Promise.all(taskIds.map((id) => {
            return Promise.all([
                client.tasks
                    .addProject(id, {
                    project: projectId,
                })
                    .then(() => {
                    return client.tasks.update(id, {
                        completed: true,
                    });
                }),
                client.tasks.addComment(id, {
                    text: taskComment,
                }),
            ]);
        }));
    }
})().catch((e) => {
    core.setFailed(e.message);
});
