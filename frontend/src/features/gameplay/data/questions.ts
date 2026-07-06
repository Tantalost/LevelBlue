import type { BktTopic } from '../constants/bktTopics';
import type { AssessmentQuestion } from '../types';

export const MODULE_1_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    topic: 'Pretexting',
    type: 'true_false',
    text: 'Social engineering relies heavily on human interaction.',
    answer: true,
  },
  {
    id: 2,
    topic: 'Phishing',
    type: 'multiple_choice',
    text: 'Which of the following is the STRONGEST password?',
    options: ['password123', 'MyBirthday1990', 'Tr!8#kL@mp99', 'abc123'],
    answer: 2,
  },
  {
    id: 3,
    topic: 'Phishing',
    type: 'spot_error',
    stem: 'Spot the INCORRECT statement about phishing:',
    items: [
      'Phishing emails often create a sense of urgency.',
      'Hovering over links reveals their true destination.',
      'Phishing only occurs via email.',
      'Poor grammar can be a sign of phishing.',
    ],
    answer: 2,
  },
  {
    id: 4,
    topic: 'Phishing',
    type: 'true_false',
    text: 'Two-factor authentication (2FA) adds an extra layer of security.',
    answer: true,
  },
  {
    id: 5,
    topic: 'Phishing',
    type: 'multiple_choice',
    text: 'What does MFA stand for?',
    options: [
      'Managed Firewall Access',
      'Multi-Factor Authentication',
      'Malware Filter Algorithm',
      'Multiple File Archive',
    ],
    answer: 1,
  },
  {
    id: 6,
    topic: 'Pretexting',
    type: 'spot_error',
    stem: 'Spot the INCORRECT statement about passwords:',
    items: [
      'Use a unique password for each account.',
      'Longer passwords are generally stronger.',
      'Writing passwords in a notebook is always safe.',
      'A password manager helps store credentials securely.',
    ],
    answer: 2,
  },
  {
    id: 7,
    topic: 'Baiting',
    type: 'true_false',
    text: 'Malware can be hidden in seemingly harmless file downloads.',
    answer: true,
  },
  {
    id: 8,
    topic: 'Baiting',
    type: 'multiple_choice',
    text: 'Which action BEST protects against ransomware?',
    options: [
      'Open all email attachments to check them',
      'Keep regular offline backups of your data',
      'Disable your firewall for faster speeds',
      'Use the same password everywhere',
    ],
    answer: 1,
  },
  {
    id: 9,
    topic: 'Phishing',
    type: 'spot_error',
    stem: 'Spot the INCORRECT statement about software updates:',
    items: [
      'Updates often patch known security vulnerabilities.',
      'Delaying updates keeps your system more stable.',
      'Automatic updates reduce the risk of missing patches.',
      'Outdated software is a common attack entry point.',
    ],
    answer: 1,
  },
  {
    id: 10,
    topic: 'Phishing',
    type: 'true_false',
    text: 'Using the same password across multiple sites is a best practice.',
    answer: false,
  },
];

export function getQuestionsForStage(_stage: number): AssessmentQuestion[] {
  return MODULE_1_QUESTIONS;
}

export type { BktTopic };
