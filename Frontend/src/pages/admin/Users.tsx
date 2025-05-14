import { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import ConfirmBox from '../../components/common/ConfirmBox';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { getUsers, getUserById, updateUser, deleteUser } from '../../api/endpoints/users';
import type { User, UpdateUserDto } from '../../api/types/users.types';

function Users() {
  const { isAllowed } = useRoleGuard(['admin']);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateUserDto>({});
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const usersPerPage = 10;

  useEffect(() => {
    if (isAllowed) {
      fetchUsers();
    }
  }, [isAllowed]);

  useEffect(() => {
    // Apply role filter
    const filtered = roleFilter
      ? users.filter((user) => user.role === roleFilter)
      : users;
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [users, roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch users', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (user: User) => {
    try {
      const userData = await getUserById(user.id);
      setEditingUser(userData);
      setFormData({ email: userData.email, role: userData.role, isActive: userData.isActive });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch user', type: 'error' });
    }
  };

  const handleViewDetails = async (user: User) => {
    try {
      const userData = await getUserById(user.id);
      setViewingUser(userData);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch user details', type: 'error' });
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      const updatedUser = await updateUser(editingUser.id, formData);
      setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setFilteredUsers(filteredUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setEditingUser(null);
      setFormData({});
      setShowToast({ message: 'User updated successfully', type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to update user', type: 'error' });
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const updatedUser = await updateUser(user.id, { isActive: !user.isActive });
      setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setFilteredUsers(filteredUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setShowToast({ message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`, type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to toggle user status', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingUserId(id);
  };

  const confirmDelete = async () => {
    if (!deletingUserId) return;
    try {
      await deleteUser(deletingUserId);
      setUsers(users.filter((u) => u.id !== deletingUserId));
      setFilteredUsers(filteredUsers.filter((u) => u.id !== deletingUserId));
      setShowToast({ message: 'User deleted successfully', type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to delete user', type: 'error' });
    } finally {
      setDeletingUserId(null);
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const columns = [
    {
      key: 'email',
      header: 'Email',
      onClick: handleViewDetails,
    },
    { key: 'role', header: 'Role' },
    {
      key: 'isActive',
      header: 'Status',
      render: (user: User) => (
        <button
          onClick={() => handleToggleActive(user)}
          className={`px-2 py-1 rounded ${
            user.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {user.isActive ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: User) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(user)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(user.id)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  if (!isAllowed) {
    return null;
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="mb-4">
        <Select
          label="Filter by Role"
          options={[
            { value: '', label: 'All Roles' },
            { value: 'admin', label: 'Admin' },
            { value: 'doctor', label: 'Doctor' },
            { value: 'nurse', label: 'Nurse' },
            { value: 'patient', label: 'Patient' },
          ]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-48"
        />
      </div>
      <Table data={currentUsers} columns={columns} />
      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              onClick={() => paginate(page)}
              className={`px-3 py-1 ${
                currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {page}
            </Button>
          ))}
          <Button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
      {/* Edit Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => {
          setEditingUser(null);
          setFormData({});
        }}
        title="Edit User"
      >
        <Input
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mb-4"
        />
        <Select
          label="Role"
          options={[
            { value: 'admin', label: 'Admin' },
            { value: 'doctor', label: 'Doctor' },
            { value: 'nurse', label: 'Nurse' },
            { value: 'patient', label: 'Patient' },
          ]}
          value={formData.role || ''}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'doctor' | 'nurse' | 'patient' })}
          className="mb-4"
        />
        <Select
          label="Status"
          options={[
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
          ]}
          value={formData.isActive ? 'true' : 'false'}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
          className="mb-4"
        />
        <div className="flex space-x-4">
          <Button onClick={handleUpdate}>Save</Button>
          <Button
            onClick={() => {
              setEditingUser(null);
              setFormData({});
            }}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </Button>
        </div>
      </Modal>
      {/* Details Modal */}
      <Modal
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        title="User Details"
      >
        {viewingUser && (
          <div className="space-y-2">
            <p><strong>ID:</strong> {viewingUser.id}</p>
            <p><strong>Email:</strong> {viewingUser.email}</p>
            <p><strong>Role:</strong> {viewingUser.role}</p>
            <p><strong>Status:</strong> {viewingUser.isActive ? 'Active' : 'Inactive'}</p>
            <p><strong>Created At:</strong> {new Date(viewingUser.createdAt).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(viewingUser.updatedAt).toLocaleString()}</p>
          </div>
        )}
        <Button
          onClick={() => setViewingUser(null)}
          className="mt-4 bg-gray-500 hover:bg-gray-600"
        >
          Close
        </Button>
      </Modal>
      {/* Delete Confirmation */}
      <ConfirmBox
        isOpen={!!deletingUserId}
        message="Are you sure you want to delete this user?"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingUserId(null)}
      />
      {showToast && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          onClose={() => setShowToast(null)}
        />
      )}
    </div>
  );
}

export default Users;