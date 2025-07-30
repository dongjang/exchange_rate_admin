import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { usersAtom, loadingAtom, errorAtom, selectedUserAtom } from '../store/userStore';
import { api } from '../services/api';
import { UserModal } from './UserModal';

export const UserList = () => {
  const [users, setUsers] = useAtom(usersAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [error, setError] = useAtom(errorAtom);
  const [selectedUser, setSelectedUser] = useAtom(selectedUserAtom);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, [setUsers, setLoading, setError]);

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(id);
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <strong>Error: </strong>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h2>Users</h2>
        <button
          onClick={() => {
            setSelectedUser({ email: '' });
            setIsModalOpen(true);
          }}
          className="create-button"
        >
          Create User
        </button>
      </div>
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.name || '-'}</td>
                <td>
                  <button
                    onClick={() => handleEdit(user)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => user.id && handleDelete(user.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && (
        <div className="no-users">
          No users found
        </div>
      )}
      
      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }} 
      />
    </div>
  );
}; 