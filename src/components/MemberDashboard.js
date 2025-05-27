import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiMessageCircle, FiX } from 'react-icons/fi';

// Predefined FAQ responses
const chatbotResponses = {
  'hi': 'Hello! How can I assist you today?',
  'help': 'Sure! Please ask your query.',
  'what courses are available': 'We offer a variety of online courses including Web Development, Data Science, and AI/ML. You can view all courses on our website.',
  'how can i enroll in a course': 'To enroll in a course, please visit the course details page and click on the "Enroll Now" button.',
  'what is the cost of the courses': 'The cost of courses varies. Please check the course details for specific pricing information.',
  'what is the duration of the courses': 'Course durations vary from a few weeks to several months. You can find the duration in the course details.',
  'how do i contact support': 'You can contact us at support@scriptindia.in for any questions or issues.',
  'is there any certificate provided': 'Yes, we provide a certificate upon successful completion of the course.',
  'can i pay in installments': 'Yes, we offer flexible payment options, including installments. Please visit our payment page for more details.',
  'what is the refund policy': 'We offer a 30-day money-back guarantee. If you are not satisfied with the course, you can request a refund within 30 days of purchase.',
  'courses available for beginners': 'We have several beginner-friendly courses in Web Development and Data Science. Check our course catalog for more details.',
};

const MemberDashboard = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [profileImage, setProfileImage] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserDetails(response.data);
        const savedImage = localStorage.getItem(`userProfileImage_${response.data.id}`);
        if (savedImage) {
          setProfileImage(savedImage);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!image) {
      alert('Please select an image to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('image', image);

    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:5000/upload-profile-image',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const imageUrl = response.data.profileImageUrl;
      localStorage.setItem(`userProfileImage_${userDetails?.id}`, imageUrl);
      setProfileImage(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 relative">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">Member Dashboard</h1>
        <h2 className="text-xl text-center mt-2">Welcome, {userDetails?.name}</h2>

        <div className="flex flex-col items-center mt-6">
          {profileImage ? (
            <img src={decodeURIComponent(profileImage)} alt="Profile" className="w-32 h-32 rounded-full border-4 border-white object-cover" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-xl">
              ❌ No Image
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center">
          <input type="file" accept="image/*" onChange={handleImageChange} className="border p-2 rounded" />
          <button
            onClick={handleImageUpload}
            className="bg-blue-500 text-white py-2 px-4 rounded mt-3"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>

       {/* Floating Chat Button */}
{!isChatOpen && (
  <button
    className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all"
    onClick={() => setIsChatOpen(true)}
    title="Need Help?"
    style={{
      marginLeft: '1100px',
      marginBottom: '100px',
    }}
  >
    <FiMessageCircle className="text-2xl" />
  </button>
)}


        {/* Chatbot Window */}
        {isChatOpen && <Chatbot onClose={() => setIsChatOpen(false)} />}
      </div>
    </div>
  );
};

// Chatbot Component
const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const handleClick = (question) => {
    setSelectedQuestion((prev) => (prev === question ? null : question));
  };

  const handleSendMessages = async () => {
  if (input.trim() === '') return;

  const lowerCaseMessage = input.toLowerCase();
  const response = chatbotResponses[lowerCaseMessage] || 'Sorry, I did not understand your question. Please contact support@scriptindia.in for help.';

  const newMessages = [
    ...messages,
    { text: input, sender: 'user' },
    { text: response, sender: 'bot' }
  ];
  setMessages(newMessages);
  setInput('');

  try {
    await axios.post('http://localhost:5000/store-conversation', {
      userQuestion: input,
      chatbotReply: response,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  } catch (error) {
    console.error('Error storing chatbot conversation:', error);
  }
};

  return (
    <div className="fixed bottom-16 right-6 w-80 bg-white shadow-lg rounded-lg p-4 border border-gray-300 z-50">
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-lg font-semibold">Chatbot</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          <FiX className="text-xl" />
        </button>
      </div>

      <div className="h-64 overflow-y-auto p-2 mt-2 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">How may I help you?</h3>
         <ul className="space-y-2">
          {Object.keys(chatbotResponses).map((q, index) => (
            <li key={index} className="space-y-2">
              <div
                onClick={() => handleClick(q)} // When clicked, show or hide the selected question's response
                className="cursor-pointer text-blue-600 hover:underline"
              >
                {q}
              </div>
              {/* Show the selected question's response */}
              {selectedQuestion === q && (
                <div className="p-2 my-1 rounded-md bg-gray-300">
                  <p><strong>{q}:</strong> {chatbotResponses[q]}</p>
                </div>
              )}
            </li>
          ))}
        </ul>

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 m-1 rounded-md ${msg.sender === 'user' ? 'bg-blue-200 text-right' : 'bg-gray-300 text-left'}`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <div className="text-gray-500">Thinking...</div>}
      </div>

      <div className="mt-2 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-2 border rounded-l-lg"
          placeholder="Ask me anything..."
        />
        <button onClick={handleSendMessages} className="bg-blue-500 text-white p-2 rounded-r-lg">
          Send
        </button>
      </div>
    </div>
  );
};

export default MemberDashboard;
