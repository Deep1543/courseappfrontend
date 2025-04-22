import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

const PurchasedUsers = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredCourses, setFilteredCourses] = useState([]);

    useEffect(() => {
        fetchPurchasedCourses();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredCourses(courses); // Show all courses when search is empty
            return;
        }

        const regex = new RegExp(`\\b${searchQuery.toLowerCase()}\\b`, "i"); // Case-insensitive partial match
        const filtered = courses.filter(course =>
            regex.test(course.title.toLowerCase()) ||
            regex.test(course.user_name.toLowerCase()) ||
            regex.test(course.user_email.toLowerCase())
        );

        setFilteredCourses(filtered);
    }, [searchQuery, courses]);

    const fetchPurchasedCourses = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/courses/purchased", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const courseData = response.data;
            setCourses(courseData);
            setFilteredCourses(courseData);
            setLoading(false);

            // Calculate total price
            const calculatedTotalPrice = courseData.reduce((acc, course) => {
                const coursePrice = parseFloat(course.price);
                return !isNaN(coursePrice) ? acc + coursePrice : acc;
            }, 0);

            setTotalPrice(calculatedTotalPrice);
        } catch (err) {
            setError("Failed to load courses.");
            setLoading(false);
        }
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const clearSearch = () => {
        setSearchQuery("");
    };

    const formattedTotalPrice = !isNaN(totalPrice) ? totalPrice.toFixed(2) : "0.00";

    if (loading) return <p className="text-center text-xl">Loading courses...</p>;
    if (error) return <p className="text-red-500 text-center text-xl">{error}</p>;

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-3xl font-semibold mb-6 text-center text-blue-600">Purchased Courses</h2>

            {/* Search Bar with Clear Button */}
            <div className="mb-6 flex">
                  <FaSearch className="text-gray-500 mr-3" />
                              <input
                                  type="text"
                                  placeholder="Search for a course..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="bg-transparent outline-none w-full"
                              />
                {searchQuery && (
                    <button
                        onClick={clearSearch}
                        className="px-4 bg-red-500 text-white rounded-r-lg"
                    >
                        ✖
                    </button>
                )}
            </div>

            {/* Display total courses and price */}
            <div className="mb-6 text-center">
                <p className="text-lg text-gray-700">Total Courses Purchased: {filteredCourses.length}</p>
                <p className="text-lg text-gray-700">Total Price: ₹{formattedTotalPrice}</p>
            </div>

            {filteredCourses.length === 0 ? (
                <p className="text-center text-gray-500">No courses found.</p>
            ) : (
                <div className="overflow-x-auto shadow-xl rounded-lg">
                    <table className="min-w-full bg-white border-collapse border border-gray-200">
                        <thead className="bg-blue-600">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-white">Course Title</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-white">Price</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-white">Purchased By</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-white">Purchased On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map((course) => (
                                <tr key={course.id} className="border-b hover:bg-gray-100">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{course.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">₹{course.price}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{course.user_name} ({course.user_email})</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">
                                        {new Date(course.purchase_date).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PurchasedUsers;
