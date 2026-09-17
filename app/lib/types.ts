export interface SchoolClass {
  name: string;
  color: string;
}

export interface Assignment {
  id: string;
  title: string;
  className: string;
  assignedDate: string;
  dueDate: string;
  description: string;
  completed: boolean;
  createdAt: string;
}