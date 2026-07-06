import type { BktTopic } from '../constants/bktTopics';

export type StageBriefing = {
  threatTitle: string;
  threatDescription: string;
  primaryTopic: BktTopic;
  objectives: string[];
};

export const STAGE_BRIEFINGS: Record<number, StageBriefing> = {
  1: {
    threatTitle: 'Phishing Swarm',
    threatDescription:
      'Intel reports a coordinated phishing campaign targeting civilian infrastructure. ' +
      'Attackers are impersonating utility providers to harvest credentials before a larger breach.',
    primaryTopic: 'Phishing',
    objectives: [
      'Complete threat assessment on social engineering vectors',
      'Deploy defensive towers along the breach path',
      'Survive all 5 malware waves without losing the base',
    ],
  },
  2: {
    threatTitle: 'Pretexting Probe',
    threatDescription:
      'Hostile actors are running pretexting scripts against help-desk channels. ' +
      'Validate caller identity protocols before they pivot into your sector grid.',
    primaryTopic: 'Pretexting',
    objectives: [
      'Identify manipulation tactics in assessment scenarios',
      'Fortify chokepoints with upgraded tower coverage',
      'Contain the probe before base integrity fails',
    ],
  },
  3: {
    threatTitle: 'Baiting Payload',
    threatDescription:
      'USB-drop and malicious download lures are spreading through the district. ' +
      'Analysts need to spot unsafe payloads before they execute on endpoint clusters.',
    primaryTopic: 'Baiting',
    objectives: [
      'Score high on baiting and malware recognition items',
      'Spend deployment gold efficiently on tower placement',
      'Eliminate every hostile payload in the wave cycle',
    ],
  },
  4: {
    threatTitle: 'Smishing Relay',
    threatDescription:
      'SMS phishing relays are spoofing two-factor prompts at scale. ' +
      'Intercept fraudulent messages before operators leak one-time codes.',
    primaryTopic: 'Smishing',
    objectives: [
      'Prove mastery on mobile social-engineering scenarios',
      'Hold the line through escalating wave pressure',
      'Keep base health above zero through the final wave',
    ],
  },
  5: {
    threatTitle: 'Sector Final Exam',
    threatDescription:
      'A mixed-domain assault combines phishing, baiting, and vishing vectors. ' +
      'This is the module capstone — your BKT mastery directly fuels combat readiness.',
    primaryTopic: 'Phishing',
    objectives: [
      'Demonstrate module mastery across all threat domains',
      'Maximize BKT probability of learning before deployment',
      'Clear the sector to unlock post-module rewards',
    ],
  },
};

export function getStageBriefing(stage: number): StageBriefing {
  return STAGE_BRIEFINGS[stage] ?? STAGE_BRIEFINGS[1];
}
