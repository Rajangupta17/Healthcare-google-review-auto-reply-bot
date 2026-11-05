// Get_Review (DEMO DATA) - 20 made-up reviews in the Google Business Profile API format.
// Replace this node with an HTTP Request to the Google API once access is approved (see README).
const reviews = [
 {
  "reviewId": "DEMO-01",
  "reviewer": {
   "displayName": "Aarav S."
  },
  "starRating": "FIVE",
  "createTime": "2026-01-01T10:00:00Z",
  "comment": "Excellent care by the doctors and very supportive nursing staff. Thank you!"
 },
 {
  "reviewId": "DEMO-02",
  "reviewer": {
   "displayName": "Priya M."
  },
  "starRating": "FIVE",
  "createTime": "2026-01-02T10:00:00Z",
  "comment": "The nurses in the ICU were so caring and kind. Highly recommend this hospital."
 },
 {
  "reviewId": "DEMO-03",
  "reviewer": {
   "displayName": "Rohit K."
  },
  "starRating": "FOUR",
  "createTime": "2026-01-03T10:00:00Z",
  "comment": "Good experience in OPD, the staff was polite and helpful."
 },
 {
  "reviewId": "DEMO-04",
  "reviewer": {
   "displayName": "Neha G."
  },
  "starRating": "FIVE",
  "createTime": "2026-01-04T10:00:00Z",
  "comment": "Doctor ne bahut accha samjhaya, staff bhi badhiya hai. Shukriya!"
 },
 {
  "reviewId": "DEMO-05",
  "reviewer": {
   "displayName": "Vikram T."
  },
  "starRating": "FIVE",
  "createTime": "2026-01-05T10:00:00Z",
  "comment": "Emergency team was quick and very professional. Grateful for the care."
 },
 {
  "reviewId": "DEMO-06",
  "reviewer": {
   "displayName": "Sana A."
  },
  "starRating": "FIVE",
  "createTime": "2026-01-06T10:00:00Z",
  "comment": "Clean rooms, tasty food and courteous housekeeping staff."
 },
 {
  "reviewId": "DEMO-07",
  "reviewer": {
   "displayName": "Karan P."
  },
  "starRating": "FIVE",
  "createTime": "2026-01-07T10:00:00Z",
  "comment": "Smooth admission and discharge. Wonderful experience overall 👍"
 },
 {
  "reviewId": "DEMO-08",
  "reviewer": {
   "displayName": "Meera J."
  },
  "starRating": "FIVE",
  "createTime": "2026-01-08T10:00:00Z",
  "comment": "International wing staff were humble and cooperative. Thank you all."
 },
 {
  "reviewId": "DEMO-09",
  "reviewer": {
   "displayName": "Arjun D."
  },
  "starRating": "THREE",
  "createTime": "2026-01-09T10:00:00Z",
  "comment": "Doctor was good but billing took 3 hours."
 },
 {
  "reviewId": "DEMO-10",
  "reviewer": {
   "displayName": "Pooja R."
  },
  "starRating": "FOUR",
  "createTime": "2026-01-10T10:00:00Z",
  "comment": "Nice staff. Please improve the washroom cleaning."
 },
 {
  "reviewId": "DEMO-11",
  "reviewer": {
   "displayName": "Imran H."
  },
  "starRating": "ONE",
  "createTime": "2026-01-11T10:00:00Z",
  "comment": "Worst experience, rude staff at reception and long waiting."
 },
 {
  "reviewId": "DEMO-12",
  "reviewer": {
   "displayName": "Anjali V."
  },
  "starRating": "TWO",
  "createTime": "2026-01-12T10:00:00Z",
  "comment": "Doctor accha tha lekin nurses ne dhyan nahi diya."
 },
 {
  "reviewId": "DEMO-13",
  "reviewer": {
   "displayName": "Rahul N."
  },
  "starRating": "FIVE",
  "createTime": "2026-01-13T10:00:00Z",
  "comment": "Good doctors. Why is the parking so costly?"
 },
 {
  "reviewId": "DEMO-14",
  "reviewer": {
   "displayName": "Diya L."
  },
  "starRating": "FOUR",
  "createTime": "2026-01-14T10:00:00Z",
  "comment": "Great treatment, we just had issue with the hygiene. Otherwise great service."
 },
 {
  "reviewId": "DEMO-15",
  "reviewer": {
   "displayName": "Sameer B."
  },
  "starRating": "ONE",
  "createTime": "2026-01-15T10:00:00Z",
  "comment": "Kept waiting for 4 hours in emergency, nobody checked my father."
 },
 {
  "reviewId": "DEMO-16",
  "reviewer": {
   "displayName": "Kavya S."
  },
  "starRating": "FIVE",
  "createTime": "2026-01-16T10:00:00Z",
  "comment": "Doctors are good. STAFF IS VERY RUDE AT BILLING COUNTER."
 },
 {
  "reviewId": "DEMO-17",
  "reviewer": {
   "displayName": "Farhan Q."
  },
  "starRating": "THREE",
  "createTime": "2026-01-17T10:00:00Z",
  "comment": "The 2 stars I'm giving are only because of the doctors."
 },
 {
  "reviewId": "DEMO-18",
  "reviewer": {
   "displayName": "Nisha T."
  },
  "starRating": "ONE",
  "createTime": "2026-01-18T10:00:00Z",
  "comment": "Bakwas service, paise ke liye hi sab kuch karte hain."
 },
 {
  "reviewId": "DEMO-19",
  "reviewer": {
   "displayName": "A Google User"
  },
  "starRating": "FIVE",
  "createTime": "2026-01-19T10:00:00Z",
  "comment": ""
 },
 {
  "reviewId": "DEMO-20",
  "reviewer": {
   "displayName": "Ritu C."
  },
  "starRating": "FIVE",
  "createTime": "2026-01-20T10:00:00Z",
  "comment": "Thanks for nothing at the pharmacy, great job making us wait."
 }
];
return [{ json: { reviews } }];
