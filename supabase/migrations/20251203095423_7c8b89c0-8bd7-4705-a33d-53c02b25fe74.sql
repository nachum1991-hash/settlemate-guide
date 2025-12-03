-- Insert FAQs for all bureaucracy steps

-- Codice Fiscale FAQs
INSERT INTO public.task_faqs (task_id, phase, question, answer, helpful_count) VALUES
('codice', 'phase-2', 'Can I get the Codice Fiscale online?', 'Yes! You can request it online through the Agenzia delle Entrate website if you''re still abroad. However, many students find it easier to get it in person within the first few days of arrival, as it''s issued immediately.', 0),
('codice', 'phase-2', 'What if I lose my Codice Fiscale card?', 'Don''t worry! The number itself never changes. You can request a duplicate card at any Agenzia delle Entrate office, or simply use your number which is also stored in their system.', 0),
('codice', 'phase-2', 'Is the Codice Fiscale the same as a tax ID?', 'Yes, it''s Italy''s equivalent of a tax identification number. You''ll use it for nearly everything: opening a bank account, signing a rental contract, getting a SIM card, and more.', 0);

-- SIM Card FAQs
INSERT INTO public.task_faqs (task_id, phase, question, answer, helpful_count) VALUES
('sim', 'phase-2', 'Which provider has the best coverage?', 'TIM generally has the best coverage, especially in rural areas. Vodafone is also excellent. Iliad and WindTre work great in cities but may have weaker signals in remote areas.', 0),
('sim', 'phase-2', 'Can I keep my foreign phone number?', 'You can keep your foreign SIM active, but having an Italian number is essential for local services, banks, and receiving SMS verifications. Many students use both.', 0),
('sim', 'phase-2', 'Do I need a contract or can I get prepaid?', 'All major providers offer prepaid (ricaricabile) plans with no contract. This is ideal for students. You can recharge at any tobacco shop, supermarket, or online.', 0),
('sim', 'phase-2', 'Can I get an eSIM instead of physical SIM?', 'Yes! Iliad and some other providers offer eSIMs. Check if your phone supports eSIM before visiting the store.', 0);

-- Residence Permit FAQs
INSERT INTO public.task_faqs (task_id, phase, question, answer, helpful_count) VALUES
('permesso', 'phase-2', 'What if I miss the 8-day deadline?', 'While you should apply within 8 days of arrival, the post office will still accept your application. However, you may face questions at the Questura. Apply as soon as possible and keep your travel documents as proof of arrival date.', 0),
('permesso', 'phase-2', 'How long is the residence permit valid?', 'The permit is typically valid for one year and matches your study program duration. You must renew it before it expires - ideally 60 days before expiration.', 0),
('permesso', 'phase-2', 'What is Cessione di fabbricato?', 'It''s a declaration from your landlord confirming your accommodation. Your landlord must provide this document - it''s required for your residence permit application. Don''t sign a rental contract without ensuring you''ll receive this document.', 0),
('permesso', 'phase-2', 'Can I travel while waiting for my permit?', 'Yes, but carefully. With your receipt (cedolino), you can stay in Italy legally. For Schengen travel, keep your receipt, passport with valid visa, and university enrollment proof. Avoid traveling until you understand the rules.', 0),
('permesso', 'phase-2', 'What happens at the Questura appointment?', 'You''ll provide fingerprints and have your documents verified. Bring ALL original documents plus copies. The appointment is usually quick (30-60 minutes) but expect waiting time.', 0),
('permesso', 'phase-2', 'How do I track my permit status?', 'Use portaleimmigrazione.it with your credentials from the postal receipt. You''ll receive SMS updates, and can check the status online anytime.', 0);

-- ATM Metro Card FAQs
INSERT INTO public.task_faqs (task_id, phase, question, answer, helpful_count) VALUES
('atm', 'phase-2', 'What discounts are available for students?', 'Students under 27 get significant discounts: €200/year vs €330 for adults. Monthly passes are €22 vs €39. You need proof of enrollment and age.', 0),
('atm', 'phase-2', 'Can I use contactless payment instead?', 'Yes! ATM Milano accepts contactless cards and Apple/Google Pay. However, single rides are more expensive (€2.20) than with a pass. The annual pass pays off quickly.', 0),
('atm', 'phase-2', 'Does the pass cover all transport in Milan?', 'The urban pass covers all metro lines, trams, and buses within Milan city (zones Mi1-Mi3). For trips to Malpensa airport or surrounding areas, you need additional tickets.', 0);

-- Bank Account FAQs
INSERT INTO public.task_faqs (task_id, phase, question, answer, helpful_count) VALUES
('bank', 'phase-2', 'Should I choose a traditional or digital bank?', 'Digital banks (N26, Revolut) are faster to open and often free. Traditional banks (UniCredit, Intesa) may be required by some landlords for rent payments via SEPA direct debit. Many students have both.', 0),
('bank', 'phase-2', 'What fees should I expect?', 'Digital banks are usually free or €0-5/month. Traditional banks may charge €2-5/month but often waive fees for students under 30. Always ask about student accounts.', 0),
('bank', 'phase-2', 'Do I need a residence permit to open an account?', 'Digital banks typically only need your passport and Codice Fiscale. Traditional banks may require your residence permit receipt. N26 and Revolut are the easiest options initially.', 0),
('bank', 'phase-2', 'How long does it take to receive my card?', 'Digital banks: 1-2 weeks by mail. Traditional banks: Usually pick up in branch within a week. You can often use virtual cards immediately with digital banks.', 0);

-- Housing FAQs
INSERT INTO public.task_faqs (task_id, phase, question, answer, helpful_count) VALUES
('housing', 'phase-2', 'How can I avoid housing scams?', 'NEVER pay before viewing in person. Be suspicious of prices too good to be true. Use reputable platforms (Spotahome, HousingAnywhere). Never wire money to unknown accounts. Meet the landlord and see the property before signing anything.', 0),
('housing', 'phase-2', 'What is a contratto transitorio?', 'It''s a temporary rental contract (1-18 months) perfect for students. It provides legal protection and allows you to get the Cessione di fabbricato needed for your residence permit.', 0),
('housing', 'phase-2', 'How much deposit is normal?', 'Usually 1-3 months rent as a security deposit (cauzione). This should be returned when you leave if there''s no damage. Get a receipt and document the apartment condition at move-in.', 0),
('housing', 'phase-2', 'What utilities will I need to pay?', 'Typically: electricity, gas, water, internet, and condominium fees (if not included). Budget €100-150/month for utilities. Some rentals include utilities in the rent - clarify this before signing.', 0),
('housing', 'phase-2', 'Can I rent without Italian documents?', 'Yes, many landlords accept foreign documents initially. You''ll need your passport, university admission letter, and proof of funds. Having a Codice Fiscale makes everything easier.', 0);

-- Visa FAQs (Phase 1)
INSERT INTO public.task_faqs (task_id, phase, question, answer, helpful_count) VALUES
('visa', 'phase-1', 'How early should I start the visa process?', 'Start at least 3-4 months before your intended arrival date. Gathering documents takes 1-2 weeks, embassy appointments may have wait times, and processing takes 4-12 weeks depending on your country.', 0),
('visa', 'phase-1', 'What if my visa application is rejected?', 'You can appeal within 60 days or reapply. Common rejection reasons include incomplete documents, insufficient funds, or missing health insurance. Address the specific issue mentioned and reapply.', 0),
('visa', 'phase-1', 'Can I work with a student visa?', 'Yes! Student visa holders can work up to 20 hours per week during the academic year and full-time during university breaks. You''ll need your residence permit first.', 0),
('visa', 'phase-1', 'Do I need to show a return ticket?', 'No, student visas don''t require a return ticket since you''ll be staying for an extended period. You just need proof of accommodation and sufficient funds.', 0),
('visa', 'phase-1', 'What health insurance is accepted?', 'Insurance must cover medical expenses for at least €30,000 and be valid in Italy/Schengen area. Many students use policies from providers like SafetyWing, World Nomads, or local insurance companies.', 0);
