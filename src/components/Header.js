import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, LogOut, ShoppingCart, LayoutDashboard, BarChart3 } from "lucide-react";

const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await axios.get("http://localhost:5000/users/me", {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    setUser(response.data);
                    fetchProfileImage(response.data.id);
                } catch (error) {
                    console.error("Error fetching user:", error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        const fetchProfileImage = async (userId) => {
            try {
                const imageResponse = await axios.get(`http://localhost:5000/get-profile-image/${userId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });

                setProfileImage(imageResponse.data.profileImageUrl);
            } catch (error) {
                console.error("Error fetching profile image:", error);
                setProfileImage(null);
            }
        };

        fetchUser();

        window.addEventListener("storage", fetchUser);
        return () => window.removeEventListener("storage", fetchUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!user) return null; // Hide header if no user is logged in

    return (
        <header className="bg-gray-500 text-black shadow-md p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-black">MyApp</h1>

                <div className="flex items-center space-x-6">
                    {user.role === "user" && (
                        <>
                            <button
                                onClick={() => navigate("/member-dashboard")}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                <span>Dashboard</span>
                            </button>

                            <button
                                onClick={() => navigate("/buy-courses")}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span>Courses</span>
                            </button>

                            <button
                                onClick={() => navigate(`/my-courses/${user.id}`)}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                            >
                                <BarChart3 className="w-5 h-5" />
                                <span>Analytics</span>
                            </button>
                        </>
                    )}

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center space-x-2 focus:outline-none"
                        >
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full border-2 border-gray-300"
                                />
                            ) : (
                                <User className="w-10 h-10 p-2 bg-gray-300 rounded-full text-gray-700" />
                            )}
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 shadow-lg rounded-lg py-2">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
