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
      if (typeof window.showMainContent === 'function') {
        window.showMainContent();
      } else {
        console.error('showMainContent function not found');
      }
    } catch (error) {
      console.error('Error transitioning to main chat:', error);
    }
  };

  // ... (rest of the component remains unchanged)
}

ReactDOM.render(<WelcomePage />, document.getElementById('welcomePage'));
