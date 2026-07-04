export interface LetterDeadline {
  date: string;
  what: string;
}

export interface LetterPayment {
  amount: number;
  currency: string;
  reason: string;
  due_date: string;
}

export interface LetterAnalysis {
  summary: string;
  action_required: boolean;
  actions: string[];
  deadlines: LetterDeadline[];
  needs_reply: boolean;
  urgency: 'high' | 'medium' | 'low';
  detected_child_name: string | null;
  detected_child_class: string | null;
  payments: LetterPayment[];
}
