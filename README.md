# Pomodoro

## Frontend

<p align="center"><img src="demo/pomodoro_001.png"></p>

## Backend API examples

### Create a new session

```bash
$ curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"duration": 1500, "type": "pomodoro"}'
{
  "id": 1
}
```

### List all sessions

```bash
$ curl -X GET http://localhost:3001/api/sessions | jq
[
  {
    "id": 2,
    "start_time": "2025-01-03 04:59:17",
    "duration": 1500,
    "type": "pomodoro",
    "task_count": 3,
    "completed_tasks": 1
  },
  {
    "id": 1,
    "start_time": "2025-01-03 01:11:38",
    "duration": 1500,
    "type": "pomodoro",
    "task_count": 7,
    "completed_tasks": 6
  }
]
```

### Delete a session (replace {id} with actual session ID)

```bash
$ curl -X DELETE http://localhost:3001/api/sessions/{id} | jq
{
  "message": "Session and associated tasks deleted successfully",
  "changes": 1
}
```

### Create a new task

```bash
$ curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"sessionId": 1, "description": "Complete project documentation"}'
{
  "id": 1
}
```

### List all tasks

```bash
$ curl -X GET http://localhost:3001/api/tasks | jq
[
  {
    "id": 2,
    "session_id": null,
    "description": "Example task description",
    "completed": 0
  },
  {
    "id": 1,
    "session_id": null,
    "description": "Example task description",
    "completed": 1
  }
]
```

### Update task completion status (replace {id} with actual task ID)

```bash
$ curl -X PUT http://localhost:3001/api/tasks/{id} \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
{
  "changes": 1
}
```

### Delete a task (replace {id} with actual task ID)

```bash
$ curl -X DELETE http://localhost:3001/api/tasks/{id} | jq
{
  "message": "Task deleted successfully",
  "changes": 1
}
```

## Docker Image

1. Build the Docker image                                                                                                                                                                                                                           

```bash
# Make sure you’re in the Pomodoro folder
cd ./Pomodoro
# Build the image and tag it (e.g., “pomodoro-app”)
docker build -t pomodoro-app .
```

2. Run the container

```bash
# Run it in detached mode and map the ports the app uses
docker run -d \
  -p 3000:3000 \   # Frontend (served on port 3000)
  -p 3001:3001 \   # Backend API (served on port 3001)
  --name pomodoro-app \
  pomodoro-app
```

3. Verify it’s running

```bash
docker ps          # Should list the “pomodoro-app” container
docker logs pomodoro-app  # Shows the startup script output
```

### Quick notes

- The `startup-script.sh` inside the image will install dependencies and launch both the frontend (React) and the backend (Node) automatically.
- If you need to stop the container later: `docker stop pomodoro-app`
- To view the logs: `docker logs pomodoro-app`
- To restart after stopping: `docker start pomodoro-app`

