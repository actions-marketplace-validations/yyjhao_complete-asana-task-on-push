import * as core from "@actions/core";
import * as github from "@actions/github";
import * as asana from "asana";

const regex = /https:\/\/app.asana.com\/(\d+)\/(?<project>\d+)\/(?<task>\d+)/g;

function taskIdsFromBody(body: string) {
  return [...new Set([...body.matchAll(regex)].map((m) => m.groups!.task))];
}

(async () => {
  core.debug(`action ${JSON.stringify(github.context.payload)}`);

  const client = asana.Client.create({
    defaultHeaders: { "asana-enable": "string_ids" },
  }).useAccessToken(core.getInput("asana-access-token"));
  const projectId = core.getInput("project-id");
  const taskCommentStart = core.getInput("task-comment");

  const commits: { message: string; url: string }[] =
    github.context.payload.commits;

  for (let commit of commits) {
    const taskComment = `${taskCommentStart} ${commit.url}`;

    const taskIds = taskIdsFromBody(commit.message);

    if (taskIds.length === 0) {
      core.info("No asana link detected.");
      continue;
    }

    core.debug(`${JSON.stringify(taskIds)}`);

    await Promise.all(
      taskIds.map((id) => {
        return Promise.all([
          client.tasks
            .addProject(id, {
              project: projectId,
            })
            .then(() => {
              return client.tasks.update(id, <any>{
                completed: true,
              });
            }),
          client.tasks.addComment(id, {
            text: taskComment,
          }),
        ]);
      })
    );
  }
})().catch((e) => {
  core.setFailed(e.message);
});
