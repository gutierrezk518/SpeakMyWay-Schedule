export interface QuickPhrase {
  id: string;
  text: string;
  icon: string;
}

export interface PhraseCategory {
  id: string;
  name: string;
  iconColor: string;
  phrases: QuickPhrase[];
}

export const quickPhrases: PhraseCategory[] = [
  {
    id: "common",
    name: "Common Phrases",
    iconColor: "blue-500",
    phrases: [
      {
        id: "feeling-good",
        text: "I'm feeling good today",
        icon: "ri-emotion-happy-line"
      },
      {
        id: "not-feeling-well",
        text: "I'm not feeling well",
        icon: "ri-emotion-unhappy-line"
      },
      {
        id: "hungry",
        text: "I'm hungry",
        icon: "ri-restaurant-line"
      },
      {
        id: "thirsty",
        text: "I'm thirsty",
        icon: "ri-cup-line"
      },
      {
        id: "tired",
        text: "I'm tired",
        icon: "ri-rest-time-line"
      },
      {
        id: "bathroom",
        text: "I need to use the bathroom",
        icon: "ri-toilet-paper-line"
      }
    ]
  },
  {
    id: "help",
    name: "Help Phrases",
    iconColor: "purple-500",
    phrases: [
      {
        id: "need-help",
        text: "I need help",
        icon: "ri-question-line"
      },
      {
        id: "dont-understand",
        text: "I don't understand",
        icon: "ri-question-answer-line"
      },
      {
        id: "repeat",
        text: "Please repeat that",
        icon: "ri-repeat-line"
      },
      {
        id: "more-time",
        text: "I need more time",
        icon: "ri-time-line"
      },
      {
        id: "too-loud",
        text: "It's too loud in here",
        icon: "ri-volume-up-line"
      },
      {
        id: "too-bright",
        text: "The lights are too bright",
        icon: "ri-sun-line"
      }
    ]
  },
  {
    id: "social",
    name: "Social Phrases",
    iconColor: "green-500",
    phrases: [
      {
        id: "hello",
        text: "Hello, how are you?",
        icon: "ri-user-smile-line"
      },
      {
        id: "thank-you",
        text: "Thank you",
        icon: "ri-hand-heart-line"
      },
      {
        id: "please",
        text: "Please",
        icon: "ri-feedback-line"
      },
      {
        id: "goodbye",
        text: "Goodbye",
        icon: "ri-door-open-line"
      },
      {
        id: "sorry",
        text: "I'm sorry",
        icon: "ri-emotion-sad-line"
      },
      {
        id: "nice-meet-you",
        text: "Nice to meet you",
        icon: "ri-user-smile-line"
      }
    ]
  },
  {
    id: "school",
    name: "School Phrases",
    iconColor: "yellow-500",
    phrases: [
      {
        id: "finished-work",
        text: "I finished my work",
        icon: "ri-checkbox-circle-line"
      },
      {
        id: "need-help-assignment",
        text: "I need help with this assignment",
        icon: "ri-question-line"
      },
      {
        id: "need-break",
        text: "I need a break",
        icon: "ri-rest-time-line"
      },
      {
        id: "where-is",
        text: "Where is my teacher?",
        icon: "ri-map-pin-line"
      },
      {
        id: "when-lunch",
        text: "When is lunch?",
        icon: "ri-time-line"
      },
      {
        id: "play-with-me",
        text: "Will you play with me?",
        icon: "ri-game-line"
      }
    ]
  }
];
