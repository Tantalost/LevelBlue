/** Topics must match `content_bank.skill` and `bkt_records.topic` */
export const BKT_TOPICS = [
  'Phishing',
  'Smishing',
  'Vishing',
  'Pretexting',
  'Baiting',
] as const;

export type BktTopic = (typeof BKT_TOPICS)[number];

export function isBktTopic(value: string): value is BktTopic {
  return (BKT_TOPICS as readonly string[]).includes(value);
}
