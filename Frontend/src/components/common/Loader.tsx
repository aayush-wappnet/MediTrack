import { FaSpinner } from 'react-icons/fa';

function Loader() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <FaSpinner className="animate-spin text-blue-600 text-4xl" />
    </div>
  );
}

export default Loader;