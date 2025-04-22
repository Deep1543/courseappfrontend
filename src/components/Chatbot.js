import { useState, useEffect } from "react";
import axios from "axios"; // Import axios

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

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null); // Track selected question
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState(""); // For the manual question input

  useEffect(() => {
    // Automatically set the FAQ questions when the component is mounted
    setSelectedQuestion(null); // Reset selected question
  }, []);

  const sendMessage = async (message) => {
    const newMessages = [...messages, { sender: "user", text: message }];
    setMessages(newMessages);
    setLoading(true);

    // Get response for the selected question or the manually typed question
    const response = chatbotResponses[message.toLowerCase()] || "Sorry, I didn't understand that. Please try again.";
    setMessages([...newMessages, { sender: "bot", text: response }]);
    setLoading(false);

    // Store the conversation in MySQL
    try {
      await axios.post('http://localhost:5000/store-conversation', {
        userQuestion: message,
        chatbotReply: response,
      });
    } catch (error) {
      console.error('Error storing conversation:', error);
    }
  };

  const handleQuestionClick = (question) => {
    if (selectedQuestion === question) {
      setSelectedQuestion(null); // If the question is already clicked, toggle its visibility
    } else {
      setSelectedQuestion(question); // Otherwise, show the selected question's response
    }
  };

  const handleUserInputChange = (e) => {
    setUserInput(e.target.value); // Update user input as they type
  };

  const handleSendClick = () => {
    if (userInput.trim()) {
      sendMessage(userInput.trim()); // Send message when button is clicked
      setUserInput(""); // Reset input field
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Course App Support</h2>

      {/* Chat messages */}
      <div className="h-64 overflow-y-auto p-2 border rounded-lg bg-white mb-4">
        <h3 className="text-lg font-semibold mb-2">How may I help you?</h3>

        {/* FAQ questions list */}
        <ul className="space-y-2">
          {Object.keys(chatbotResponses).map((q, index) => (
            <li key={index} className="space-y-2">
              <div
                onClick={() => handleQuestionClick(q)} // When clicked, show or hide the selected question's response
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
            className={`p-2 my-1 rounded-md ${msg.sender === "user" ? "bg-blue-200 text-right" : "bg-gray-300 text-left"}`}
          >
            {msg.text}
          </div>
        ))}

        {loading && <div className="text-gray-500">Thinking...</div>}
      </div>

      {/* User input section */}
      <div className="mt-2 flex">
        <input
          type="text"
          value={userInput}
          onChange={handleUserInputChange}
          className="flex-grow p-2 border rounded-l-lg bg-gray-200"
          placeholder="Type your question..."
        />
        <button
          onClick={handleSendClick}
          className="bg-blue-500 text-white p-2 rounded-r-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
