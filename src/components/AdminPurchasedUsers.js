import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminPurchasedUsers = () => {
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAdminPurchasedCourses();
    }, []);

    const fetchAdminPurchasedCourses = async () => {
        try {
            const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
            const response = await axios.get("http://localhost:5000/admin/courses1/purchased", {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Group data by created_by_name (admin/non-admin)
            const groupedData = groupDataByCreatedBy(response.data);
            setUserData(groupedData);
            setLoading(false);
        } catch (err) {
            setError("Failed to load users.");
            setLoading(false);
        }
    };

    const groupDataByCreatedBy = (data) => {
        const grouped = {};

        data.forEach((user) => {
            const createdBy = user.created_by_name || 'Unknown'; // If no admin/non-admin, set to 'Unknown'
            if (!grouped[createdBy]) {
                grouped[createdBy] = { total_courses: 0, total_price: 0 };
            }
            grouped[createdBy].total_courses += user.total_courses;
            grouped[createdBy].total_price += parseFloat(user.total_price);
        });

        // Convert grouped data to an array
        return Object.keys(grouped).map((key) => ({
            created_by_name: key,
            total_courses: grouped[key].total_courses,
            total_price: grouped[key].total_price,
        }));
    };

    if (loading) return <p className="text-center text-lg text-gray-500">Loading user data...</p>;
    if (error) return <p className="text-center text-lg text-red-500">{error}</p>;

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Admin/Non-Admin Course Purchase Details</h2>
                {userData.length === 0 ? (
                    <p className="text-center text-lg text-gray-600">No data found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    <th className="py-3 px-6 text-left">Admin/Non-Admin</th>
                                    <th className="py-3 px-6 text-left">Total Courses Purchased</th>
                                    <th className="py-3 px-6 text-left">Total Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userData.map((user, index) => {
                                    const totalPrice = !isNaN(user.total_price) ? user.total_price.toFixed(2) : "0.00"; // Check if total_price is a valid number
                                    return (
                                        <tr key={index} className="border-b hover:bg-gray-100">
                                            <td className="py-3 px-6 text-gray-900">{user.created_by_name}</td> {/* Admin/Non-Admin Name */}
                                            <td className="py-3 px-6 text-gray-900 text-center">{user.total_courses}</td> {/* Total Courses */}
                                            <td className="py-3 px-6 text-gray-900 font-semibold">₹{totalPrice}</td> {/* Total Price */}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPurchasedUsers;
