/**
 * Customer feedback & programme voice (South African FMCG network).
 */

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  org: string;
  /** Optional Q&A style */
  question?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "norton",
    quote:
      "I think it is a fantastic model which needs to be shared with all South Africans and later internationally.",
    name: "Tracey Norton",
    org: "Imana Foods",
  },
  {
    id: "moodley",
    quote:
      "This programme has been a journey of learning, growth and development. The model has potential to engage and influence people across age, education, class and culture as it is not bound to a rigid concept or theory of what a leader or leadership is. Instead, it explores that which comprises moral, effective human functioning, especially in a leadership context.",
    name: "Vernon Moodley",
    org: "Kerry Foods",
  },
  {
    id: "mkhwanazi",
    quote: "The programme is what the world is waiting for.",
    name: "Sydney Mkhwanazi",
    org: "Imana Foods",
  },
  {
    id: "thevan-qa",
    question:
      "Does the Super-Cube® leadership model positively influence your leadership behaviour?",
    quote:
      "More than the word influence, it provokes your behaviour and calls for change.",
    name: "Theolen Thevan",
    org: "Kerry Foods",
  },
  {
    id: "govender",
    quote:
      "It was a wonderful and enlightening experience. I have learnt about myself weakness and strengths, and how to grow and improve as a person. I feel the content learnt will help me be a great manager and leader in the future.",
    name: "Kaveshin Govender",
    org: "Kerry Foods",
  },
  {
    id: "thevan-close",
    quote: "The man behind it, must not rest until the world changes.",
    name: "Theolen Thevan",
    org: "Kerry Foods",
  },
];

/** Short set for compact strips (home / what) */
export const featuredTestimonials = [
  testimonials[0],
  testimonials[2],
  testimonials[3],
];
