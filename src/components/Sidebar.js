import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ShoppingCart,
  DollarSign,
  LogOut,
  BookOpen,
} from "lucide-react"; // Importing icons

const Sidebar = () => {
  const navigate = useNavigate();

  // Get the token from localStorage
  const token = localStorage.getItem("token");

  // Decode the JWT token if it exists
  let user = null;
  if (token) {
    try {
      user = JSON.parse(atob(token.split(".")[1])); // Decode the payload part of the JWT token
    } catch (error) {
      console.error("Error decoding token", error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token from localStorage
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-4 shadow-lg flex flex-col">
        {/* Sidebar Header */}
        <div className="text-3xl font-bold tracking-wide text-white mb-8 text-center">
        
        </div>

        {/* Sidebar Links */}
        <div className="space-y-6 flex-grow">
          {user ? (
            <>
              {/* Conditional rendering based on user role */}
              {(user.role === "admin" || user.role === "non-admin") && (
                <Link
                  to="/courses"
                  className="flex items-center space-x-3 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-300"
                >
                  <BookOpen size={20} />
                  <span>Courses</span>
                </Link>
              )}

              {user.role === "admin" && (
                <>
                  <button
                    onClick={() => navigate("/admin-dashboard")}
                    className="flex items-center space-x-3 w-full text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-300"
                  >
                    <LayoutDashboard size={20} />
                    <span>Admin Dashboard</span>
                  </button>

                  <button
                    onClick={() => navigate("/PurchasedCoursesPage")}
                    className="flex items-center space-x-3 w-full text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-300"
                  >
                    <ShoppingCart size={20} />
                    <span>Expiry Details</span>
                  </button>

                  <button
                    onClick={() => navigate("/courses/:courseId/purchasing")}
                    className="flex items-center space-x-3 w-full text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-300"
                  >
                    <Users size={20} />
                    <span> User Course Purchased</span>
                  </button>

                  <button
                    onClick={() => navigate("/AdminPurchasedUsers")}
                    className="flex items-center space-x-3 w-full text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-300"
                  >
                    <DollarSign size={20} />
                    <span>Total Revenue</span>
                  </button>
                </>
              )}

              {user.role === "non-admin" && (
                <>
                  <button
                    onClick={() => navigate("/courses/:courseId/purchasing")}
                    className="flex items-center space-x-3 w-full text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-300"
                  >
                    <Users size={20} />
                    <span>Purchased Users</span>
                  </button>

                  <button
                    onClick={() => navigate("/non-admin-dashboard")}
                    className="flex items-center space-x-3 w-full text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-300"
                  >
                    <LayoutDashboard size={20} />
                    <span>Non-Admin Dashboard</span>
                  </button>

                  <button
                    onClick={() => navigate("/PurchasedCoursesPage")}
                    className="flex items-center space-x-3 w-full text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-300"
                  >
                    <GraduationCap size={20} />
                    <span>Purchased Courses</span>
                  </button>
                </>
              )}

           
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center space-x-3 w-full text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300"
            >
              <LogOut size={20} />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-10 bg-gray-100">
        <div className="container mx-auto">
          {/* Main content goes here */}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
