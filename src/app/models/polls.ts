export interface Polls {
  pollId: string;
  pollTitle: string;
  pollContent: string;
  pollOptionA: string;
  pollOptionB: string;
  pollOptionC: string;
  pollOptionD: string;
  votesA: string[];
  votesB: string[];
  votesC: string[];
  votesD: string[];
  postedById: string;
  postedBy: string;
  postedBySurname: string;
  postedByPhoto: string;
  postOrgId: string;
  createdAt: number;
}
