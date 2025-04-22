import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        price: '',
        duration: '',
    });
    const [admin, setAdmin] = useState(null);
    const [error, setError] = useState(null);
    const [payments, setPayments] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [editData, setEditData] = useState({});
    const [editImage, setEditImage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const coursesResponse = await axios.get('http://localhost:5000/courses');
                setCourses(coursesResponse.data);

                const token = localStorage.getItem('token');
                if (token) {
                    const userResponse = await axios.get('http://localhost:5000/users/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setAdmin(userResponse.data);

                    const paymentsResponse = await axios.get('http://localhost:5000/user/purchases', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setPayments(paymentsResponse.data.purchases);
                }
            } catch (error) {
                console.log('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleCourseChange = (e) => {
        const { name, value } = e.target;
        setNewCourse({ ...newCourse, [name]: value });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();

        if (!newCourse.title || !newCourse.description || !newCourse.price || !newCourse.duration || !selectedFile) {
            setError('Please fill out all fields and upload an image.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You are not authorized. Please log in.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', newCourse.title);
            formData.append('description', newCourse.description);
            formData.append('price', parseFloat(newCourse.price));
            formData.append('duration', parseInt(newCourse.duration));
            formData.append('image', selectedFile);

            const response = await axios.post('http://localhost:5000/courses', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setCourses([...courses, response.data]);
            setNewCourse({ title: '', description: '', price: '', duration: '' });
            setSelectedFile(null);
            setError(null);
            alert('Course created successfully!');
        } catch (error) {
            console.log('Error details:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'Error creating course');
        }
    };

    const handleEditClick = (course) => {
        setEditingCourseId(course.id);
        setEditData({ ...course });
        setEditImage(null);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData({ ...editData, [name]: value });
    };

    const handleEditImageChange = (e) => {
        setEditImage(e.target.files[0]);
    };

    const handleSaveEdit = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('You are not authorized. Please log in.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', editData.title);
            formData.append('description', editData.description);
            formData.append('price', parseFloat(editData.price));
            formData.append('duration', parseInt(editData.duration));
            if (editImage) {
                formData.append('image', editImage);
            }

            const response = await axios.put(`http://localhost:5000/courses/${editingCourseId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const updatedCourses = courses.map((c) =>
                c.id === editingCourseId ? response.data : c
            );
            setCourses(updatedCourses);
            setEditingCourseId(null);
            setEditImage(null);
            setEditData({});
            alert('Course updated successfully!');
        } catch (error) {
            console.log('Error updating course:', error);
            setError('Error updating course');
        }
    };

    // Delete course function
    const handleDeleteCourse = async (courseId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('You are not authorized. Please log in.');
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/courses/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            // Remove the deleted course from the state
            setCourses(courses.filter((course) => course.id !== courseId));
            alert('Course deleted successfully!');
        } catch (error) {
            console.log('Error deleting course:', error);
            setError('Error deleting course');
        }
    };

    if (!admin) return <Navigate to="/" />;
    if (admin && (admin.role !== 'admin' && admin.role !== 'non-admin')) {
        return <Navigate to="/" />;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                {admin && (
                    <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
                        Welcome, {admin.name} ({admin.role})
                    </h1>
                )}

                {error && <div className="text-red-600 text-center mb-4">{error}</div>}

                {(admin && (admin.role === 'admin' || admin.role === 'non-admin')) && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">Add New Course</h2>
                        <form onSubmit={handleAddCourse} className="space-y-4">
                            <input type="text" name="title" value={newCourse.title} onChange={handleCourseChange} placeholder="Title" className="w-full p-2 border rounded" />
                            <textarea name="description" value={newCourse.description} onChange={handleCourseChange} placeholder="Description" className="w-full p-2 border rounded" />
                            <input type="number" name="price" value={newCourse.price} onChange={handleCourseChange} placeholder="Price" className="w-full p-2 border rounded" />
                            <input type="number" name="duration" value={newCourse.duration} onChange={handleCourseChange} placeholder="Duration" className="w-full p-2 border rounded" />
                            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 border rounded" />
                            <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">Add Course</button>
                        </form>
                    </div>
                )}

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Courses</h2>
                    <div className="space-y-4">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-gray-50 p-4 rounded shadow">
                                {editingCourseId === course.id ? (
                                    <div className="space-y-2">
                                        <input type="text" name="title" value={editData.title} onChange={handleEditChange} className="w-full p-2 border rounded" />
                                        <textarea name="description" value={editData.description} onChange={handleEditChange} className="w-full p-2 border rounded" />
                                        <input type="number" name="price" value={editData.price} onChange={handleEditChange} className="w-full p-2 border rounded" />
                                        <input type="number" name="duration" value={editData.duration} onChange={handleEditChange} className="w-full p-2 border rounded" />
                                        <input type="file" accept="image/*" onChange={handleEditImageChange} className="w-full p-2 border rounded" />
                                        <button onClick={handleSaveEdit} className="bg-blue-500 text-white py-2 px-4 rounded mt-2">Save</button>
                                    </div>
                                ) : (
                                    <>
                                        {course.imageUrl && (
                                            <img src={`http://localhost:5000/${course.imageUrl}`} alt={course.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                                        )}
                                        <p className="text-gray-700 font-semibold">{course.title}</p>
                                        <p>{course.description}</p>
                                        <p className="text-gray-600">
                                            Price: ${course.price} | Duration: {course.duration}
                                        </p>
                                        {(admin.role === 'admin' || admin.role === 'non-admin') && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(course)}
                                                    className="bg-yellow-500 text-white py-2 px-4 rounded mt-2"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCourse(course.id)}
                                                    className="bg-red-500 text-white py-2 px-4 rounded mt-2"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Payments</h2>
                    <div className="space-y-4">
                        {payments.map((payment) => (
                            <div key={payment.id} className="bg-gray-50 p-4 rounded shadow">
                                <p>Payment for course: {payment.course_id} | Amount: ${payment.amount}</p>
                                <p>Payment Date: {new Date(payment.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursesPage;
