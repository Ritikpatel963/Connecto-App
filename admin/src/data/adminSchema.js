export const statusOptions = {
  users: ["active", "suspended"],
  verification: ["pending", "approved", "rejected"],
  calls: ["initiated", "ongoing", "completed", "missed", "rejected", "failed"],
  transactions: ["pending", "verified", "rejected"],
  referrals: ["pending", "qualified", "rejected"],
  redemptions: ["pending", "approved", "rejected", "credited"],
};

const people = {
  1: "Aarav Mehta",
  2: "Meera Kapoor",
  3: "Kabir Singh",
  4: "Ananya Rao",
  5: "Riya Sharma",
  6: "Arjun Patel",
};

export const entityConfigs = {
  users: {
    tableName: "users",
    title: "Users",
    singular: "user",
    description: "Manage member profiles, account status, verification and referral performance.",
    icon: "solar:users-group-rounded-outline",
    primaryAction: "Add user",
    schemaFields: ["id", "name", "age", "gender", "country", "state", "city", "bio", "profile_image_url", "is_online", "last_seen_at", "call_rate", "average_rating", "total_ratings", "is_active", "is_id_verified", "is_voice_verified", "referral_code", "referred_by_user_id", "total_referrals", "referral_earnings", "created_at", "updated_at"],
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Member", type: "user" },
      { key: "location", label: "Location" },
      { key: "gender", label: "Gender" },
      { key: "call_rate", label: "Call rate", type: "money" },
      { key: "average_rating", label: "Rating", type: "rating" },
      { key: "verification", label: "Verification", type: "verification" },
      { key: "status", label: "Status", type: "status" },
    ],
    rows: [
      { id: 1001, name: people[1], email: "aarav@example.com", age: 29, gender: "male", country: "India", state: "Maharashtra", city: "Mumbai", location: "Mumbai, Maharashtra", bio: "Product designer and music lover.", is_online: true, last_seen_at: "Online now", call_rate: 12, average_rating: 4.8, total_ratings: 184, is_active: true, is_id_verified: true, is_voice_verified: true, verification: "ID + Voice", referral_code: "AARAV24", total_referrals: 12, referral_earnings: 150, status: "active", created_at: "2026-04-12" },
      { id: 1002, name: people[2], email: "meera@example.com", age: 26, gender: "female", country: "India", state: "Delhi", city: "New Delhi", location: "New Delhi, Delhi", bio: "Traveller and storyteller.", is_online: true, last_seen_at: "Online now", call_rate: 18, average_rating: 4.9, total_ratings: 241, is_active: true, is_id_verified: true, is_voice_verified: false, verification: "ID verified", referral_code: "MEERA18", total_referrals: 7, referral_earnings: 50, status: "active", created_at: "2026-04-18" },
      { id: 1003, name: people[3], email: "kabir@example.com", age: 32, gender: "male", country: "India", state: "Karnataka", city: "Bengaluru", location: "Bengaluru, Karnataka", bio: "Engineer, reader and runner.", is_online: false, last_seen_at: "12 min ago", call_rate: 10, average_rating: 4.4, total_ratings: 87, is_active: true, is_id_verified: false, is_voice_verified: true, verification: "Voice verified", referral_code: "KABIR10", total_referrals: 3, referral_earnings: 0, status: "active", created_at: "2026-05-02" },
      { id: 1004, name: people[4], email: "ananya@example.com", age: 24, gender: "female", country: "India", state: "Telangana", city: "Hyderabad", location: "Hyderabad, Telangana", bio: "Coffee, cinema and conversations.", is_online: false, last_seen_at: "2 hr ago", call_rate: 20, average_rating: 4.7, total_ratings: 139, is_active: false, is_id_verified: false, is_voice_verified: false, verification: "Unverified", referral_code: "ANANYA7", total_referrals: 1, referral_earnings: 0, status: "suspended", created_at: "2026-05-11" },
      { id: 1005, name: people[5], email: "riya@example.com", age: 28, gender: "female", country: "India", state: "Gujarat", city: "Ahmedabad", location: "Ahmedabad, Gujarat", bio: "Marketing strategist.", is_online: true, last_seen_at: "Online now", call_rate: 15, average_rating: 4.6, total_ratings: 105, is_active: true, is_id_verified: true, is_voice_verified: true, verification: "ID + Voice", referral_code: "RIYA22", total_referrals: 25, referral_earnings: 500, status: "active", created_at: "2026-05-20" },
    ],
  },
  "user-languages": {
    tableName: "user_languages", title: "User Languages", singular: "language", description: "Languages declared by members for matching and discovery.", icon: "solar:global-outline",
    schemaFields: ["id", "user_id", "language"],
    columns: [{ key: "id", label: "ID" }, { key: "user", label: "User", type: "user" }, { key: "language", label: "Language" }, { key: "proficiency", label: "Profile usage" }],
    rows: [
      { id: 1, user_id: 1001, user: people[1], language: "Hindi", proficiency: "Primary" },
      { id: 2, user_id: 1001, user: people[1], language: "English", proficiency: "Secondary" },
      { id: 3, user_id: 1002, user: people[2], language: "English", proficiency: "Primary" },
      { id: 4, user_id: 1003, user: people[3], language: "Kannada", proficiency: "Primary" },
    ],
  },
  "user-interests": {
    tableName: "user_interests", title: "User Interests", singular: "interest", description: "Interest tags used for recommendations and discovery.", icon: "solar:heart-angle-outline",
    schemaFields: ["id", "user_id", "interest"],
    columns: [{ key: "id", label: "ID" }, { key: "user", label: "User", type: "user" }, { key: "interest", label: "Interest" }, { key: "usage", label: "Matches" }],
    rows: [
      { id: 1, user_id: 1001, user: people[1], interest: "Music", usage: 1824 },
      { id: 2, user_id: 1002, user: people[2], interest: "Travel", usage: 2410 },
      { id: 3, user_id: 1003, user: people[3], interest: "Technology", usage: 1562 },
      { id: 4, user_id: 1004, user: people[4], interest: "Cinema", usage: 992 },
    ],
  },
  favourites: {
    tableName: "favourites", title: "Favourites", singular: "favourite", description: "Review member-to-member favourite relationships.", icon: "solar:heart-outline",
    schemaFields: ["id", "user_id", "favourite_user_id", "created_at"],
    columns: [{ key: "id", label: "ID" }, { key: "user", label: "User", type: "user" }, { key: "favourite", label: "Favourite member", type: "user" }, { key: "created_at", label: "Saved on", type: "date" }],
    rows: [
      { id: 501, user_id: 1001, user: people[1], favourite_user_id: 1002, favourite: people[2], created_at: "2026-06-28" },
      { id: 502, user_id: 1003, user: people[3], favourite_user_id: 1005, favourite: people[5], created_at: "2026-06-29" },
      { id: 503, user_id: 1004, user: people[4], favourite_user_id: 1001, favourite: people[1], created_at: "2026-07-01" },
    ],
  },
  ratings: {
    tableName: "ratings", title: "Ratings & Reviews", singular: "rating", description: "Monitor post-call ratings and moderate written reviews.", icon: "solar:star-outline",
    schemaFields: ["id", "rater_user_id", "rated_user_id", "call_id", "rating", "review_text", "created_at"],
    columns: [{ key: "id", label: "ID" }, { key: "rater", label: "From", type: "user" }, { key: "rated", label: "To", type: "user" }, { key: "rating", label: "Rating", type: "rating" }, { key: "review_text", label: "Review", type: "truncate" }, { key: "created_at", label: "Date", type: "date" }],
    rows: [
      { id: 701, rater_user_id: 1001, rater: people[1], rated_user_id: 1002, rated: people[2], call_id: 8801, rating: 5, review_text: "Great conversation and very respectful.", created_at: "2026-07-01" },
      { id: 702, rater_user_id: 1003, rater: people[3], rated_user_id: 1005, rated: people[5], call_id: 8802, rating: 4, review_text: "Friendly and engaging.", created_at: "2026-07-02" },
      { id: 703, rater_user_id: 1004, rater: people[4], rated_user_id: 1001, rated: people[1], call_id: 8803, rating: 3, review_text: "Call quality could be better.", created_at: "2026-07-03" },
    ],
  },
  "id-verifications": {
    tableName: "id_verifications", title: "ID Verifications", singular: "verification", description: "Review government ID submissions and approve or reject them.", icon: "solar:shield-check-outline", workflow: "approval",
    schemaFields: ["id", "user_id", "id_image_url", "status", "rejection_reason", "reviewed_by_admin_id", "submitted_at", "reviewed_at"],
    columns: [{ key: "id", label: "Request" }, { key: "user", label: "User", type: "user" }, { key: "document", label: "Document" }, { key: "submitted_at", label: "Submitted", type: "date" }, { key: "status", label: "Status", type: "status" }],
    rows: [
      { id: "IDV-2041", user_id: 1003, user: people[3], document: "Aadhaar •••• 4812", id_image_url: "/documents/id-2041.jpg", status: "pending", rejection_reason: "", reviewed_by_admin_id: null, submitted_at: "2026-07-03 10:42", reviewed_at: null },
      { id: "IDV-2040", user_id: 1004, user: people[4], document: "Passport •••• 9031", id_image_url: "/documents/id-2040.jpg", status: "pending", rejection_reason: "", reviewed_by_admin_id: null, submitted_at: "2026-07-03 09:18", reviewed_at: null },
      { id: "IDV-2039", user_id: 1002, user: people[2], document: "PAN •••• 1187", id_image_url: "/documents/id-2039.jpg", status: "approved", rejection_reason: "", reviewed_by_admin_id: 1, submitted_at: "2026-07-02 16:05", reviewed_at: "2026-07-02 16:22" },
      { id: "IDV-2038", user_id: 1006, user: people[6], document: "Aadhaar •••• 5520", id_image_url: "/documents/id-2038.jpg", status: "rejected", rejection_reason: "Image is blurred", reviewed_by_admin_id: 2, submitted_at: "2026-07-02 13:11", reviewed_at: "2026-07-02 14:03" },
    ],
  },
  "voice-verifications": {
    tableName: "voice_verifications", title: "Voice Verifications", singular: "verification", description: "Listen to voice samples and complete trust verification.", icon: "solar:microphone-3-outline", workflow: "approval",
    schemaFields: ["id", "user_id", "voice_audio_url", "status", "rejection_reason", "reviewed_by_admin_id", "submitted_at", "reviewed_at"],
    columns: [{ key: "id", label: "Request" }, { key: "user", label: "User", type: "user" }, { key: "sample", label: "Voice sample" }, { key: "submitted_at", label: "Submitted", type: "date" }, { key: "status", label: "Status", type: "status" }],
    rows: [
      { id: "VV-912", user_id: 1002, user: people[2], sample: "00:18 audio", voice_audio_url: "/audio/vv-912.mp3", status: "pending", rejection_reason: "", reviewed_by_admin_id: null, submitted_at: "2026-07-03 11:05", reviewed_at: null },
      { id: "VV-911", user_id: 1004, user: people[4], sample: "00:21 audio", voice_audio_url: "/audio/vv-911.mp3", status: "pending", rejection_reason: "", reviewed_by_admin_id: null, submitted_at: "2026-07-03 08:51", reviewed_at: null },
      { id: "VV-910", user_id: 1001, user: people[1], sample: "00:16 audio", voice_audio_url: "/audio/vv-910.mp3", status: "approved", rejection_reason: "", reviewed_by_admin_id: 1, submitted_at: "2026-07-02 18:40", reviewed_at: "2026-07-02 19:00" },
    ],
  },
  calls: {
    tableName: "calls", title: "Voice Calls", singular: "call", description: "Monitor Agora voice sessions, duration, status and billing.", icon: "solar:phone-calling-outline",
    schemaFields: ["id", "caller_user_id", "receiver_user_id", "agora_channel_name", "agora_token", "rate_per_min_charged", "duration_seconds", "total_cost", "status", "started_at", "ended_at", "created_at"],
    columns: [{ key: "id", label: "Call" }, { key: "caller", label: "Caller", type: "user" }, { key: "receiver", label: "Receiver", type: "user" }, { key: "duration", label: "Duration" }, { key: "total_cost", label: "Cost", type: "money" }, { key: "status", label: "Status", type: "status" }, { key: "created_at", label: "Started", type: "date" }],
    rows: [
      { id: "CALL-8804", caller_user_id: 1001, caller: people[1], receiver_user_id: 1002, receiver: people[2], agora_channel_name: "cp_8804", rate_per_min_charged: 18, duration_seconds: 742, duration: "12m 22s", total_cost: 222.6, status: "completed", started_at: "2026-07-03 11:02", ended_at: "2026-07-03 11:14", created_at: "2026-07-03 11:02" },
      { id: "CALL-8803", caller_user_id: 1004, caller: people[4], receiver_user_id: 1001, receiver: people[1], agora_channel_name: "cp_8803", rate_per_min_charged: 12, duration_seconds: 318, duration: "5m 18s", total_cost: 63.6, status: "completed", started_at: "2026-07-03 10:18", ended_at: "2026-07-03 10:23", created_at: "2026-07-03 10:18" },
      { id: "CALL-8802", caller_user_id: 1003, caller: people[3], receiver_user_id: 1005, receiver: people[5], agora_channel_name: "cp_8802", rate_per_min_charged: 15, duration_seconds: 0, duration: "—", total_cost: 0, status: "missed", started_at: null, ended_at: null, created_at: "2026-07-03 09:55" },
      { id: "CALL-8801", caller_user_id: 1002, caller: people[2], receiver_user_id: 1005, receiver: people[5], agora_channel_name: "cp_8801", rate_per_min_charged: 15, duration_seconds: 196, duration: "3m 16s", total_cost: 49, status: "rejected", started_at: "2026-07-03 09:14", ended_at: "2026-07-03 09:17", created_at: "2026-07-03 09:14" },
    ],
  },
  conversations: {
    tableName: "conversations", title: "Conversations", singular: "conversation", description: "Review conversation activity and participant pairs.", icon: "solar:chat-round-dots-outline",
    schemaFields: ["id", "user_one_id", "user_two_id", "last_message_at", "created_at"],
    columns: [{ key: "id", label: "Conversation" }, { key: "user_one", label: "Participant one", type: "user" }, { key: "user_two", label: "Participant two", type: "user" }, { key: "messages", label: "Messages" }, { key: "last_message_at", label: "Last activity", type: "date" }],
    rows: [
      { id: "CONV-4102", user_one_id: 1001, user_one: people[1], user_two_id: 1002, user_two: people[2], messages: 46, last_message_at: "2026-07-03 11:31", created_at: "2026-06-14" },
      { id: "CONV-4101", user_one_id: 1003, user_one: people[3], user_two_id: 1005, user_two: people[5], messages: 18, last_message_at: "2026-07-03 10:22", created_at: "2026-06-25" },
      { id: "CONV-4100", user_one_id: 1004, user_one: people[4], user_two_id: 1001, user_two: people[1], messages: 9, last_message_at: "2026-07-02 20:05", created_at: "2026-07-01" },
    ],
  },
  messages: {
    tableName: "messages", title: "Messages", singular: "message", description: "Search message history and moderate reported content.", icon: "solar:chat-square-code-outline",
    schemaFields: ["id", "conversation_id", "sender_id", "message_type", "content", "is_read", "sent_at"],
    columns: [{ key: "id", label: "Message" }, { key: "conversation_id", label: "Conversation" }, { key: "sender", label: "Sender", type: "user" }, { key: "message_type", label: "Type" }, { key: "content", label: "Content", type: "truncate" }, { key: "read", label: "Read", type: "status" }, { key: "sent_at", label: "Sent", type: "date" }],
    rows: [
      { id: "MSG-9901", conversation_id: "CONV-4102", sender_id: 1001, sender: people[1], message_type: "text", content: "That sounds great, let's talk later today.", is_read: true, read: "read", sent_at: "2026-07-03 11:31" },
      { id: "MSG-9900", conversation_id: "CONV-4102", sender_id: 1002, sender: people[2], message_type: "emoji", content: "😊", is_read: true, read: "read", sent_at: "2026-07-03 11:30" },
      { id: "MSG-9899", conversation_id: "CONV-4101", sender_id: 1005, sender: people[5], message_type: "image", content: "image_0703_1022.jpg", is_read: false, read: "unread", sent_at: "2026-07-03 10:22" },
    ],
  },
  wallets: {
    tableName: "wallets", title: "Wallets", singular: "wallet", description: "View member balances and recent wallet activity.", icon: "solar:wallet-2-outline",
    schemaFields: ["id", "user_id", "balance", "updated_at"],
    columns: [{ key: "id", label: "Wallet" }, { key: "user", label: "User", type: "user" }, { key: "balance", label: "Balance", type: "money" }, { key: "last_transaction", label: "Last transaction" }, { key: "updated_at", label: "Updated", type: "date" }],
    rows: [
      { id: "WLT-301", user_id: 1001, user: people[1], balance: 1240.5, last_transaction: "Call deduction", updated_at: "2026-07-03 11:14" },
      { id: "WLT-302", user_id: 1002, user: people[2], balance: 2840, last_transaction: "Manual recharge", updated_at: "2026-07-03 09:28" },
      { id: "WLT-303", user_id: 1003, user: people[3], balance: 430.75, last_transaction: "Referral reward", updated_at: "2026-07-02 17:11" },
      { id: "WLT-304", user_id: 1004, user: people[4], balance: 95, last_transaction: "Refund", updated_at: "2026-07-02 12:01" },
    ],
  },
  "wallet-transactions": {
    tableName: "wallet_transactions", title: "Wallet Transactions", singular: "transaction", description: "Approve manual recharges and audit deductions, refunds and rewards.", icon: "solar:card-transfer-outline", workflow: "approval",
    schemaFields: ["id", "wallet_id", "transaction_type", "amount", "payment_method", "razorpay_payment_id", "payment_screenshot_url", "verification_status", "reviewed_by_admin_id", "reviewed_at", "call_id", "created_at"],
    columns: [{ key: "id", label: "Transaction" }, { key: "wallet_id", label: "Wallet" }, { key: "transaction_type", label: "Type" }, { key: "amount", label: "Amount", type: "money" }, { key: "payment_method", label: "Method" }, { key: "verification_status", label: "Status", type: "status" }, { key: "created_at", label: "Created", type: "date" }],
    rows: [
      { id: "TXN-7204", wallet_id: "WLT-302", transaction_type: "recharge", amount: 1000, payment_method: "manual_upload", razorpay_payment_id: null, payment_screenshot_url: "/payments/7204.jpg", verification_status: "pending", reviewed_by_admin_id: null, reviewed_at: null, call_id: null, created_at: "2026-07-03 11:26" },
      { id: "TXN-7203", wallet_id: "WLT-301", transaction_type: "call_deduction", amount: -222.6, payment_method: null, razorpay_payment_id: null, payment_screenshot_url: null, verification_status: "verified", reviewed_by_admin_id: null, reviewed_at: null, call_id: "CALL-8804", created_at: "2026-07-03 11:14" },
      { id: "TXN-7202", wallet_id: "WLT-303", transaction_type: "referral_reward", amount: 150, payment_method: null, razorpay_payment_id: null, payment_screenshot_url: null, verification_status: "verified", reviewed_by_admin_id: 3, reviewed_at: "2026-07-02 17:11", call_id: null, created_at: "2026-07-02 17:11" },
      { id: "TXN-7201", wallet_id: "WLT-304", transaction_type: "recharge", amount: 500, payment_method: "manual_upload", razorpay_payment_id: null, payment_screenshot_url: "/payments/7201.jpg", verification_status: "rejected", reviewed_by_admin_id: 3, reviewed_at: "2026-07-02 12:01", call_id: null, created_at: "2026-07-02 11:45" },
    ],
  },
  referrals: {
    tableName: "referrals", title: "Referrals", singular: "referral", description: "Track referral qualification from signup through ID approval.", icon: "solar:share-circle-outline",
    schemaFields: ["id", "referrer_user_id", "referred_user_id", "status", "qualified_at", "created_at"],
    columns: [{ key: "id", label: "Referral" }, { key: "referrer", label: "Referrer", type: "user" }, { key: "referred", label: "Referred user", type: "user" }, { key: "status", label: "Status", type: "status" }, { key: "qualified_at", label: "Qualified", type: "date" }, { key: "created_at", label: "Joined", type: "date" }],
    rows: [
      { id: "REF-601", referrer_user_id: 1001, referrer: people[1], referred_user_id: 1004, referred: people[4], status: "pending", qualified_at: null, created_at: "2026-07-01" },
      { id: "REF-600", referrer_user_id: 1002, referrer: people[2], referred_user_id: 1003, referred: people[3], status: "qualified", qualified_at: "2026-06-30", created_at: "2026-06-20" },
      { id: "REF-599", referrer_user_id: 1005, referrer: people[5], referred_user_id: 1006, referred: people[6], status: "rejected", qualified_at: null, created_at: "2026-06-18" },
    ],
  },
  "referral-tiers": {
    tableName: "referral_tiers", title: "Referral Reward Tiers", singular: "tier", description: "Configure referral milestones and wallet rewards.", icon: "solar:cup-star-outline", primaryAction: "Add tier",
    schemaFields: ["id", "tier_name", "min_referrals", "reward_amount", "is_active"],
    columns: [{ key: "id", label: "ID" }, { key: "tier_name", label: "Tier" }, { key: "min_referrals", label: "Qualified referrals" }, { key: "reward_amount", label: "Reward", type: "money" }, { key: "status", label: "Status", type: "status" }],
    rows: [
      { id: 1, tier_name: "Bronze", min_referrals: 5, reward_amount: 50, is_active: true, status: "active" },
      { id: 2, tier_name: "Silver", min_referrals: 10, reward_amount: 150, is_active: true, status: "active" },
      { id: 3, tier_name: "Gold", min_referrals: 25, reward_amount: 500, is_active: true, status: "active" },
    ],
  },
  "referral-redemptions": {
    tableName: "referral_redemptions", title: "Referral Redemptions", singular: "redemption", description: "Review reward payout requests and credit approved wallets.", icon: "solar:gift-outline", workflow: "approval",
    schemaFields: ["id", "user_id", "tier_id", "qualified_referrals_at_request", "reward_amount", "status", "wallet_transaction_id", "requested_at", "processed_at", "processed_by_admin_id"],
    columns: [{ key: "id", label: "Request" }, { key: "user", label: "User", type: "user" }, { key: "tier", label: "Tier" }, { key: "qualified_referrals_at_request", label: "Qualified" }, { key: "reward_amount", label: "Reward", type: "money" }, { key: "status", label: "Status", type: "status" }, { key: "requested_at", label: "Requested", type: "date" }],
    rows: [
      { id: "RDM-330", user_id: 1005, user: people[5], tier_id: 3, tier: "Gold", qualified_referrals_at_request: 25, reward_amount: 500, status: "pending", wallet_transaction_id: null, requested_at: "2026-07-03 10:15", processed_at: null, processed_by_admin_id: null },
      { id: "RDM-329", user_id: 1001, user: people[1], tier_id: 2, tier: "Silver", qualified_referrals_at_request: 12, reward_amount: 150, status: "approved", wallet_transaction_id: null, requested_at: "2026-07-02 15:41", processed_at: "2026-07-02 16:00", processed_by_admin_id: 3 },
      { id: "RDM-328", user_id: 1002, user: people[2], tier_id: 1, tier: "Bronze", qualified_referrals_at_request: 7, reward_amount: 50, status: "credited", wallet_transaction_id: "TXN-7198", requested_at: "2026-07-01 12:20", processed_at: "2026-07-01 13:02", processed_by_admin_id: 3 },
    ],
  },
  admins: {
    tableName: "admins", title: "Admin Accounts", singular: "admin", description: "Manage staff access, assigned roles and account activity.", icon: "solar:user-shield-outline", primaryAction: "Invite admin",
    schemaFields: ["id", "name", "email", "password_hash", "role_id", "is_active", "last_login_at", "created_at"],
    columns: [{ key: "id", label: "ID" }, { key: "name", label: "Admin", type: "user" }, { key: "email", label: "Email" }, { key: "role", label: "Role" }, { key: "last_login_at", label: "Last login", type: "date" }, { key: "status", label: "Status", type: "status" }],
    rows: [
      { id: 1, name: "Neha Verma", email: "neha@connecto.app", role_id: 1, role: "Super admin", is_active: true, status: "active", last_login_at: "2026-07-03 11:38", created_at: "2026-01-10" },
      { id: 2, name: "Vikram Shah", email: "vikram@connecto.app", role_id: 2, role: "Moderator", is_active: true, status: "active", last_login_at: "2026-07-03 10:16", created_at: "2026-03-08" },
      { id: 3, name: "Sara Khan", email: "sara@connecto.app", role_id: 3, role: "Finance admin", is_active: true, status: "active", last_login_at: "2026-07-03 09:41", created_at: "2026-04-02" },
    ],
  },
  roles: {
    tableName: "roles", title: "Roles", singular: "role", description: "Define staff responsibilities and permission bundles.", icon: "solar:users-group-two-rounded-outline", primaryAction: "Create role",
    schemaFields: ["id", "name", "description"],
    columns: [{ key: "id", label: "ID" }, { key: "name", label: "Role" }, { key: "description", label: "Description", type: "truncate" }, { key: "permissions", label: "Permissions" }, { key: "admins", label: "Admins" }],
    rows: [
      { id: 1, name: "Super admin", description: "Full access to the entire administration platform.", permissions: 6, admins: 1 },
      { id: 2, name: "Moderator", description: "Reviews ID and voice verification submissions.", permissions: 3, admins: 4 },
      { id: 3, name: "Finance admin", description: "Approves wallet recharges and referral payouts.", permissions: 2, admins: 2 },
    ],
  },
  permissions: {
    tableName: "permissions", title: "Permissions", singular: "permission", description: "Permission catalogue available to staff roles.", icon: "solar:key-minimalistic-square-outline", primaryAction: "Add permission",
    schemaFields: ["id", "name", "description"],
    columns: [{ key: "id", label: "ID" }, { key: "name", label: "Permission" }, { key: "description", label: "Description", type: "truncate" }, { key: "roles", label: "Used by roles" }],
    rows: [
      { id: 1, name: "verify_id", description: "Approve or reject government ID submissions.", roles: 2 },
      { id: 2, name: "verify_voice", description: "Approve or reject voice verification samples.", roles: 2 },
      { id: 3, name: "approve_wallet_recharge", description: "Approve manual wallet recharge proofs.", roles: 2 },
      { id: 4, name: "approve_referral_redemption", description: "Approve referral reward payouts.", roles: 2 },
      { id: 5, name: "manage_users", description: "Suspend, ban and edit member profiles.", roles: 2 },
      { id: 6, name: "manage_admins", description: "Create and edit staff accounts.", roles: 1 },
    ],
  },
  "role-permissions": {
    tableName: "role_permissions", title: "Role Permission Matrix", singular: "assignment", description: "Inspect and manage role-to-permission assignments.", icon: "solar:lock-keyhole-minimalistic-outline",
    schemaFields: ["id", "role_id", "permission_id"],
    columns: [{ key: "id", label: "ID" }, { key: "role", label: "Role" }, { key: "permission", label: "Permission" }, { key: "scope", label: "Scope" }],
    rows: [
      { id: 1, role_id: 1, role: "Super admin", permission_id: 6, permission: "manage_admins", scope: "Global" },
      { id: 2, role_id: 2, role: "Moderator", permission_id: 1, permission: "verify_id", scope: "Trust & Safety" },
      { id: 3, role_id: 2, role: "Moderator", permission_id: 2, permission: "verify_voice", scope: "Trust & Safety" },
      { id: 4, role_id: 3, role: "Finance admin", permission_id: 3, permission: "approve_wallet_recharge", scope: "Finance" },
      { id: 5, role_id: 3, role: "Finance admin", permission_id: 4, permission: "approve_referral_redemption", scope: "Referrals" },
    ],
  },
};

export const sidebarSections = [
  {
    id: "people",
    label: "People & Community",
    icon: "solar:users-group-rounded-outline",
    items: [
      ["users", "Users"],
      ["user-languages", "User Languages"],
      ["user-interests", "User Interests"],
      ["favourites", "Favourites"],
      ["ratings", "Ratings & Reviews"],
    ],
  },
  {
    id: "trust",
    label: "Trust & Safety",
    icon: "solar:shield-check-outline",
    items: [["id-verifications", "ID Verifications"], ["voice-verifications", "Voice Verifications"]],
  },
  {
    id: "communication",
    label: "Communication",
    icon: "solar:chat-round-dots-outline",
    items: [["calls", "Voice Calls"], ["conversations", "Conversations"], ["messages", "Messages"]],
  },
  {
    id: "finance",
    label: "Wallet & Finance",
    icon: "solar:wallet-2-outline",
    items: [["wallets", "Wallets"], ["wallet-transactions", "Transactions"]],
  },
  {
    id: "referrals",
    label: "Referrals",
    icon: "solar:share-circle-outline",
    items: [["referrals", "Referral Activity"], ["referral-tiers", "Reward Tiers"], ["referral-redemptions", "Redemptions"]],
  },
  {
    id: "access",
    label: "Access Control",
    icon: "solar:user-shield-outline",
    items: [["admins", "Admin Accounts"], ["roles", "Roles"], ["permissions", "Permissions"], ["role-permissions", "Role Matrix"]],
  },
];

export const overviewStats = [
  { label: "Total users", value: "24,892", change: "+12.4%", tone: "primary", icon: "solar:users-group-rounded-bold" },
  { label: "Online now", value: "1,284", change: "+8.1%", tone: "success", icon: "solar:wi-fi-router-bold" },
  { label: "Calls today", value: "3,106", change: "+18.2%", tone: "info", icon: "solar:phone-calling-bold" },
  { label: "Wallet volume", value: "₹4.86L", change: "+9.7%", tone: "warning", icon: "solar:wallet-money-bold" },
];

export const approvalQueue = [
  { type: "ID verification", item: "IDV-2041", user: people[3], age: "14 min", route: "/admin/id-verifications", tone: "warning" },
  { type: "Voice verification", item: "VV-912", user: people[2], age: "21 min", route: "/admin/voice-verifications", tone: "info" },
  { type: "Manual recharge", item: "TXN-7204", user: people[2], age: "27 min", route: "/admin/wallet-transactions", tone: "primary" },
  { type: "Referral payout", item: "RDM-330", user: people[5], age: "42 min", route: "/admin/referral-redemptions", tone: "success" },
];
