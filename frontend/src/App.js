import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/solid';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [type, setType] = useState('pomodoro');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const times = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const handleTimerComplete = useCallback(async () => {
    setIsActive(false);
    if (currentSessionId) {
      try {
        await axios.put(`${API_URL}/sessions/${currentSessionId}`, {
          completed: true,
        });
      } catch (error) {
        console.error('Error updating session:', error);
      }
    }
  }, [currentSessionId]);

  useEffect(() => {
    let interval = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, time, handleTimerComplete]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const toggleTimer = async () => {
    if (!isActive && !currentSessionId) {
      try {
        const response = await axios.post(`${API_URL}/sessions`, {
          duration: times[type],
          type,
        });
        setCurrentSessionId(response.data.id);
      } catch (error) {
        console.error('Error creating session:', error);
      }
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(times[type]);
    setCurrentSessionId(null);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      await axios.post(`${API_URL}/tasks`, {
        sessionId: currentSessionId,
        description: newTask,
      });
      setNewTask('');
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (taskId, completed) => {
    try {
      await axios.put(`${API_URL}/tasks/${taskId}`, {
        completed: !completed,
      });
      fetchTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex justify-center space-x-4 mb-8">
                  <button
                    className={`px-4 py-2 rounded ${type === 'pomodoro' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => { setType('pomodoro'); setTime(times.pomodoro); }}
                  >
                    Pomodoro
                  </button>
                  <button
                    className={`px-4 py-2 rounded ${type === 'shortBreak' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => { setType('shortBreak'); setTime(times.shortBreak); }}
                  >
                    Short Break
                  </button>
                  <button
                    className={`px-4 py-2 rounded ${type === 'longBreak' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => { setType('longBreak'); setTime(times.longBreak); }}
                  >
                    Long Break
                  </button>
                </div>

                <div className="text-center">
                  <h2 className="text-6xl font-bold mb-8">{formatTime(time)}</h2>
                  <div className="flex justify-center space-x-4">
                    <button
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                      onClick={toggleTimer}
                    >
                      {isActive ? (
                        <PauseIcon className="h-8 w-8 text-gray-600" />
                      ) : (
                        <PlayIcon className="h-8 w-8 text-gray-600" />
                      )}
                    </button>
                    <button
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                      onClick={resetTimer}
                    >
                      <StopIcon className="h-8 w-8 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  <form onSubmit={addTask} className="flex space-x-2">
                    <input
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder="Add a task..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </form>

                  <div className="mt-4 space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id, task.completed)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className={task.completed ? 'line-through text-gray-400' : ''}>
                          {task.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
