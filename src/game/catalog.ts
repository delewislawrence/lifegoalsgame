import type { ContractDefinition, GoalDefinition, SequenceId, SkillPathId } from './types'

export const BONUS_XP = 40
export const MAJOR_XP = 500

export const SEQUENCES: {
  id: SequenceId
  index: string
  name: string
  purpose: string
  startDay: number
}[] = [
  { id: 'awakening', index: '01', name: 'The Awakening', purpose: 'Build the foundation.', startDay: 0 },
  { id: 'apprentice', index: '02', name: 'The Apprentice', purpose: 'Turn learning into capability.', startDay: 90 },
  { id: 'assassin', index: '03', name: 'The Assassin', purpose: 'Turn capability into independence.', startDay: 180 },
  { id: 'master', index: '04', name: 'The Master', purpose: 'Finish what was started.', startDay: 270 },
]

export const SKILL_PATHS: {
  id: SkillPathId
  name: string
  description: string
}[] = [
  { id: 'combat', name: 'Combat / Physical', description: 'Train the body until it keeps its promises.' },
  { id: 'stealth', name: 'Stealth / Intellect', description: 'Learn in quiet and ship what you learn.' },
  { id: 'eagle', name: 'Eagle Vision', description: 'See the week, the month, and the pattern under them.' },
  { id: 'economic', name: 'Economic Assassin', description: 'Build income, assets, and a system that compounds.' },
  { id: 'creator', name: 'Creator', description: 'Finish songs, pages, images, and films.' },
  { id: 'brotherhood', name: 'Brotherhood', description: 'Stay connected to family and friends on purpose.' },
  { id: 'intimacy', name: 'Intimacy', description: 'Practice honesty, confidence, and closeness.' },
  { id: 'inner-temple', name: 'Inner Temple', description: 'Reflect, serve, and keep your rituals intentional.' },
  { id: 'artisan', name: 'Artisan', description: 'Cook, maintain, groom, and keep a working life.' },
  { id: 'hidden-bureau', name: 'Hidden Bureau', description: 'Run the operating system behind the year.' },
  { id: 'explorer', name: 'Explorer', description: 'Leave the familiar and come back changed.' },
  { id: 'play', name: 'Play', description: 'Collect new experiences before the year closes.' },
  { id: 'character', name: 'Character', description: 'The sum of every other path. This is who the year is making.' },
]

export const CONTRACTS: ContractDefinition[] = [
  {
    id: 'body',
    xp: 20,
    skillPathId: 'combat',
    linkedGoalId: 'training-days',
    defaultTitle: 'Body',
    defaultDescription: '30 minutes physical training',
  },
  {
    id: 'mind',
    xp: 30,
    skillPathId: 'stealth',
    linkedGoalId: 'deep-work-days',
    defaultTitle: 'Mind',
    defaultDescription: '60 minutes focused coding or deep work',
  },
  {
    id: 'inner-temple',
    xp: 10,
    skillPathId: 'inner-temple',
    linkedGoalId: 'reflection-days',
    defaultTitle: 'Inner Temple',
    defaultDescription: '10 minutes reflection or journaling',
  },
]

export const GOALS: GoalDefinition[] = [
  { id: 'establish-pos', title: 'Establish Personal Operating System', description: 'Stand up the system you will actually run this year.', category: 'Admin', type: 'checkbox', target: 1, unit: 'system', xpReward: 250, skillPathId: 'hidden-bureau', sequenceId: 'awakening' },
  { id: 'begin-coding', title: 'Begin coding practice', description: 'Start the daily practice that leads to the course.', category: 'Education', type: 'checkbox', target: 1, unit: 'start', xpReward: 150, skillPathId: 'stealth', sequenceId: 'awakening' },
  { id: 'begin-martial-arts', title: 'Begin martial arts', description: 'Step on the mat and make it a practice.', category: 'Body', type: 'checkbox', target: 1, unit: 'start', xpReward: 150, skillPathId: 'combat', sequenceId: 'awakening' },
  { id: 'begin-investing', title: 'Begin investing', description: 'Place the first intentional investment.', category: 'Investing', type: 'checkbox', target: 1, unit: 'start', xpReward: 150, skillPathId: 'economic', sequenceId: 'awakening' },
  { id: 'financial-tracking', title: 'Build financial tracking system', description: 'Know what comes in, what goes out, and what remains.', category: 'Finance', type: 'checkbox', target: 1, unit: 'system', xpReward: 200, skillPathId: 'economic', sequenceId: 'awakening' },
  { id: 'establish-recovery', title: 'Establish recovery routine', description: 'Decide how you sleep, rest, and come back.', category: 'Body', type: 'checkbox', target: 1, unit: 'routine', xpReward: 150, skillPathId: 'combat', sequenceId: 'awakening' },
  { id: 'begin-reflection', title: 'Begin reflection practice', description: 'Open the inner temple and keep the appointment.', category: 'Soul', type: 'checkbox', target: 1, unit: 'start', xpReward: 150, skillPathId: 'inner-temple', sequenceId: 'awakening' },
  { id: 'creative-routine', title: 'Establish creative routine', description: 'Give the work a repeating hour.', category: 'Create', type: 'checkbox', target: 1, unit: 'routine', xpReward: 150, skillPathId: 'creator', sequenceId: 'awakening' },
  { id: 'asset-allocation', title: 'Build asset allocation plan', description: 'Write where money is allowed to go.', category: 'Investing', type: 'checkbox', target: 1, unit: 'plan', xpReward: 200, skillPathId: 'economic', sequenceId: 'awakening' },
  { id: 'resume', title: 'Build professional résumé', description: 'Make the record of your work clear and current.', category: 'Business', type: 'checkbox', target: 1, unit: 'document', xpReward: 150, skillPathId: 'hidden-bureau', sequenceId: 'awakening' },
  { id: 'file-organization', title: 'Organize files', description: 'Put the archive where you can find it again.', category: 'Admin', type: 'checkbox', target: 1, unit: 'system', xpReward: 150, skillPathId: 'hidden-bureau', sequenceId: 'awakening' },
  { id: 'backups', title: 'Establish backups', description: 'Keep a second copy of what you cannot lose.', category: 'Admin', type: 'checkbox', target: 1, unit: 'system', xpReward: 150, skillPathId: 'hidden-bureau', sequenceId: 'awakening' },
  { id: 'career-tracking', title: 'Establish career tracking', description: 'Record applications, projects, and next moves.', category: 'Admin', type: 'checkbox', target: 1, unit: 'system', xpReward: 150, skillPathId: 'hidden-bureau', sequenceId: 'awakening' },
  { id: 'cannabis-practice', title: 'Develop intentional cannabis use', description: 'Choose the practice instead of drifting into it.', category: 'Soul', type: 'checkbox', target: 1, unit: 'practice', xpReward: 150, skillPathId: 'inner-temple', sequenceId: 'awakening' },

  { id: 'coding-course', title: 'Complete coding course', description: 'Finish the course that makes you dangerous with software.', category: 'Education', type: 'checkbox', target: 1, unit: 'course', xpReward: 400, skillPathId: 'stealth', sequenceId: 'apprentice' },
  { id: 'portfolio-projects', title: 'Build 3 portfolio projects', description: 'Three finished pieces you can show.', category: 'Education', type: 'counter', target: 3, unit: 'projects', xpReward: 450, skillPathId: 'stealth', sequenceId: 'apprentice' },
  { id: 'engineering-projects', title: 'Build 3 engineering projects', description: 'Three builds that teach you how things work.', category: 'Education', type: 'counter', target: 3, unit: 'projects', xpReward: 450, skillPathId: 'stealth', sequenceId: 'apprentice' },
  { id: 'portfolio-website', title: 'Build portfolio website', description: 'A home for the work, with your name on it.', category: 'Business', type: 'checkbox', target: 1, unit: 'site', xpReward: 250, skillPathId: 'stealth', sequenceId: 'apprentice' },
  { id: 'finance-books', title: 'Read 12 finance books', description: 'One book a month on money and investing.', category: 'Education', type: 'counter', target: 12, unit: 'books', xpReward: 360, skillPathId: 'economic', sequenceId: 'apprentice' },
  { id: 'poker-hands', title: 'Review 500 poker hands', description: 'Study the spots until the pattern shows.', category: 'Education', type: 'counter', target: 500, unit: 'hands', xpReward: 500, skillPathId: 'stealth', sequenceId: 'apprentice' },
  { id: 'freelance', title: 'Pursue freelance work', description: 'Make the offer and send it.', category: 'Business', type: 'checkbox', target: 1, unit: 'pursuit', xpReward: 200, skillPathId: 'economic', sequenceId: 'apprentice' },
  { id: 'friendships', title: 'Strengthen 5 friendships', description: 'Invest in the people you want still here.', category: 'Relationships', type: 'counter', target: 5, unit: 'friendships', xpReward: 300, skillPathId: 'brotherhood', sequenceId: 'apprentice' },
  { id: 'dating-skills', title: 'Develop dating skills', description: 'Practice meeting people with a clear intention.', category: 'Relationships', type: 'checkbox', target: 1, unit: 'practice', xpReward: 200, skillPathId: 'intimacy', sequenceId: 'apprentice' },
  { id: 'communication', title: 'Improve communication', description: 'Say the true thing sooner and cleaner.', category: 'Intimacy', type: 'checkbox', target: 1, unit: 'practice', xpReward: 200, skillPathId: 'intimacy', sequenceId: 'apprentice' },
  { id: 'confidence', title: 'Improve confidence', description: 'Act before the feeling arrives.', category: 'Intimacy', type: 'checkbox', target: 1, unit: 'practice', xpReward: 200, skillPathId: 'intimacy', sequenceId: 'apprentice' },

  { id: 'deploy-projects', title: 'Deploy 3 software projects', description: 'Put three real things on the internet.', category: 'Education', type: 'counter', target: 3, unit: 'deploys', xpReward: 600, skillPathId: 'stealth', sequenceId: 'assassin' },
  { id: 'income-tiers', title: 'Progress through 4 income tiers', description: 'Move the number that pays for the life.', category: 'Finance', type: 'counter', target: 4, unit: 'tiers', xpReward: 400, skillPathId: 'economic', sequenceId: 'assassin' },
  { id: 'income-increase', title: 'Increase income', description: 'Record a real rise in what you earn.', category: 'Finance', type: 'checkbox', target: 1, unit: 'milestone', xpReward: 400, skillPathId: 'economic', sequenceId: 'assassin' },
  { id: 'paying-client', title: 'Acquire first paying client', description: 'Someone pays you for the work.', category: 'Business', type: 'checkbox', target: 1, unit: 'client', xpReward: 500, skillPathId: 'economic', sequenceId: 'assassin' },
  { id: 'launch-business', title: 'Launch an income-producing business', description: 'Open something that can pay you back.', category: 'Business', type: 'checkbox', target: 1, unit: 'business', xpReward: 800, skillPathId: 'economic', sequenceId: 'assassin' },
  { id: 'beat-tape', title: 'Release beat tape', description: 'Finish the tape and let it leave your machine.', category: 'Create', type: 'checkbox', target: 1, unit: 'release', xpReward: 500, skillPathId: 'creator', sequenceId: 'assassin', headline: true },
  { id: 'live-performance', title: 'Perform live once', description: 'Play for people who are in the room.', category: 'Create', type: 'checkbox', target: 1, unit: 'performance', xpReward: 300, skillPathId: 'creator', sequenceId: 'assassin' },
  { id: 'photo-portfolio', title: 'Create a 100-photo portfolio', description: 'A hundred frames you would show.', category: 'Create', type: 'collection', target: 100, unit: 'photos', xpReward: 400, skillPathId: 'creator', sequenceId: 'assassin' },
  { id: 'social-connections', title: 'Build 12 meaningful connections', description: 'One real connection each month.', category: 'Relationships', type: 'counter', target: 12, unit: 'connections', xpReward: 360, skillPathId: 'brotherhood', sequenceId: 'assassin' },
  { id: 'emotional-intelligence', title: 'Develop emotional intelligence', description: 'Name what you feel before you act on it.', category: 'Intimacy', type: 'checkbox', target: 1, unit: 'practice', xpReward: 250, skillPathId: 'intimacy', sequenceId: 'assassin' },
  { id: 'conditioning', title: 'Improve physical conditioning', description: 'A measured step past where the year started.', category: 'Body', type: 'checkbox', target: 1, unit: 'milestone', xpReward: 300, skillPathId: 'combat', sequenceId: 'assassin' },

  { id: 'martial-arts', title: 'Complete 200 martial arts sessions', description: 'Return to the mat until two hundred are done.', category: 'Body', type: 'counter', target: 200, unit: 'sessions', xpReward: 1000, skillPathId: 'combat', sequenceId: 'master', headline: true },
  { id: 'training-days', title: 'Log 200 training days', description: 'The Body contract writes one day here.', category: 'Body', type: 'time', target: 200, unit: 'days', xpReward: 600, skillPathId: 'combat', sequenceId: 'master' },
  { id: 'sleep-nights', title: 'Sleep 7+ hours for 200 nights', description: 'Mark a night when you actually got the hours.', category: 'Body', type: 'time', target: 200, unit: 'nights', xpReward: 600, skillPathId: 'combat', sequenceId: 'master' },
  { id: 'recovery-sessions', title: 'Complete 100 recovery sessions', description: 'Mobility, rest, and the work between the work.', category: 'Body', type: 'counter', target: 100, unit: 'sessions', xpReward: 400, skillPathId: 'combat', sequenceId: 'master' },
  { id: 'fi-foundation', title: 'Build a financial independence foundation', description: 'The first year of a plan you can keep running.', category: 'Finance', type: 'checkbox', target: 1, unit: 'foundation', xpReward: 800, skillPathId: 'economic', sequenceId: 'master' },
  { id: 'invest-months', title: 'Invest for 12 months', description: 'One contribution every month of the campaign.', category: 'Investing', type: 'streak', target: 12, unit: 'months', xpReward: 600, skillPathId: 'economic', sequenceId: 'master', headline: true },
  { id: 'thesis-reviews', title: 'Review investment thesis 12 times', description: 'Keep the watchlist and the reasons current.', category: 'Investing', type: 'streak', target: 12, unit: 'reviews', xpReward: 360, skillPathId: 'economic', sequenceId: 'master' },
  { id: 'asset-income', title: 'Build toward asset income', description: 'Move something you own closer to paying you.', category: 'Business', type: 'checkbox', target: 1, unit: 'milestone', xpReward: 400, skillPathId: 'economic', sequenceId: 'master' },
  { id: 'dj-mixes', title: 'Record 12 DJ mixes', description: 'Twelve mixes finished and kept.', category: 'Create', type: 'counter', target: 12, unit: 'mixes', xpReward: 480, skillPathId: 'creator', sequenceId: 'master' },
  { id: 'novel', title: 'Finish the novel', description: 'Reach the last page and stop rewriting the first.', category: 'Create', type: 'checkbox', target: 1, unit: 'manuscript', xpReward: 800, skillPathId: 'creator', sequenceId: 'master' },
  { id: 'short-film', title: 'Release a short film', description: 'Finish the film and put it where people can see it.', category: 'Create', type: 'checkbox', target: 1, unit: 'film', xpReward: 700, skillPathId: 'creator', sequenceId: 'master' },
  { id: 'family-weeks', title: 'Connect with family for 52 weeks', description: 'A weekly line back to your people.', category: 'Relationships', type: 'streak', target: 52, unit: 'weeks', xpReward: 520, skillPathId: 'brotherhood', sequenceId: 'master', headline: true },
  { id: 'intimate-relationship', title: 'Build a healthy intimate relationship', description: 'Closeness that stays honest.', category: 'Intimacy', type: 'checkbox', target: 1, unit: 'bond', xpReward: 400, skillPathId: 'intimacy', sequenceId: 'master', headline: true },
  { id: 'reflection-days', title: 'Reflect for 300 days', description: 'The Inner Temple contract writes one day here.', category: 'Soul', type: 'time', target: 300, unit: 'days', xpReward: 900, skillPathId: 'inner-temple', sequenceId: 'master', headline: true },
  { id: 'service-hours', title: 'Complete 100 hours of service', description: 'Hours given without keeping score in public.', category: 'Soul', type: 'time', target: 100, unit: 'hours', xpReward: 500, skillPathId: 'inner-temple', sequenceId: 'master' },
  { id: 'meals', title: 'Learn 50 meals', description: 'Fifty dishes you can cook again.', category: 'Life Skills', type: 'collection', target: 50, unit: 'meals', xpReward: 500, skillPathId: 'artisan', sequenceId: 'master', headline: true },
  { id: 'automotive', title: 'Complete 10 automotive tasks', description: 'Maintenance you did yourself or understood.', category: 'Life Skills', type: 'counter', target: 10, unit: 'tasks', xpReward: 300, skillPathId: 'artisan', sequenceId: 'master' },
  { id: 'cleaning-weeks', title: 'Keep a weekly cleaning system', description: 'Fifty-two weeks the space was reset.', category: 'Life Skills', type: 'streak', target: 52, unit: 'weeks', xpReward: 260, skillPathId: 'artisan', sequenceId: 'master' },
  { id: 'grooming-weeks', title: 'Keep a grooming routine', description: 'Fifty-two weeks you kept the standard.', category: 'Life Skills', type: 'streak', target: 52, unit: 'weeks', xpReward: 200, skillPathId: 'artisan', sequenceId: 'master' },
  { id: 'finish-pos', title: 'Finish Personal Operating System', description: 'Close the year with the system actually finished.', category: 'Admin', type: 'checkbox', target: 1, unit: 'system', xpReward: 400, skillPathId: 'hidden-bureau', sequenceId: 'master' },
  { id: 'campaign-months', title: 'Run this campaign for 12 months', description: 'Mark each month you kept the practice.', category: 'Admin', type: 'streak', target: 12, unit: 'months', xpReward: 240, skillPathId: 'hidden-bureau', sequenceId: 'master', headline: true },
  { id: 'weekly-plans', title: 'Plan 52 weeks', description: 'Look at the week before it spends you.', category: 'Admin', type: 'streak', target: 52, unit: 'weeks', xpReward: 520, skillPathId: 'eagle', sequenceId: 'master', headline: true },
  { id: 'monthly-reviews', title: 'Complete 12 monthly reviews', description: 'Sit down once a month and tell the truth.', category: 'Admin', type: 'streak', target: 12, unit: 'reviews', xpReward: 360, skillPathId: 'eagle', sequenceId: 'master' },
  { id: 'places', title: 'Visit 3 new places', description: 'Three destinations you had not been.', category: 'Adventure', type: 'collection', target: 3, unit: 'places', xpReward: 450, skillPathId: 'explorer', sequenceId: 'master', headline: true },
  { id: 'explorations', title: 'Explore 24 new environments', description: 'Twice a month, go somewhere unfamiliar.', category: 'Adventure', type: 'counter', target: 24, unit: 'outings', xpReward: 360, skillPathId: 'explorer', sequenceId: 'master' },
  { id: 'survival', title: 'Complete a 48-hour survival challenge', description: 'Two days with the skills, not the comforts.', category: 'Life Skills', type: 'checkbox', target: 1, unit: 'challenge', xpReward: 500, skillPathId: 'explorer', sequenceId: 'master' },
  { id: 'experiences', title: 'Collect 100 new experiences', description: 'One hundred things you had never done.', category: 'Fun', type: 'collection', target: 100, unit: 'experiences', xpReward: 800, skillPathId: 'play', sequenceId: 'master', headline: true },
  { id: 'deep-work-days', title: 'Log 200 deep work days', description: 'The Mind contract writes one day here.', category: 'Education', type: 'time', target: 200, unit: 'days', xpReward: 600, skillPathId: 'stealth', sequenceId: 'master', headline: true },
]

export const GOAL_BY_ID = Object.fromEntries(GOALS.map((goal) => [goal.id, goal]))

export function sequenceById(id: SequenceId) {
  return SEQUENCES.find((sequence) => sequence.id === id)!
}

export function skillById(id: SkillPathId) {
  return SKILL_PATHS.find((path) => path.id === id)!
}

export function contractById(id: ContractDefinition['id']) {
  return CONTRACTS.find((contract) => contract.id === id)!
}
