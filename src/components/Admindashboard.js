import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserEdit, FaTrash, FaUserShield, FaUser } from 'react-icons/fa';

const AdminDashboard = () => {
    const [adminDetails, setAdminDetails] = useState(null);
    const [users, setUsers] = useState([]);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profileImage, setProfileImage] = useState('');

    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        const fetchAdminDetailsAndUsers = async () => {
            const token = getToken();
            try {
                const adminResponse = await axios.get('http://localhost:5000/users/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setAdminDetails(adminResponse.data);

                // Retrieve from Local Storage
                const storedProfileImage = localStorage.getItem(`userProfileImage_${adminResponse.data.id}`);
                if (storedProfileImage) {
                    setProfileImage(storedProfileImage);
                } else {
                    setProfileImage(adminResponse.data.profile_image || "http://localhost:5000/uploads/profile_images/default.jpg");
                }

                // Fetch Users
                const usersResponse = await axios.get('http://localhost:5000/users', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(usersResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data.');
            } finally {
                setLoading(false);
            }
        };

        fetchAdminDetailsAndUsers();
    }, []);



    const handleImageChange = (event) => {
        const file = event.target.files[0];
        console.log("Selected file:", file);
        setImage(file);
    };

    
    const handleImageUpload = async () => {
        if (!image) {
            console.error("No image selected");
            return;
        }

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await axios.post(
                'http://localhost:5000/upload-profile-image',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    }
                }
            );

            console.log('Image uploaded:', response.data);

            // Store the new image URL in localStorage and update the state
            const imageUrl = response.data.profileImageUrl;
            localStorage.setItem(`userProfileImage_${adminDetails?.id}`, imageUrl);
            setProfileImage(imageUrl);

        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };



    const handleUpdateName = async (userId, newName) => {
        const token = getToken();
        try {
            await axios.put(
                `http://localhost:5000/update-user/${userId}`,
                { name: newName, updatedBy: adminDetails?.name || 'Admin' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers((prev) =>
                prev.map((user) => (user.id === userId ? { ...user, name: newName } : user))
            );
        } catch (error) {
            console.error('Error updating user name:', error);
            alert('Error updating user name');
        }
    };

    const handleDeleteUser = async (userId) => {
        const token = getToken();
        try {
            await axios.delete(`http://localhost:5000/delete-user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { deletedBy: adminDetails?.name || 'Admin' },
            });
            setUsers((prev) => prev.filter((user) => user.id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user');
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        const token = getToken();
        try {
            await axios.put(
                `http://localhost:5000/change-role/${userId}`,
                { role: newRole, updatedBy: adminDetails?.name || 'Admin' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers((prev) =>
                prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
            );
        } catch (error) {
            console.error('Error changing user role:', error);
            alert('Error changing user role');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const groupedUsers = {
        admins: users.filter((user) => user.role?.toLowerCase() === 'admin'),
        nonAdmins: users.filter((user) => user.role?.toLowerCase() === 'non-admin'),
        members: users.filter((user) => ['member', 'user'].includes(user.role?.toLowerCase())),
    };

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <div className="flex flex-col items-center">
                    <img
                        src={decodeURIComponent(profileImage)} // ✅ Decode any encoded characters (e.g., %20)
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-white object-cover" // Increased size
                    />

                    <h1 className="text-3xl font-semibold text-center mb-6">Dashboard</h1>
                </div>
                <div className="mt-6">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    <button
                        onClick={handleImageUpload}
                        className="bg-blue-500 text-white py-2 px-4 rounded ml-2"
                    >
                        Upload Image
                    </button>
                </div>
            </div>


                {Object.entries(groupedUsers).map(([group, users]) => (
                    users.length > 0 && (
                        <UserGroup
                            key={group}
                            title={group === 'admins' ? 'Admin Users' : group === 'nonAdmins' ? 'Non-Admin Users' : 'Members'}
                            users={users}
                            handleUpdateName={handleUpdateName}
                            handleDeleteUser={handleDeleteUser}
                            handleChangeRole={group !== 'members' ? handleChangeRole : null}
                            handleImageChange={handleImageChange}
                            handleImageUpload={handleImageUpload}
                        />
                    )
                ))}
            </div>
    );
};

const UserGroup = ({ title, users, handleUpdateName, handleDeleteUser, handleChangeRole, handleImageChange, handleImageUpload }) => {
    const [editingUserId, setEditingUserId] = useState(null);
    const [editName, setEditName] = useState('');

    return (
        <div className="p-6 mb-6 rounded-md shadow-md bg-gray-50">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                {title === 'Admin Users' ? <FaUserShield className="mr-2" /> : <FaUser className="mr-2" />} {title}
            </h2>
            <table className="min-w-full table-auto bg-white rounded-md shadow-md">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Email</th>
                        <th className="py-3 px-4 text-left">Role</th>
                        <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">
                                {editingUserId === user.id ? (
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="border rounded px-2 py-1"
                                    />
                                ) : (
                                    user.name
                                )}
                            </td>
                            <td className="py-2 px-4">{user.email}</td>
                            <td className="py-2 px-4">{user.role}</td>
                            <td className="py-2 px-4 flex items-center">
                                {editingUserId === user.id ? (
                                    <button
                                        onClick={() => {
                                            handleUpdateName(user.id, editName);
                                            setEditingUserId(null);
                                        }}
                                        className="text-green-500 mr-3"
                                    >
                                        Save
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditName(user.name);
                                            setEditingUserId(user.id);
                                        }}
                                        className="text-blue-500 mr-3"
                                    >
                                        <FaUserEdit />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-500 mr-3"
                                >
                                    <FaTrash />
                                </button>
                                {handleChangeRole && (
                                    <button
                                        onClick={() => handleChangeRole(user.id, user.role === 'member' ? 'non-admin' : 'member')}
                                        className="text-yellow-500"
                                    >
                                        Change Role
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
