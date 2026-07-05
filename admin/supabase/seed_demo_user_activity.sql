-- Rich, repeatable demo data for the six Connecto profiles.
-- Run after add_phone_number_to_users.sql and seed_demo_users.sql.

-- Complete the visible profile fields.
with profile_data (phone_number, bio, referral_code, is_online, average_rating, total_ratings) as (
  values
    ('+919100000001', 'Product designer who enjoys music, cricket and thoughtful conversations.', 'AARAV24', true,  4.8, 34),
    ('+919100000002', 'Software engineer, weekend runner and enthusiastic reader.', 'KABIR27', false, 4.6, 21),
    ('+919100000003', 'Fitness enthusiast who loves travel stories and new technology.', 'ARJUN22', true, 4.7, 18),
    ('+919100000004', 'Classical dancer, film lover and friendly listener.', 'ANANYA23', true, 4.9, 57),
    ('+919100000005', 'Traveller, storyteller and coffee explorer.', 'MEERA26', false, 4.8, 46),
    ('+919100000006', 'Marketing professional interested in food, fashion and startups.', 'RIYA25', true, 4.5, 29)
)
update public.users as users
set bio = profile.bio,
    referral_code = profile.referral_code,
    is_online = profile.is_online,
    average_rating = profile.average_rating,
    total_ratings = profile.total_ratings,
    updated_at = now()
from profile_data as profile
where users.phone_number = profile.phone_number;

-- Matching languages.
with language_data (phone_number, language) as (
  values
    ('+919100000001', 'Hindi'), ('+919100000001', 'English'), ('+919100000001', 'Marathi'),
    ('+919100000002', 'Hindi'), ('+919100000002', 'English'), ('+919100000002', 'Kannada'),
    ('+919100000003', 'Hindi'), ('+919100000003', 'English'),
    ('+919100000004', 'Tamil'), ('+919100000004', 'English'), ('+919100000004', 'Hindi'),
    ('+919100000005', 'Telugu'), ('+919100000005', 'Hindi'), ('+919100000005', 'English'),
    ('+919100000006', 'Gujarati'), ('+919100000006', 'Hindi'), ('+919100000006', 'English')
)
insert into public.user_languages (user_id, language)
select users.id, language_data.language
from language_data
join public.users as users using (phone_number)
where not exists (
  select 1 from public.user_languages as existing
  where existing.user_id = users.id
    and lower(existing.language) = lower(language_data.language)
);

-- Discovery interests.
with interest_data (phone_number, interest) as (
  values
    ('+919100000001', 'Music'), ('+919100000001', 'Cricket'), ('+919100000001', 'Design'),
    ('+919100000002', 'Technology'), ('+919100000002', 'Books'), ('+919100000002', 'Running'),
    ('+919100000003', 'Fitness'), ('+919100000003', 'Travel'), ('+919100000003', 'Gaming'),
    ('+919100000004', 'Dance'), ('+919100000004', 'Cinema'), ('+919100000004', 'Art'),
    ('+919100000005', 'Travel'), ('+919100000005', 'Coffee'), ('+919100000005', 'Storytelling'),
    ('+919100000006', 'Fashion'), ('+919100000006', 'Food'), ('+919100000006', 'Startups')
)
insert into public.user_interests (user_id, interest)
select users.id, interest_data.interest
from interest_data
join public.users as users using (phone_number)
where not exists (
  select 1 from public.user_interests as existing
  where existing.user_id = users.id
    and lower(existing.interest) = lower(interest_data.interest)
);

-- One wallet per demo user.
with wallet_data (phone_number, balance) as (
  values
    ('+919100000001', 1240.50), ('+919100000002', 430.75),
    ('+919100000003', 875.00),  ('+919100000004', 2840.00),
    ('+919100000005', 1925.50), ('+919100000006', 760.00)
)
insert into public.wallets (user_id, balance, updated_at)
select users.id, wallet_data.balance, now()
from wallet_data
join public.users as users using (phone_number)
where not exists (
  select 1 from public.wallets as existing where existing.user_id = users.id
);

-- Wallet history for every profile.
with transaction_data (phone_number, transaction_type, amount, payment_method, verification_status, created_at) as (
  values
    ('+919100000001', 'recharge', 1500.00, 'razorpay', 'verified', timestamp '2026-07-01 09:10:00'),
    ('+919100000001', 'call_deduction', -259.50, null, 'verified', timestamp '2026-07-03 11:14:00'),
    ('+919100000002', 'recharge', 500.00, 'razorpay', 'verified', timestamp '2026-07-01 10:20:00'),
    ('+919100000002', 'call_deduction', -69.25, null, 'verified', timestamp '2026-07-03 10:23:00'),
    ('+919100000003', 'recharge', 1000.00, 'manual_upload', 'verified', timestamp '2026-07-02 08:30:00'),
    ('+919100000004', 'referral_reward', 150.00, null, 'verified', timestamp '2026-07-02 17:11:00'),
    ('+919100000005', 'recharge', 2000.00, 'razorpay', 'verified', timestamp '2026-07-02 12:45:00'),
    ('+919100000006', 'recharge', 760.00, 'manual_upload', 'pending', timestamp '2026-07-03 09:00:00')
)
insert into public.wallet_transactions (
  wallet_id, transaction_type, amount, payment_method, verification_status, created_at
)
select wallets.id, txn.transaction_type, txn.amount,
       txn.payment_method, txn.verification_status, txn.created_at
from transaction_data as txn
join public.users as users using (phone_number)
join public.wallets as wallets on wallets.user_id = users.id
where not exists (
  select 1 from public.wallet_transactions as existing
  where existing.wallet_id = wallets.id
    and existing.transaction_type = txn.transaction_type
    and existing.amount = txn.amount
    and existing.created_at = txn.created_at
);

-- Completed and missed calls connecting all six profiles.
with call_data (
  channel_name, caller_phone, receiver_phone, duration_seconds,
  rate_per_minute, total_cost, status, started_at, ended_at, created_at
) as (
  values
    ('demo_call_001', '+919100000001', '+919100000004', 742, 14.00, 173.13, 'completed', timestamp '2026-07-03 11:02:00', timestamp '2026-07-03 11:14:22', timestamp '2026-07-03 11:02:00'),
    ('demo_call_002', '+919100000002', '+919100000005', 318, 18.00,  95.40, 'completed', timestamp '2026-07-03 10:18:00', timestamp '2026-07-03 10:23:18', timestamp '2026-07-03 10:18:00'),
    ('demo_call_003', '+919100000003', '+919100000006', 496, 16.00, 132.27, 'completed', timestamp '2026-07-03 09:05:00', timestamp '2026-07-03 09:13:16', timestamp '2026-07-03 09:05:00'),
    ('demo_call_004', '+919100000001', '+919100000005', 196, 18.00,  58.80, 'completed', timestamp '2026-07-02 20:14:00', timestamp '2026-07-02 20:17:16', timestamp '2026-07-02 20:14:00'),
    ('demo_call_005', '+919100000002', '+919100000006',   0, 16.00,   0.00, 'missed',   null, null, timestamp '2026-07-02 18:30:00'),
    ('demo_call_006', '+919100000003', '+919100000004', 264, 14.00,  61.60, 'completed', timestamp '2026-07-02 16:10:00', timestamp '2026-07-02 16:14:24', timestamp '2026-07-02 16:10:00')
)
insert into public.calls (
  caller_user_id, receiver_user_id, agora_channel_name, duration_seconds,
  rate_per_min_charged, total_cost, status, started_at, ended_at, created_at
)
select callers.id, receivers.id, demo_call.channel_name, demo_call.duration_seconds,
       demo_call.rate_per_minute, demo_call.total_cost, demo_call.status,
       demo_call.started_at, demo_call.ended_at, demo_call.created_at
from call_data as demo_call
join public.users as callers on callers.phone_number = demo_call.caller_phone
join public.users as receivers on receivers.phone_number = demo_call.receiver_phone
where not exists (
  select 1 from public.calls as existing
  where existing.agora_channel_name = demo_call.channel_name
);

-- Reviews tied to completed calls.
with rating_data (channel_name, rating, review_text, created_at) as (
  values
    ('demo_call_001', 5, 'Warm, respectful and genuinely enjoyable conversation.', timestamp '2026-07-03 11:16:00'),
    ('demo_call_002', 4, 'Great listener with thoughtful travel stories.', timestamp '2026-07-03 10:25:00'),
    ('demo_call_003', 5, 'Friendly, energetic and very easy to talk to.', timestamp '2026-07-03 09:15:00'),
    ('demo_call_004', 5, 'Wonderful conversation. Would happily call again.', timestamp '2026-07-02 20:19:00'),
    ('demo_call_006', 4, 'Fun chat and excellent recommendations.', timestamp '2026-07-02 16:16:00')
)
insert into public.ratings (
  rater_user_id, rated_user_id, call_id, rating, review_text, created_at
)
select calls.caller_user_id, calls.receiver_user_id, calls.id,
       rating.rating, rating.review_text, rating.created_at
from rating_data as rating
join public.calls as calls on calls.agora_channel_name = rating.channel_name
where not exists (
  select 1 from public.ratings as existing where existing.call_id = calls.id
);

-- Favourite relationships used by discovery.
with favourite_data (owner_phone, favourite_phone, created_at) as (
  values
    ('+919100000001', '+919100000004', timestamp '2026-07-03 11:18:00'),
    ('+919100000002', '+919100000005', timestamp '2026-07-03 10:27:00'),
    ('+919100000003', '+919100000006', timestamp '2026-07-03 09:17:00'),
    ('+919100000004', '+919100000001', timestamp '2026-07-03 12:00:00')
)
insert into public.favourites (user_id, favourite_user_id, created_at)
select owners.id, favourites.id, favourite.created_at
from favourite_data as favourite
join public.users as owners on owners.phone_number = favourite.owner_phone
join public.users as favourites on favourites.phone_number = favourite.favourite_phone
where not exists (
  select 1 from public.favourites as existing
  where existing.user_id = owners.id
    and existing.favourite_user_id = favourites.id
);

-- Referral links between the demo accounts.
with referral_data (referrer_phone, referred_phone, status, qualified_at, created_at) as (
  values
    ('+919100000001', '+919100000004', 'qualified', timestamp '2026-06-30 12:00:00', timestamp '2026-06-20 09:00:00'),
    ('+919100000002', '+919100000005', 'qualified', timestamp '2026-07-01 14:00:00', timestamp '2026-06-25 10:30:00'),
    ('+919100000003', '+919100000006', 'pending', null, timestamp '2026-07-01 16:45:00')
)
insert into public.referrals (
  referrer_user_id, referred_user_id, status, qualified_at, created_at
)
select referrers.id, referred.id, referral.status, referral.qualified_at, referral.created_at
from referral_data as referral
join public.users as referrers on referrers.phone_number = referral.referrer_phone
join public.users as referred on referred.phone_number = referral.referred_phone
where not exists (
  select 1 from public.referrals as existing
  where existing.referrer_user_id = referrers.id
    and existing.referred_user_id = referred.id
);

-- Referral reward tiers and example redemption requests.
insert into public.referral_tiers (tier_name, min_referrals, reward_amount, is_active)
select tier.tier_name, tier.min_referrals, tier.reward_amount, true
from (
  values ('Bronze', 5, 50.00), ('Silver', 10, 150.00), ('Gold', 25, 500.00)
) as tier (tier_name, min_referrals, reward_amount)
where not exists (
  select 1 from public.referral_tiers as existing
  where lower(existing.tier_name) = lower(tier.tier_name)
);

with redemption_data (
  phone_number, tier_name, qualified_referrals, reward_amount, status, requested_at
) as (
  values
    ('+919100000001', 'Bronze', 5, 50.00, 'credited', timestamp '2026-07-02 15:41:00'),
    ('+919100000002', 'Bronze', 5, 50.00, 'pending',  timestamp '2026-07-03 10:15:00')
)
insert into public.referral_redemptions (
  user_id, tier_id, qualified_referrals_at_request, reward_amount, status, requested_at
)
select users.id, tiers.id, redemption.qualified_referrals,
       redemption.reward_amount, redemption.status, redemption.requested_at
from redemption_data as redemption
join public.users as users using (phone_number)
join public.referral_tiers as tiers on lower(tiers.tier_name) = lower(redemption.tier_name)
where not exists (
  select 1 from public.referral_redemptions as existing
  where existing.user_id = users.id
    and existing.tier_id = tiers.id
    and existing.requested_at = redemption.requested_at
);

-- ID verification history for every demo profile.
with id_data (phone_number, status, image_url, submitted_at) as (
  values
    ('+919100000001', 'approved', '/demo/verifications/aarav-id.jpg',  timestamp '2026-06-20 10:00:00'),
    ('+919100000002', 'approved', '/demo/verifications/kabir-id.jpg',  timestamp '2026-06-21 10:00:00'),
    ('+919100000003', 'pending',  '/demo/verifications/arjun-id.jpg',  timestamp '2026-07-03 10:00:00'),
    ('+919100000004', 'approved', '/demo/verifications/ananya-id.jpg', timestamp '2026-06-22 10:00:00'),
    ('+919100000005', 'approved', '/demo/verifications/meera-id.jpg',  timestamp '2026-06-23 10:00:00'),
    ('+919100000006', 'approved', '/demo/verifications/riya-id.jpg',   timestamp '2026-06-24 10:00:00')
)
insert into public.id_verifications (user_id, id_image_url, status, submitted_at)
select users.id, verification.image_url, verification.status, verification.submitted_at
from id_data as verification
join public.users as users using (phone_number)
where not exists (
  select 1 from public.id_verifications as existing
  where existing.user_id = users.id
    and existing.submitted_at = verification.submitted_at
);

-- Voice verification history for every demo profile.
with voice_data (phone_number, status, audio_url, submitted_at) as (
  values
    ('+919100000001', 'approved', '/demo/verifications/aarav-voice.mp3',  timestamp '2026-06-20 11:00:00'),
    ('+919100000002', 'approved', '/demo/verifications/kabir-voice.mp3',  timestamp '2026-06-21 11:00:00'),
    ('+919100000003', 'approved', '/demo/verifications/arjun-voice.mp3',  timestamp '2026-06-22 11:00:00'),
    ('+919100000004', 'approved', '/demo/verifications/ananya-voice.mp3', timestamp '2026-06-23 11:00:00'),
    ('+919100000005', 'approved', '/demo/verifications/meera-voice.mp3',  timestamp '2026-06-24 11:00:00'),
    ('+919100000006', 'pending',  '/demo/verifications/riya-voice.mp3',   timestamp '2026-07-03 11:00:00')
)
insert into public.voice_verifications (user_id, voice_audio_url, status, submitted_at)
select users.id, verification.audio_url, verification.status, verification.submitted_at
from voice_data as verification
join public.users as users using (phone_number)
where not exists (
  select 1 from public.voice_verifications as existing
  where existing.user_id = users.id
    and existing.submitted_at = verification.submitted_at
);

-- Final result summary for a quick SQL Editor check.
select
  users.name,
  users.phone_number,
  (select count(*) from public.user_languages where user_id = users.id) as languages,
  (select count(*) from public.user_interests where user_id = users.id) as interests,
  (select count(*) from public.calls where caller_user_id = users.id or receiver_user_id = users.id) as calls,
  (select count(*) from public.ratings where rater_user_id = users.id or rated_user_id = users.id) as ratings,
  (select count(*) from public.referrals where referrer_user_id = users.id or referred_user_id = users.id) as referrals
from public.users as users
where users.phone_number like '+91910000000%'
order by users.name;
