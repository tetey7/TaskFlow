import Link from 'next/link';

interface HeaderProps {
  onNewTask?: () => void;
}

export default function Header({ onNewTask }: HeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              TaskFlow
            </Link>
            <nav className="flex space-x-4">
              <Link
                href="/tasks"
                className="text-gray-900 font-medium px-3 py-2 rounded-md bg-gray-100"
              >
                Tasks
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                About
              </Link>
            </nav>
          </div>
          {onNewTask && (
            <button
              onClick={onNewTask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              + New Task
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
