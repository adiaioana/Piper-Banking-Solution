interface FeatureSection {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

interface HomeContent {
  welcome: {
    title: string;
    subtitle: string;
    description: string;
  };
  features: FeatureSection[];
  callToAction: {
    slogan: string;
    buttonText: string;
  };
}

export const homeContent: HomeContent = {
  welcome: {
    title: "Welcome to Piper Digital Banking",
    subtitle: "Your secure and modern banking solution - where innovation meets financial security",
    description: "Experience banking reimagined for the digital age"
  },
  features: [
    {
      title: "Secure Transactions",
      description: "Bank with confidence using our state-of-the-art security systems. Our advanced encryption and multi-factor authentication ensure your finances are protected 24/7.",
      imageUrl: "https://placehold.co/400x400",
      imageAlt: "Secure Banking"
    },
    {
      title: "Mobile Banking",
      description: "Access your accounts anytime, anywhere with our mobile app. Whether you're at home or traveling, manage your finances with ease.",
      imageUrl: "https://placehold.co/400x400",
      imageAlt: "Mobile Banking"
    },
    {
      title: "24/7 Support",
      description: "Get help whenever you need it with our round-the-clock customer service. Our dedicated team of financial experts is always ready to assist you.",
      imageUrl: "https://placehold.co/400x400",
      imageAlt: "24/7 Support"
    }
  ],
  callToAction: {
    slogan: "Ready to experience the future of banking?",
    buttonText: "Join Piper Today - Your Money, Your Control"
  }
}; 