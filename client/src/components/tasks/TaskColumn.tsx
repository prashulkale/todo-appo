'use client';

import { Task, TaskStatus } from '@/types';
import { Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}

export default function TaskColumn({ status, title, color, tasks }: TaskColumnProps) {
  return (
    <div className="flex flex-col">
      <div className={`${color} rounded-lg p-3 mb-4`}>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{tasks.length} tasks</p>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[200px] rounded-lg border-2 border-dashed transition-colors ${
              snapshot.isDraggingOver
                ? 'border-primary-400 bg-primary-50'
                : 'border-gray-200'
            }`}
          >
            <div className="p-2 space-y-2">
              {tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
}
