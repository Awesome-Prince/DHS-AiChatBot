const { motion } = window.Motion;

function WelcomePage() {
  const [loading, setLoading] = React.useState(true);
  const [showWelcome, setShowWelcome] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setShowWelcome(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleStartChatting = () => {
    try {
      const welcomePage = document.getElementById('welcomePage');
      const mainContent = document.getElementById('mainContent');
      
      if (welcomePage && mainContent) {
        welcomePage.style.display = 'none';
        mainContent.classList.remove('hidden');
        mainContent.style.display = 'flex';
        mainContent.style.flexDirection = 'column';
        
        // Trigger any necessary initialization for the main chat
        if (typeof initializeChat === 'function') {
          initializeChat();
        }
      } else {
        console.error('Welcome page or main content elements not found');
      }
    } catch (error) {
      console.error('Error transitioning to main chat:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white text-blue-900">
      {loading ? (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-blue-50"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <motion.div
            className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      ) : (
        <motion.div
          className="container mx-auto px-4 py-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-5xl font-bold mb-8 text-blue-700"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Welcome to AI Chat
          </motion.h1>
          <motion.p
            className="text-xl mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Your intelligent companion for learning and discovery
          </motion.p>
          <motion.div
            className="flex justify-center space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartChatting}
              id="startChattingBtn"
            >
              Start Chatting
            </motion.button>
            <motion.button
              className="bg-white hover:bg-blue-100 text-blue-500 font-bold py-3 px-6 rounded-full border-2 border-blue-500 transition-all duration-300 transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </motion.div>
          <motion.div
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {[
              { icon: "🧠", title: "Intelligent Responses", description: "Get smart, contextual answers to your questions" },
              { icon: "🌟", title: "Personalized Learning", description: "Tailored to your unique educational needs" },
              { icon: "🚀", title: "Always Improving", description: "Constantly updated with the latest information" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

ReactDOM.render(<WelcomePage />, document.getElementById('welcomePage'));
