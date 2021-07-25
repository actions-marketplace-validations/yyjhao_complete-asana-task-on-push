# Github action to complete asana tasks on push

A very simple Asana Github Action to

1. complete tasks on push
2. add a comment with the link to the commit, and
3. add the task to a project

## Inputs

## `asana-access-token`

**Required** A personal access token with access to all tasks that can be mentioned and the project

## `task-comment`

**Required** Text for adding comments to a task. The comment will appear as {{task-comment}} {{github url}}

## `project-id`

**Required** ID of project to multi-home task to.

## Example usage

```yaml
uses: yyjhao/complete-asana-task-on-push@v1.0.0
with:
  asana-access-token: "<your access token>"
  task-comment: "Pull request opened: "
  project-id: "<some project id>"
```

It's recommended to tied this up with the push event type, for example:

```yaml
name: Asana Action
on: push
jobs:
  Update-on-push:
    runs-on: ubuntu-latest
    steps:
      - name: run action
        uses: yyjhao/complete-asana-task-on-push@v1.0.0
        with:
          asana-access-token: "<your access token>"
          task-comment: "Pull request opened: "
          project-id: "<some project id>"
```
